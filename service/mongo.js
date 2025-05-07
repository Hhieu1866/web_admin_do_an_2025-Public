import mongoose from "mongoose";

export async function dbConnect() {
  try {
    // Kiểm tra xem đã kết nối chưa
    if (mongoose.connection.readyState >= 1) {
      return mongoose.connection;
    }

    // Kết nối mới nếu chưa kết nối
    console.log("Đang kết nối MongoDB...");
    const conn = await mongoose.connect(
      String(process.env.MONGODB_CONNECTION_STRING),
    );
    console.log("Kết nối MongoDB thành công!");
    return conn;
  } catch (error) {
    console.error("Lỗi kết nối MongoDB:", error.message);
    console.error("Stack trace:", error.stack);
    throw error; // Ném lỗi để xử lý ở mức cao hơn
  }
}
