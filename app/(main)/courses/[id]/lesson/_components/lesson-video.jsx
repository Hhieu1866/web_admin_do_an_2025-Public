"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import ReactPlayer from "react-player/youtube";
import { Button } from "@/components/ui/button";
import { CheckCircle, X } from "lucide-react";
import { toast } from "sonner";

export const LessonVideo = ({ courseId, lesson, module }) => {
  const [hasWindow, setHasWindow] = useState(false);
  const [started, setStarted] = useState(false);
  const [ended, setEnded] = useState(false);
  const [duration, setDuration] = useState(0);
  const [loading, setLoading] = useState(false);
  const hasInitialized = useRef(false);

  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      setHasWindow(true);
    }
  }, []);

  useEffect(() => {
    async function updateLessonWatch() {
      setLoading(true);
      const response = await fetch("/api/lesson-watch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          courseId: courseId,
          lessonId: lesson.id,
          moduleSlug: module,
          state: "started",
          lastTime: 0,
        }),
      });
      if (response.status === 200) {
        const result = await response.text();
        console.log(result);
        setStarted(false);
      }
      setLoading(false);
    }
    started && updateLessonWatch();
  }, [started, courseId, lesson.id, module]);

  useEffect(() => {
    async function updateLessonWatch() {
      setLoading(true);
      const response = await fetch("/api/lesson-watch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          courseId: courseId,
          lessonId: lesson.id,
          moduleSlug: module,
          state: "completed",
          lastTime: duration,
          unlockNext: true,
        }),
      });
      if (response.status === 200) {
        const result = await response.text();
        setEnded(false);
        toast.success("Bài học đã được đánh dấu hoàn thành!");
        router.refresh();
      }
      setLoading(false);
    }
    ended && updateLessonWatch();
  }, [ended, courseId, lesson.id, module, duration, router]);

  // Đánh dấu bài học bắt đầu khi xem nội dung văn bản
  useEffect(() => {
    // Chỉ đánh dấu bắt đầu cho nội dung văn bản khi load component và chưa khởi tạo
    if (
      lesson.content_type === "text" &&
      hasWindow &&
      !hasInitialized.current
    ) {
      hasInitialized.current = true; // Đánh dấu đã gửi yêu cầu
      setStarted(true);
    }
  }, [lesson.content_type, hasWindow]);

  function handleOnStart() {
    console.log("handleOnStart");
    setStarted(true);
  }

  function handleOnEnded() {
    console.log("handleOnEnded");
    setEnded(true);
  }

  function handleOnDuration(value) {
    console.log("handleOnDuration", value);
    setDuration(value);
  }

  function handleOnProgress() {
    // console.log("handleOnProgress");
  }

  // Hàm để đánh dấu hoàn thành bài học thủ công
  const handleCompleteLesson = () => {
    setEnded(true);
  };

  // Hiển thị nội dung văn bản hoặc video dựa vào content_type
  if (lesson.content_type === "text") {
    return (
      <div className="bg-white rounded-md shadow-sm p-4 min-h-[470px] w-full">
        <div
          className="prose prose-lg max-w-none content-view mx-auto"
          style={{ maxWidth: "1000px" }}
          dangerouslySetInnerHTML={{ __html: lesson.text_content }}
        />

        <div className="mt-8 text-center">
          <Button
            onClick={handleCompleteLesson}
            disabled={loading || lesson?.state === "completed"}
            className="gap-2"
          >
            {loading ? (
              "Đang xử lý..."
            ) : lesson?.state === "completed" ? (
              <>
                <CheckCircle size={16} /> Đã hoàn thành
              </>
            ) : (
              "Đánh dấu đã hoàn thành"
            )}
          </Button>
        </div>
      </div>
    );
  }

  // Mặc định hiển thị video
  return (
    <>
      {hasWindow && (
        <div className="flex flex-col">
          <ReactPlayer
            url={lesson.video_url}
            width="100%"
            height="470px"
            controls={true}
            onStart={handleOnStart}
            onDuration={handleOnDuration}
            onProgress={handleOnProgress}
            onEnded={handleOnEnded}
          />

          <div className="mt-4 text-center">
            <Button
              onClick={handleCompleteLesson}
              disabled={loading || lesson?.state === "completed"}
              className="gap-2"
            >
              {loading ? (
                "Đang xử lý..."
              ) : lesson?.state === "completed" ? (
                <>
                  <CheckCircle size={16} /> Đã hoàn thành
                </>
              ) : (
                "Đánh dấu đã hoàn thành"
              )}
            </Button>
          </div>
        </div>
      )}
    </>
  );
};
