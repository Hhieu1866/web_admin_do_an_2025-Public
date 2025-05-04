import { NextResponse } from "next/server";
import { dbConnect } from "@/service/mongo";
import { User } from "@/model/user-model";
import bcrypt from "bcryptjs";
import { replaceMongoIdInObject } from "@/lib/convertData";

/**
 * API đăng ký người dùng mới cho app-member
 */
export async function POST(request) {
  try {
    // Kết nối đến MongoDB
    await dbConnect();

    // Lấy dữ liệu từ body request
    const data = await request.json();
    const { email, password, firstName, lastName, phone } = data;

    // Kiểm tra dữ liệu đầu vào bắt buộc
    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { error: "Thông tin đăng ký không đầy đủ" },
        { status: 400 },
      );
    }

    // Kiểm tra định dạng email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Định dạng email không hợp lệ" },
        { status: 400 },
      );
    }

    // Kiểm tra độ dài mật khẩu
    if (password.length < 6) {
      return NextResponse.json(
        { error: "Mật khẩu phải có ít nhất 6 ký tự" },
        { status: 400 },
      );
    }

    // Kiểm tra xem email đã tồn tại chưa
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "Email đã được sử dụng" },
        { status: 400 },
      );
    }

    // Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10);

    // Tạo người dùng mới
    const newUser = await User.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      phone: phone || "",
      role: "user", // Người dùng mới luôn có role là "user"
      createdAt: new Date(),
    });

    // Trả về thông tin người dùng đã tạo (không bao gồm mật khẩu)
    const userWithoutPassword = await User.findById(newUser._id).lean();
    const { password: _, ...userToReturn } = userWithoutPassword;

    return NextResponse.json({
      message: "Đăng ký thành công",
      user: replaceMongoIdInObject(userToReturn),
    });
  } catch (error) {
    console.error("Lỗi khi đăng ký người dùng:", error);
    return NextResponse.json(
      { error: "Lỗi server khi đăng ký người dùng" },
      { status: 500 },
    );
  }
}
