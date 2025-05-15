"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Check,
  CheckCheck,
  CheckCircle,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axiosInstance from "@/lib/axios";

export const CompleteLessonButton = ({
  courseId,
  lessonId,
  moduleSlug,
  initialState = null,
  nextLessonUrl = null,
}) => {
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(initialState === "completed");
  const [processing, setProcessing] = useState(false); // Trạng thái đang xử lý API
  const router = useRouter();

  // Cập nhật state khi props thay đổi
  useEffect(() => {
    setCompleted(initialState === "completed");
  }, [initialState, lessonId]);

  // Lấy trạng thái từ window object (được set bởi LessonVideo component)
  useEffect(() => {
    const checkPlayerState = () => {
      if (window.LessonPlayerState) {
        // Chỉ cập nhật trạng thái hoàn thành nếu chưa hoàn thành
        if (!completed && window.LessonPlayerState.isCompleted) {
          setCompleted(window.LessonPlayerState.isCompleted);
        }
        setLoading(window.LessonPlayerState.isLoading);
      }
    };

    // Kiểm tra ngay khi mount
    checkPlayerState();

    // Set interval để kiểm tra liên tục
    const interval = setInterval(checkPlayerState, 1000);
    return () => clearInterval(interval);
  }, [completed]);

  const handleCompleteLesson = async () => {
    // Nếu có sẵn hàm completeLesson từ player, sử dụng nó
    if (window.LessonPlayerState && window.LessonPlayerState.completeLesson) {
      window.LessonPlayerState.completeLesson();
      return;
    }

    // Bắt đầu animation xử lý trước khi thay đổi trạng thái
    setProcessing(true);

    try {
      // Sử dụng axios thay vì fetch
      await axiosInstance.post("/api/lesson-watch", {
        courseId,
        lessonId,
        moduleSlug,
        state: "completed",
        lastTime: 0,
        unlockNext: true,
      });

      // Thông báo thành công
      toast.success("Bài học đã được đánh dấu hoàn thành!");

      // Thực hiện các revalidation song song để tăng tốc độ
      const revalidationPromises = [
        router.refresh(),
        axiosInstance.get(`/api/revalidate?path=/courses/${courseId}`),
        axiosInstance.get(`/api/revalidate?path=/courses/${courseId}/details`),
        axiosInstance.get(`/api/revalidate?path=/dashboard`),
      ];

      // Đợi tất cả revalidation hoàn thành
      await Promise.allSettled(revalidationPromises);

      // Đã hoàn tất xử lý, cập nhật UI
      setCompleted(true);
    } catch (error) {
      console.error("Error completing lesson:", error);
      toast.error("Có lỗi xảy ra khi đánh dấu hoàn thành bài học");
    } finally {
      setProcessing(false); // Kết thúc xử lý
    }
  };

  return (
    <div className="flex flex-wrap gap-3">
      {!completed ? (
        // Nút đánh dấu hoàn thành
        <Button
          onClick={handleCompleteLesson}
          disabled={loading || processing}
          className={`relative gap-2 overflow-hidden bg-primary text-white transition-all duration-300 sm:w-auto ${processing ? "animate-shimmer" : ""}`}
          size="lg"
        >
          {processing ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Đang xử lý...</span>
            </div>
          ) : (
            <>
              <Check className="h-4 w-4" />
              <span>Đánh dấu đã hoàn thành</span>
            </>
          )}
        </Button>
      ) : (
        // Nút hiển thị đã hoàn thành
        <Button
          disabled={true}
          variant="outline"
          className="gap-2 border-green-600 bg-green-100 text-green-800 shadow-sm transition-all duration-300 sm:w-auto"
          size="lg"
        >
          <CheckCheck className="h-4 w-4 font-bold text-green-700" />
          <span className="font-medium">Đã hoàn thành</span>
        </Button>
      )}

      {/* Chỉ hiển thị nút bài tiếp theo khi bài hiện tại đã hoàn thành và có bài tiếp theo */}
      {completed && nextLessonUrl && (
        <Button
          asChild
          size="lg"
          className="animate-fadeIn gap-1 bg-primary text-white transition-all duration-300"
        >
          <Link
            href={`${nextLessonUrl}${nextLessonUrl.includes("?") ? "&" : "?"}fromComplete=true`}
            className="bg-primary text-white"
          >
            Bài tiếp theo <ChevronRight className="h-4 w-4" />
          </Link>
        </Button>
      )}
    </div>
  );
};
