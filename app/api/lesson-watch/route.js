import { getLoggedInUser } from "@/lib/loggedin-user";
import { Watch } from "@/model/watch-model";
import { getLesson } from "@/queries/lessons";
import { getModuleBySlug, getModuleById } from "@/queries/modules";
import { createWatchReport } from "@/queries/reports";
import { NextRequest, NextResponse } from "next/server";
import { Course } from "@/model/course-model";
import mongoose from "mongoose";
import { dbConnect } from "@/service/mongo";
import { getCache, setCache, createCacheKey, deleteCache } from "@/lib/cache";

const STARTED = "started";
const COMPLETED = "completed";
const WATCH_CACHE_TTL = 5 * 60 * 1000; // 5 phút

async function updateReport(userId, courseId, moduleId, lessonId) {
  try {
    createWatchReport({ userId, courseId, moduleId, lessonId });
  } catch (error) {
    throw new Error(error);
  }
}

// Hàm tìm bài học tiếp theo trong module
async function findNextLessonInModule(courseId, moduleId, currentLessonId) {
  try {
    await dbConnect();

    // Kiểm tra cache
    const cacheKey = createCacheKey(
      "findNextLessonInModule",
      courseId,
      moduleId,
      currentLessonId,
    );
    const cachedData = getCache(cacheKey);
    if (cachedData) {
      return cachedData;
    }

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

    let result = null;

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
          result = {
            lesson: nextLessons[0],
            module: nextModule,
          };
        }
      }
    } else {
      // Trả về bài học tiếp theo trong cùng module
      result = {
        lesson: sortedLessons[currentIndex + 1],
        module: currentModule,
      };
    }

    // Lưu kết quả vào cache
    setCache(cacheKey, result, WATCH_CACHE_TTL);
    return result;
  } catch (error) {
    console.error("Lỗi khi tìm bài học tiếp theo:", error);
    return null;
  }
}

export async function GET(request) {
  try {
    const loggedInUser = await getLoggedInUser();
    if (!loggedInUser) {
      return NextResponse.json(
        { error: "Bạn cần đăng nhập để thực hiện thao tác này" },
        { status: 401 },
      );
    }

    const url = new URL(request.url);
    const courseId = url.searchParams.get("courseId");
    const checkOnly = url.searchParams.get("checkOnly") === "true";

    if (!courseId) {
      return NextResponse.json(
        { error: "Thiếu thông tin khóa học" },
        { status: 400 },
      );
    }

    if (checkOnly) {
      // Kiểm tra cache
      const cacheKey = createCacheKey(
        "hasStartedLearning",
        courseId,
        loggedInUser.id,
      );
      const cachedData = getCache(cacheKey);
      if (cachedData !== null) {
        return NextResponse.json({
          hasStarted: cachedData,
        });
      }

      await dbConnect();

      // Kiểm tra xem học viên đã bắt đầu học chưa
      const watchRecord = await Watch.findOne({
        user: new mongoose.Types.ObjectId(loggedInUser.id),
      }).lean();

      const result = !!watchRecord;

      // Lưu kết quả vào cache
      setCache(cacheKey, result, WATCH_CACHE_TTL);

      return NextResponse.json({
        hasStarted: result,
      });
    }

    return NextResponse.json(
      { error: "Phương thức không được hỗ trợ" },
      { status: 400 },
    );
  } catch (error) {
    console.error("Lỗi khi kiểm tra trạng thái học tập:", error);
    return NextResponse.json(
      { error: "Có lỗi xảy ra khi kiểm tra trạng thái học tập" },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const { courseId, lessonId, moduleSlug, state, lastTime, unlockNext } =
      await request.json();

    const loggedinUser = await getLoggedInUser();

    if (!loggedinUser) {
      return NextResponse.json(
        { error: "Bạn cần đăng nhập để thực hiện thao tác này" },
        { status: 401 },
      );
    }

    if (state !== STARTED && state !== COMPLETED) {
      return NextResponse.json(
        { error: "Trạng thái không hợp lệ" },
        { status: 400 },
      );
    }

    await dbConnect();

    const lesson = await getLesson(lessonId);
    if (!lesson) {
      return NextResponse.json(
        { error: "Không tìm thấy bài học" },
        { status: 404 },
      );
    }

    const module = await getModuleBySlug(moduleSlug);
    if (!module) {
      return NextResponse.json(
        { error: "Không tìm thấy module" },
        { status: 404 },
      );
    }

    const watchEntry = {
      lastTime,
      lesson: lesson.id,
      module: module.id,
      user: loggedinUser.id,
      state,
    };

    // Xóa cache liên quan
    deleteCache(
      createCacheKey("hasStartedLearning", courseId, loggedinUser.id),
    );

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

    return NextResponse.json(
      {
        message: "Watch Record added Successfully",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Lỗi khi cập nhật trạng thái học tập:", error);
    return NextResponse.json(
      {
        error: error.message || "Có lỗi xảy ra khi cập nhật trạng thái học tập",
      },
      { status: 500 },
    );
  }
}
