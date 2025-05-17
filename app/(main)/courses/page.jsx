import SearchCourse from "./_components/SearchCourse";
import SortCourse from "./_components/SortCourse";
import FilterCourseMobile from "./_components/FilterCourseMobile";
import FilterCourse from "./_components/FilterCourse";
import { getCourseList } from "@/queries/courses";
import { getCategories } from "@/queries/categories";
import CourseCard from "./_components/CourseCard";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

// Loading component cho phần danh sách khóa học (chỉ hiển thị spinner)
const CourseListLoading = () => (
  <div className="flex items-center justify-center py-20 lg:col-span-3">
    <div className="text-center">
      <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
      <p className="mt-4 text-gray-600">Đang tải khóa học...</p>
    </div>
  </div>
);

const CoursesPage = async ({ searchParams }) => {
  try {
    const categories = await getCategories();

    // Lấy các filter từ URL params
    const selectedCategories = searchParams?.categories
      ? Array.isArray(searchParams.categories)
        ? searchParams.categories
        : [searchParams.categories]
      : [];

    const selectedPrices = searchParams?.price
      ? Array.isArray(searchParams.price)
        ? searchParams.price
        : [searchParams.price]
      : [];

    const filters = {
      categories: selectedCategories,
      price: selectedPrices,
      sort: searchParams?.sort || "",
    };

    // Lấy danh sách khóa học với filter
    const courses = await getCourseList(filters);

    return (
      <section
        id="courses"
        className="container space-y-6 py-6 dark:bg-transparent"
      >
        {/* <h2 className="text-xl md:text-2xl font-medium">All Courses</h2> */}
        {/* header */}
        <div className="flex flex-col items-baseline justify-between gap-4 border-b border-gray-200 pb-6 lg:flex-row">
          <SearchCourse />

          <div className="flex items-center justify-end gap-2 max-lg:w-full">
            <SortCourse />

            {/* Filter Menus For Mobile */}

            <FilterCourseMobile
              categories={categories}
              initialFilters={filters}
            />
          </div>
        </div>
        {/* header ends */}
        {/* active filters */}

        <section className="pb-24 pt-6">
          <div className="grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-4">
            {/* Filters */}
            {/* these component can be re use for mobile also */}
            <FilterCourse categories={categories} initialFilters={filters} />
            {/* Course grid */}
            <Suspense fallback={<CourseListLoading />}>
              <div className="relative lg:col-span-3">
                {courses.length > 0 ? (
                  <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
                    {courses.map((course) => {
                      return <CourseCard key={course.id} course={course} />;
                    })}
                  </div>
                ) : (
                  <div className="flex h-40 items-center justify-center py-10 text-center">
                    <p className="text-lg text-gray-600">
                      Không tìm thấy khóa học nào phù hợp với bộ lọc đã chọn.
                    </p>
                  </div>
                )}
              </div>
            </Suspense>
          </div>
        </section>
      </section>
    );
  } catch (error) {
    console.error("Lỗi khi tải trang khóa học:", error);
    return (
      <section className="container py-20 text-center">
        <h2 className="mb-4 text-2xl font-semibold text-gray-800">
          Đã xảy ra lỗi
        </h2>
        <p className="mb-8 text-gray-600">
          Không thể tải danh sách khóa học. Vui lòng thử lại sau.
        </p>
        <div className="flex justify-center">
          <button
            onClick={() => window.location.reload()}
            className="rounded-md bg-primary px-4 py-2 text-white transition-colors hover:bg-primary/90"
          >
            Tải lại trang
          </button>
        </div>
      </section>
    );
  }
};

export default CoursesPage;

export const dynamic = "force-dynamic";
