import { X } from "lucide-react";

export default function ModalShell({ title, description, children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/40 p-3 md:items-center">
      <div className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-3xl bg-[#f5f8fc] p-5 text-slate-950 shadow-2xl dark:bg-slate-900 dark:text-slate-100">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h3 className="text-2xl font-black">{title}</h3>

            {description && (
              <p className="mt-2 text-sm font-normal leading-relaxed text-slate-500 dark:text-slate-400">
                {description}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="shrink-0 rounded-full bg-white p-2 text-slate-600 transition-colors hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            <X size={20} />
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}
