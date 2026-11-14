export const TYPES = {
  class: "Lớp học",
  makeup: "Dạy bù",
  substitute: "Dạy thay",
  judge: "Giám khảo",
  trial: "Trải nghiệm",
  unknown: "Chưa phân loại",
};
export const GROUPS = {
  review: "Cần kiểm tra",
  missing: "Thiếu trong bảng",
  extra: "Chỉ có trong bảng",
  different: "Lệch thông tin",
  ambiguous: "Cần ghép / phân loại",
  matched: "Đã khớp",
  resolved: "Đã xử lý",
  all: "Tất cả",
};
const upper = (s) =>
  String(s ?? "")
    .trim()
    .toUpperCase();
export function canonicalClass(value) {
  return upper(value)
    .split("-")
    .filter((x) => !["C4K", "ROB"].includes(x))
    .join("-");
}
export function defaultCampus(centre) {
  return (
    { "505MK": "MK", "98NVC": "NVC", OCEANPARK1: "OCP", "HN-VHRS": "VHRS" }[
      upper(centre)
    ] || upper(centre)
  );
}
export function resolveRow(row, aliases = {}) {
  const campus = aliases.campuses?.[row.centre] || defaultCampus(row.centre);
  const mapped = aliases.classes?.[row.rawClass];
  const original = canonicalClass(row.rawClass),
    parts = original.split("-");
  const name =
    mapped ||
    (parts.length > 1 ? [campus, ...parts.slice(1)].join("-") : original);
  return {
    ...row,
    campus,
    classKey: canonicalClass(name),
    type: aliases.types?.[`${row.rawType}|${row.role}`] || row.type,
  };
}
export const signature = (row) =>
  JSON.stringify(row, (_key, value) =>
    value && typeof value === "object" && !Array.isArray(value)
      ? Object.fromEntries(
          Object.keys(value)
            .sort()
            .map((key) => [key, value[key]]),
        )
      : value,
  );
