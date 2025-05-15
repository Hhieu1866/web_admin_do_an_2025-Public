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
import { CompleteLessonButton } from "./_components/complete-lesson-button";
import { getLoggedInUser } from "@/lib/loggedin-user";
import { Watch } from "@/model/watch-model";
import { redirect } from "next/navigation";
import { createCacheKey, deleteCache } from "@/lib/cache";

const LessonPage = async ({ params, searchParams }) => {
  const id = params.id;
  const nameParam = searchParams.name;
  const moduleParam = searchParams.module;

  // Lấy thông tin người dùng đăng nhập
  const loggedinUser = await getLoggedInUser();
  if (!loggedinUser) {
    return redirect("/login");
  }

  // Xóa cache báo cáo khi load trang bài học mới để đảm bảo dữ liệu mới nhất
  const reportCacheKey = createCacheKey("report", id, loggedinUser.id);
  deleteCache(reportCacheKey);

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

  // Get current module
  const currentModule =
    allModules.find((module) => module.slug === defaultModule) || firstModule;

  // Kiểm tra xem bài học này có thể truy cập hay không
  const lessonId = lessonToPay.id;
  const moduleId = currentModule.id;
  const watch = await Watch.findOne({
    lesson: lessonId,
    module: moduleId,
    user: loggedinUser.id,
  }).lean();

  // Kiểm tra tham số truy cập từ đâu
  const fromComplete = searchParams.fromComplete === "true";

  // Sửa logic kiểm tra để không tự động đánh dấu bài là completed
  if (!watch) {
    // Nếu chưa có record watch, tạo record started
    await Watch.create({
      lesson: lessonId,
      module: moduleId,
      user: loggedinUser.id,
      state: "started",
      lastTime: 0,
      created_at: Date.now(),
      modified_at: Date.now(),
    });
    lessonToPay.state = "started";
  } else {
    // Cập nhật trạng thái bài học hiện tại theo đúng dữ liệu trong database
    lessonToPay.state = watch.state;
  }

  // Lấy tất cả bài học trong module hiện tại và sắp xếp theo thứ tự
  const currentModuleLessons = currentModule?.lessonIds
    ? replaceMongoIdInArray(currentModule.lessonIds).toSorted(
        (a, b) => a.order - b.order,
      )
    : [];

  // Tìm vị trí bài học hiện tại
  const currentLessonIndex = currentModuleLessons.findIndex(
    (lesson) => lesson.id === lessonToPay.id,
  );

  // Tìm bài học tiếp theo trong cùng module
  let nextLessonUrl = null;

  // Chỉ xác định nextLessonUrl nếu bài học hiện tại đã hoàn thành
  if (lessonToPay.state === "completed") {
    if (
      currentLessonIndex !== -1 &&
      currentLessonIndex < currentModuleLessons.length - 1
    ) {
      // Có bài tiếp theo trong cùng module
      const nextLesson = currentModuleLessons[currentLessonIndex + 1];
      nextLessonUrl = `/courses/${id}/lesson?name=${nextLesson.slug}&module=${currentModule.slug}`;
    } else {
      // Kiểm tra xem có module tiếp theo không
      const currentModuleIndex = allModules.findIndex(
        (module) => module.id === currentModule.id,
      );
      if (
        currentModuleIndex !== -1 &&
        currentModuleIndex < allModules.length - 1
      ) {
        // Có module tiếp theo
        const nextModule = allModules[currentModuleIndex + 1];
        if (nextModule.lessonIds && nextModule.lessonIds.length > 0) {
          // Lấy bài học đầu tiên của module tiếp theo
          const firstLessonOfNextModule = replaceMongoIdInObject(
            nextModule.lessonIds.toSorted((a, b) => a.order - b.order)[0],
          );
          nextLessonUrl = `/courses/${id}/lesson?name=${firstLessonOfNextModule.slug}&module=${nextModule.slug}`;
        }
      }
    }
  }

  // Debug thông tin bài học
  console.log("Lesson data:", {
    id: lessonToPay?.id,
    title: lessonToPay?.title,
    content_type: lessonToPay?.content_type,
    video_url: lessonToPay?.video_url,
  });

  // Format duration
  const formatDuration = (minutes) => {
    if (!minutes) return "Chưa xác định";
    if (minutes < 60) return `${minutes} phút`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours} giờ ${remainingMinutes > 0 ? `${remainingMinutes} phút` : ""}`;
  };

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

          {/* Nút đánh dấu hoàn thành bài học */}
          <div className="mt-8 flex justify-center">
            <CompleteLessonButton
              courseId={id}
              lessonId={lessonToPay.id}
              moduleSlug={defaultModule}
              initialState={lessonToPay.state}
              nextLessonUrl={nextLessonUrl}
            />
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
