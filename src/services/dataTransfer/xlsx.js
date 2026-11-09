// Minimal OOXML workbook: typed values, inline strings, no formula evaluation.
const enc = new TextEncoder();
const xml = (value) =>
  String(value ?? "")
    // XML 1.0 excludes these control characters.
    // oxlint-disable-next-line eslint/no-control-regex
    .replace(/[\x00-\x08\x0b\x0c\x0e-\x1f]/g, "")
    .replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&apos;",
        })[c],
    );
const table = Array.from({ length: 256 }, (_, n) => {
  for (let i = 0; i < 8; i++) n = n & 1 ? 0xedb88320 ^ (n >>> 1) : n >>> 1;
  return n >>> 0;
});
function crc(bytes) {
  let n = 0xffffffff;
  for (const byte of bytes) n = table[(n ^ byte) & 255] ^ (n >>> 8);
  return (n ^ 0xffffffff) >>> 0;
}
function header(size, fields) {
  const b = new Uint8Array(size),
    v = new DataView(b.buffer);
  for (const [offset, value, width] of fields) {
    if (width === 2) v.setUint16(offset, value, true);
    else v.setUint32(offset, value, true);
  }
  return b;
}
function zip(files) {
  const parts = [],
    central = [];
  let offset = 0;
  for (const [name, content] of files) {
    const n = enc.encode(name),
      d = enc.encode(content),
      c = crc(d);
    parts.push(
      header(30, [
        [0, 0x04034b50, 4],
        [4, 20, 2],
        [14, c, 4],
        [18, d.length, 4],
        [22, d.length, 4],
        [26, n.length, 2],
      ]),
      n,
      d,
    );
    central.push(
      header(46, [
        [0, 0x02014b50, 4],
        [4, 20, 2],
        [6, 20, 2],
        [16, c, 4],
        [20, d.length, 4],
        [24, d.length, 4],
        [28, n.length, 2],
        [42, offset, 4],
      ]),
      n,
    );
    offset += 30 + n.length + d.length;
  }
  const size = central.reduce((n, b) => n + b.length, 0);
  return new Blob(
    [
      ...parts,
      ...central,
      header(22, [
        [0, 0x06054b50, 4],
        [8, files.length, 2],
        [10, files.length, 2],
        [12, size, 4],
        [16, offset, 4],
      ]),
    ],
    {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    },
  );
}
function column(i) {
  let s = "";
  for (i++; i; i = Math.floor((i - 1) / 26))
    s = String.fromCharCode(65 + ((i - 1) % 26)) + s;
  return s;
}
export function createWorkbook(sheets) {
  const files = [];
  const ns = "http://schemas.openxmlformats.org/spreadsheetml/2006/main";
  files.push([
    "[Content_Types].xml",
    `<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>${sheets.map((_, i) => `<Override PartName="/xl/worksheets/sheet${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join("")}</Types>`,
  ]);
  files.push([
    "_rels/.rels",
    '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>',
  ]);
  files.push([
    "xl/workbook.xml",
    `<workbook xmlns="${ns}" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>${sheets.map((s, i) => `<sheet name="${xml(s.name)}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`).join("")}</sheets></workbook>`,
  ]);
  files.push([
    "xl/_rels/workbook.xml.rels",
    `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${sheets.map((_, i) => `<Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`).join("")}</Relationships>`,
  ]);
  sheets.forEach((s, i) =>
    files.push([
      `xl/worksheets/sheet${i + 1}.xml`,
      `<worksheet xmlns="${ns}"><sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews><cols>${(s.rows[0] || []).map((_, j) => `<col min="${j + 1}" max="${j + 1}" width="${s.widths?.[j] || 22}" customWidth="1"/>`).join("")}</cols><sheetData>${s.rows.map((row, r) => `<row r="${r + 1}">${row.map((v, c) => (typeof v === "number" && Number.isFinite(v) ? `<c r="${column(c)}${r + 1}"><v>${v}</v></c>` : `<c r="${column(c)}${r + 1}" t="inlineStr"><is><t xml:space="preserve">${xml(v)}</t></is></c>`)).join("")}</row>`).join("")}</sheetData><autoFilter ref="A1:${column((s.rows[0]?.length || 1) - 1)}${Math.max(1, s.rows.length)}"/></worksheet>`,
    ]),
  );
  return zip(files);
}
