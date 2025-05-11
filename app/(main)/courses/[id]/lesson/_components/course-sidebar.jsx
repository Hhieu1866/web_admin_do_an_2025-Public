import { CourseProgress } from "@/components/course-progress";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CheckCircle } from "lucide-react";
import { PlayCircle } from "lucide-react";
import { Lock } from "lucide-react";
import Link from "next/link";
import { ReviewModal } from "./review-modal";
import { DownloadCertificate } from "./download-certificate";
import { GiveReview } from "./give-review";
import { SidebarModules } from "./sidebar-modules";
import { getCourseDetails } from "@/queries/courses";
import { getLoggedInUser } from "@/lib/loggedin-user";
import { Watch } from "@/model/watch-model";
import { ObjectId } from "mongoose";
import { getReport } from "@/queries/reports";
import Quiz from "./quiz";

export const CourseSidebar = async ({ courseId }) => {
  const course = await getCourseDetails(courseId);
  const loggedinUser = await getLoggedInUser();

  const report = await getReport({
    course: courseId,
    student: loggedinUser.id,
  });

  const totalCompletedModules = report?.totalCompletedModeules
    ? report?.totalCompletedModeules.length
    : 0;

  const totalModules = course?.modules ? course.modules.length : 0;

  let totalLessons = 0;
  let totalCompletedLessons = report?.totalCompletedLessons?.length || 0;

  if (course?.modules && Array.isArray(course.modules)) {
    course.modules.forEach((module) => {
      if (module.lessonIds && Array.isArray(module.lessonIds)) {
        totalLessons += module.lessonIds.length;
      }
    });
  }

  let totalProgress = 0;

  if (totalModules > 0 && totalCompletedModules > 0) {
    totalProgress = (totalCompletedModules / totalModules) * 100;
  } else if (totalLessons > 0 && totalCompletedLessons > 0) {
    totalProgress = (totalCompletedLessons / totalLessons) * 100;
  }

  totalProgress = Math.max(0, Math.min(100, totalProgress));

  // Sanitize fucntion for handle ObjectID and Buffer
  function sanitizeData(data) {
    if (!data) return null;

    return JSON.parse(
      JSON.stringify(data, (key, value) => {
        if (value instanceof ObjectId) {
          return value.toString();
        }
        if (Buffer.isBuffer(value)) {
          return value.toString("base64");
        }
        return value;
      }),
    );
  }

  let updatedModules = [];

  if (course?.modules && Array.isArray(course.modules)) {
    updatedModules = await Promise.all(
      course.modules.map(async (module) => {
        const moduleId = module._id.toString();
        const lessons = module?.lessonIds;

        if (lessons && Array.isArray(lessons)) {
          const updatedLessons = await Promise.all(
            lessons.map(async (lesson) => {
              const lessonId = lesson._id.toString();
              const watch = await Watch.findOne({
                lesson: lessonId,
                module: moduleId,
                user: loggedinUser.id,
              }).lean();
              if (watch?.state === "completed") {
                lesson.state = "completed";
              } else if (watch?.state === "started") {
                lesson.state = "started";
              }
              return lesson;
            }),
          );
        }

        return module;
      }),
    );
  }

  //console.log(updatedModules);

  const updatedallModules =
    updatedModules.length > 0 ? sanitizeData(updatedModules) : [];

  const quizSetall = course?.quizSet;
  const isQuizComplete = report?.quizAssessment ? true : false;
  const quizSet = quizSetall ? sanitizeData(quizSetall) : null;

  //console.log({quizSet});
  //console.log({isQuizComplete});

  return (
    <>
      <div className="flex h-full flex-col overflow-y-auto border-r shadow-sm">
        <div className="flex flex-col border-b p-8">
          <h1 className="font-semibold">{course?.title}</h1>
          {/* Check purchase */}
          {
            <div className="mt-10">
              <CourseProgress variant="success" value={totalProgress} />
              {totalCompletedLessons > 0 && (
                <p className="mt-1 text-xs text-muted-foreground">
                  {totalCompletedLessons}/{totalLessons} bài học đã hoàn thành
                </p>
              )}
            </div>
          }
        </div>

        <SidebarModules courseId={courseId} modules={updatedallModules} />

        <div className="w-full border-t px-4 pt-10 lg:px-14">
          {quizSet && (
            <Quiz
              courseId={courseId}
              quizSet={quizSet}
              isTaken={isQuizComplete}
            />
          )}
        </div>

        <div className="mb-10 w-full px-6">
          <GiveReview courseId={courseId} loginid={loggedinUser.id} />
          <DownloadCertificate
            courseId={courseId}
            totalProgress={totalProgress}
          />
        </div>
      </div>
    </>
  );
};
