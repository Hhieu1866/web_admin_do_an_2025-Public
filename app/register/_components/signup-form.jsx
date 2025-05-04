'use client'
import Link from "next/link";
import { useState, useEffect } from "react";
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
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CheckCircle2, XCircle } from "lucide-react";
import { ProgressBar } from "@tremor/react";

export function SignupForm() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordRequirements, setPasswordRequirements] = useState({
    length: false,
    lowercase: false,
    uppercase: false,
    number: false,
    special: false
  });

  // Kiểm tra độ mạnh mật khẩu khi người dùng nhập
  useEffect(() => {
    if (!password) {
      setPasswordStrength(0);
      setPasswordRequirements({
        length: false,
        lowercase: false,
        uppercase: false,
        number: false,
        special: false
      });
      return;
    }

    const requirements = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
    };

    setPasswordRequirements(requirements);

    // Tính điểm độ mạnh (20 điểm cho mỗi yêu cầu thoả mãn)
    const strength = Object.values(requirements).filter(Boolean).length * 20;
    setPasswordStrength(strength);
  }, [password]);

  const getPasswordStrengthLabel = () => {
    if (passwordStrength === 0) return "Chưa nhập mật khẩu";
    if (passwordStrength <= 20) return "Rất yếu";
    if (passwordStrength <= 40) return "Yếu";
    if (passwordStrength <= 60) return "Trung bình";
    if (passwordStrength <= 80) return "Mạnh";
    return "Rất mạnh";
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength === 0) return "gray";
    if (passwordStrength <= 20) return "red";
    if (passwordStrength <= 40) return "orange";
    if (passwordStrength <= 60) return "yellow";
    if (passwordStrength <= 80) return "blue";
    return "green";
  };

  async function onSubmit(event) {
    event.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const formData = new FormData(event.currentTarget);
      const firstName = formData.get("first-name");
      const lastName = formData.get("last-name");
      const email = formData.get("email");
      const password = formData.get("password");
      const confirmPassword = formData.get("confirmPassword");

      // Kiểm tra mật khẩu xác nhận
      if (password !== confirmPassword) {
        setError('Mật khẩu xác nhận không khớp.');
        setIsLoading(false);
        return;
      }

      // Kiểm tra độ mạnh mật khẩu
      if (passwordStrength < 100) {
        setError('Mật khẩu chưa đáp ứng đủ các yêu cầu bảo mật.');
        setIsLoading(false);
        return;
      }

      // Mặc định role là user (không còn phân biệt student/instructor)
      const userRole = "user"; 

      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          password,
          userRole 
        })
      });

      if (response.status === 201) {
        toast.success("Đăng ký tài khoản thành công!");
        router.push("/login");
      } else {
        const data = await response.json();
        setError(data.message || "Có lỗi xảy ra khi đăng ký.");
      }
    } catch (e) {
      setError(e.message || "Có lỗi xảy ra khi đăng ký.");
    } finally {
      setIsLoading(false);
    } 
  }

  return (
    <Card className="mx-auto max-w-md">
      <CardHeader>
        <CardTitle className="text-xl">
        <p className="mt-5 text-3xl font-bold leading-tight text-gray-900 sm:leading-tight sm:text-5xl lg:text-3xl lg:leading-tight font-pj">
       <span className="relative inline-flex sm:inline">
                <span className="bg-gradient-to-r from-[#44BCFF] via-[#FF44EC] to-[#FF675E] blur-lg filter opacity-30 w-full h-full absolute inset-0"></span>
              <span className="relative">Đăng ký</span>
          </span>
          </p>
        </CardTitle>
        <CardDescription>
          Nhập thông tin của bạn để tạo tài khoản mới
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit}>
        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
                <Label htmlFor="first-name">Họ</Label>
                <Input id="first-name" name="first-name" placeholder="Nguyễn" required />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="last-name">Tên</Label>
                <Input id="last-name" name="last-name" placeholder="Văn A" required />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email" 
              type="email"
                placeholder="email@example.com"
              required
            />
          </div>
          <div className="grid gap-2">
              <Label htmlFor="password">Mật khẩu</Label>
              <Input 
                id="password" 
                name="password" 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
                className="mb-1"
              />
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span>Độ mạnh: {getPasswordStrengthLabel()}</span>
                  <span>{passwordStrength}%</span>
                </div>
                <ProgressBar value={passwordStrength} color={getPasswordStrengthColor()} className="mt-1" />
                
                <div className="mt-2 space-y-1.5">
                  <p className="text-xs font-medium mb-1">Mật khẩu phải có:</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-1 text-xs">
                    <div className="flex items-center gap-1.5">
                      {passwordRequirements.length ? 
                        <CheckCircle2 className="h-3.5 w-3.5 text-green-500" /> : 
                        <XCircle className="h-3.5 w-3.5 text-red-500" />
                      }
                      <span>Ít nhất 8 ký tự</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {passwordRequirements.lowercase ? 
                        <CheckCircle2 className="h-3.5 w-3.5 text-green-500" /> : 
                        <XCircle className="h-3.5 w-3.5 text-red-500" />
                      }
                      <span>Chữ thường (a-z)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {passwordRequirements.uppercase ? 
                        <CheckCircle2 className="h-3.5 w-3.5 text-green-500" /> : 
                        <XCircle className="h-3.5 w-3.5 text-red-500" />
                      }
                      <span>Chữ hoa (A-Z)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {passwordRequirements.number ? 
                        <CheckCircle2 className="h-3.5 w-3.5 text-green-500" /> : 
                        <XCircle className="h-3.5 w-3.5 text-red-500" />
                      }
                      <span>Chữ số (0-9)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {passwordRequirements.special ? 
                        <CheckCircle2 className="h-3.5 w-3.5 text-green-500" /> : 
                        <XCircle className="h-3.5 w-3.5 text-red-500" />
                      }
                      <span>Ký tự đặc biệt (!@#$...)</span>
                    </div>
                  </div>
                </div>
              </div>
          </div>
          <div className="grid gap-2">
              <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
              <Input 
                id="confirmPassword" 
                name="confirmPassword" 
                type="password" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required 
              />
              {password && confirmPassword && password !== confirmPassword && (
                <p className="text-xs text-red-500 mt-1">Mật khẩu xác nhận không khớp</p>
              )}
            </div>
            {error && (
              <div className="text-sm text-red-500 p-2 bg-red-50 rounded-md border border-red-200">
                {error}
          </div>
            )}
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading || passwordStrength < 100 || password !== confirmPassword}
            >
              {isLoading ? "Đang xử lý..." : "Tạo tài khoản"}
          </Button>
        </div>
        <div className="mt-4 text-center text-sm">
            Đã có tài khoản?{" "}
            <Link href="/login" className="underline text-primary font-medium">
              Đăng nhập
          </Link>
        </div>
        </form>
      </CardContent>
    </Card>
  );
}
