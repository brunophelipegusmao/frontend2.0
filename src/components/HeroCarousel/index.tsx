"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { DEFAULT_HERO_SLIDES, type HeroSlide } from "@/constants/home";

export function HeroCarousel({ slides }: { slides?: HeroSlide[] }) {
  const slidesToShow = slides?.length ? slides : DEFAULT_HERO_SLIDES;
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    if (slidesToShow.length <= 1) {
      return;
    }
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slidesToShow.length);
    }, 6000);

    return () => clearInterval(timer);
  }, [slidesToShow.length]);

  const safeActiveSlide =
    slidesToShow.length > 0 ? activeSlide % slidesToShow.length : 0;

  const active = slidesToShow[safeActiveSlide];

  const handleDotClick = (index: number) => {
    setActiveSlide(index);
  };

  const handleNext = () => {
    setActiveSlide((prev) => (prev + 1) % slidesToShow.length);
  };

  const handlePrev = () => {
    setActiveSlide(
      (prev) => (prev - 1 + slidesToShow.length) % slidesToShow.length,
    );
  };

  if (!active) {
    return null;
  }

  return (
    <section id="inicio" aria-label="Hero" className="space-y-5 sm:space-y-6">
      <div className="mx-auto max-w-6xl space-y-4">
        <div className="relative overflow-hidden rounded-[24px] border border-white/10 shadow-2xl shadow-black/60 sm:rounded-[32px]">
          <div className="relative h-[240px] sm:h-[320px] md:h-[380px]">
            <Image
              src={active.src}
              alt={active.title}
              fill
              sizes="(max-width: 768px) 100vw, 1200px"
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/60 to-transparent" />
            <div className="absolute inset-0 flex flex-col justify-end gap-3 px-4 pb-5 sm:gap-4 sm:px-8 sm:pb-6">
              <p className="text-[0.58rem] uppercase tracking-[0.2rem] text-[var(--gold-tone)] sm:text-xs sm:tracking-[0.6rem]">
                JM Fitness Studio
              </p>
              <h1 className="text-[1.75rem] leading-tight text-[var(--foreground)] sm:text-4xl lg:text-5xl">
                {active.title}
              </h1>
              <p className="max-w-2xl text-[0.9rem] text-[var(--muted-foreground)] sm:text-lg">
                {active.description}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handlePrev}
            aria-label="Slide anterior"
            className="absolute left-4 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-[#C2A537]/40 bg-black/40 text-sm text-[var(--gold-tone)] transition hover:border-[var(--gold-tone)] sm:flex"
          >
            ◄
          </button>
          <button
            type="button"
            onClick={handleNext}
            aria-label="Próximo slide"
            className="absolute right-4 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-[#C2A537]/40 bg-black/40 text-sm text-[var(--gold-tone)] transition hover:border-[var(--gold-tone)] sm:flex"
          >
            ►
          </button>
        </div>

        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Slide anterior"
            className="inline-flex h-8 items-center justify-center rounded-full border border-[color:var(--border-dim)] px-3 text-[0.62rem] font-semibold uppercase tracking-[0.12rem] text-[var(--gold-tone-dark)] transition hover:border-[var(--gold-tone)] sm:hidden"
          >
            Anterior
          </button>
          {slidesToShow.map((_, index) => {
            const isActive = index === safeActiveSlide;
            return (
              <button
                key={_.src}
                type="button"
                onClick={() => handleDotClick(index)}
                className={`h-2 w-6 rounded-full transition-all duration-300 sm:w-8 ${
                  isActive
                    ? "bg-gradient-to-r from-[#FFE17D] to-[#D4B547]"
                    : "bg-white/5"
                }`}
                aria-label={`Abrir slide ${index + 1}`}
              />
            );
          })}
          <button
            type="button"
            onClick={handleNext}
            aria-label="Próximo slide"
            className="inline-flex h-8 items-center justify-center rounded-full border border-[color:var(--border-dim)] px-3 text-[0.62rem] font-semibold uppercase tracking-[0.12rem] text-[var(--gold-tone-dark)] transition hover:border-[var(--gold-tone)] sm:hidden"
          >
            Próximo
          </button>
        </div>
      </div>
    </section>
  );
}
