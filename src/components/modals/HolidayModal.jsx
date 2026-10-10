import { useState } from 'react';
import { Save } from 'lucide-react';

import ModalShell from '../common/ModalShell';
import Field from '../common/Field';
import SelectField from '../common/SelectField';

import { todayISO } from '../../utils/date';

export default function HolidayModal({ courses, onClose, onSave }) {
    const [title, setTitle] = useState('Nghỉ lễ');
    const [startDate, setStartDate] = useState(todayISO());
    const [endDate, setEndDate] = useState(todayISO());
    const [applyTo, setApplyTo] = useState('all');
    function submit() {
        onSave({
            title: title.trim() || 'Nghỉ',
            startDate,
            endDate: endDate < startDate ? startDate : endDate,
            applyTo,
        });
    }
    return (<ModalShell title="Thêm ngày nghỉ" onClose={onClose}>
        <div className="space-y-4">
            <Field label="Tên ngày nghỉ" value={title} onChange={setTitle} />
            <Field label="Từ ngày" type="date" value={startDate} onChange={setStartDate} />
            <Field label="Đến ngày" type="date" value={endDate} onChange={setEndDate} />

            <SelectField label="Áp dụng cho" value={applyTo} onChange={setApplyTo} options={[
                { label: 'Tất cả lớp', value: 'all' },
                ...courses.map((course) => ({
                    label: course.code,
                    value: course.id,
                })),
            ]} />

            <button onClick={submit} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-4 font-black text-white">
                <Save size={18} />
                Lưu ngày nghỉ
            </button>
        </div>
    </ModalShell>);
}