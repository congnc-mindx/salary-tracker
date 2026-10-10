import { useState } from 'react';
import { Save } from 'lucide-react';

import ModalShell from '../common/ModalShell';
import Field from '../common/Field';
import SelectField from '../common/SelectField';

import { todayISO, getNativeWeekday } from '../../utils/date';

export default function CourseModal({ course, onClose, onSave }) {
    const [code, setCode] = useState(course?.code || 'SA55');
    const [startDate, setStartDate] = useState(course?.startDate || todayISO());
    const [weekday, setWeekday] = useState(String(course?.weekday ?? getNativeWeekday(todayISO())));
    const [startTime, setStartTime] = useState(course?.startTime || '19:30');
    function submit() {
        onSave({
            code: code.trim().toUpperCase(),
            startDate,
            weekday: Number(weekday),
            startTime,
            totalSessions: 14,
        }, course?.id);
    }
    return (<ModalShell title={course ? 'Sửa lớp học' : 'Thêm lớp học'} onClose={onClose}>
        <div className="space-y-4">
            <Field label="Tên / mã lớp" value={code} onChange={setCode} />
            <Field label="Ngày khai giảng" type="date" value={startDate} onChange={setStartDate} />

            <SelectField label="Thứ cố định" value={weekday} onChange={setWeekday} options={[
                { label: 'Thứ 2', value: '1' },
                { label: 'Thứ 3', value: '2' },
                { label: 'Thứ 4', value: '3' },
                { label: 'Thứ 5', value: '4' },
                { label: 'Thứ 6', value: '5' },
                { label: 'Thứ 7', value: '6' },
                { label: 'Chủ nhật', value: '0' },
            ]} />

            <Field label="Giờ bắt đầu" type="time" value={startTime} onChange={setStartTime} />

            <button onClick={submit} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-4 font-black text-white">
                <Save size={18} />
                Lưu lớp học
            </button>
        </div>
    </ModalShell>);
}