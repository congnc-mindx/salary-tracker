import { getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { doc, getFirestore, runTransaction, serverTimestamp } from 'firebase/firestore';

import { STORAGE_KEYS, defaultSettings } from '../config/income';

export function getIncomeContext(userId) {
  const app = getApp();
  const user = getAuth(app).currentUser;
  const ownerUid = import.meta.env.VITE_FIREBASE_OWNER_UID?.trim();

  if (!userId || user?.uid !== userId || userId !== ownerUid) {
    throw new Error('Phiên đăng nhập không hợp lệ. Hãy đăng nhập lại.');
  }

  return { db: getFirestore(app) };
}

// Dữ liệu form hiện tại là object JSON.
// Loại bỏ các thuộc tính undefined trước khi gửi lên Firestore.
export function cleanData(value) {
  return JSON.parse(JSON.stringify(value));
}

export function getFirestoreMessage(error) {
  switch (error.code) {
    case 'permission-denied':
      return 'Không có quyền truy cập dữ liệu. Kiểm tra Firestore Rules và UID tài khoản.';
    case 'unavailable':
      return 'Chưa kết nối được Firebase. Hãy kiểm tra mạng và thử lại.';
    case 'unauthenticated':
      return 'Phiên đăng nhập đã hết hiệu lực. Hãy đăng nhập lại.';
    default:
      return error.message || 'Không thể thực hiện thao tác. Hãy thử lại.';
  }
}

export function hasLocalIncomeData() {
  try {
    return Object.values(STORAGE_KEYS).some(
      (key) => localStorage.getItem(key) !== null
    );
  } catch {
    return false;
  }
}

export async function importLocalIncome(db, userId) {
  const entries = [];

  for (const name of ['courses', 'holidays', 'overrides', 'extras']) {
    const raw = localStorage.getItem(STORAGE_KEYS[name]);
    if (raw === null) continue;

    const items = JSON.parse(raw);

    if (!Array.isArray(items)) {
      throw new Error(`Dữ liệu cũ của ${name} không hợp lệ.`);
    }

    items.forEach((item, index) => {
      const id = name === 'overrides' ? item?.key : item?.id;

      if (typeof id !== 'string' || !id) {
        throw new Error(`Có bản ghi ${name} bị thiếu ID. Chưa nhập dữ liệu.`);
      }

      entries.push({
        ref: doc(db, 'users', userId, name, encodeURIComponent(id)),
        value: cleanData({
          ...item,
          createdAt: item.createdAt ?? Date.now() - index,
        }),
      });
    });
  }

  const rawSettings = localStorage.getItem(STORAGE_KEYS.settings);

  if (rawSettings !== null) {
    const settings = JSON.parse(rawSettings);

    if (
      !settings ||
      typeof settings !== 'object' ||
      Array.isArray(settings) ||
      !Array.isArray(settings.salaryHistory)
    ) {
      throw new Error('Cài đặt lương cũ không hợp lệ. Chưa nhập dữ liệu.');
    }

    entries.push({
      ref: doc(db, 'users', userId, 'settings', 'income'),
      value: cleanData({ ...defaultSettings, ...settings }),
    });
  }

  if (!entries.length) {
    throw new Error('Không tìm thấy dữ liệu cũ trong trình duyệt này.');
  }

  // Giới hạn chủ động cho lần nhập nguyên khối này.
  // Nếu vượt giới hạn, dừng trước khi ghi để không nhập dở dang.
  if (entries.length > 400) {
    throw new Error(
      'Dữ liệu cũ có hơn 400 bản ghi, cần chia đợt nhập. Dữ liệu hiện tại vẫn được giữ nguyên.'
    );
  }

  const paths = new Set(entries.map((entry) => entry.ref.path));

  if (paths.size !== entries.length) {
    throw new Error('Dữ liệu cũ có ID trùng nhau. Chưa nhập dữ liệu.');
  }

  const markerRef = doc(
    db,
    'users',
    userId,
    'settings',
    'localImportV1'
  );

  await runTransaction(db, async (transaction) => {
    const marker = await transaction.get(markerRef);

    // Đã nhập trước đó thì không tự đưa các bản ghi đã xóa trở lại.
    if (marker.exists()) return;

    const snapshots = await Promise.all(
      entries.map((entry) => transaction.get(entry.ref))
    );

    // Giữ nguyên những bản ghi đã có trên Firebase.
    entries.forEach((entry, index) => {
      if (!snapshots[index].exists()) {
        transaction.set(entry.ref, entry.value);
      }
    });

    transaction.set(markerRef, {
      completedAt: serverTimestamp(),
      source: 'localStorage',
    });
  });
}