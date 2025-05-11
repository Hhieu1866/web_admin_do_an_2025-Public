"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import ReactPlayer from "react-player/youtube";
import { Button } from "@/components/ui/button";
import { CheckCircle, PlayCircle } from "lucide-react";
import { toast } from "sonner";

export const LessonVideo = ({ courseId, lesson, module }) => {
  const [hasWindow, setHasWindow] = useState(false);
  const [started, setStarted] = useState(false);
  const [ended, setEnded] = useState(false);
  const [duration, setDuration] = useState(0);
  const [loading, setLoading] = useState(false);
  const [playing, setPlaying] = useState(false);
  const hasInitialized = useRef(false);
  const playerRef = useRef(null);

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
      <div className="min-h-[400px] w-full rounded-lg border border-gray-100 bg-white p-6 shadow-sm">
        <div
          className="content-view prose prose-lg mx-auto max-w-none"
          dangerouslySetInnerHTML={{ __html: lesson.text_content }}
        />

        <div className="mt-6 flex justify-center">
          <Button
            onClick={handleCompleteLesson}
            disabled={loading || lesson?.state === "completed"}
            className="gap-2"
            size="lg"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>Đang xử lý...</span>
              </div>
            ) : lesson?.state === "completed" ? (
              <>
                <CheckCircle className="h-4 w-4" /> Đã hoàn thành
              </>
            ) : (
              "Đánh dấu đã hoàn thành"
            )}
          </Button>
        </div>
      </div>
    );
  }

  // Xử lý trạng thái trước khi play video
  const handleCustomPlay = () => {
    setPlaying(true);
  };

  // Mặc định hiển thị video
  return (
    <>
      {hasWindow && (
        <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black">
          {!playing && (
            <div
              className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black bg-opacity-50"
              onClick={handleCustomPlay}
            >
              <div className="flex flex-col items-center gap-4">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white bg-opacity-20 transition-all hover:bg-opacity-30">
                  <PlayCircle className="h-16 w-16 text-white" />
                </div>
                <span className="text-sm font-medium text-white">
                  Nhấn để phát
                </span>
              </div>
            </div>
          )}

          <ReactPlayer
            ref={playerRef}
            url={lesson.video_url}
            width="100%"
            height="100%"
            playing={playing}
            controls={playing}
            onStart={handleOnStart}
            onDuration={handleOnDuration}
            onProgress={handleOnProgress}
            onEnded={handleOnEnded}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              opacity: playing ? 1 : 0,
            }}
          />

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 transform">
            {playing && (
              <Button
                onClick={handleCompleteLesson}
                disabled={loading || lesson?.state === "completed"}
                className="gap-2"
                variant={lesson?.state === "completed" ? "outline" : "default"}
                size="sm"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    <span>Đang xử lý...</span>
                  </div>
                ) : lesson?.state === "completed" ? (
                  <>
                    <CheckCircle className="h-3 w-3" /> Đã hoàn thành
                  </>
                ) : (
                  "Đánh dấu đã hoàn thành"
                )}
              </Button>
            )}
          </div>
        </div>
      )}
    </>
  );
};
