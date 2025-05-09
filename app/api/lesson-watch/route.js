import { getLoggedInUser } from "@/lib/loggedin-user";
import { Watch } from "@/model/watch-model";
import { getLesson } from "@/queries/lessons";
import { getModuleBySlug, getModuleById } from "@/queries/modules";
import { createWatchReport } from "@/queries/reports";
import { NextRequest, NextResponse } from "next/server";
import { Course } from "@/model/course-model";

const STARTED = "started";
const COMPLETED = "completed";

async function updateReport(userId, courseId, moduleId, lessonId) {
  try {
    createWatchReport({ userId, courseId, moduleId, lessonId });
  } catch (error) {
    throw new Error(error);
  }
}

// Hàm tìm bài học tiếp theo trong module
async function findNextLessonInModule(courseId, moduleId, currentLessonId) {
  // Tìm module trong course
  const course = await Course.findById(courseId)
    .populate({
      path: "modules",
      populate: {
        path: "lessonIds",
      },
    })
    .lean();

  if (!course || !course.modules) return null;

  // Tìm module hiện tại
  const currentModule = course.modules.find(
    (m) => m._id.toString() === moduleId.toString(),
  );

  if (!currentModule || !currentModule.lessonIds) return null;

  // Sắp xếp bài học theo order
  const sortedLessons = [...currentModule.lessonIds].sort(
    (a, b) => a.order - b.order,
  );

  // Tìm index của bài học hiện tại
  const currentIndex = sortedLessons.findIndex(
    (l) => l._id.toString() === currentLessonId.toString(),
  );

  if (currentIndex === -1 || currentIndex === sortedLessons.length - 1) {
    // Nếu là bài cuối cùng trong module, tìm module tiếp theo
    const allModules = [...course.modules].sort((a, b) => a.order - b.order);
    const currentModuleIndex = allModules.findIndex(
      (m) => m._id.toString() === moduleId.toString(),
    );

    if (
      currentModuleIndex !== -1 &&
      currentModuleIndex < allModules.length - 1
    ) {
      const nextModule = allModules[currentModuleIndex + 1];
      if (nextModule.lessonIds && nextModule.lessonIds.length > 0) {
        // Trả về bài đầu tiên của module tiếp theo
        const nextLessons = [...nextModule.lessonIds].sort(
          (a, b) => a.order - b.order,
        );
        return {
          lesson: nextLessons[0],
          module: nextModule,
        };
      }
    }
    return null;
  }

  // Trả về bài học tiếp theo trong cùng module
  return {
    lesson: sortedLessons[currentIndex + 1],
    module: currentModule,
  };
}

export async function POST(request) {
  const { courseId, lessonId, moduleSlug, state, lastTime, unlockNext } =
    await request.json();

  const loggedinUser = await getLoggedInUser();
  const lesson = await getLesson(lessonId);
  const module = await getModuleBySlug(moduleSlug);

  if (!loggedinUser) {
    return new NextResponse(`You are not authenticated.`, {
      status: 401,
    });
  }

  if (state !== STARTED && state !== COMPLETED) {
    return new NextResponse(`Invalid state. Can not process request`, {
      status: 500,
    });
  }

  if (!lesson) {
    return new NextResponse(`Invalid lesson. Can not process request`, {
      status: 500,
    });
  }

  const watchEntry = {
    lastTime,
    lesson: lesson.id,
    module: module.id,
    user: loggedinUser.id,
    state,
  };

  try {
    const found = await Watch.findOne({
      lesson: lessonId,
      module: module.id,
      user: loggedinUser.id,
    }).lean();

    if (state === STARTED) {
      if (!found) {
        watchEntry["created_at"] = Date.now();
        await Watch.create(watchEntry);
      }
    } else if (state === COMPLETED) {
      if (!found) {
        watchEntry["created_at"] = Date.now();
        await Watch.create(watchEntry);
        await updateReport(loggedinUser.id, courseId, module.id, lessonId);
      } else {
        if (found.state !== COMPLETED) {
          watchEntry["modified_at"] = Date.now();
          await Watch.findByIdAndUpdate(found._id, {
            state: COMPLETED,
            modified_at: Date.now(),
          });
          await updateReport(loggedinUser.id, courseId, module.id, lessonId);
        }
      }

      // Nếu có yêu cầu mở khóa bài tiếp theo, tìm và mở khóa bài học tiếp theo
      if (unlockNext) {
        const nextLessonInfo = await findNextLessonInModule(
          courseId,
          module.id,
          lessonId,
        );

        if (nextLessonInfo) {
          // Kiểm tra xem đã có bản ghi watch cho bài tiếp theo chưa
          const nextLessonWatch = await Watch.findOne({
            lesson: nextLessonInfo.lesson._id,
            module: nextLessonInfo.module._id,
            user: loggedinUser.id,
          }).lean();

          // Nếu chưa có, tạo mới với state="started"
          if (!nextLessonWatch) {
            await Watch.create({
              lesson: nextLessonInfo.lesson._id,
              module: nextLessonInfo.module._id,
              user: loggedinUser.id,
              state: STARTED,
              lastTime: 0,
              created_at: Date.now(),
              modified_at: Date.now(),
            });
          }
          // Nếu có rồi nhưng chưa started, cập nhật thành started
          else if (
            nextLessonWatch.state !== STARTED &&
            nextLessonWatch.state !== COMPLETED
          ) {
            await Watch.findByIdAndUpdate(nextLessonWatch._id, {
              state: STARTED,
              modified_at: Date.now(),
            });
          }
        }
      }
    }

    return new NextResponse("Watch Record added Successfully", {
      status: 200,
    });
  } catch (error) {
    console.log(error);
    return new NextResponse(error.message, {
      status: 500,
    });
  }
}
