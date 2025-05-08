import { Navbar } from "./_components/navbar";
import Sidebar from "./_components/sidebar";
import { auth } from "@/auth";
import { getUserByEmail } from "@/queries/users";
import { redirect } from "next/navigation";

const DashboardLayout = async ({ children }) => {
  const session = await auth();

  // Kiểm tra người dùng đã đăng nhập
  if (!session?.user) {
    redirect("/login");
  }

  // Lấy thông tin người dùng
  const user = await getUserByEmail(session.user.email);

  // Kiểm tra quyền instructor
  if (user?.role !== "instructor") {
    redirect("/"); // Nếu không phải instructor, chuyển hướng về trang chủ
  }

  return (
    <div className="h-full">
      <div className="h-[80px] lg:pl-56 fixed inset-y-0 w-full z-50">
        <Navbar />
      </div>
      <div className="hidden lg:flex h-full w-56 flex-col fixed inset-y-0 z-50">
        <Sidebar />
      </div>
      <main className="lg:pl-56 pt-[80px] h-full">{children}</main>
    </div>
  );
};
export default DashboardLayout;
