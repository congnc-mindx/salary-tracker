import TemplateCard from "./TemplateCard";
import { useSubjectCatalog } from "../SubjectCatalogContext";
import { subjectLabel } from "../subjectCatalog";
import { useState } from "react";
import useSessionTemplates from "../../../hooks/useSessionTemplates";
import SessionReviewEditor from "./SessionReviewEditor";

export default function SessionTemplateManager({
  userId,
  subject,
  onSave,
  onClose,
  embedded = false,
  finalTemplate,
  onFinal,
}) {
  const catalog = useSubjectCatalog();
  const { templates, loading, error } = useSessionTemplates(userId, subject);
  const [sessionNo, setSessionNo] = useState(null);
  return (
    <section className="space-y-4">
      {!embedded && <button
        type="button"
        className="text-sm font-bold text-brand-600 dark:text-brand-400"
        onClick={onClose}
      >
        ← Các học phần
      </button>}
      {loading ? (
        <p role="status">Đang tải mẫu…</p>
      ) : error ? (
        <p role="alert">{error}</p>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-2">
            {Array.from({length:14}, (_,i)=>i+1).map((no) => (
              <TemplateCard key={no} title={`Buổi ${String(no).padStart(2,"0")}`} content={no === 14 ? [finalTemplate?.learning, finalTemplate?.recommendation].filter(Boolean).join(" · ") : templates[no]?.content} onClick={()=>no === 14 ? onFinal() : setSessionNo(no)}/>
            ))}
          </div>
        </div>
      )}
      {sessionNo && (
        <SessionReviewEditor
          key={sessionNo}
          title={`Mẫu ${subjectLabel(subject, catalog)}`}
          subject={subject}
          sessionNo={sessionNo}
          isTemplate
          template={templates[sessionNo]}
          onClose={() => setSessionNo(null)}
          onSave={(value) =>
            onSave(subject, sessionNo, {
              content: value.content,
              homework: value.homework,
            })
          }
        />
      )}
    </section>
  );
}
