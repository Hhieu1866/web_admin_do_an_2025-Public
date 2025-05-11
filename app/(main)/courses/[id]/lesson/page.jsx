import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { getCourseDetails } from "@/queries/courses";
import {
  replaceMongoIdInArray,
  replaceMongoIdInObject,
} from "@/lib/convertData";
import { getLessonBySlug } from "@/queries/lessons";
import { LessonVideo } from "./_components/lesson-video";
import { DownloadButton } from "@/components/download-button";
import { FileText, Download, Clock, Calendar } from "lucide-react";

const LessonPage = async ({ params, searchParams }) => {
  const id = params.id;
  const nameParam = searchParams.name;
  const moduleParam = searchParams.module;

  const course = await getCourseDetails(id);
  const allModules = replaceMongoIdInArray(course.modules).toSorted(
    (a, b) => a.order - b.order,
  );

  // Kiểm tra xem allModules có phần tử nào không
  if (!allModules || allModules.length === 0) {
    return (
      <div className="flex h-[calc(100vh-64px)] flex-col items-center justify-center">
        <h1 className="mb-4 text-2xl font-semibold">
          Không tìm thấy bài học nào trong khóa học này
        </h1>
        <Button asChild>
          <a href="/courses">Quay lại danh sách khóa học</a>
        </Button>
      </div>
    );
  }

  const firstModule = allModules[0];
  const defaultLesson =
    firstModule?.lessonIds?.length > 0
      ? replaceMongoIdInObject(
          firstModule.lessonIds.toSorted((a, b) => a.order - b.order)[0],
        )
      : null;

  if (!defaultLesson) {
    return (
      <div className="flex h-[calc(100vh-64px)] flex-col items-center justify-center">
        <h1 className="mb-4 text-2xl font-semibold">
          Không tìm thấy bài học nào trong khóa học này
        </h1>
        <Button asChild>
          <a href="/courses">Quay lại danh sách khóa học</a>
        </Button>
      </div>
    );
  }

  const lessonToPay = nameParam
    ? await getLessonBySlug(nameParam)
    : defaultLesson;
  const defaultModule = moduleParam ?? (firstModule?.slug || "");

  // Format duration
  const formatDuration = (minutes) => {
    if (!minutes) return "Chưa xác định";
    if (minutes < 60) return `${minutes} phút`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours} giờ ${remainingMinutes > 0 ? `${remainingMinutes} phút` : ""}`;
  };

  // Get current module
  const currentModule =
    allModules.find((module) => module.slug === defaultModule) || firstModule;

  return (
    <div className="mx-auto max-w-4xl">
      {/* Video Player */}
      <div className="mb-6 overflow-hidden rounded-xl bg-black">
        <LessonVideo
          courseId={id}
          lesson={lessonToPay}
          module={defaultModule}
        />
      </div>

      {/* Lesson Content */}
      <div className="space-y-8">
        {/* Title & Meta */}
        <div>
          <h1 className="mb-4 text-2xl font-bold text-gray-900">
            {lessonToPay.title}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              <span>
                {new Date(
                  lessonToPay.createdAt || Date.now(),
                ).toLocaleDateString("vi-VN")}
              </span>
            </div>
            {lessonToPay.duration && (
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                <span>{formatDuration(lessonToPay.duration)}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <FileText className="h-4 w-4" />
              <span>{currentModule?.title}</span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Description */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Mô tả bài học</h2>
          <div className="prose prose-slate max-w-none">
            {lessonToPay.description ? (
              <div
                dangerouslySetInnerHTML={{ __html: lessonToPay.description }}
              />
            ) : (
              <p className="text-gray-500">Không có mô tả cho bài học này.</p>
            )}
          </div>
        </div>

        {/* Attachments */}
        {lessonToPay.attachment && (
          <>
            <Separator />
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Tài liệu bài học
              </h2>
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        Tài liệu bài học
                      </p>
                      <p className="text-sm text-gray-500">
                        {lessonToPay.attachment.name || "lecture-materials.pdf"}
                      </p>
                    </div>
                  </div>
                  <DownloadButton
                    url={lessonToPay.attachment.url}
                    filename={
                      lessonToPay.attachment.name || "lecture-materials.pdf"
                    }
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                  >
                    Tải xuống
                  </DownloadButton>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default LessonPage;
