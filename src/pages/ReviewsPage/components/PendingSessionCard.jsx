import { useSubjectCatalog } from "../SubjectCatalogContext";
import { subjectLabel } from "../subjectCatalog";
import { useState } from "react";
import { getCourseTitle } from "../../../utils/courseDisplay";
import PendingReviewCard from "./PendingReviewCard";
import useSessionTemplates from "../../../hooks/useSessionTemplates";
import SessionReviewEditor from "./SessionReviewEditor";

export default function PendingSessionCard({
  userId,
  item,
  onSave,
  onComplete,
}) {
  const catalog = useSubjectCatalog();
  const { course, session } = item;
  const { templates, loading, error } = useSessionTemplates(
    userId,
    course.subject,
  );
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const saved = course.sessionReviews?.[session.sessionNo];
  const template = templates[session.sessionNo];
  const content = saved?.content ?? template?.content;
  async function complete() {
    if (busy) return;
    setBusy(true);
    try {
      if (!(await onComplete(course.id, session.sessionNo, true)))
        setMessage("Chưa đánh dấu được. Hãy thử lại.");
    } catch {
      setMessage("Chưa đánh dấu được. Hãy thử lại.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <PendingReviewCard
        item={item}
        saved={saved}
        content={content}
        loading={loading}
        error={error}
        subjectName={subjectLabel(course.subject, catalog)}
        busy={busy}
        message={message}
        onComplete={complete}
        onOpen={() => setOpen(true)}
        disabled={
          !course.subject || (!saved?.content && (loading || Boolean(error)))
        }
      />
      {open && (
        <SessionReviewEditor
          title={getCourseTitle(course)}
          subject={course.subject}
          sessionNo={session.sessionNo}
          total={course.totalSessions || 14}
          saved={saved}
          template={template}
          onClose={() => setOpen(false)}
          onSave={(value) =>
            onSave(course.id, session.sessionNo, {
              ...value,
              date: session.date,
            })
          }
        />
      )}
    </>
  );
}
