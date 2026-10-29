import { useEffect, useRef, useState } from "react";
import {
  collection,
  deleteDoc,
  doc,
  getDocsFromServer,
  onSnapshot,
  runTransaction,
  setDoc,
  updateDoc,
  writeBatch,
} from "firebase/firestore";

import { defaultSettings } from "../config/income";
import { uid } from "../utils/id";
import { mergeCampuses, normalizeCampus } from "../utils/campuses";
import {
  cleanData,
  getFirestoreMessage,
  getIncomeContext,
  hasLocalIncomeData,
  importLocalIncome,
} from "../services/incomeFirestore";

export default function useIncomeData(userId) {
  const [courses, setCourses] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [overrides, setOverrides] = useState([]);
  const [extras, setExtras] = useState([]);
  const [settings, setSettings] = useState(defaultSettings);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [imported, setImported] = useState(false);
  const [hasLocalData] = useState(hasLocalIncomeData);

  const busyRef = useRef(false);
  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    const unsubscribers = [];
    const loaded = new Set();

    setLoading(true);
    setLoadError("");

    function failed(error) {
      if (active) {
        setLoadError(getFirestoreMessage(error));
      }
    }

    function listen(name, reference, receive) {
      const unsubscribe = onSnapshot(
        reference,
        { includeMetadataChanges: true },
        (snapshot) => {
          if (!active) return;

          receive(snapshot);

          // Chờ dữ liệu được xác nhận từ server trước khi mở dashboard.
          if (!snapshot.metadata.fromCache) {
            loaded.add(name);
          }

          if (loaded.size === 6) {
            setLoading(false);
          }
        },
        failed,
      );

      unsubscribers.push(unsubscribe);
    }

    try {
      const { db } = getIncomeContext(userId);

      const collections = [
        ["courses", setCourses],
        ["holidays", setHolidays],
        ["overrides", setOverrides],
        ["extras", setExtras],
      ];

      collections.forEach(([name, setter]) => {
        listen(name, collection(db, "users", userId, name), (snapshot) => {
          const items = snapshot.docs.map((item) => ({
            ...item.data(),
            id: item.id,
          }));

          items.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

          setter(items);
        });
      });

      listen(
        "settings",
        doc(db, "users", userId, "settings", "income"),
        (snapshot) => {
          setSettings(
            snapshot.exists()
              ? { ...defaultSettings, ...snapshot.data() }
              : defaultSettings,
          );
        },
      );

      listen(
        "migration",
        doc(db, "users", userId, "settings", "localImportV1"),
        (snapshot) => setImported(snapshot.exists()),
      );
    } catch (error) {
      failed(error);
    }

    return () => {
      active = false;
      unsubscribers.forEach((unsubscribe) => unsubscribe());
    };
  }, [userId]);

  function record(db, name, id) {
    return doc(db, "users", userId, name, encodeURIComponent(id));
  }

  // Trả về true khi server đã xác nhận thành công.
  // Trả về false khi thất bại để modal giữ nguyên dữ liệu đang nhập.
  async function perform(operation) {
    if (busyRef.current) return false;

    busyRef.current = true;
    setSaving(true);
    setSaveError("");

    try {
      if (loading || loadError) {
        throw new Error("Dữ liệu chưa sẵn sàng. Hãy tải lại trang.");
      }

      if (!navigator.onLine) {
        throw new Error("Bạn đang mất mạng. Hãy kết nối lại rồi lưu.");
      }

      const { db } = getIncomeContext(userId);
      await operation(db);

      return true;
    } catch (error) {
      if (mountedRef.current) {
        setSaveError(getFirestoreMessage(error));
      }

      return false;
    } finally {
      busyRef.current = false;

      if (mountedRef.current) {
        setSaving(false);
      }
    }
  }

  function saveCourse(data, id) {
    return perform(async (db) => {
      if (id) {
        await updateDoc(record(db, "courses", id), cleanData(data));
        return;
      }

      const courseId = uid();

      await setDoc(
        record(db, "courses", courseId),
        cleanData({
          ...data,
          id: courseId,
          createdAt: Date.now(),
        }),
      );
    });
  }

  function deleteCourse(id) {
    return perform(async (db) => {
      // Đọc bản mới từ server trước khi xóa dữ liệu liên quan.
      const [holidaySnapshot, overrideSnapshot] = await Promise.all([
        getDocsFromServer(collection(db, "users", userId, "holidays")),
        getDocsFromServer(collection(db, "users", userId, "overrides")),
      ]);

      const relatedHolidays = holidaySnapshot.docs.filter(
        (item) => item.data().applyTo === id,
      );

      const relatedOverrides = overrideSnapshot.docs.filter((item) =>
        item.data().key?.startsWith(`${id}-`),
      );

      const references = [
        record(db, "courses", id),
        ...relatedHolidays.map((item) => item.ref),
        ...relatedOverrides.map((item) => item.ref),
      ];

      if (references.length > 400) {
        throw new Error(
          "Lớp có quá nhiều dữ liệu liên quan để xóa trong một lần.",
        );
      }

      const batch = writeBatch(db);

      references.forEach((reference) => batch.delete(reference));

      await batch.commit();
    });
  }

  function addRecord(name, data) {
    return perform(async (db) => {
      const id = uid();

      await setDoc(
        record(db, name, id),
        cleanData({
          ...data,
          id,
          createdAt: Date.now(),
        }),
      );
    });
  }

  function addHoliday(data, id) {
    if (id) {
      return perform((db) =>
        updateDoc(record(db, "holidays", id), cleanData(data)),
      );
    }

    return addRecord("holidays", data);
  }

  function deleteHoliday(id) {
    return perform((db) => deleteDoc(record(db, "holidays", id)));
  }

  function addExtra(data, id) {
    if (id) {
      return perform((db) =>
        updateDoc(record(db, "extras", id), cleanData(data)),
      );
    }

    return addRecord("extras", data);
  }

  function updateExtraStatus(id, status) {
    return perform((db) => {
      const reference = record(db, "extras", id);

      if (status === "cancelled") {
        return deleteDoc(reference);
      }

      return updateDoc(reference, { status });
    });
  }

  function updateSessionStatus(key, status) {
    return perform((db) =>
      setDoc(record(db, "overrides", key), { key, status }, { merge: true }),
    );
  }

  function addSalaryRate(rate, effectiveDate) {
    return perform(async (db) => {
      const reference = record(db, "settings", "income");

      const salaryRate = {
        id: uid(),
        effectiveDate,
        teacherRatePerSession: rate,
      };

      await runTransaction(db, async (transaction) => {
        const snapshot = await transaction.get(reference);

        const current = snapshot.exists()
          ? { ...defaultSettings, ...snapshot.data() }
          : defaultSettings;

        transaction.set(reference, {
          ...current,
          salaryHistory: [...current.salaryHistory, salaryRate].sort((a, b) =>
            a.effectiveDate.localeCompare(b.effectiveDate),
          ),
        });
      });
    });
  }

  function saveSessionTemplate(subject, sessionNo, value) {
    return perform(async (db) => {
      if (
        !/^[A-Z]{2,5}$/.test(subject) ||
        !Number.isInteger(sessionNo) ||
        sessionNo < 1 ||
        sessionNo > 100
      ) {
        throw new Error("Học phần hoặc số buổi không hợp lệ.");
      }
      if (
        typeof value.content !== "string" ||
        typeof value.homework !== "string" ||
        value.content.length > 12000 ||
        value.homework.length > 12000
      ) {
        throw new Error("Nội dung mẫu quá dài hoặc không hợp lệ.");
      }
      const reference = record(db, "settings", `sessionTemplates_${subject}`);
      await runTransaction(db, async (transaction) => {
        const snapshot = await transaction.get(reference);
        const sessions = {
          ...(snapshot.data()?.sessions || {}),
          [sessionNo]: { ...value, updatedAt: Date.now() },
        };
        if (new TextEncoder().encode(JSON.stringify(sessions)).length > 750000)
          throw new Error("Kho mẫu học phần quá dài. Hãy rút gọn nội dung.");
        transaction.set(reference, { sessions }, { merge: true });
      });
    });
  }

  function setSessionReviewCompleted(courseId, sessionNo, completed) {
    return perform(async (db) => {
      if (
        !Number.isInteger(sessionNo) ||
        sessionNo < 1 ||
        typeof completed !== "boolean"
      )
        throw new Error("Buổi học không hợp lệ.");
      const reference = record(db, "courses", courseId);
      await runTransaction(db, async (transaction) => {
        const snapshot = await transaction.get(reference);
        if (!snapshot.exists()) throw new Error("Lớp đã bị xóa.");
        const current = snapshot.data();
        if (sessionNo > (current.totalSessions || 14))
          throw new Error("Số buổi không hợp lệ.");
        transaction.update(reference, {
          sessionReviews: {
            ...(current.sessionReviews || {}),
            [sessionNo]: {
              ...(current.sessionReviews?.[sessionNo] || {}),
              completed,
              completedAt: completed ? Date.now() : null,
            },
          },
        });
      });
    });
  }

  function saveSessionReview(courseId, sessionNo, value) {
    return perform(async (db) => {
      if (
        !Number.isInteger(sessionNo) ||
        sessionNo < 1 ||
        typeof value.content !== "string" ||
        value.content.length > 12000 ||
        typeof value.comments !== "string" ||
        value.comments.length > 30000 ||
        typeof value.homework !== "string" ||
        value.homework.length > 12000 ||
        !["draft", "sent"].includes(value.status)
      )
        throw new Error("Nhận xét không hợp lệ.");
      const reference = record(db, "courses", courseId);
      await runTransaction(db, async (transaction) => {
        const snapshot = await transaction.get(reference);
        if (!snapshot.exists())
          throw new Error("Lớp đã bị xóa. Chưa lưu nhận xét.");
        const current = snapshot.data();
        if (sessionNo > (current.totalSessions || 14))
          throw new Error("Số buổi vượt quá thời lượng khóa học.");
        const previous = current.sessionReviews?.[sessionNo];
        const review = cleanData({
          completed: previous?.completed ?? previous?.status === "sent",
          completedAt: previous?.completedAt ?? null,
          content: value.content,
          comments: value.comments,
          homework: value.homework,
          subject: value.subject,
          date: value.date,
          status: value.status,
          updatedAt: Date.now(),
          sentAt:
            value.status === "sent"
              ? previous?.status === "sent"
                ? previous.sentAt
                : Date.now()
              : null,
        });
        const sessionReviews = {
          ...(current.sessionReviews || {}),
          [sessionNo]: review,
        };
        if (
          new TextEncoder().encode(
            JSON.stringify({ ...current, sessionReviews }),
          ).length > 750000
        )
          throw new Error(
            "Nhận xét của lớp quá dài. Hãy rút gọn nội dung trước khi lưu.",
          );
        transaction.update(reference, { sessionReviews });
      });
    });
  }

  function saveFinalReviewTemplate(subject, value) {
    return perform(async (db) => {
      if (
        !/^[A-Z]{2,5}$/.test(subject) ||
        typeof value.learning !== "string" ||
        typeof value.recommendation !== "string" ||
        value.learning.length > 10000 ||
        value.recommendation.length > 10000
      ) {
        throw new Error("Nội dung mẫu không hợp lệ.");
      }
      const reference = record(db, "settings", "income");
      await runTransaction(db, async (transaction) => {
        const snapshot = await transaction.get(reference);
        const current = snapshot.exists() ? snapshot.data() : {};
        const finalReviewTemplates = {
          ...(current.finalReviewTemplates || {}),
          [subject]: { ...value, updatedAt: Date.now() },
        };
        if (
          new TextEncoder().encode(
            JSON.stringify({ ...current, finalReviewTemplates }),
          ).length > 800000
        ) {
          throw new Error(
            "Kho mẫu quá dài. Hãy rút gọn nội dung trước khi lưu.",
          );
        }
        transaction.set(reference, { finalReviewTemplates }, { merge: true });
      });
    });
  }

  function importLocalData() {
    return perform((db) => importLocalIncome(db, userId));
  }

  const campuses = mergeCampuses(
    settings.campuses || [],
    courses.map((course) => course.campus),
  );

  function addCampus(value) {
    return perform(async (db) => {
      const name = value.trim().replace(/\s+/g, " ");

      if (!name) {
        throw new Error("Bạn hãy nhập tên cơ sở.");
      }

      const reference = record(db, "settings", "income");

      await runTransaction(db, async (transaction) => {
        const snapshot = await transaction.get(reference);
        const current = snapshot.exists() ? snapshot.data() : {};

        const existing = mergeCampuses(
          current.campuses || [],
          courses.map((course) => course.campus),
        );

        if (
          existing.some(
            (campus) => normalizeCampus(campus) === normalizeCampus(name),
          )
        ) {
          throw new Error("Cơ sở này đã có trong danh sách.");
        }

        transaction.set(
          reference,
          { campuses: mergeCampuses(existing, [name]) },
          { merge: true },
        );
      });
    });
  }

  return {
    userId,
    saveSessionTemplate,
    saveSessionReview,
    setSessionReviewCompleted,
    courses,
    holidays,
    overrides,
    extras,
    settings,

    loading,
    loadError,
    saving,
    saveError,
    canImportLocalData: hasLocalData && !imported,
    clearSaveError: () => setSaveError(""),

    saveCourse,
    saveFinalReviewTemplate,
    deleteCourse,
    addHoliday,
    deleteHoliday,
    addExtra,
    updateExtraStatus,
    updateSessionStatus,
    addSalaryRate,
    importLocalData,
    campuses,
    addCampus,
  };
}
