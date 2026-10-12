import { useState } from 'react';
import { Save } from 'lucide-react';

import ModalShell from '../common/ModalShell';
import DatePicker from '../common/DatePicker';
import Field from '../common/Field';
import TimeSelect from '../common/TimeSelect';
import { mergeCampuses } from '../../utils/campuses';

import { todayISO, getNativeWeekday, parseDate, toISO } from '../../utils/date';

const weekdayNames = [
    'Chủ Nhật',
    'Thứ 2',
    'Thứ 3',
    'Thứ 4',
    'Thứ 5',
    'Thứ 6',
    'Thứ 7',
];

const timeOptions = Array.from({ length: 29 }, (_, index) => {
    const totalMinutes = 8 * 60 + index * 30;
    const hour = String(Math.floor(totalMinutes / 60)).padStart(2, '0');
    const minute = String(totalMinutes % 60).padStart(2, '0');
    const time = `${hour}:${minute}`;

    return { label: time, value: time };
});

function getMinimumStartDate() {
    const today = parseDate(todayISO());
    const originalDay = today.getDate();

    // Lùi đúng 6 tháng, xử lý cả trường hợp tháng đích ít ngày hơn.
    const target = new Date(today.getFullYear(), today.getMonth() - 6, 1);
    const lastDay = new Date(
        target.getFullYear(),
        target.getMonth() + 1,
        0
    ).getDate();

    target.setDate(Math.min(originalDay, lastDay));

    return toISO(target);
}

function getMaximumStartDate() {
    const today = parseDate(todayISO());
    const originalDay = today.getDate();

    const target = new Date(
        today.getFullYear(),
        today.getMonth() + 1,
        1
    );

    const lastDay = new Date(
        target.getFullYear(),
        target.getMonth() + 1,
        0
    ).getDate();

    target.setDate(Math.min(originalDay, lastDay));

    return toISO(target);
}

function isValidDate(value) {
    return /^\d{4}-\d{2}-\d{2}$/.test(value)
        && toISO(parseDate(value)) === value;
}

export default function CourseModal({
    course,
    campuses = [],
    onClose,
    onSave,
}) {
    const [code, setCode] = useState(course?.code || '');
    const [campus, setCampus] = useState(course?.campus || '');
    const availableCampuses = mergeCampuses(
        [course?.campus],
        campuses
    );
    const [startDate, setStartDate] = useState(
        course?.startDate || todayISO()
    );

    const [startTime, setStartTime] = useState(() => {
        const initialTime = course?.startTime || '19:00';

        return timeOptions.some((item) => item.value === initialTime)
            ? initialTime
            : '';
    });

    const [error, setError] = useState('');

    const minStartDate = getMinimumStartDate();
    const maxStartDate = getMaximumStartDate();
    const validStartDate = isValidDate(startDate);

    // Khi sửa lớp cũ mà không đổi ngày, giữ thứ đã lưu trước đây.
    const keepExistingSchedule =
        Boolean(course) && startDate === course.startDate;

    const weekday = keepExistingSchedule
        ? (course.weekday ?? getNativeWeekday(startDate))
        : (validStartDate ? getNativeWeekday(startDate) : null);

    // Cho phép giữ ngày cũ hơn 6 tháng khi chỉ sửa thông tin lớp cũ.
    const keepingOldDate =
        keepExistingSchedule && startDate < minStartDate;

    function submit() {
        setError('');

        const normalizedCode = code.trim().toUpperCase();
        const normalizedCampus = campus.trim().replace(/\s+/g, ' ');

        if (!normalizedCode) {
            setError('Bạn hãy nhập mã lớp.');
            return;
        }

        if (!availableCampuses.includes(normalizedCampus)) {
            setError('Bạn hãy chọn cơ sở trong danh sách.');
            return;
        }

        if (!validStartDate) {
            setError('Bạn hãy chọn ngày khai giảng hợp lệ.');
            return;
        }

        if (startDate < minStartDate && !keepingOldDate) {
            setError('Ngày khai giảng chỉ được lùi tối đa 6 tháng.');
            return;
        }
        if (startDate > maxStartDate) {
            setError('Chỉ được đặt lịch khai giảng trước tối đa 1 tháng.');
            return;
        }

        if (!timeOptions.some((item) => item.value === startTime)) {
            setError('Bạn hãy chọn giờ từ 08:00 đến 22:00, theo bước 30 phút.');
            return;
        }

        onSave(
            {
                code: normalizedCode,
                campus: normalizedCampus,
                startDate,
                weekday,
                startTime,
                totalSessions: course?.totalSessions ?? 14,
            },
            course?.id
        );
    }

    return (
        <ModalShell
            title={course ? 'Sửa lớp học' : 'Thêm lớp học'}
            description="Ngày khai giảng: tối đa 6 tháng về trước hoặc 1 tháng tới."
            onClose={onClose}
        >
            <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                    <Field
                        label="Mã lớp"
                        value={code}
                        onChange={setCode}
                        placeholder="VD: SA55"
                        required
                    />

                    <label className="block">
                        <span className="mb-2 block font-black text-slate-700 dark:text-slate-200">
                            Cơ sở
                        </span>

                        <select
                            value={campus}
                            onChange={(event) => setCampus(event.target.value)}
                            required
                            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-bold text-slate-950 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
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

                        {availableCampuses.length === 0 && (
                            <p className="mt-2 text-xs text-amber-700 dark:text-amber-300">
                                Hãy thêm cơ sở trong trang Cài đặt trước.
                            </p>
                        )}
                    </label>
                </div>

                <DatePicker
                    label="Ngày khai giảng"
                    value={startDate}
                    onChange={setStartDate}
                    min={keepingOldDate ? startDate : minStartDate}
                    max={maxStartDate}
                />

                {validStartDate && weekday !== null && (
                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                        Lịch học: {weekdayNames[weekday]} hàng tuần.
                    </p>
                )}

                <TimeSelect
                    label="Giờ bắt đầu"
                    value={startTime}
                    onChange={setStartTime}
                    options={timeOptions}
                />

                {error && (
                    <p
                        role="alert"
                        className="rounded-2xl bg-red-50 p-3 text-sm font-semibold text-red-700 dark:bg-red-950 dark:text-red-200"
                    >
                        {error}
                    </p>
                )}

                <button
                    type="button"
                    onClick={submit}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-4 font-black text-white hover:bg-blue-700"
                >
                    <Save size={18} />
                    Lưu lớp học
                </button>
            </div>
        </ModalShell>
    );
}