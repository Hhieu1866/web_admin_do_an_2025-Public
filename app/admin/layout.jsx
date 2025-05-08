import { auth } from "@/auth";
import { getUserByEmail } from "@/queries/users";
import { redirect } from "next/navigation";
import { AdminSidebarWrapper } from "./_components/client-sidebar-wrapper";

export default async function AdminLayout({ children }) {
  const session = await auth();

  // Kiểm tra người dùng đã đăng nhập
  if (!session?.user) {
    redirect("/login");
  }

  // Lấy thông tin người dùng
  const user = await getUserByEmail(session.user.email);

  // Kiểm tra quyền admin
  if (user?.role !== "admin") {
    redirect("/"); // Nếu không phải admin, chuyển hướng về trang chủ
  }

  return (
    <>
      <AdminSidebarWrapper>
        <div className="p-6">{children}</div>
      </AdminSidebarWrapper>
    </>
  );
}
