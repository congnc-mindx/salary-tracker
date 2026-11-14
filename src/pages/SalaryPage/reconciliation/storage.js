import {
  collection,
  doc,
  documentId,
  endAt,
  getDocsFromServer,
  getDocFromServer,
  orderBy,
  query,
  runTransaction,
  startAt,
  limitToLast,
} from "firebase/firestore";
import { getIncomeContext } from "../../../services/incomeFirestore";
import { validatePayrollDocument } from "./validation";
export async function loadPayrollHistory(userId) {
  const { db } = getIncomeContext(userId);
  const q = query(
    collection(db, "users", userId, "settings"),
    orderBy(documentId()),
    startAt("payrollRun_"),
    endAt("payrollRun_\uf8ff"),
    limitToLast(30),
  );
  const snap = await getDocsFromServer(q);
  return snap.docs
    .map((d) => ({ ...d.data(), id: d.id }))
    .sort((a, b) => b.createdAt - a.createdAt);
}
export async function loadPayrollAliases(userId) {
  const { db } = getIncomeContext(userId);
  const snap = await getDocFromServer(
    doc(db, "users", userId, "settings", "payrollAliases"),
  );
  return snap.exists()
    ? snap.data()
    : { revision: 0, campuses: {}, classes: {}, types: {} };
}
export async function savePayrollDocument(
  userId,
  id,
  value,
  expectedRevision = 0,
) {
  validatePayrollDocument(id, value);
  const { db } = getIncomeContext(userId);
  const ref = doc(db, "users", userId, "settings", id);
  if (new TextEncoder().encode(JSON.stringify(value)).length > 750000)
    throw new Error(
      "Lần đối soát quá lớn để lưu. Hãy thu hẹp tháng/cơ sở; bản đang xem vẫn được giữ.",
    );
  return runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    if ((snap.data()?.revision || 0) !== expectedRevision)
      throw new Error(
        "Bản lưu đã đổi ở nơi khác. Tải lại lịch sử hoặc lưu thành lần mới.",
      );
    const next = {
      ...JSON.parse(JSON.stringify(value)),
      revision: expectedRevision + 1,
      updatedAt: Date.now(),
    };
    tx.set(ref, next);
    return { ...next, id };
  });
}
