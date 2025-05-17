"use client";

import { CourseProgress } from "@/components/course-progress";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  CheckCircle,
  PlayCircle,
  Lock,
  Award,
  ThumbsUp,
  HelpCircle,
} from "lucide-react";
import Link from "next/link";
import { GiveReview } from "./give-review";
import { DownloadCertificate } from "./download-certificate";
import Quiz from "./quiz";
import { LessonSidebarLink } from "./lesson-sidebar-link";

export const LessonSidebar = ({ course, report, userId }) => {
  // Tính toán lại các giá trị dựa trên props
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
  if (totalLessons > 0 && totalCompletedLessons >= 0) {
    totalProgress = (totalCompletedLessons / totalLessons) * 100;
  }
  totalProgress = Math.max(0, Math.min(100, totalProgress));

  // Không fetch lại, chỉ dùng dữ liệu từ props
  const updatedallModules = course?.modules || [];

  const quizSetall = course?.quizSet;
  const isQuizComplete = report?.quizAssessment ? true : false;
  const quizSet = quizSetall || null;

  return (
    <div className="flex h-full flex-col">
      {/* Course Title & Progress */}
      <div className="border-b px-5 py-6">
        <h1 className="text-lg font-semibold text-gray-900">{course?.title}</h1>
        <div className="mt-4">
          <CourseProgress variant="success" value={totalProgress} />
          <p className="mt-1 text-xs text-muted-foreground">
            {totalCompletedLessons}/{totalLessons} bài học hoàn thành
          </p>
        </div>
      </div>

      {/* Course Modules & Lessons */}
      <div className="flex-1 overflow-y-auto">
        <Accordion
          type="multiple"
          defaultValue={updatedallModules.map((module) => module._id)}
          className="w-full"
        >
          {updatedallModules.map((module) => (
            <AccordionItem
              key={module._id}
              value={module._id}
              className="border-b px-0"
            >
              <AccordionTrigger className="px-5 py-3 hover:bg-slate-50">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <span className="truncate">{module.title}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-0">
                <div className="flex flex-col">
                  {module.lessonIds &&
                    Array.isArray(module.lessonIds) &&
                    module.lessonIds
                      .sort((a, b) => a.order - b.order)
                      .map((lesson) => {
                        const status = lesson.state;
                        const isCompleted = status === "completed";
                        const isStarted = status === "started";
                        const lessonUrl = `/courses/${course._id}/lesson?name=${lesson.slug}&module=${module.slug}`;

                        return (
                          <LessonSidebarLink
                            key={lesson._id}
                            lesson={lesson}
                            href={lessonUrl}
                            isCompleted={isCompleted}
                            isStarted={isStarted}
                          />
                        );
                      })}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        {/* Final Items */}
        <div className="px-5 py-4">
          {/* Quiz Section */}
          {quizSet && (
            <div className="mb-4 rounded-lg border">
              <div className="flex items-center gap-3 border-b p-4">
                <HelpCircle className="h-5 w-5 text-blue-600" />
                <div>
                  <h3 className="font-medium">Bài kiểm tra</h3>
                  <p className="text-xs text-muted-foreground">
                    Kiểm tra kiến thức của bạn
                  </p>
                </div>
              </div>
              <div className="">
                <Quiz
                  courseId={course._id}
                  quizSet={quizSet}
                  isTaken={isQuizComplete}
                />
              </div>
            </div>
          )}

          {/* Review Button */}
          <div className="mb-3">
            <GiveReview courseId={course._id} loginid={userId} />
          </div>

          {/* Certificate Button */}
          <div>
            <DownloadCertificate
              courseId={course._id}
              totalProgress={totalProgress}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
