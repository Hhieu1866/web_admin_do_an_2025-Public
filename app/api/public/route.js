import { NextResponse } from "next/server";
import { dbConnect } from "@/service/mongo";
import { Course } from "@/model/course-model";
import { Category } from "@/model/category-model";
import { Lesson } from "@/model/lesson.model";
import { Module } from "@/model/module.model";
import { User } from "@/model/user-model";
import {
  replaceMongoIdInArray,
  replaceMongoIdInObject,
} from "@/lib/convertData";

/**
 * API route công khai để lấy danh sách khóa học
 * Không yêu cầu xác thực
 */
export async function GET(request) {
  try {
    // Kết nối đến MongoDB
    await dbConnect();

    // Lấy tham số từ URL
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "courses";
    const id = searchParams.get("id");
    const limit = parseInt(searchParams.get("limit")) || 10;
    const category = searchParams.get("category");

    // Xử lý các loại request khác nhau
    switch (type) {
      case "courses": {
        // Nếu có ID cụ thể, lấy chi tiết một khóa học
        if (id) {
          const course = await Course.findById(id)
            .populate({
              path: "category",
              model: Category,
            })
            .populate({
              path: "instructor",
              model: User,
              select: "firstName lastName profilePicture designation",
            })
            .populate({
              path: "modules",
              model: Module,
              populate: {
                path: "lessonIds",
                model: Lesson,
              },
            })
            .lean();

          if (!course) {
            return NextResponse.json(
              { error: "Không tìm thấy khóa học" },
              { status: 404 },
            );
          }

          return NextResponse.json(replaceMongoIdInObject(course));
        }

        // Lấy danh sách khóa học với bộ lọc nếu có
        let query = { active: true };

        // Lọc theo danh mục nếu có
        if (category) {
          query.category = category;
        }

        const courses = await Course.find(query)
          .select([
            "title",
            "subtitle",
            "thumbnail",
            "price",
            "category",
            "instructor",
            "createdAt",
          ])
          .populate({
            path: "category",
            model: Category,
          })
          .populate({
            path: "instructor",
            model: User,
            select: "firstName lastName profilePicture",
          })
          .sort({ createdAt: -1 })
          .limit(limit)
          .lean();

        return NextResponse.json(replaceMongoIdInArray(courses));
      }

      case "categories": {
        // Lấy danh sách danh mục
        const categories = await Category.find()
          .select(["name", "description"])
          .limit(limit)
          .lean();

        return NextResponse.json(replaceMongoIdInArray(categories));
      }

      case "lessons": {
        // Lấy bài học theo ID
        if (!id) {
          return NextResponse.json(
            { error: "ID bài học không được cung cấp" },
            { status: 400 },
          );
        }

        const lesson = await Lesson.findById(id).lean();

        if (!lesson) {
          return NextResponse.json(
            { error: "Không tìm thấy bài học" },
            { status: 404 },
          );
        }

        return NextResponse.json(replaceMongoIdInObject(lesson));
      }

      case "course-lessons": {
        // Lấy tất cả bài học của một khóa học
        if (!id) {
          return NextResponse.json(
            { error: "ID khóa học không được cung cấp" },
            { status: 400 },
          );
        }

        // Tìm khóa học
        const course = await Course.findById(id)
          .populate({
            path: "modules",
            model: Module,
          })
          .lean();

        if (!course) {
          return NextResponse.json(
            { error: "Không tìm thấy khóa học" },
            { status: 404 },
          );
        }

        // Lấy tất cả ID bài học từ các module
        const lessonIds = course.modules.reduce((ids, module) => {
          return [...ids, ...(module.lessonIds || [])];
        }, []);

        // Tìm tất cả bài học
        const lessons = await Lesson.find({
          _id: { $in: lessonIds },
        }).lean();

        return NextResponse.json(replaceMongoIdInArray(lessons));
      }

      default:
        return NextResponse.json(
          { error: "Loại yêu cầu không hợp lệ" },
          { status: 400 },
        );
    }
  } catch (error) {
    console.error("Lỗi khi xử lý API public:", error);
    return NextResponse.json(
      { error: "Lỗi server khi xử lý yêu cầu" },
      { status: 500 },
    );
  }
}
