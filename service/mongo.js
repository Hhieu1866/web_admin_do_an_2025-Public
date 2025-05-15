import mongoose from "mongoose";

const MONGODB_CONNECTION_TIMEOUT = 60000; // Tăng timeout lên 60 giây
const MAX_RETRIES = 5; // Tăng số lần thử lại kết nối tối đa
const RETRY_INTERVAL = 2000; // Tăng khoảng thời gian giữa các lần thử lại (ms)
const RECONNECT_INTERVAL = 10000; // Khoảng thời gian thử kết nối lại khi mất kết nối

export async function dbConnect() {
  let retries = 0;

  // Thiết lập sự kiện khi mất kết nối
  mongoose.connection.on("disconnected", () => {
    console.log("MongoDB bị ngắt kết nối, sẽ thử kết nối lại sau 10 giây...");
    setTimeout(() => {
      console.log("Đang thử kết nối lại MongoDB...");
      mongoose
        .connect(
          String(process.env.MONGODB_CONNECTION_STRING),
          getConnectionOptions(),
        )
        .catch((err) => console.error("Lỗi khi thử kết nối lại:", err.message));
    }, RECONNECT_INTERVAL);
  });

  // Thiết lập sự kiện khi kết nối thành công
  mongoose.connection.on("connected", () => {
    console.log("Kết nối MongoDB thành công!");
  });

  // Thiết lập sự kiện khi có lỗi
  mongoose.connection.on("error", (err) => {
    console.error("Lỗi trong kết nối MongoDB:", err.message);
  });

  // Hàm tạo options kết nối
  function getConnectionOptions() {
    return {
      serverSelectionTimeoutMS: MONGODB_CONNECTION_TIMEOUT,
      socketTimeoutMS: MONGODB_CONNECTION_TIMEOUT,
      connectTimeoutMS: MONGODB_CONNECTION_TIMEOUT,
      heartbeatFrequencyMS: 5000, // Giảm thời gian giữa các heartbeat để phát hiện vấn đề sớm hơn
      maxPoolSize: 20, // Tăng kích thước pool kết nối
      minPoolSize: 5, // Duy trì ít nhất 5 kết nối
      // Buffer lệnh trong 60 giây
      bufferCommands: true,
      bufferMaxEntries: 0, // Vô hiệu hóa buffering để lỗi xảy ra ngay lập tức thay vì timeout
      // Cấu hình retry kết nối
      autoReconnect: true,
      useNewUrlParser: true,
    };
  }

  while (retries < MAX_RETRIES) {
    try {
      // Kiểm tra xem đã kết nối chưa
      if (mongoose.connection.readyState >= 1) {
        return mongoose.connection;
      }

      // Kết nối mới nếu chưa kết nối
      console.log(
        `Đang kết nối MongoDB... (lần thử ${retries + 1}/${MAX_RETRIES})`,
      );

      const conn = await mongoose.connect(
        String(process.env.MONGODB_CONNECTION_STRING),
        getConnectionOptions(),
      );

      console.log("Kết nối MongoDB thành công!");
      return conn;
    } catch (error) {
      retries++;
      console.error(
        `Lỗi kết nối MongoDB (lần thử ${retries}/${MAX_RETRIES}):`,
        error.message,
      );

      if (retries >= MAX_RETRIES) {
        console.error("Đã hết số lần thử lại. Stack trace:", error.stack);
        throw new Error(
          `Không thể kết nối đến MongoDB sau ${MAX_RETRIES} lần thử: ${error.message}`,
        );
      }

      // Tăng thời gian chờ theo số lần thử
      const waitTime = RETRY_INTERVAL * retries;
      console.log(`Đợi ${waitTime}ms trước khi thử lại...`);
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
  }
}
