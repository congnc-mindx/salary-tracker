import { useEffect, useState } from 'react';

import { STORAGE_KEYS, defaultSettings } from '../config/income';
import { readStorage, writeStorage } from '../services/storage';
import { uid } from '../utils/id';

// Dùng với các storage key cố định trong file này.
function useStoredState(key, initialValue) {
  const [value, setValue] = useState(() =>
    readStorage(key, initialValue)
  );

  useEffect(() => {
    writeStorage(key, value);
  }, [key, value]);

  return [value, setValue];
}

export default function useIncomeData() {
  const [courses, setCourses] = useStoredState(
    STORAGE_KEYS.courses,
    []
  );

  const [holidays, setHolidays] = useStoredState(
    STORAGE_KEYS.holidays,
    []
  );

  const [overrides, setOverrides] = useStoredState(
    STORAGE_KEYS.overrides,
    []
  );

  const [extras, setExtras] = useStoredState(
    STORAGE_KEYS.extras,
    []
  );

  const [settings, setSettings] = useStoredState(
    STORAGE_KEYS.settings,
    defaultSettings
  );

  function saveCourse(data, id) {
    if (id) {
      setCourses((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, ...data } : item
        )
      );
      return;
    }

    const course = { ...data, id: uid() };
    setCourses((prev) => [course, ...prev]);
  }

  function deleteCourse(id) {
    setCourses((prev) =>
      prev.filter((item) => item.id !== id)
    );

    setOverrides((prev) =>
      prev.filter((item) => !item.key.startsWith(`${id}-`))
    );

    setHolidays((prev) =>
      prev.filter((item) => item.applyTo !== id)
    );
  }

  function addHoliday(data) {
    const holiday = { ...data, id: uid() };
    setHolidays((prev) => [holiday, ...prev]);
  }

  function deleteHoliday(id) {
    setHolidays((prev) =>
      prev.filter((item) => item.id !== id)
    );
  }

  function addExtra(data) {
    const extra = { ...data, id: uid() };
    setExtras((prev) => [extra, ...prev]);
  }

  function updateExtraStatus(id, status) {
    setExtras((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status } : item
      )
    );
  }

  function updateSessionStatus(key, status) {
    setOverrides((prev) => {
      const exists = prev.some((item) => item.key === key);

      if (!exists) {
        return [...prev, { key, status }];
      }

      return prev.map((item) =>
        item.key === key ? { ...item, status } : item
      );
    });
  }

  function addSalaryRate(rate, effectiveDate) {
    const salaryRate = {
      id: uid(),
      effectiveDate,
      teacherRatePerSession: rate,
    };

    setSettings((prev) => ({
      ...prev,
      salaryHistory: [...prev.salaryHistory, salaryRate].sort(
        (a, b) => a.effectiveDate.localeCompare(b.effectiveDate)
      ),
    }));
  }

  return {
    courses,
    holidays,
    overrides,
    extras,
    settings,
    saveCourse,
    deleteCourse,
    addHoliday,
    deleteHoliday,
    addExtra,
    updateExtraStatus,
    updateSessionStatus,
    addSalaryRate,
  };
}