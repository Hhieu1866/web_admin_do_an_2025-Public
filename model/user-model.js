import mongoose, { Schema } from "mongoose";

// Hàm kết nối đến MongoDB
async function connectToMongoDB() {
  if (mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }

  try {
    console.log("Đang kết nối đến MongoDB...");
    const conn = await mongoose.connect(process.env.MONGODB_CONNECTION_STRING);
    console.log("Kết nối MongoDB thành công!");
    return conn;
  } catch (error) {
    console.error("Lỗi kết nối MongoDB:", error.message);
    console.error("Stack trace:", error.stack);
    throw error; // Ném lỗi để xử lý ở mức cao hơn
  }
}

const userSchema = new Schema({
  firstName: {
    required: true,
    type: String,
  },
  lastName: {
    required: true,
    type: String,
  },
  password: {
    required: true,
    type: String,
  },
  email: {
    required: true,
    type: String,
  },
  role: {
    required: true,
    type: String,
  },
  phone: {
    required: false,
    type: String,
  },
  bio: {
    required: false,
    type: String,
    default: "",
  },
  socialMedia: {
    required: false,
    type: Object,
  },

  profilePicture: {
    required: false,
    type: String,
  },
  designation: {
    required: false,
    type: String,
    default: "",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Xử lý an toàn hơn để tránh lỗi khi mongoose chưa được kết nối
let User;

// Sử dụng mô hình người dùng nếu đã tồn tại, nếu không thì tạo mới
if (mongoose.models && mongoose.models.User) {
  User = mongoose.models.User;
} else {
  User = mongoose.model("User", userSchema);
}

export { User, connectToMongoDB };
