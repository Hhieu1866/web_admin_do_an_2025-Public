import {
  replaceMongoIdInArray,
  replaceMongoIdInObject,
} from "@/lib/convertData";
import { Course } from "@/model/course-model";
import { Enrollment } from "@/model/enrollment-model";
import { dbConnect } from "@/service/mongo";
import mongoose from "mongoose";

export async function getEnrollmentsForCourse(courseId) {
  await dbConnect();
  const enrollments = await Enrollment.find({ course: courseId }).lean();
  return replaceMongoIdInArray(enrollments);
}

export async function enrollForCourse(courseId, userId) {
  try {
    // Đảm bảo đã kết nối đến MongoDB trước khi thực hiện thao tác
    await dbConnect();

    console.log(
      "Đang đăng ký khóa học với ID:",
      courseId,
      "cho user:",
      userId,
    );

    const newEnrollment = {
      course: courseId,
      student: userId,
      method: "free", // Tất cả khóa học đều miễn phí
      enrollment_date: Date.now(),
      status: "not-started",
    };

    // Sử dụng phương thức tạo mới đối tượng Mongoose
    const enrollment = new Enrollment(newEnrollment);
    const savedEnrollment = await enrollment.save();

    console.log("Đăng ký thành công:", savedEnrollment);
    return savedEnrollment;
  } catch (error) {
    console.error("Lỗi chi tiết khi đăng ký khóa học:", error);
    throw new Error(error.message || "Không thể đăng ký khóa học");
  }
}

export async function getEnrollmentsForUser(userId) {
  try {
    if (!userId) {
      console.error("getUserId is undefined or null");
      return [];
    }

    await dbConnect();

    // Đảm bảo userId là ObjectId hợp lệ
    let userObjectId;
    try {
      userObjectId = new mongoose.Types.ObjectId(userId);
    } catch (error) {
      console.error("Invalid userId format:", userId, error);
      return [];
    }

    console.log("Đang lấy danh sách khóa học đã đăng ký cho user:", userId);

    const enrollments = await Enrollment.find({ student: userObjectId })
      .populate({
        path: "course",
        model: Course,
      })
      .lean();

    console.log("Tìm thấy", enrollments.length, "khóa học đã đăng ký");

    return replaceMongoIdInArray(enrollments);
  } catch (err) {
    console.error("Lỗi khi lấy danh sách khóa học đã đăng ký:", err);
    throw new Error(err);
  }
}

export async function hasEnrollmentForCourse(courseId, studentId) {
  try {
    if (!courseId || !studentId) {
      console.error("courseId hoặc studentId không hợp lệ:", {
        courseId,
        studentId,
      });
      return false;
    }

    await dbConnect();

    // Đảm bảo courseId và studentId là ObjectId hợp lệ
    let courseObjectId, studentObjectId;
    try {
      courseObjectId = new mongoose.Types.ObjectId(courseId);
      studentObjectId = new mongoose.Types.ObjectId(studentId);
    } catch (error) {
      console.error("Invalid ID format:", { courseId, studentId }, error);
      return false;
    }

    const enrollment = await Enrollment.findOne({
      course: courseObjectId,
      student: studentObjectId,
    })
      .populate({
        path: "course",
        model: Course,
      })
      .lean();

    return !!enrollment;
  } catch (error) {
    console.error("Lỗi khi kiểm tra đăng ký khóa học:", error);
    throw new Error(error);
  }
}
