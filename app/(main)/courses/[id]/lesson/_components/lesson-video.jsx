"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import ReactPlayer from "react-player/youtube";

export const LessonVideo = ({ courseId, lesson, module }) => {
  const [hasWindow, setHasWindow] = useState(false);
  const [started, setStarted] = useState(false);
  const [ended, setEnded] = useState(false);
  const [duration, setDuration] = useState(0);
  const hasInitialized = useRef(false);

  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      setHasWindow(true);
    }
  }, []);

  useEffect(() => {
    async function updateLessonWatch() {
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
    }
    started && updateLessonWatch();
  }, [started, courseId, lesson.id, module]);

  useEffect(() => {
    async function updateLessonWatch() {
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
        }),
      });
      if (response.status === 200) {
        const result = await response.text();
        setEnded(false);
        router.refresh();
      }
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

      // Sau 30 giây, tự động đánh dấu là đã hoàn thành
      const timer = setTimeout(() => {
        setEnded(true);
      }, 30000);

      return () => clearTimeout(timer);
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

  // Hiển thị nội dung văn bản hoặc video dựa vào content_type
  if (lesson.content_type === "text") {
    return (
      <div className="bg-white rounded-md shadow-sm p-4 min-h-[470px] w-full">
        <div
          className="prose prose-lg max-w-none content-view mx-auto"
          style={{ maxWidth: "1000px" }}
          dangerouslySetInnerHTML={{ __html: lesson.text_content }}
        />
      </div>
    );
  }

  // Mặc định hiển thị video
  return (
    <>
      {hasWindow && (
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
      )}
    </>
  );
};
