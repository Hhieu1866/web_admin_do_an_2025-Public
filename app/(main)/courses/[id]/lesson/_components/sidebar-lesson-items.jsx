import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CheckCircle } from "lucide-react";
import { PlayCircle } from "lucide-react";
import { Lock } from "lucide-react";
import Link from "next/link";

export const SidebarLessonItem = ({ courseId, lesson, module }) => {
  // Kiểm tra bài học có thể truy cập hay không dựa trên state
  const isLocked = (lesson) => {
    // Nếu không có state hoặc state không phải là started/completed thì khóa
    return (
      !lesson?.state ||
      (lesson?.state !== "started" && lesson?.state !== "completed")
    );
  };

  const isCompleted = (lesson) => {
    return lesson?.state === "completed";
  };

  const isStarted = (lesson) => {
    return lesson?.state === "started";
  };

  const getStatusText = (lesson) => {
    if (isLocked(lesson)) return "Bài học bị khóa";
    if (isCompleted(lesson)) return "Đã hoàn thành";
    if (isStarted(lesson)) return "Đang học";
    return "";
  };

  return (
    <Link
      href={
        isLocked(lesson)
          ? "#"
          : `/courses/${courseId}/lesson?name=${lesson.slug}&module=${module}`
      }
      className={cn(
        "flex items-center gap-x-2 text-slate-500 text-sm font-[500] transition-all hover:text-slate-600 group relative",
        isLocked(lesson)
          ? "text-slate-400 hover:text-slate-400 cursor-default"
          : isCompleted(lesson)
          ? "text-emerald-700 hover:text-emerald-700"
          : isStarted(lesson) && "text-blue-600 hover:text-blue-700",
      )}
      title={getStatusText(lesson)}
    >
      <div className="flex items-center gap-x-2">
        {isLocked(lesson) ? (
          <Lock size={16} className={cn("text-slate-400 flex-shrink-0")} />
        ) : isCompleted(lesson) ? (
          <CheckCircle
            size={16}
            className={cn("text-emerald-700 flex-shrink-0")}
          />
        ) : (
          <PlayCircle
            size={16}
            className={cn("text-blue-600 flex-shrink-0")}
          />
        )}
        <span className="truncate">{lesson.title}</span>
      </div>
      <span className="absolute left-0 -top-6 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
        {getStatusText(lesson)}
      </span>
    </Link>
  );
};
