import {
  collection,
  doc,
  getDocsFromServer,
  runTransaction,
} from "firebase/firestore";
import { getIncomeContext } from "../incomeFirestore";
import {
  COLLECTIONS,
  createBackup,
  portableSetting,
  importPlan,
  stableJSON,
} from "./backupModel";
import { validateCatalog } from "../../pages/ReviewsPage/subjectCatalog";

export async function readBackup(userId) {
  const { db } = getIncomeContext(userId);
  const lists = await Promise.all(
    COLLECTIONS.map(async (name) => {
      const snapshot = await getDocsFromServer(
        collection(db, "users", userId, name),
      );
      return [
        name,
        snapshot.docs
          .filter((d) => name !== "settings" || portableSetting(d.id))
          .map((d) => ({ id: d.id, data: d.data() })),
      ];
    }),
  );
  return createBackup(Object.fromEntries(lists), userId);
}
export function downloadFile(blob, filename) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}
export function downloadBackup(backup, prefix = "MindX-backup") {
  downloadFile(
    new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" }),
    `${prefix}-${new Date().toISOString().replace(/[:.]/g, "-")}.json`,
  );
}
export async function restoreBackup(userId, incoming, current, mode) {
  const { db } = getIncomeContext(userId);
  const plan = importPlan(incoming, current, mode);
  const income = plan.entries.find(
    (e) => e.name === "settings" && e.id === "income",
  );
  if (income?.data.subjectCatalog) validateCatalog(income.data.subjectCatalog);
  if (!plan.entries.length) return plan;
  // One transaction: all reads before writes, no partially imported chunks.
  await runTransaction(db, async (tx) => {
    const refs = plan.entries.map((e) =>
      doc(db, "users", userId, e.name, e.id),
    );
    const snapshots = await Promise.all(refs.map((ref) => tx.get(ref)));
    for (let i = 0; i < plan.entries.length; i++) {
      const previous = snapshots[i].exists() ? snapshots[i].data() : null;
      if (stableJSON(previous) !== stableJSON(plan.entries[i].previous))
        throw new Error(
          "Dữ liệu đã thay đổi sau khi xem trước. Hãy chọn lại file để đối chiếu bản mới; chưa ghi dữ liệu.",
        );
    }
    plan.entries.forEach((entry, i) => tx.set(refs[i], entry.data));
  });
  return plan;
}
