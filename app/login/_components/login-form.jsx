"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ceredntialLogin } from "@/app/actions";

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function onSubmit(event) {
    event.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData(event.currentTarget);
      const email = formData.get("email");
      const password = formData.get("password");

      // Kiểm tra cơ bản ở client side trước khi gửi request
      if (!email || !password) {
        toast.error("Vui lòng nhập đầy đủ email và mật khẩu", {
          duration: 3000,
          position: "top-center",
        });
        setIsLoading(false);
        return;
      }

      // Thêm logic retry với tối đa 2 lần thử
      let attempts = 0;
      let loginSuccess = false;
      let response;

      while (attempts < 2 && !loginSuccess) {
        try {
          response = await ceredntialLogin(formData);
          loginSuccess = true;
        } catch (err) {
          attempts++;
          console.log(`Lỗi đăng nhập lần ${attempts}, đang thử lại...`);

          // Nếu là lỗi timeout MongoDB, hiển thị thông báo nhưng vẫn thử lại
          if (err.message && err.message.includes("buffering timed out")) {
            if (attempts < 2) {
              toast.error("Hệ thống đang tải chậm, đang thử lại...", {
                duration: 2000,
                position: "top-center",
              });
              // Đợi 1 giây trước khi thử lại
              await new Promise((resolve) => setTimeout(resolve, 1000));
            }
          } else {
            // Nếu là lỗi khác, ném ra để xử lý bên ngoài
            throw err;
          }
        }
      }

      // Nếu không thành công sau 2 lần thử
      if (!loginSuccess) {
        throw new Error(
          "Không thể kết nối đến hệ thống. Vui lòng thử lại sau.",
        );
      }

      if (!!response?.error) {
        console.log(response.error);
        // Hiển thị lỗi với toast
        toast.error(response.error, {
          duration: 4000,
          position: "top-center",
          id: "login-error",
        });
        setIsLoading(false);
      } else {
        toast.success("Đăng nhập thành công!", {
          duration: 3000,
          position: "top-center",
        });

        // Kiểm tra role của người dùng để chuyển hướng phù hợp
        const userEmail = formData.get("email");
        try {
          // Lấy thông tin vai trò người dùng
          const userResponse = await fetch(
            `/api/users/check-role?email=${encodeURIComponent(userEmail)}`,
          );
          const userData = await userResponse.json();

          if (userData.role === "admin") {
            // Nếu là admin, chuyển đến trang admin dashboard
            router.push("/admin");
          } else if (userData.role === "instructor") {
            // Nếu là instructor, chuyển đến trang dashboard
            router.push("/dashboard");
          } else {
            // Nếu là người dùng thông thường (student), chuyển đến trang courses
            router.push("/courses");
          }
        } catch (err) {
          // Nếu có lỗi khi kiểm tra role, vẫn chuyển đến trang courses
          console.error("Lỗi khi kiểm tra role:", err);
          router.push("/courses");
        }
      }
    } catch (error) {
      console.error("Lỗi đăng nhập:", error);
      // Xử lý thông báo dựa vào loại lỗi
      let errorMessage = "Đã xảy ra lỗi khi đăng nhập";

      if (error.message && error.message.includes("buffering timed out")) {
        errorMessage = "Hệ thống đang tải chậm. Vui lòng thử lại sau.";
      } else if (error.message && error.message.includes("MongooseError")) {
        errorMessage =
          "Không thể kết nối đến cơ sở dữ liệu. Vui lòng thử lại sau.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      // Hiển thị lỗi với toast
      toast.error(errorMessage, {
        duration: 4000,
        position: "top-center",
      });
      setIsLoading(false);
    }
  }

  return (
    <Card className="mx-auto w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">
          <p className="font-pj mt-5 text-3xl font-bold leading-tight text-gray-900 sm:text-5xl sm:leading-tight lg:text-3xl lg:leading-tight">
            <span className="relative inline-flex sm:inline">
              <span className="absolute inset-0 h-full w-full bg-gradient-to-r from-[#44BCFF] via-[#FF44EC] to-[#FF675E] opacity-30 blur-lg filter"></span>
              <span className="relative">Đăng nhập</span>
            </span>
          </p>
        </CardTitle>
        <CardDescription>
          Nhập email và mật khẩu để đăng nhập vào tài khoản của bạn
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit}>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="email@example.com"
                required
                disabled={isLoading}
                className="focus:ring-primary"
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Mật khẩu</Label>
                {/* <Link href="#" className="ml-auto inline-block text-sm underline">
                  Quên mật khẩu?
              </Link> */}
              </div>
              <Input
                id="password"
                name="password"
                type="password"
                required
                disabled={isLoading}
                className="focus:ring-primary"
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="animate-faster-spin h-4 w-4" />
                  Đang xử lý...
                </span>
              ) : (
                "Đăng nhập"
              )}
            </Button>
          </div>
          <div className="mt-4 text-center text-sm">
            Chưa có tài khoản?{" "}
            <Link
              href="/register"
              className="text-primary underline hover:text-primary/80"
            >
              Đăng ký
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
