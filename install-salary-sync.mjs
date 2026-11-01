// One-time, idempotent and guarded patch of src/App.jsx in Salary Tracker.
// Run from Salary Tracker's root AFTER extracting this ZIP.
import { readFile, writeFile } from "node:fs/promises";
const path = "src/App.jsx";
let source = await readFile(path, "utf8");
const imported = 'import SalaryIncomePublisher from "./components/sync/SalaryIncomePublisher";';
const component = '<SalaryIncomePublisher userId={user.uid} summary={summary} data={data} />';
if (!source.includes('from "./hooks/useIncomeApp"')) {
  throw new Error("Đây không phải phiên bản Salary Tracker đã kiểm tra. Không thay đổi file App.jsx.");
}
if (!source.includes(imported)) source = imported + "\n" + source;
if (!source.includes(component)) {
  const anchor = '      <SaveFeedback';
  if (!source.includes(anchor)) throw new Error("Không tìm thấy vị trí chèn. App.jsx chưa được ghi.");
  source = source.replace(anchor, `      ${component}\n${anchor}`);
}
await writeFile(path, source);
console.log("Đã tích hợp bộ xuất bảng lương vào src/App.jsx (không ghi đè phần còn lại).");
