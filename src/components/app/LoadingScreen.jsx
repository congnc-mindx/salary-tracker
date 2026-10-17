export default function LoadingScreen({ error }) {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-slate-50 p-6 text-slate-600 dark:bg-slate-950 dark:text-slate-300">
      {error ? (
        <div className="max-w-md text-center">
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            Chưa tải được dữ liệu
          </h1>

          <p
            role="alert"
            className="mt-3 text-sm text-red-600 dark:text-red-400"
          >
            {error}
          </p>

          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-5 rounded-xl bg-brand-600 px-5 py-3 font-bold text-white transition-colors hover:bg-brand-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
          >
            Tải lại
          </button>
        </div>
      ) : (
        <div role="status" className="text-center">
          <p className="font-bold">Đang tải dữ liệu từ Firebase…</p>

          <p className="mt-2 text-sm">
            Cần kết nối Internet để mở dữ liệu tài khoản.
          </p>
        </div>
      )}
    </main>
  );
}
