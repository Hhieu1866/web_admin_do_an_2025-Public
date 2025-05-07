"use client";
import React, { useState, useEffect } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { ArrowRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

const EnrollCourse = ({ asLink, courseId }) => {
  const router = useRouter();
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [initialCheckDone, setInitialCheckDone] = useState(false);

  // Kiểm tra xem người dùng đã đăng ký khóa học này chưa khi component được tải
  useEffect(() => {
    const checkEnrollment = async () => {
      if (!session?.user) return;

      try {
        setIsLoading(true);
        const response = await fetch("/api/courses/enroll", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ courseId, checkOnly: true }),
        });

        const data = await response.json();
        if (response.ok && data.isEnrolled) {
          setIsEnrolled(true);
        }
      } catch (error) {
        console.error("Lỗi khi kiểm tra đăng ký:", error);
      } finally {
        setIsLoading(false);
        setInitialCheckDone(true);
      }
    };

    checkEnrollment();
  }, [courseId, session]);

  const handleEnroll = async () => {
    if (!session?.user) {
      toast.error("Bạn cần đăng nhập để đăng ký khóa học");
      router.push("/login");
      return;
    }

    setIsLoading(true);
    try {
      console.log("Bắt đầu đăng ký khóa học:", courseId);

      // Gọi API để đăng ký khóa học
      const response = await fetch("/api/courses/enroll", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ courseId }),
      });

      const data = await response.json();

      // Kiểm tra phản hồi
      if (!response.ok) {
        throw new Error(data.error || "Có lỗi xảy ra khi đăng ký khóa học");
      }

      setIsEnrolled(true);
      toast.success(data.message || "Đăng ký khóa học thành công!");

      // Đợi một chút trước khi chuyển hướng để người dùng thấy thông báo
      setTimeout(() => {
        // Làm mới trang để cập nhật trạng thái
        router.refresh();

        // Chuyển hướng đến trang bài học
        router.push(`/courses/${courseId}/lesson`);
      }, 1500);
    } catch (error) {
      console.error("Lỗi khi đăng ký khóa học:", error);
      toast.error(error.message || "Có lỗi xảy ra khi đăng ký khóa học");
    } finally {
      setIsLoading(false);
    }
  };

  // Nếu đang kiểm tra đăng ký, hiển thị loading
  if (!initialCheckDone && isLoading) {
    return asLink ? (
      <Button
        variant="ghost"
        className="text-xs text-slate-500 h-7 gap-1"
        disabled={true}
      >
        <Loader2 className="h-3 w-3 animate-spin" />
        <span>Đang kiểm tra...</span>
      </Button>
    ) : (
      <Button className={cn(buttonVariants({ size: "lg" }))} disabled={true}>
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        <span>Đang kiểm tra...</span>
      </Button>
    );
  }

  // Nếu đã đăng ký, hiển thị nút vào học
  if (isEnrolled) {
    return (
      <Button
        variant={asLink ? "ghost" : "default"}
        className={
          asLink
            ? "text-xs text-emerald-700 h-7 gap-1"
            : cn(buttonVariants({ size: "lg" }))
        }
        onClick={() => router.push(`/courses/${courseId}/lesson`)}
      >
        Vào học ngay
        <ArrowRight className={asLink ? "w-3" : "w-4 ml-2"} />
      </Button>
    );
  }

  // Nếu chưa đăng ký, hiển thị nút đăng ký
  return (
    <>
      {asLink ? (
        <Button
          onClick={handleEnroll}
          variant="ghost"
          className="text-xs text-sky-700 h-7 gap-1"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-3 w-3 animate-spin" />
              <span>Đang xử lý...</span>
            </>
          ) : (
            <>
              Đăng ký
              <ArrowRight className="w-3" />
            </>
          )}
        </Button>
      ) : (
        <Button
          onClick={handleEnroll}
          className={cn(buttonVariants({ size: "lg" }))}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              <span>Đang xử lý...</span>
            </>
          ) : (
            "Đăng ký ngay"
          )}
        </Button>
      )}
    </>
  );
};

export default EnrollCourse;
