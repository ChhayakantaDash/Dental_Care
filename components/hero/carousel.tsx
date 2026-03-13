"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Carousel({ images, interval = 4500 }: { images: string[]; interval?: number }) {
  const [index, setIndex] = useState(0);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    if (!images || images.length <= 1) return;
    timer.current = window.setInterval(() => setIndex((i) => (i + 1) % images.length), interval);
    return () => {
      if (timer.current) window.clearInterval(timer.current);
    };
  }, [images, interval]);

  if (!images || images.length === 0) return null;

  return (
    <div className="relative w-full h-full group bg-slate-100">
      {images.map((src, i) => (
        <div
          key={i}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            i === index ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
          }`}
        >
          <img src={src} alt={`slide-${i}`} className="w-full h-full object-cover" />
        </div>
      ))}

      {images.length > 1 && (
        <>
          <button
            aria-label="Prev"
            onClick={() => setIndex((index - 1 + images.length) % images.length)}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/20 backdrop-blur-md hover:bg-black/40 p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-md text-white z-20"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <button
            aria-label="Next"
            onClick={() => setIndex((index + 1) % images.length)}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/20 backdrop-blur-md hover:bg-black/40 p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-md text-white z-20"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-20">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                className={`transition-all duration-300 rounded-full h-2.5 ${
                  i === index ? "w-8 bg-white" : "w-2.5 bg-white/50 hover:bg-white/80"
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
