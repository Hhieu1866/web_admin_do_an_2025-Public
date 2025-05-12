import React from "react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import EnrollCourse from "@/components/enroll-course";
import { auth } from "@/auth";
import { getUserByEmail } from "@/queries/users";
import {
  hasEnrollmentForCourse,
  hasStartedLearning,
} from "@/queries/enrollments";
import { getImageUrl, shouldDisplayImage } from "@/lib/imageUtils";

const CourseDetailsIntro = async ({ course }) => {
  const session = await auth();
  const loogedInUser = await getUserByEmail(session?.user?.email);
  const hasEnrollment = await hasEnrollmentForCourse(
    course?.id,
    loogedInUser?.id,
  );

  // Kiểm tra xem người dùng đã bắt đầu học chưa
  const hasStarted = hasEnrollment
    ? await hasStartedLearning(course?.id, loogedInUser?.id)
    : false;

  // Debug course data
  console.log("Course detail data:", course?.id, {
    thumbnailUrl: course?.thumbnailUrl,
    thumbnail: course?.thumbnail,
  });

  // Cập nhật cách xử lý hình ảnh
  const imageSrc = course?.thumbnailUrl
    ? course.thumbnailUrl
    : getImageUrl(course?.thumbnail, "course");
  const showImage = shouldDisplayImage(imageSrc);

  // Log image source
  console.log("Detail image source:", imageSrc, "Should show:", showImage);

  return (
    <div className="grainy overflow-x-hidden">
      <section className="pt-12 sm:pt-16">
        <div className="container">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h1 className="px-6 font-inter text-lg text-gray-600">
                {course?.subtitle}
              </h1>
              <p className="font-pj mt-5 text-4xl font-bold leading-tight text-gray-900 sm:text-5xl sm:leading-tight lg:text-6xl lg:leading-tight">
                <span className="relative inline-flex sm:inline">
                  <span className="absolute inset-0 h-full w-full bg-gradient-to-r from-[#44BCFF] via-[#FF44EC] to-[#FF675E] opacity-30 blur-lg filter"></span>
                  <span className="relative">{course?.title} </span>
                </span>
              </p>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                {hasEnrollment ? (
                  <Link
                    href={`/courses/${course?.id}/lesson`}
                    className={cn(buttonVariants({ size: "lg" }))}
                  >
                    {hasStarted ? "Tiếp tục học" : "Vào học ngay"}
                  </Link>
                ) : (
                  <EnrollCourse courseId={course?.id} />
                )}

                <Link
                  href=""
                  className={cn(
                    buttonVariants({ variant: "outline", size: "lg" }),
                  )}
                >
                  See Intro
                </Link>
                <Link
                  href=""
                  className={cn(
                    buttonVariants({ variant: "destructive", size: "lg" }),
                  )}
                >
                  Price : ${course?.price}
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-6 pb-12">
            <div className="relative">
              <div className="absolute inset-0 h-2/3"></div>
              <div className="relative mx-auto">
                <div className="lg:mx-auto lg:max-w-3xl">
                  {showImage && (
                    <Image
                      className="w-full rounded-lg"
                      width={768}
                      height={463}
                      src={imageSrc}
                      alt="Course thumbnail"
                      priority
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CourseDetailsIntro;
