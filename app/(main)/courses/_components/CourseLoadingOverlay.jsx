"use client";

import { Spinner } from "@/components/ui/spinner";
import useFilterLoading from "@/hooks/useFilterLoading";

const CourseLoadingOverlay = () => {
  const { isLoading } = useFilterLoading();

  if (!isLoading) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
      <div className="flex flex-col items-center">
        <Spinner className="h-12 w-12" />
        <p className="mt-4 text-sm font-medium text-gray-700">Đang tải...</p>
      </div>
    </div>
  );
};

export default CourseLoadingOverlay;
