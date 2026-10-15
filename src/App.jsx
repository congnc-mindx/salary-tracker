import useIncomeApp from "./hooks/useIncomeApp";
import DashboardLayout from "./components/dashboard/DashboardLayout";
import PageContent from "./components/layout/PageContent";
import AppModals from "./components/modals/AppModals";

export default function App({ user }) {
  const {
    activeTab,
    setActiveTab,
    selectedMonth,
    setSelectedMonth,
    modal,
    closeModal,
    data,
    summary,
    actions,
  } = useIncomeApp(user?.uid);

  if (data.loadError) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-slate-50 p-6 dark:bg-slate-950">
        <div className="max-w-md text-center">
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            Chưa tải được dữ liệu
          </h1>

          <p
            role="alert"
            className="mt-3 text-sm text-red-600 dark:text-red-400"
          >
            {data.loadError}
          </p>

          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-5 rounded-xl bg-blue-600 px-5 py-3 font-bold text-white"
          >
            Tải lại
          </button>
        </div>
      </main>
    );
  }

  if (data.loading) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-slate-50 p-6 text-slate-600 dark:bg-slate-950 dark:text-slate-300">
        <div role="status" className="text-center">
          <p className="font-bold">Đang tải dữ liệu từ Firebase…</p>
          <p className="mt-2 text-sm">
            Cần kết nối Internet để mở dữ liệu tài khoản.
          </p>
        </div>
      </main>
    );
  }

  return (
    <>
      {data.saveError && (
        <div
          role="alert"
          className="fixed inset-x-3 top-3 z-[70] mx-auto flex max-w-xl items-start justify-between gap-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 shadow-lg dark:border-red-900 dark:bg-red-950 dark:text-red-200"
        >
          <p>{data.saveError}</p>

          <button
            type="button"
            onClick={data.clearSaveError}
            className="shrink-0 font-bold"
          >
            Đóng
          </button>
        </div>
      )}

      {data.saving && (
        <div
          role="status"
          className="fixed inset-x-3 bottom-4 z-[70] mx-auto max-w-md rounded-2xl bg-blue-600 px-5 py-3 text-center text-sm font-semibold text-white shadow-lg"
        >
          Đang lưu lên Firebase… Nếu mạng gián đoạn, hãy chờ kết nối lại.
        </div>
      )}

      <fieldset
        disabled={data.saving}
        aria-busy={data.saving}
        className="m-0 min-w-0 border-0 p-0"
      >
        {data.canImportLocalData && (
          <div className="border-b border-blue-200 bg-blue-50 px-5 py-4 dark:border-blue-900 dark:bg-blue-950">
            <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-bold text-blue-900 dark:text-blue-100">
                  Có dữ liệu cũ trong trình duyệt này
                </p>

                <p className="mt-1 text-sm text-blue-800 dark:text-blue-200">
                  Nhập vào tài khoản hiện tại. Bản ghi đã có trên Firebase sẽ
                  được giữ nguyên.
                </p>
              </div>

              <button
                type="button"
                onClick={data.importLocalData}
                className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white disabled:opacity-50"
              >
                Nhập dữ liệu cũ
              </button>
            </div>
          </div>
        )}

        <DashboardLayout
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          selectedMonth={selectedMonth}
          setSelectedMonth={setSelectedMonth}
          summary={summary}
          actions={actions}
        >
          <PageContent
            activeTab={activeTab}
            selectedMonth={selectedMonth}
            data={data}
            summary={summary}
            actions={actions}
          />
        </DashboardLayout>

        <AppModals
          modal={modal}
          onClose={closeModal}
          courses={data.courses}
          settings={data.settings}
          currentTeacherRate={summary.currentTeacherRate}
          onSaveCourse={data.saveCourse}
          onAddHoliday={data.addHoliday}
          onAddExtra={data.addExtra}
          onAddSalaryRate={data.addSalaryRate}
          campuses={data.campuses}
        />
      </fieldset>
    </>
  );
}
