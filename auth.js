import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { User } from "./model/user-model";
import bcrypt from 'bcryptjs';
import { authConfig } from "./auth.config";
 
export const {
    handlers: {GET, POST},
    auth,
    signIn,
    signOut,
} = NextAuth({
     ...authConfig,
    providers: [
        CredentialsProvider({
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Vui lòng nhập đầy đủ email và mật khẩu");
                }

        try {
            const user = await User.findOne({email: credentials?.email });

                    if (!user) {
                        // Thông báo cụ thể khi không tìm thấy tài khoản
                        throw new Error("Tài khoản không tồn tại");
                    }
                    
                    const isMatch = await bcrypt.compare(credentials.password, user.password);

                if (isMatch) {
                        // Trả về thông tin người dùng không bao gồm password
                        return {
                            id: user._id.toString(),
                            email: user.email,
                            name: `${user.firstName} ${user.lastName}`,
                            role: user.role
                        };
                } else {
                        // Thông báo cụ thể khi sai mật khẩu
                        throw new Error("Mật khẩu không chính xác");
                } 
                } catch (error) {
                    console.error("Lỗi đăng nhập:", error);
                    // Trả về lỗi với thông báo cụ thể
                    throw error;
            } 
            }
        })
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.role = user.role;
            }
            return token;
        },
        async session({ session, token }) {
            if (token) {
                session.user.role = token.role;
        }  
            return session;
            }
    },
    pages: {
        signIn: '/login',
        error: '/login'
    }
})
