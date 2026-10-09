export const STORAGE_KEYS = {
  courses: "teaching-income-web-courses-v2",
  holidays: "teaching-income-web-holidays-v2",
  overrides: "teaching-income-web-overrides-v2",
  extras: "teaching-income-web-extras-v2",
  settings: "teaching-income-web-settings-v2",
};

export const defaultSettings = {
  salaryHistory: [
    {
      id: "default-rate",
      effectiveDate: "2026-01-01",
      teacherRatePerSession: 300000,
    },
  ],
  makeUpRatio: 0.375,
  judgeRatePerSession: 300000,
  trialOnlineRatePerStudent: 40000,
  trialOfflineBaseRate: 80000,
  trialOfflineBonusPerStudent: 30000,
};