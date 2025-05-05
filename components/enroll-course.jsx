"use client";
import React from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { enrollForCourse } from "@/queries/enrollments";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const EnrollCourse = ({ asLink, courseId }) => {
  const router = useRouter();

  const handleEnroll = async () => {
    try {
      // Đăng ký trực tiếp vào khóa học
      await enrollForCourse(courseId);
      toast.success("Đăng ký khóa học thành công!");
      router.push(`/courses/${courseId}/lesson`);
    } catch (error) {
      console.error("Lỗi khi đăng ký khóa học:", error);
      toast.error("Có lỗi xảy ra khi đăng ký khóa học");
    }
  };

  return (
    <>
      {asLink ? (
        <Button
          onClick={handleEnroll}
          variant="ghost"
          className="text-xs text-sky-700 h-7 gap-1"
        >
          Đăng ký
          <ArrowRight className="w-3" />
        </Button>
      ) : (
        <Button
          onClick={handleEnroll}
          className={cn(buttonVariants({ size: "lg" }))}
        >
          Đăng ký ngay
        </Button>
      )}
    </>
  );
};

export default EnrollCourse;
