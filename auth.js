import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { User } from "./model/user-model";
import bcrypt from "bcryptjs";
import { authConfig } from "./auth.config";

const nextAuthConfig = {
  ...authConfig,
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log("Đang xử lý đăng nhập cho email:", credentials?.email);

        if (!credentials?.email || !credentials?.password) {
          console.error("Thiếu thông tin đăng nhập");
          throw new Error("Vui lòng nhập đầy đủ email và mật khẩu");
        }

        try {
          console.log("Đang tìm user với email:", credentials.email);
          const user = await User.findOne({ email: credentials?.email });

          if (!user) {
            console.error("Không tìm thấy user với email:", credentials.email);
            throw new Error("Tài khoản không tồn tại");
          }

          console.log(
            "Đã tìm thấy user:",
            user.email,
            "- Đang kiểm tra mật khẩu",
          );

          const isMatch = await bcrypt.compare(
            credentials.password,
            user.password,
          );

          console.log("Kết quả kiểm tra mật khẩu:", isMatch ? "Đúng" : "Sai");

          if (isMatch) {
            const userData = {
              id: user._id.toString(),
              email: user.email,
              name: `${user.firstName} ${user.lastName}`,
              role: user.role,
            };

            console.log(
              "Đăng nhập thành công. Dữ liệu trả về:",
              JSON.stringify(userData),
            );
            return userData;
          } else {
            console.error(
              "Mật khẩu không chính xác cho user:",
              credentials.email,
            );
            throw new Error("Mật khẩu không chính xác");
          }
        } catch (error) {
          console.error("Lỗi đăng nhập chi tiết:", error.message, error.stack);
          throw error;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.role = token.role;
        session.user.id = token.id;
      }
      return session;
    },
  },
};

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth(nextAuthConfig);
