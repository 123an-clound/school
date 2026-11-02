"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import Autoplay from "embla-carousel-autoplay";
import { Pause, Play } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";

type Slide = {
  id: string;
  title: string;
  subtitle: string | null;
  image_url: string;
  cta_label: string | null;
  cta_href: string | null;
};

const controlClass = "static size-10 translate-none rounded-full border-white/40 bg-primary/70 text-white hover:bg-primary";

export function HeroCarousel({ slides }: { slides: Slide[] }) {
  // No stopOnMouseEnter: the plugin resumes on mouseleave even after the visitor pressed pause (WCAG 2.2.2).
  const [autoplay] = useState(() => Autoplay({ delay: 6000, playOnInit: false, stopOnInteraction: true }));
  const [api, setApi] = useState<CarouselApi>();
  const [playing, setPlaying] = useState(false);
  const multiple = slides.length > 1;

  useEffect(() => {
    if (!api || !multiple) return;
    const onPlay = () => setPlaying(true);
    const onStop = () => setPlaying(false);
    api.on("autoplay:play", onPlay).on("autoplay:stop", onStop);
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) autoplay.play();
    return () => {
      api.off("autoplay:play", onPlay).off("autoplay:stop", onStop);
    };
  }, [api, autoplay, multiple]);

  return (
    <Carousel setApi={setApi} plugins={[autoplay]} opts={{ loop: multiple }} aria-label="Ảnh nổi bật">
      <CarouselContent className="ml-0">
        {slides.map((slide, i) => (
          <CarouselItem key={slide.id} className="pl-0" aria-label={`${i + 1} / ${slides.length}`}>
            <div className="relative h-[22rem] sm:h-[26rem] lg:h-[32rem]">
              <Image src={slide.image_url} alt="" fill fetchPriority={i === 0 ? "high" : undefined} loading={i === 0 ? "eager" : undefined} sizes="100vw" className="object-cover" />
              <div className="absolute inset-0 bg-linear-to-t from-primary via-primary/70 to-primary/10" />
              <div className="absolute inset-x-0 bottom-0 mx-auto max-w-7xl px-4 pb-24 text-white">
                <h2 className="max-w-2xl font-heading text-2xl leading-tight font-bold text-balance sm:text-4xl">
                  {slide.title}
                </h2>
                {slide.subtitle && <p className="mt-3 max-w-xl text-base text-white/90 sm:text-lg">{slide.subtitle}</p>}
                {slide.cta_href && slide.cta_label && (
                  <Link
                    href={slide.cta_href}
                    className={buttonVariants({ className: "mt-5 h-11 bg-brand-gold px-5 text-base text-primary hover:bg-brand-gold/90" })}
                  >
                    {slide.cta_label}
                  </Link>
                )}
              </div>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      {multiple && (
        <div className="absolute right-4 bottom-12 flex gap-2 sm:right-[max(1rem,calc((100vw-80rem)/2+1rem))]">
          <CarouselPrevious variant="outline" className={controlClass} />
          <Button
            variant="outline"
            size="icon"
            className={controlClass}
            onClick={() => (playing ? autoplay.stop() : autoplay.play())}
            aria-label={playing ? "Tạm dừng trình chiếu" : "Tiếp tục trình chiếu"}
          >
            {playing ? <Pause /> : <Play />}
          </Button>
          <CarouselNext variant="outline" className={controlClass} />
        </div>
      )}
    </Carousel>
  );
}
