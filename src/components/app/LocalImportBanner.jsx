export default function LocalImportBanner({ onImport }) {
  return (
    <div className="border-b border-brand-200 bg-brand-50 px-5 py-4 dark:border-brand-900 dark:bg-brand-950">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-bold text-brand-900 dark:text-brand-100">
            Có dữ liệu cũ trong trình duyệt này
          </p>

          <p className="mt-1 text-sm text-brand-800 dark:text-brand-200">
            Nhập vào tài khoản hiện tại. Bản ghi đã có trên Firebase sẽ được giữ
            nguyên.
          </p>
        </div>

        <button
          type="button"
          onClick={onImport}
          className="rounded-xl bg-brand-600 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-brand-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 disabled:opacity-50"
        >
          Nhập dữ liệu cũ
        </button>
      </div>
    </div>
  );
}
