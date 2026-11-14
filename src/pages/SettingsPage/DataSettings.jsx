import { useRef, useState } from "react";
import { Download, FileSpreadsheet, Upload, Database } from "lucide-react";
import ModalShell from "../../components/common/ModalShell";
import Button from "../../components/common/Button";
import {
  readBackup,
  downloadBackup,
  downloadFile,
} from "../../services/dataTransfer/backupService";
import {
  validateBackup,
  importPlan,
  COLLECTIONS,
} from "../../services/dataTransfer/backupModel";
import { exportWorkbook } from "../../services/dataTransfer/exportReport";
const names = {
  courses: "Lớp học và nhận xét",
  extras: "Lịch phát sinh",
  holidays: "Khoảng nghỉ",
  overrides: "Điều chỉnh buổi học",
  settings: "Cài đặt, kho mẫu và đối soát",
};
const card =
  "flex flex-col rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900";
export default function DataSettings({ data }) {
  const [year, setYear] = useState(() => new Date().getFullYear());
  const [busy, setBusy] = useState(false),
    [message, setMessage] = useState(""),
    [error, setError] = useState("");
  const [preview, setPreview] = useState(null),
    [mode, setMode] = useState("missing");
  const input = useRef(null),
    lock = useRef(false);
  const [currentYear] = useState(() => new Date().getFullYear());
  let plan = null,
    planError = "";
  if (preview)
    try {
      plan = importPlan(preview.incoming, preview.current, mode);
    } catch (e) {
      planError = e.message;
    }
  async function work(operation) {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await operation();
    } catch (e) {
      setError(e.message || "Không thực hiện được. Hãy thử lại.");
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  async function inspect(file) {
    if (!file) return;
    await work(async () => {
      if (file.size > 20 * 1024 * 1024)
        throw new Error("File vượt 20 MB. Chưa nhập dữ liệu.");
      let incoming;
      try {
        incoming = JSON.parse(await file.text());
      } catch {
        throw new Error("Không đọc được JSON. Hãy chọn file sao lưu MindX.");
      }
      validateBackup(incoming);
      const current = await readBackup(data.userId);
      setMode("missing");
      setPreview({ incoming, current, name: file.name });
    });
  }
  async function restore() {
    await work(async () => {
      const latest = await readBackup(data.userId);
      downloadBackup(latest, "MindX-before-restore");
      const ok = await data.restoreData(
        preview.incoming,
        preview.current,
        mode,
      );
      if (!ok)
        throw new Error(
          "Chưa khôi phục được. Xem thông báo lỗi và chọn lại file nếu dữ liệu đã thay đổi.",
        );
      setMessage(
        `Đã thêm ${plan.added}, cập nhật ${plan.updated} bản ghi; bỏ qua ${plan.skipped} bản ghi.`,
      );
      setPreview(null);
    });
  }
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-black">Trích xuất và bảo vệ dữ liệu</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Excel để đối soát. JSON để giữ đầy đủ dữ liệu và khôi phục khi cần.
        </p>
      </div>
      <fieldset
        disabled={busy || data.saving}
        className="grid min-w-0 gap-4 lg:grid-cols-3 disabled:opacity-70"
      >
        <section className={card}>
          <FileSpreadsheet className="mb-4 text-emerald-600" size={26} />
          <h3 className="font-black">Xuất Excel theo năm</h3>
          <p className="mt-2 min-h-16 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
            Tổng hợp tháng, từng buổi học, lịch phát sinh, lớp và ngày nghỉ. Tối
            đa 5 năm gần nhất.
          </p>
          <label className="my-4 block text-sm font-bold">
            Năm dữ liệu
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="mt-2 min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 dark:border-slate-700 dark:bg-slate-950"
            >
              {Array.from({ length: 5 }, (_, i) => currentYear - i).map((y) => (
                <option key={y}>{y}</option>
              ))}
            </select>
          </label>
          <Button
            className="mt-auto w-full"
            onClick={() =>
              work(async () => {
                const backup = await readBackup(data.userId);
                downloadFile(
                  exportWorkbook(backup, year),
                  `MindX-${year}.xlsx`,
                );
                setMessage("Đã tạo file Excel. Kiểm tra thư mục tải xuống.");
              })
            }
          >
            <Download size={16} /> Tải Excel
          </Button>
        </section>
        <section className={card}>
          <Database className="mb-4 text-brand-600" size={26} />
          <h3 className="font-black">Sao lưu toàn bộ JSON</h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
            Bao gồm lớp, nhận xét, lịch phát sinh, ngày nghỉ, mức lương, cơ sở
            và mẫu từng buổi/cuối khóa và lịch sử đối soát. Không giới hạn năm.
          </p>
          <p className="my-4 text-xs text-slate-500 dark:text-slate-400">
            File có nội dung nhận xét học sinh. Hãy lưu ở nơi riêng tư.
          </p>
          <Button
            className="mt-auto w-full"
            onClick={() =>
              work(async () => {
                downloadBackup(await readBackup(data.userId));
                setMessage(
                  "Đã tạo bản sao lưu JSON. Kiểm tra thư mục tải xuống.",
                );
              })
            }
          >
            <Download size={16} /> Tải bản sao lưu
          </Button>
        </section>
        <section className={card}>
          <Upload className="mb-4 text-violet-600" size={26} />
          <h3 className="font-black">Khôi phục từ JSON</h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
            Chọn file → đối chiếu → xác nhận nhập. Mặc định chỉ thêm bản ghi
            thiếu, giữ dữ liệu đang có.
          </p>
          <p className="my-4 text-xs text-slate-500 dark:text-slate-400">
            Tự tạo bản sao lưu trước khi nhập. Không xóa bản ghi ngoài file.
          </p>
          <input
            ref={input}
            type="file"
            accept=".json,application/json"
            aria-label="Chọn file sao lưu JSON"
            className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              inspect(file);
            }}
          />
          <Button
            className="mt-auto w-full"
            onClick={() => input.current?.click()}
          >
            <Upload size={16} /> Chọn file JSON
          </Button>
        </section>
      </fieldset>
      {busy && (
        <p role="status" className="text-sm">
          Đang xử lý dữ liệu…
        </p>
      )}
      {message && (
        <p
          role="status"
          className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
        >
          {message}
        </p>
      )}
      {error && !preview && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-300">
          {error}
        </p>
      )}
      {preview && (
        <ModalShell
          title="Kiểm tra trước khi khôi phục"
          description={preview.name}
          busy={busy}
          onClose={() => {
            if (!busy) setPreview(null);
          }}
          footer={
            <Button
              variant="primary"
              disabled={busy || !plan || plan.entries.length === 0}
              onClick={restore}
            >
              {busy
                ? "Đang nhập…"
                : `Xác nhận nhập ${plan?.entries.length || 0} bản ghi`}
            </Button>
          }
        >
          <div className="space-y-4">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Bản sao lưu: {preview.incoming.exportedAt || "Không có thời gian"}
              {preview.incoming.sourceUid !== data.userId
                ? " · Từ tài khoản khác"
                : ""}
            </p>
            <dl className="divide-y divide-slate-200 dark:divide-slate-700">
              {COLLECTIONS.map((name) => (
                <div
                  key={name}
                  className="flex justify-between gap-3 py-2 text-sm"
                >
                  <dt>{names[name]}</dt>
                  <dd className="font-bold">
                    {preview.incoming.collections[name].length}
                  </dd>
                </div>
              ))}
            </dl>
            <fieldset disabled={busy} className="space-y-2">
              <legend className="mb-2 text-sm font-bold">
                Cách xử lý bản ghi trùng ID
              </legend>
              {[
                ["missing", "Giữ bản hiện tại — chỉ thêm bản ghi thiếu"],
                ["update", "Cập nhật bản trùng ID bằng nội dung trong file"],
              ].map(([value, label]) => (
                <label
                  key={value}
                  className="flex items-start gap-3 rounded-xl border border-slate-200 p-3 text-sm dark:border-slate-700"
                >
                  <input
                    type="radio"
                    name="restore-mode"
                    value={value}
                    checked={mode === value}
                    onChange={() => setMode(value)}
                    className="mt-1"
                  />
                  {label}
                </label>
              ))}
            </fieldset>
            {plan && (
              <p
                role="status"
                className="rounded-xl bg-slate-100 p-3 text-sm dark:bg-slate-800"
              >
                Thêm {plan.added} · Cập nhật {plan.updated} · Bỏ qua{" "}
                {plan.skipped}
              </p>
            )}
            <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              “Giữ bản hiện tại” giữ nguyên cả bản ghi lớp và kho mẫu đã có,
              không gộp các trường bên trong. Mỗi lần nhập tối đa 400 bản ghi
              cần ghi để hoàn tất trong một giao dịch. Giữ file JSON vừa tải
              trước khi nhập để có thể phục hồi.
            </p>
            {(error || planError) && (
              <p
                role="alert"
                className="text-sm text-red-600 dark:text-red-300"
              >
                {error || planError}
              </p>
            )}
          </div>
        </ModalShell>
      )}
    </div>
  );
}
