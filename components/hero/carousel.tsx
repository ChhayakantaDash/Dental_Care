"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Carousel({ images, interval = 4500 }: { images: string[]; interval?: number }) {
  const [index, setIndex] = useState(0);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    if (!images || images.length === 0) return;
    timer.current = window.setInterval(() => setIndex((i) => (i + 1) % images.length), interval);
    return () => {
      if (timer.current) window.clearInterval(timer.current);
    };
  }, [images, interval]);

  if (!images || images.length === 0) return null;

  return (
    <div className="relative w-full h-56 sm:h-72 lg:h-[420px]">
      {images.map((src, i) => (
        <div
          key={i}
          className={`absolute inset-0 transition-opacity duration-700 ${
            i === index ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
          }`}
        >
          <img src={src} alt={`slide-${i}`} className="w-full h-full object-cover rounded-xl shadow-lg" />
        </div>
      ))}

      <button
        aria-label="Prev"
        onClick={() => setIndex((index - 1 + images.length) % images.length)}
        className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      <button
        aria-label="Next"
        onClick={() => setIndex((index + 1) % images.length)}
        className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow"
      >
        <ChevronRight className="h-4 w-4" />
      </button>

      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={`w-2.5 h-2.5 rounded-full transition-opacity ${i === index ? "bg-white" : "bg-white/50"}`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
