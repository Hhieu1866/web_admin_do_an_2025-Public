"use client";

export const VideoPlayer = ({}) => {
  return (
    <div className="relative aspect-video">
      <iframe
        className="h-full w-full"
        src="https://www.youtube.com/embed/LJi2tiWiYmI?si=CeLBaBM2iQorWJjU"
        title="YouTube video player"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
      ></iframe>
    </div>
  );
};
