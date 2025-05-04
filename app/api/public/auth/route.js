import { NextResponse } from "next/server";
import { dbConnect } from "@/service/mongo";
import { User } from "@/model/user-model";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { replaceMongoIdInObject } from "@/lib/convertData";

// Khóa bí mật để ký JWT, nên lưu trong biến môi trường
const JWT_SECRET = process.env.JWT_SECRET || "your-jwt-secret-key";

/**
 * API đăng nhập, trả về token JWT cho app-member
 */
export async function POST(request) {
  try {
    // Kết nối đến MongoDB
    await dbConnect();

    // Lấy dữ liệu từ body request
    const { email, password } = await request.json();

    // Kiểm tra đầu vào
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email và mật khẩu là bắt buộc" },
        { status: 400 },
      );
    }

    // Tìm người dùng theo email
    const user = await User.findOne({ email }).lean();

    // Nếu không tìm thấy người dùng
    if (!user) {
      return NextResponse.json(
        { error: "Email hoặc mật khẩu không đúng" },
        { status: 401 },
      );
    }

    // Kiểm tra mật khẩu
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return NextResponse.json(
        { error: "Email hoặc mật khẩu không đúng" },
        { status: 401 },
      );
    }

    // Tạo token JWT
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: "7d" }, // Token hết hạn sau 7 ngày
    );

    // Loại bỏ mật khẩu trước khi trả về thông tin người dùng
    const { password: _, ...userWithoutPassword } = user;

    // Trả về thông tin người dùng và token
    return NextResponse.json({
      user: replaceMongoIdInObject(userWithoutPassword),
      token,
    });
  } catch (error) {
    console.error("Lỗi khi đăng nhập:", error);
    return NextResponse.json(
      { error: "Lỗi server khi đăng nhập" },
      { status: 500 },
    );
  }
}
