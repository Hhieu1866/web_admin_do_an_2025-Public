import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Image from "next/image";
import Link from "next/link";
import { BookOpen } from "lucide-react";
import { formatPrice } from "@/lib/formatPrice";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { SectionTitle } from "@/components/section-title";
import { getImageUrl, shouldDisplayImage } from "@/lib/imageUtils";

const RelatedCourses = ({ relatedCourses }) => {
  return (
    <section className="">
      <div className="container">
        <SectionTitle className="mb-6">Related Courses</SectionTitle>
        <Carousel
          opts={{
            align: "start",
          }}
          className="max-2xl:w-[90%] w-full mx-auto"
        >
          <CarouselPrevious />
          <CarouselNext />
          <CarouselContent>
            {relatedCourses.map((course) => {
              console.log("Related course data:", course?._id, {
                thumbnailUrl: course?.thumbnailUrl,
                thumbnail: course?.thumbnail,
              });

              let imageSrc;

              if (course?.thumbnailUrl) {
                imageSrc = course.thumbnailUrl;
              } else if (typeof course?.thumbnail === "string") {
                imageSrc = getImageUrl(course.thumbnail, "course");
              } else if (typeof course?.thumbnail === "object") {
                imageSrc = getImageUrl(course.thumbnail, "course");
              } else {
                imageSrc = getImageUrl(null, "course");
              }

              const showImage = shouldDisplayImage(imageSrc);

              console.log(
                "Related image source:",
                imageSrc,
                "Should show:",
                showImage,
              );

              return (
                <CarouselItem
                  key={course._id}
                  className="md:basis-1/2 lg:basis-1/3"
                >
                  <Link href={`/courses/${course._id.toString()}`}>
                    <div className="group hover:shadow-sm transition overflow-hidden border rounded-lg p-3 h-full">
                      <div className="relative w-full aspect-video rounded-md overflow-hidden">
                        {showImage && (
                          <Image
                            src={imageSrc}
                            alt="Course thumbnail"
                            className="object-cover"
                            fill
                          />
                        )}
                      </div>
                      <div className="flex flex-col pt-2">
                        <div className="text-lg md:text-base font-medium group-hover:text-sky-700 line-clamp-2">
                          {course.title}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Development
                        </p>

                        <div className="flex items-center justify-between mt-4">
                          <p className="text-md md:text-sm font-medium text-slate-700">
                            {formatPrice(course.price)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>
                </CarouselItem>
              );
            })}
          </CarouselContent>
        </Carousel>
      </div>
    </section>
  );
};

export default RelatedCourses;
