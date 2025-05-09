"use client";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CheckCircle } from "lucide-react";
import { PlayCircle } from "lucide-react";
import { Lock } from "lucide-react";
import Link from "next/link";
import { SidebarLessons } from "./sidebar-lessons";
import { replaceMongoIdInArray } from "@/lib/convertData";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export const SidebarModules = ({ courseId, modules }) => {
  const seachParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  // State để lưu trữ modules đã xử lý
  const [processedModules, setProcessedModules] = useState([]);

  // Xử lý modules khi component mount hoặc khi modules thay đổi
  useEffect(() => {
    if (modules && modules.length > 0) {
      const sortedModules = replaceMongoIdInArray(modules).toSorted(
        (a, b) => a.order - b.order,
      );
      setProcessedModules(sortedModules);
    }
  }, [modules]);

  const query = seachParams.get("name");

  // Tìm module chứa bài học hiện tại để mở rộng accordion
  const expandModule = processedModules.find((module) => {
    return module.lessonIds?.find((lesson) => {
      return lesson.slug === query;
    });
  });

  const expandModuleId = expandModule?.id ?? (processedModules[0]?.id || "");

  // Hàm tải lại sidebarmodules khi có thay đổi
  const refreshSidebar = () => {
    // Refresh router để lấy dữ liệu mới
    router.refresh();
  };

  // Thiết lập interval để làm mới sidebar định kỳ (mỗi 3 giây)
  useEffect(() => {
    const interval = setInterval(() => {
      refreshSidebar();
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  if (processedModules.length === 0) {
    return <div className="p-4">Đang tải...</div>;
  }

  return (
    <Accordion
      defaultValue={expandModuleId}
      type="single"
      collapsible
      className="w-full px-6"
    >
      {processedModules.map((module) => (
        <AccordionItem key={module.id} className="border-0" value={module.id}>
          <AccordionTrigger>{module.title} </AccordionTrigger>

          <SidebarLessons
            courseId={courseId}
            lessons={module.lessonIds}
            module={module.slug}
          />
        </AccordionItem>
      ))}
    </Accordion>
  );
};
