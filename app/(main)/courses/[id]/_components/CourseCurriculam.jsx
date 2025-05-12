import React from "react";
import { BookCheck } from "lucide-react";
import { Award } from "lucide-react";
import { Calendar } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import CourseModuleList from "./module/CourseModuleList";

const CourseCurriculam = ({ course }) => {
  // console.log(course)

  const totalDuration = course?.modules
    .map((item) => {
      return item.lessonIds.reduce(function (acc, obj) {
        return acc + obj.duration;
      }, 0);
    })
    .reduce(function (acc, obj) {
      return acc + obj;
    }, 0);
  //console.log(totalDuration);

  return (
    <>
      <div className="mb-6 mt-4 flex flex-wrap items-center justify-center gap-x-5 text-sm text-gray-600">
        <span className="flex items-center gap-1.5">
          <BookCheck className="h-4 w-4" />
          {course?.modules?.length} Chapters
        </span>
        <span className="flex items-center gap-1.5">
          <Award className="h-4 w-4" />
          {course?.enrollmentCount || 0} Học viên
        </span>
        <span className="flex items-center gap-1.5">
          <Calendar className="h-4 w-4" />
          Cập nhật{" "}
          {new Date(course?.updatedAt || Date.now()).toLocaleDateString(
            "vi-VN",
          )}
        </span>
      </div>

      <Accordion
        defaultValue={["item-1", "item-2", "item-3"]}
        type="multiple"
        collapsible="true"
        className="w-full"
      >
        {course?.modules &&
          course.modules.map((module, index) => (
            <CourseModuleList key={module.id || index} module={module} />
          ))}
      </Accordion>
    </>
  );
};

export default CourseCurriculam;
