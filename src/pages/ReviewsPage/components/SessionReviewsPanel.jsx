import {notify} from "../../../components/common/feedback";
import Button from "../../../components/common/Button";
import useNow from "../../../hooks/useNow";
import EmptyState from "../../../components/common/EmptyState";
import { useState } from "react";
import { getCourseTitle } from "../../../utils/courseDisplay";
import { buildPendingReviews, buildCompletedReviews } from "../pendingReviewsModel";
import PendingSessionCard from "./PendingSessionCard";

export default function SessionReviewsPanel({
  userId,
  courses,
  sessions,
  onSave,
  onComplete,
  onSaveTemplate,
}) {
  const now = useNow(15_000);
  const [search, setSearch] = useState("");
  const [showCompleted,setShowCompleted]=useState(false);
  const pending = showCompleted ? buildCompletedReviews(courses,sessions,now) : buildPendingReviews(courses,sessions,now);
  const visible=pending.filter(({course,session})=>`${getCourseTitle(course)} buổi ${session.sessionNo} ${session.date}`.toLowerCase().includes(search.toLowerCase().trim()));
  async function complete(courseId,sessionNo,completed) {
    const ok=await onComplete(courseId,sessionNo,completed);
    if(ok) notify(`Đã hoàn thành buổi ${sessionNo} · ${getCourseTitle(courses.find(c=>c.id===courseId)||{})}`,{action:async()=>{if(!await onComplete(courseId,sessionNo,false))throw new Error();}});
    return ok;
  }
  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-black">
          {showCompleted ? "Đã hoàn thành" : "Cần lấy nhận xét"} · {pending.length} buổi
        </h2>
        <input
          aria-label="Tìm lớp cần nhận xét"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm lớp, buổi hoặc ngày…"
          className="w-full rounded-xl border border-slate-300 bg-white p-3 text-sm sm:w-72 dark:border-slate-700 dark:bg-slate-900"
        />
      </div>
      <div className="flex gap-2"><Button variant={!showCompleted?"primary":"secondary"} onClick={()=>setShowCompleted(false)}>Chờ nhận xét</Button><Button variant={showCompleted?"primary":"secondary"} onClick={()=>setShowCompleted(true)}>Đã hoàn thành</Button></div>
      <div className="grid items-start gap-4 md:grid-cols-3">
        {visible.map((item) => (
          <PendingSessionCard
            key={`${item.course.id}-${item.session.sessionNo}`}
            userId={userId}
            item={item}
            onSaveTemplate={onSaveTemplate}
            onSave={onSave}
            onComplete={complete}
          />
        ))}
      </div>
      {!visible.length && (
        <EmptyState>
          {pending.length
            ? "Không có lớp khớp tìm kiếm."
            : showCompleted ? "Chưa có buổi học đã hoàn thành nhận xét." : "Không có buổi học nào đang chờ lấy nhận xét."}
        </EmptyState>
      )}
    </section>
  );
}
