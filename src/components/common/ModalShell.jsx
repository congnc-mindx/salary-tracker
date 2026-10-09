import { X } from 'lucide-react';

export default function ModalShell({ title, children, onClose }) {
    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/40 p-3 md:items-center">
            <div className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-3xl bg-[#f5f8fc] p-5 shadow-2xl">
                <div className="mb-5 flex items-center justify-between">
                    <h3 className="text-2xl font-black">{title}</h3>
                    <button onClick={onClose} className="rounded-full bg-white p-2">
                        <X size={20} />
                    </button>
                </div>
                {children}
            </div>
        </div>);
}