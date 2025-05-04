import mongoose, {Schema} from "mongoose";

const userSchema = new Schema({
    firstName:{
        required: true,
        type: String
    },
    lastName:{
        required: true,
        type: String
    },
    password:{
        required: true,
        type: String
    },
    email:{
        required: true,
        type: String
    },
    role:{
        required: true,
        type: String
    },
    phone:{
        required: false,
        type: String
    },
    bio:{
        required: false,
        type: String,
        default: ""
    },
    socialMedia:{
        required: false,
        type: Object
    },   
  
    profilePicture:{
        required: false,
        type: String
    },
    designation:{
        required: false,
        type: String,
        default: ""
    },
    createdAt:{
        type: Date,
        default: Date.now
    }
});

// Xử lý an toàn hơn để tránh lỗi khi mongoose chưa được kết nối
let User;
try {
    // Kiểm tra xem model đã tồn tại chưa, nếu chưa thì tạo mới
    User = mongoose.models?.User || mongoose.model("User", userSchema);
} catch (error) {
    // Trong trường hợp có lỗi, tạo model mới
    User = mongoose.model("User", userSchema);
}

export { User };