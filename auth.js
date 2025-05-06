import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { User } from "./model/user-model";
import bcrypt from 'bcryptjs';
import { authConfig } from "./auth.config";

const nextAuthConfig = {
    ...authConfig,
    providers: [
        CredentialsProvider({
            name: 'credentials',
            credentials: {
                email: { label: "Email", type: "text" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Vui lòng nhập đầy đủ email và mật khẩu");
                }

                try {
                    const user = await User.findOne({email: credentials?.email });

                    if (!user) {
                        throw new Error("Tài khoản không tồn tại");
                    }
                    
                    const isMatch = await bcrypt.compare(credentials.password, user.password);

                    if (isMatch) {
                        return {
                            id: user._id.toString(),
                            email: user.email,
                            name: `${user.firstName} ${user.lastName}`,
                            role: user.role
                        };
                    } else {
                        throw new Error("Mật khẩu không chính xác");
                    } 
                } catch (error) {
                    console.error("Lỗi đăng nhập:", error);
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
    }
};

export const { handlers: { GET, POST }, auth, signIn, signOut } = NextAuth(nextAuthConfig);
