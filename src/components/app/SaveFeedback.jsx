export default function SaveFeedback({ error, saving, onDismiss }) {
  return (
    <>
      {error && (
        <div
          role="alert"
          className="fixed inset-x-3 top-3 z-[70] mx-auto flex max-w-xl items-start justify-between gap-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 shadow-lg dark:border-red-900 dark:bg-red-950 dark:text-red-200"
        >
          <p className="min-w-0 break-words">{error}</p>

          <button
            type="button"
            onClick={onDismiss}
            aria-label="Đóng thông báo lỗi"
            className="shrink-0 font-bold"
          >
            Đóng
          </button>
        </div>
      )}

      {saving && (
        <div
          role="status"
          className="fixed inset-x-3 bottom-4 z-[70] mx-auto max-w-md rounded-2xl bg-brand-600 px-5 py-3 text-center text-sm font-semibold text-white shadow-lg"
        >
          Đang lưu lên Firebase… Nếu mạng gián đoạn, hãy chờ kết nối lại.
        </div>
      )}
    </>
  );
}
