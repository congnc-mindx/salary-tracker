import { useState } from 'react';
import { Save } from 'lucide-react';

import ModalShell from '../common/ModalShell';
import Field from '../common/Field';
import SelectField from '../common/SelectField';

import {
    datetimeNowLocal,
    dateFromDateTime,
} from '../../utils/date';

import {
    getDefaultStatusByDate,
    getExtraAmount,
} from '../../services/income';

import { money } from '../../utils/format';

export default function ExtraWorkModal({ type, settings, onClose, onSave }) {
    const [classCode, setClassCode] = useState(type === 'trial' ? '' : type === 'makeup' ? 'SA55' : 'GA71');
    const [datetime, setDatetime] = useState(datetimeNowLocal());
    const [hours, setHours] = useState('1');
    const [studentCount, setStudentCount] = useState('1');
    const [trialMode, setTrialMode] = useState('ONL');
    const [campus, setCampus] = useState('Oceanpark');
    const status = getDefaultStatusByDate(dateFromDateTime(datetime));
    const [note, setNote] = useState('');
    const parsedHours = Math.max(1, Math.floor(Number(hours) || 1));
    const parsedStudentCount = Math.max(0, Number(studentCount) || 0);
    const preview = {
        id: 'preview',
        type,
        classCode,
        datetime,
        hours: type === 'judge' ? 2 : parsedHours,
        studentCount: parsedStudentCount,
        trialMode,
        campus,
        status,
        note,
    };
    const estimate = getExtraAmount(preview, settings);
    function submit() {
        onSave({
            type,
            classCode: type === 'trial' ? undefined : classCode.trim().toUpperCase(),
            datetime,
            hours: type === 'judge' ? 2 : parsedHours,
            studentCount: type === 'trial' ? parsedStudentCount : undefined,
            trialMode: type === 'trial' ? trialMode : undefined,
            campus: type === 'trial' ? campus : undefined,
            status,
            note,
        });
    }
    const title = type === 'makeup'
        ? 'Book lịch dạy bù'
        : type === 'judge'
            ? 'Book lịch giám khảo'
            : 'Book lịch dạy trải nghiệm';
    return (
        <ModalShell title={title} onClose={onClose}>
            <div className="space-y-4">
                {type !== 'trial' && <Field label="Mã lớp" value={classCode} onChange={setClassCode} />}

                <Field label="Thời gian bắt đầu" type="datetime-local" value={datetime} onChange={setDatetime} />

                {type === 'makeup' && (<>
                    <Field label="Số giờ dạy bù" type="number" min={1} step={1} value={hours} onChange={setHours} />
                    <Field label="Số học sinh" type="number" min={0} step={1} value={studentCount} onChange={setStudentCount} />
                </>)}

                {type === 'trial' && (<>
                    <SelectField label="Hình thức" value={trialMode} onChange={(value) => setTrialMode(value)} options={[
                        { label: 'Online', value: 'ONL' },
                        { label: 'Offline', value: 'OFF' },
                    ]} />
                    <Field label="Cơ sở" value={campus} onChange={setCampus} />
                    <Field label="Số học sinh" type="number" value={studentCount} onChange={setStudentCount} />
                </>)}

                <Field label="Ghi chú" value={note} onChange={setNote} />

                <div className="rounded-3xl bg-blue-50 p-4 text-sm font-bold text-blue-800">
                    Lương: {money(estimate)}
                </div>

                <button onClick={submit} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-4 font-black text-white">
                    <Save size={18} />
                    Lưu lịch
                </button>
            </div>
        </ModalShell>);
}