import mongoose, { Schema } from "mongoose";

// Hàm kết nối đến MongoDB
async function connectToMongoDB() {
  if (mongoose.connection.readyState >= 1) {
    console.log("MongoDB đã được kết nối từ trước.");
    return;
  }

  try {
    console.log("Đang kết nối đến MongoDB...");
    await mongoose.connect(process.env.MONGODB_CONNECTION_STRING);
    console.log("Kết nối MongoDB thành công!");
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
try {
  console.log("Đang kiểm tra kết nối MongoDB...");
  // Đảm bảo đã kết nối trước khi tạo model
  connectToMongoDB().catch((err) => {
    console.error("Không thể kết nối đến MongoDB:", err.message);
  });

  // Kiểm tra xem model đã tồn tại chưa, nếu chưa thì tạo mới
  if (mongoose.models?.User) {
    console.log("Sử dụng model User đã được định nghĩa trước đó");
    User = mongoose.models.User;
  } else {
    console.log("Tạo model User mới");
    User = mongoose.model("User", userSchema);
  }
} catch (error) {
  // Trong trường hợp có lỗi, tạo model mới
  console.error("Lỗi khi khởi tạo model User:", error.message);
  console.error("Stack trace:", error.stack);
  User = mongoose.model("User", userSchema);
}

export { User };
