import { Badge } from "@/components/ui/badge";
import { BookOpen } from "lucide-react";
import Image from "next/image";
import EnrolledCourseCard from "../../component/enrolled-coursecard";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getUserByEmail } from "@/queries/users";
import { getEnrollmentsForUser } from "@/queries/enrollments";
import Link from "next/link";

async function EnrolledCourses() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  console.log("Session user:", session.user);
  const loggedInUser = await getUserByEmail(session?.user?.email);
  console.log("Logged in user:", {
    id: loggedInUser?.id,
    email: loggedInUser?.email,
  });

  const enrollments = await getEnrollmentsForUser(loggedInUser?.id);
  console.log("Enrollments found:", enrollments?.length);

  // Lọc ra các enrollment có course và course._id hợp lệ
  const validEnrollments = enrollments?.filter(
    (enrollment) => enrollment?.course && enrollment.course._id,
  );

  return (
    <div className="grid gap-6 sm:grid-cols-3">
      {validEnrollments && validEnrollments.length > 0 ? (
        <>
          {validEnrollments.map((enrollment) => (
            <Link
              key={enrollment?.id}
              href={`/courses/${enrollment.course._id.toString()}/lesson`}
            >
              <EnrolledCourseCard
                key={enrollment?.id}
                enrollment={enrollment}
              />
            </Link>
          ))}
        </>
      ) : (
        <div>
          <p className="mb-4 font-bold text-red-700">
            Không tìm thấy khóa học nào đã đăng ký!
          </p>
          <p>
            Hãy khám phá các khóa học tại{" "}
            <Link href="/courses" className="text-blue-600 hover:underline">
              đây
            </Link>
          </p>
        </div>
      )}
    </div>
  );
}

export default EnrolledCourses;
