import ModalShell from "../common/ModalShell";
import { teachingTypes } from "../../utils/extra";

const descriptions = {
  makeup: "Tính lương theo số giờ dạy bù.",
  substitute: "Một buổi 2 giờ, lương như lớp thường.",
  trial: "Online hoặc Offline, tính theo số học sinh.",
  judge: "Một buổi 2 giờ, tính theo mức lương giám khảo.",
};

export default function TeachingTypeModal({ onClose, onChoose }) {
  return (
    <ModalShell title="Đặt lịch phát sinh" onClose={onClose}>
      <div className="grid gap-3 sm:grid-cols-2">
        {teachingTypes.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => onChoose(item.value)}
            className="rounded-2xl border border-slate-200 bg-white p-4 text-left transition-colors hover:border-brand-500 hover:bg-brand-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-brand-400 dark:hover:bg-slate-700"
          >
            <p className="font-black text-slate-900 dark:text-slate-100">
              {item.label}
            </p>

            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              {descriptions[item.value]}
            </p>
          </button>
        ))}
      </div>
    </ModalShell>
  );
}
