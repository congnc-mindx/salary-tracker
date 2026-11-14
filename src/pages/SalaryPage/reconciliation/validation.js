const object = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
const mapping = (v) =>
  object(v) &&
  Object.entries(v).every(
    ([k, x]) =>
      !["__proto__", "constructor", "prototype"].includes(k) &&
      typeof x === "string" &&
      x.length <= 250,
  );
export function validAliases(v) {
  return (
    object(v) &&
    ["campuses", "classes", "types"].every((k) => mapping(v[k] || {}))
  );
}
export function validatePayrollDocument(id, v) {
  const fail = () => {
    throw new Error("Dữ liệu đối soát không hợp lệ.");
  };
  if (!object(v)) fail();
  if (id === "payrollAliases") {
    if (!validAliases(v)) fail();
    return true;
  }
  if (
    !/^payrollRun_[A-Za-z0-9_-]+$/.test(id) ||
    v.schemaVersion !== 1 ||
    typeof v.complete !== "boolean" ||
    !Number.isFinite(v.createdAt) ||
    !/^\d{4}-(0[1-9]|1[0-2])$/.test(v.month) ||
    typeof v.teacher !== "string" ||
    !Array.isArray(v.scope) ||
    !v.scope.every((x) => typeof x === "string") ||
    !Array.isArray(v.rows) ||
    !Array.isArray(v.expected) ||
    !validAliases(v.aliases) ||
    !mapping(v.links) ||
    !object(v.decisions)
  )
    fail();
  if (v.rows.length > 1500 || v.expected.length > 3000) fail();
  for (const r of [...v.rows, ...v.expected])
    if (
      !object(r) ||
      !["id", "date", "time", "type"].every((k) => typeof r[k] === "string") ||
      !/^\d{4}-\d{2}-\d{2}$/.test(r.date) ||
      !/^\d{2}:\d{2}$/.test(r.time) ||
      !Number.isFinite(r.total) ||
      r.total < 0 ||
      !Number.isFinite(r.hours) ||
      r.hours <= 0
    )
      fail();
  for (const r of v.rows)
    if (
      ![
        "stt",
        "rawClass",
        "centre",
        "email",
        "role",
        "status",
        "rawType",
      ].every((k) => typeof r[k] === "string") ||
      !Number.isFinite(r.price) ||
      !Number.isFinite(r.students)
    )
      fail();
  for (const r of v.expected)
    if (
      !["title", "classKey", "campus", "status"].every(
        (k) => typeof r[k] === "string",
      )
    )
      fail();
  for (const d of Object.values(v.decisions))
    if (
      !object(d) ||
      !["ask", "resolved"].includes(d.status) ||
      typeof d.note !== "string" ||
      typeof d.token !== "string"
    )
      fail();
  return true;
}
