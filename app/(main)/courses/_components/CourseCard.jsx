import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { formatPrice } from "@/lib/formatPrice";
import { ArrowRightIcon } from "lucide-react";
import { BookOpen } from "lucide-react";
import EnrollCourse from "@/components/enroll-course";
import { getImageUrl, shouldDisplayImage } from "@/lib/imageUtils";
import { hasEnrollmentForCourse } from "@/queries/enrollments";
import { getLoggedInUser } from "@/lib/loggedin-user";
import { cn } from "@/lib/utils";

const CourseCard = async ({ course }) => {
  // Lấy thông tin người dùng hiện tại
  const loggedInUser = await getLoggedInUser();

  // Kiểm tra xem người dùng đã đăng ký khóa học này chưa
  const isEnrolled = loggedInUser
    ? await hasEnrollmentForCourse(course?.id, loggedInUser?.id)
    : false;

  console.log("Course data:", course?.id, {
    thumbnailUrl: course?.thumbnailUrl,
    thumbnail: course?.thumbnail,
  });

  let imageSrc;

  if (course?.thumbnailUrl) {
    imageSrc = course.thumbnailUrl;
  } else if (typeof course?.thumbnail === "string") {
    imageSrc = getImageUrl(course.thumbnail, "course");
  } else if (typeof course?.thumbnail === "object") {
    imageSrc = getImageUrl(course.thumbnail, "course");
  } else {
    imageSrc = getImageUrl(null, "course");
  }

  const showImage = shouldDisplayImage(imageSrc);

  console.log("Image source:", imageSrc, "Should show:", showImage);

  return (
    <div className="group hover:shadow-sm transition overflow-hidden border rounded-lg p-3 h-full">
      <Link key={course.id} href={`/courses/${course.id}`}>
        <div className="relative w-full aspect-video rounded-md overflow-hidden">
          {showImage && (
            <Image
              src={imageSrc}
              alt="Course thumbnail"
              className="object-cover"
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority={false}
            />
          )}
        </div>
        <div className="flex flex-col pt-2">
          <div className="text-lg md:text-base font-medium group-hover:text-sky-700 line-clamp-2">
            {course?.title}
          </div>
          <p className="text-xs text-muted-foreground">
            {course?.category?.title}
          </p>
          <div className="my-3 flex items-center gap-x-2 text-sm md:text-xs">
            <div className="flex items-center gap-x-1 text-slate-500">
              <div>
                <BookOpen className="w-4" />
              </div>
              <span>{course?.modules?.length} Chapters</span>
            </div>
          </div>

          {/* <CourseProgress
              size="sm"
              value={80}
              variant={110 === 100 ? "success" : ""}
            /> */}
        </div>
      </Link>

      <div className="flex items-center justify-between mt-4">
        <p className="text-md md:text-sm font-medium text-slate-700">
          {formatPrice(course?.price)}
        </p>

        {isEnrolled ? (
          <Link href={`/courses/${course?.id}/lesson`}>
            <Button
              variant="ghost"
              className="text-xs text-emerald-700 h-7 gap-1"
            >
              Vào học ngay
              <ArrowRight className="w-3" />
            </Button>
          </Link>
        ) : (
          <EnrollCourse asLink={true} courseId={course?.id} />
        )}
      </div>
    </div>
  );
};

export default CourseCard;
