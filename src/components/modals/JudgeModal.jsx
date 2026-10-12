import { useState } from 'react';
import { ChevronDown, Save } from 'lucide-react';

import ModalShell from '../common/ModalShell';
import Field from '../common/Field';
import DatePicker from '../common/DatePicker';
import TimeSelect from '../common/TimeSelect';

import { parseDate, toISO, addHoursToTime } from '../../utils/date';
import { mergeCampuses } from '../../utils/campuses';
import { money } from '../../utils/format';
import { getDefaultStatusByDate } from '../../services/income';

const timeOptions = Array.from({ length: 29 }, (_, index) => {
    const minutes = 8 * 60 + index * 30;
    const hour = String(Math.floor(minutes / 60)).padStart(2, '0');
    const minute = String(minutes % 60).padStart(2, '0');

    return `${hour}:${minute}`;
});

function shiftMonth(date, amount) {
    const next = new Date(date);
    const day = next.getDate();

    next.setDate(1);
    next.setMonth(next.getMonth() + amount);

    const lastDay = new Date(
        next.getFullYear(),
        next.getMonth() + 1,
        0
    ).getDate();

    next.setDate(Math.min(day, lastDay));

    return toISO(next);
}

const selectClass =
    'w-full appearance-none rounded-2xl border border-slate-200 ' +
    'bg-white py-3 pl-4 pr-12 font-bold text-slate-950 outline-none ' +
    'focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 ' +
    'dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100';

export default function JudgeModal({
    campuses = [],
    settings,
    onClose,
    onSave,
}) {
    const [classCode, setClassCode] = useState('');
    const [campus, setCampus] = useState('');
    const [date, setDate] = useState(() => toISO(new Date()));
    const [startTime, setStartTime] = useState('19:00');
    const [note, setNote] = useState('');
    const [error, setError] = useState('');

    const availableCampuses = mergeCampuses(campuses);
    const today = new Date();
    const minDate = shiftMonth(today, -1);
    const maxDate = shiftMonth(today, 1);

    const rate = settings.judgeRatePerSession ?? 300000;
    const endTime = addHoursToTime(startTime, 2);
    const endsNextDay = startTime === '22:00';

    function submit() {
        setError('');

        const code = classCode.trim().toUpperCase();

        if (!code) {
            setError('Bạn hãy nhập mã lớp.');
            return;
        }

        if (!availableCampuses.includes(campus)) {
            setError('Bạn hãy chọn cơ sở trong danh sách.');
            return;
        }

        if (
            !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
            toISO(parseDate(date)) !== date
        ) {
            setError('Ngày chấm không hợp lệ.');
            return;
        }

        // Kiểm tra lại tại thời điểm lưu.
        const now = new Date();

        if (
            date < shiftMonth(now, -1) ||
            date > shiftMonth(now, 1)
        ) {
            setError('Ngày chấm chỉ được trong 1 tháng trước đến 1 tháng tới.');
            return;
        }

        if (!timeOptions.includes(startTime)) {
            setError('Bạn hãy chọn giờ bắt đầu hợp lệ.');
            return;
        }

        onSave({
            type: 'judge',
            classCode: code,
            campus,
            datetime: `${date}T${startTime}`,
            hours: 2,
            status: getDefaultStatusByDate(date),
            note: note.trim(),
        });
    }

    return (
        <ModalShell
            title="Book lịch giám khảo"
            description="Ngày chấm trong 1 tháng trước đến 1 tháng tới. Mỗi ca kéo dài 2 tiếng."
            onClose={onClose}
        >
            <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                    <Field
                        label="Mã lớp"
                        value={classCode}
                        onChange={setClassCode}
                        placeholder="VD: GA71"
                    />

                    <label className="block">
                        <span className="mb-2 block font-black text-slate-700 dark:text-slate-200">
                            Cơ sở
                        </span>

                        <div className="relative">
                            <select
                                value={campus}
                                onChange={(event) => setCampus(event.target.value)}
                                className={selectClass}
                            >
                                <option value="" disabled>
                                    Chọn cơ sở
                                </option>

                                {availableCampuses.map((name) => (
                                    <option key={name} value={name}>
                                        {name}
                                    </option>
                                ))}
                            </select>

                            <ChevronDown
                                size={20}
                                aria-hidden="true"
                                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400"
                            />
                        </div>
                    </label>
                </div>

                {availableCampuses.length === 0 && (
                    <p className="text-sm text-amber-700 dark:text-amber-300">
                        Hãy thêm cơ sở trong trang Cài đặt trước.
                    </p>
                )}

                <DatePicker
                    label="Ngày chấm"
                    value={date}
                    onChange={setDate}
                    min={minDate}
                    max={maxDate}
                />

                <TimeSelect
                    label="Giờ bắt đầu"
                    value={startTime}
                    onChange={setStartTime}
                    options={timeOptions}
                />

                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                    Ca chấm: {startTime} – {endTime}
                    {endsNextDay ? ' ngày kế tiếp' : ''}
                    {' · '}2 tiếng
                </p>

                <Field
                    label="Ghi chú"
                    value={note}
                    onChange={setNote}
                    placeholder="Nhập ghi chú nếu có"
                />

                <div className="rounded-3xl bg-blue-50 p-4 text-sm font-bold text-blue-800 dark:bg-blue-950 dark:text-blue-200">
                    Lương: {money(rate)} / ca 2 tiếng
                </div>

                {error && (
                    <p role="alert" className="text-sm font-semibold text-red-600 dark:text-red-400">
                        {error}
                    </p>
                )}

                <button
                    type="button"
                    onClick={submit}
                    disabled={availableCampuses.length === 0}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-4 font-black text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <Save size={18} />
                    Lưu lịch
                </button>
            </div>
        </ModalShell>
    );
}