export function itemToken(item) {
  const source = item.source
    ? { ...item.source, id: undefined, line: undefined }
    : null;
  return signature([source, item.expected || null, item.issues]);
}
export function comparePayroll(
  source,
  expected,
  aliases = {},
  links = {},
  decisions = {},
  includeMissing = true,
) {
  const rows = source.map((r) => resolveRow(r, aliases)),
    used = new Set(),
    paired = new Map(),
    issues = new Map();
  const duplicates = new Set();
  const counts = new Map();
  for (const r of rows) {
    for (const k of [
      "id:" + r.email + ":" + r.stt,
      "slot:" +
        r.email +
        ":" +
        r.campus +
        ":" +
        r.classKey +
        ":" +
        r.date +
        ":" +
        r.time +
        ":" +
        r.type,
    ]) {
      const ids = counts.get(k) || [];
      ids.push(r.id);
      counts.set(k, ids);
    }
  }
  for (const ids of counts.values())
    if (ids.length > 1) ids.forEach((id) => duplicates.add(id));
  for (const r of rows) {
    const flags = [];
    if (duplicates.has(r.id)) flags.push("Dòng trùng: cần xác minh");
    if (r.status !== "CHECKED")
      flags.push(`Trạng thái trung tâm: ${r.status || "trống"}`);
    if (r.type === "unknown") flags.push("Chưa xác định loại công việc");
    if (Math.abs(r.hours * r.price - r.total) >= 1)
      flags.push("Total khác thời lượng × đơn giá");
    issues.set(r.id, flags);
  }
  // Explicit links first; reject conflicting links rather than consuming a row twice.
  const manualCounts = new Map();
  for (const id of Object.values(links))
    if (id) manualCounts.set(id, (manualCounts.get(id) || 0) + 1);
  for (const r of rows) {
    const id = links[r.id];
    if (!id) continue;
    const match = expected.find((e) => e.id === id);
    if (!match || manualCounts.get(id) > 1) {
      issues.get(r.id).push("Liên kết thủ công không hợp lệ hoặc bị trùng");
      continue;
    }
    paired.set(r.id, match);
    used.add(id);
  }
  const exact = (r, e) =>
    r.campus === e.campus &&
    r.classKey === e.classKey &&
    r.date === e.date &&
    r.time === e.time &&
    r.type === e.type;
  const proposals = new Map();
  for (const r of rows) {
    if (
      paired.has(r.id) ||
      Object.hasOwn(links, r.id) ||
      duplicates.has(r.id) ||
      r.type === "unknown"
    )
      continue;
    const candidates = expected.filter((e) => !used.has(e.id) && exact(r, e));
    if (candidates.length === 1) {
      const list = proposals.get(candidates[0].id) || [];
      list.push(r);
      proposals.set(candidates[0].id, list);
    }
  }
  for (const [id, rs] of proposals)
    if (rs.length === 1) {
      paired.set(
        rs[0].id,
        expected.find((e) => e.id === id),
      );
      used.add(id);
    }
  const result = rows.map((r) => {
    const e = paired.get(r.id);
    const flags = [...issues.get(r.id)];
    if (e) {
      if (r.campus !== e.campus) flags.push("Khác cơ sở");
      if (r.classKey !== e.classKey) flags.push("Khác mã lớp");
      if (r.date !== e.date || r.time !== e.time) flags.push("Khác ngày / giờ");
      if (r.type !== e.type) flags.push("Khác loại công việc");
      if (Math.abs(r.hours - e.hours) > 0.001) flags.push("Khác thời lượng");
      if (e.students != null && r.students !== e.students)
        flags.push("Khác số học sinh");
      if (Math.abs(r.total - e.total) >= 1) flags.push("Khác tổng tiền");
      if (e.price != null && Math.abs(r.price - e.price) >= 1)
        flags.push(
          r.type === "makeup" ? "Đơn giá dạy bù khác quy tắc" : "Khác đơn giá",
        );
      if (e.status === "planned") flags.push("Lịch trên web chưa xác nhận");
    }
    const candidates = e
      ? []
      : expected.filter(
          (e) =>
            !used.has(e.id) &&
            r.date === e.date &&
            (r.classKey === e.classKey || r.time === e.time),
        );
    const group = e
      ? flags.length
        ? "different"
        : "matched"
      : flags.length || candidates.length
        ? "ambiguous"
        : "extra";
    return {
      key: "source:" + r.id,
      source: r,
      expected: e || null,
      issues: flags,
      candidates,
      group,
      delta: r.total - (e?.total || 0),
    };
  });
  for (const e of expected)
    if (includeMissing && !used.has(e.id))
      result.push({
        key: "expected:" + e.id,
        source: null,
        expected: e,
        issues: ["Chưa tìm thấy dòng tương ứng trong bảng trung tâm"],
        candidates: [],
        group: "missing",
        delta: -e.total,
      });
  return result.map((item) => {
    const d = decisions[item.key];
    return { ...item, decision: d?.token === itemToken(item) ? d : null };
  });
}
export function summaryOf(items) {
  return items.reduce(
    (s, i) => {
      s.source += i.source?.total || 0;
      s.expected += i.expected?.total || 0;
      s.needsReview +=
        i.group !== "matched" && i.decision?.status !== "resolved" ? 1 : 0;
      return s;
    },
    { source: 0, expected: 0, needsReview: 0 },
  );
}
export function questionText(items, month) {
  const rows = items.filter((i) => i.decision?.status === "ask");
  return [
    `Nhờ trung tâm kiểm tra bảng lương tháng ${month.slice(5)}/${month.slice(0, 4)}:`,
    ...rows.map((i, n) => {
      const r = i.source || i.expected;
      return `${n + 1}. ${r.date} ${r.time} · ${r.classKey || r.title} · ${TYPES[r.type]}${i.source ? ` · STT ${i.source.stt}` : ""}\n   Web: ${i.expected ? i.expected.total.toLocaleString("vi-VN") + "đ" : "chưa có lịch"}; bảng trung tâm: ${i.source ? i.source.total.toLocaleString("vi-VN") + "đ" : "chưa tìm thấy"}.\n   ${i.decision.note || i.issues.join("; ") || GROUPS[i.group]}`;
    }),
  ].join("\n");
}
export function changesSince(oldRows, newRows) {
  const key = (r) => r.email + "|" + r.stt;
  const old = new Map(oldRows.map((r) => [key(r), r]));
  const now = new Map(newRows.map((r) => [key(r), r]));
  const stable = (r) => signature({ ...r, id: undefined, line: undefined });
  return {
    added: newRows.filter((r) => !old.has(key(r))).length,
    removed: oldRows.filter((r) => !now.has(key(r))).length,
    changed: newRows.filter(
      (r) => old.has(key(r)) && stable(r) !== stable(old.get(key(r))),
    ).length,
  };
}

export function inheritDecisions(previous, nextRows) {
  const decisions = {},
    links = {};
  if (!previous) return { decisions, links };
  for (const row of nextRows) {
    const matches = previous.rows.filter(
      (r) => r.stt === row.stt && r.email === row.email,
    );
    if (matches.length !== 1) continue;
    const old = matches[0],
      key = "source:" + old.id;
    if (previous.decisions[key])
      decisions["source:" + row.id] = previous.decisions[key];
    if (Object.hasOwn(previous.links, old.id))
      links[row.id] = previous.links[old.id];
  }
  for (const [key, d] of Object.entries(previous.decisions))
    if (key.startsWith("expected:")) decisions[key] = d;
  return { decisions, links };
}
