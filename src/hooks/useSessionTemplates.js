import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import {
  getIncomeContext,
  getFirestoreMessage,
} from "../services/incomeFirestore";

export default function useSessionTemplates(userId, subject) {
  const [state, setState] = useState({
    key: "",
    templates: {},
    loading: true,
    error: "",
  });
  const key = `${userId}:${subject}`;
  useEffect(() => {
    if (!subject) return;
    let active = true;
    let unsubscribe;
    try {
      const { db } = getIncomeContext(userId);
      unsubscribe = onSnapshot(
        doc(db, "users", userId, "settings", `sessionTemplates_${subject}`),
        (snapshot) => {
          if (active)
            setState({
              key,
              templates: snapshot.data()?.sessions || {},
              loading: false,
              error: "",
            });
        },
        (error) => {
          if (active)
            setState({
              key,
              templates: {},
              loading: false,
              error: getFirestoreMessage(error),
            });
        },
      );
    } catch (error) {
      queueMicrotask(() => {
        if (active)
          setState({
            key,
            templates: {},
            loading: false,
            error: getFirestoreMessage(error),
          });
      });
    }
    return () => {
      active = false;
      unsubscribe?.();
    };
  }, [userId, subject, key]);
  if (!subject) return { templates: {}, loading: false, error: "" };
  return state.key === key
    ? state
    : { templates: {}, loading: true, error: "" };
}
