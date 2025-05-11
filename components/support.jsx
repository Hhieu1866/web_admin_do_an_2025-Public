import Image from "next/image";
import React from "react";

const support = () => {
  return (
    <div className="bg-darkBlue mb-14 px-4 py-5 text-black md:px-16">
      <div className="mx-auto flex max-w-7xl flex-col items-center space-y-12 md:flex-row md:space-x-8 md:space-y-0">
        <div className="flex-1">
          <p className="mt-5 font-poppins text-3xl font-bold leading-tight text-gray-900 sm:text-5xl sm:leading-tight lg:leading-tight">
            <span className="relative inline-flex sm:inline">
              <span className="absolute inset-0 h-full w-full bg-gradient-to-r from-[#44BCFF] via-[#FF44EC] to-[#FF675E] opacity-30 blur-lg filter"></span>
              <span className="relative">Let us know for support</span>
            </span>
          </p>

          <p className="mb-8 mt-8 leading-relaxed text-black">
            I Am Founder Of Easy Learning Academy And Best Selling Online
            Instructor Around The World My life’s mission is to help novice and
            professional software engineers increase their skills, make more
            money, and ultimately change their lives for the better.
          </p>

          <div className="flex flex-wrap gap-4">
            <a
              href="#"
              className="rounded-lg bg-fuchsia-500 px-6 py-3 font-semibold text-white shadow transition hover:bg-fuchsia-800"
            >
              Contact Us
            </a>

            <a
              href="#"
              className="rounded-lg bg-gray-700 px-6 py-3 font-semibold text-white shadow transition hover:bg-gray-900"
            >
              Call for Support
            </a>
          </div>
        </div>

        <div className="flex flex-1 justify-center">
          <Image
            src="/assets/images/support1.png"
            alt="Support"
            width={500}
            height={400}
            className="rounded-lg"
          />
        </div>
      </div>
    </div>
  );
};

export default support;
