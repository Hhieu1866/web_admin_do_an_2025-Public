import { dbConnect } from "@/service/mongo";
import { User } from "@/model/user-model";
import { Course } from "@/model/course-model";
import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function GET(request) {
  try {
    // Kiểm tra xác thực và quyền admin
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Không được phép truy cập" }, { status: 401 });
    }

    // Kết nối đến MongoDB
    await dbConnect();

    // Kiểm tra role của người dùng
    const user = await User.findOne({ email: session.user.email });
    if (user?.role !== "admin") {
      return NextResponse.json({ error: "Không có quyền admin" }, { status: 403 });
    }

    // Tính toán các số liệu thống kê
    const totalUsers = await User.countDocuments();
    const totalInstructors = await User.countDocuments({ role: "instructor" });
    const totalStudents = await User.countDocuments({ role: "user" });
    
    // Thống kê khóa học
    const totalCourses = await Course.countDocuments();

    // Trả về dữ liệu thống kê
    return NextResponse.json({
      totalUsers,
      totalInstructors,
      totalStudents,
      totalCourses
    });
  } catch (error) {
    console.error("Lỗi khi lấy thống kê admin:", error);
    return NextResponse.json(
      { error: "Lỗi server khi lấy thống kê" },
      { status: 500 }
    );
  }
} 