import { NextResponse } from "next/server";
import { dbConnect } from "@/service/mongo";
import { User } from "@/model/user-model";
import { replaceMongoIdInArray } from "@/lib/convertData";

export async function GET(request) {
  try {
    // Kết nối đến MongoDB
    await dbConnect();

    // Lấy tham số từ URL
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;
    const search = searchParams.get("search") || "";
    const role = searchParams.get("role") || "";

    // Tính toán skip để phân trang
    const skip = (page - 1) * limit;

    // Tạo query filter
    const filter = {};
    if (search) {
      filter.$or = [
        { email: { $regex: search, $options: "i" } },
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
      ];
    }
    if (role) {
      filter.role = role;
    }

    // Đếm tổng số người dùng
    const total = await User.countDocuments(filter);

    // Truy vấn user từ database với phân trang
    const users = await User.find(filter)
      .select("-password") // Loại bỏ mật khẩu
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const totalPages = Math.ceil(total / limit);

    // Trả về kết quả đã chuyển đổi _id thành id
    return NextResponse.json({
      users: replaceMongoIdInArray(users),
      total,
      page,
      limit,
      totalPages,
    });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách người dùng:", error);
    return NextResponse.json(
      { error: "Lỗi khi lấy danh sách người dùng" },
      { status: 500 },
    );
  }
}
