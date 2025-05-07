import { Button } from "@/components/ui/button";
import { VideoPlayer } from "./_components/video-player";
import { Separator } from "@/components/ui/separator";
import VideoDescription from "./_components/video-description";
import { getCourseDetails } from "@/queries/courses";
import {
  replaceMongoIdInArray,
  replaceMongoIdInObject,
} from "@/lib/convertData";
import { getLessonBySlug } from "@/queries/lessons";
import { LessonVideo } from "./_components/lesson-video";

const Course = async ({ params, searchParams }) => {
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
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-2xl font-semibold mb-4">
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
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-2xl font-semibold mb-4">
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

  return (
    <div>
      <div className="flex flex-col max-w-4xl mx-auto pb-20">
        <div className="p-4 w-full">
          <LessonVideo
            courseId={id}
            lesson={lessonToPay}
            module={defaultModule}
          />
        </div>
        <div>
          <div className="p-4 flex flex-col md:flex-row items-center justify-between">
            <h2 className="text-2xl font-semibold mb-2">
              {lessonToPay.title}
            </h2>
          </div>
          <Separator />
          <VideoDescription description={lessonToPay.description} />
        </div>
      </div>
    </div>
  );
};
export default Course;
