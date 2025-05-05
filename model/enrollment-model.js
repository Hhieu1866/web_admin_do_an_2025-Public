import mongoose, { Schema } from "mongoose";

const enrollmentSchema = new Schema({
  enrollment_date: {
    required: true,
    type: Date,
  },
  status: {
    required: true,
    type: String,
  },
  completion_date: {
    required: false,
    type: Date,
  },
  method: {
    required: true,
    type: String,
  },
  course: { type: Schema.ObjectId, ref: "Course" },

  student: { type: Schema.ObjectId, ref: "User" },
});

// Sửa lại cách khởi tạo model để tránh lỗi
let EnrollmentModel;
try {
  // Kiểm tra xem model đã tồn tại chưa
  EnrollmentModel = mongoose.model("Enrollment");
} catch (error) {
  // Nếu chưa tồn tại, tạo mới model
  EnrollmentModel = mongoose.model("Enrollment", enrollmentSchema);
}

export const Enrollment = EnrollmentModel;
