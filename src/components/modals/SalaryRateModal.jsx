import { useState } from 'react';
import { Save } from 'lucide-react';

import ModalShell from '../common/ModalShell';
import Field from '../common/Field';

import { todayISO } from '../../utils/date';

export default function SalaryRateModal({ currentRate, onClose, onSave }) {
    const [rate, setRate] = useState(String(currentRate));
    const [date, setDate] = useState(todayISO());
    function submit() {
        const parsed = Number(rate.replace(/[^\d]/g, ''));
        onSave(parsed, date);
    }
    return (<ModalShell title="Cập nhật mức lương" onClose={onClose}>
        <div className="space-y-4">
            <Field label="Lương GV / ca 2 tiếng" type="number" value={rate} onChange={setRate} />
            <Field label="Áp dụng từ ngày" type="date" value={date} onChange={setDate} />

            <div className="rounded-3xl bg-blue-50 p-4 text-sm font-bold text-blue-800">
                Các buổi trước ngày áp dụng vẫn dùng mức cũ. Từ ngày này trở đi dùng mức mới.
            </div>

            <button onClick={submit} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-4 font-black text-white">
                <Save size={18} />
                Lưu mức lương
            </button>
        </div>
    </ModalShell>);
}