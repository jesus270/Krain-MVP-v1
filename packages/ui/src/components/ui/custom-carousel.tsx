"use client";

import * as React from "react";
import useEmblaCarousel from "embla-carousel-react";
import type { EmblaOptionsType } from "embla-carousel";
import Image from "next/image";

interface CustomCarouselProps {
  children: React.ReactNode;
  options?: EmblaOptionsType;
  showControls?: boolean;
  controlsClassName?: string;
  className?: string;
  slideClassName?: string;
  containerClassName?: string;
  showPartialSlides?: boolean;
}

export function CustomCarousel({
  children,
  options = {
    align: "center",
    loop: true,
    containScroll: "trimSnaps",
  },
  showControls = true,
  controlsClassName = "flex gap-2",
  className = "overflow-hidden",
  containerClassName = "",
  slideClassName = "grid grid-flow-col auto-cols-[90vw] sm:auto-cols-[80vw] md:auto-cols-[420px] gap-1",
  showPartialSlides = false,
}: CustomCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    ...options,
    align: showPartialSlides ? "center" : options.align,
    loop: true,
    startIndex: 1,
    inViewThreshold: 0,
    skipSnaps: false,
  });

  const [selectedIndex, setSelectedIndex] = React.useState(0);

  React.useEffect(() => {
    if (emblaApi) {
      emblaApi.on("select", () => {
        setSelectedIndex(emblaApi.selectedScrollSnap());
      });
      // Initial selection
      setSelectedIndex(emblaApi.selectedScrollSnap());
    }
  }, [emblaApi]);

  const scrollPrev = React.useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = React.useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const scrollTo = React.useCallback(
    (index: number) => {
      if (emblaApi) emblaApi.scrollTo(index);
    },
    [emblaApi],
  );

  const containerStyle = showPartialSlides
    ? {
        paddingLeft: "15%",
        paddingRight: "15%",
      }
    : {};

  // Wrap each child with a div that handles opacity
  const wrappedChildren = React.Children.map(children, (child, index) => (
    <div
      className={`transition-opacity duration-300 px-1 ${
        selectedIndex === index ? "opacity-100" : "opacity-30"
      }`}
    >
      {child}
    </div>
  ));

  return (
    <div className={containerClassName}>
      <div className={className} ref={emblaRef} style={containerStyle}>
        <div className={slideClassName}>{wrappedChildren}</div>
      </div>

      {/* Navigation and Dots indicator in a single flex container */}
      <div className="flex items-center justify-center gap-4 mt-4">
        {showControls && (
          <button onClick={scrollPrev} className="group">
            <Image
              src="/button-carousel.svg"
              alt="Previous"
              width={28}
              height={28}
              className="rotate-180 opacity-50 transition-opacity hover:opacity-100"
            />
          </button>
        )}

        {/* Dots indicator */}
        <div className="flex justify-center gap-2">
          {React.Children.map(children, (_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full transition-all ${
                selectedIndex === index ? "bg-primary w-4" : "bg-muted"
              }`}
              onClick={() => scrollTo(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {showControls && (
          <button onClick={scrollNext} className="group">
            <Image
              src="/button-carousel.svg"
              alt="Next"
              width={28}
              height={28}
              className="opacity-50 transition-opacity hover:opacity-100"
            />
          </button>
        )}
      </div>
    </div>
  );
}
