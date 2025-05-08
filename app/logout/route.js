import { signOut } from "@/auth";
import { redirect } from "next/navigation";

export async function GET() {
  console.log("Đang xử lý request logout...");
  try {
    await signOut();
    console.log("Đã đăng xuất thành công, chuyển hướng về trang đăng nhập");
    return redirect("/login");
  } catch (error) {
    console.error("Lỗi khi đăng xuất:", error);
    return redirect("/login");
  }
}
