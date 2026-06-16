"use client";

import { useCallback, useEffect, useState } from "react";
import { ZoomIn } from "lucide-react";

import { OptimizedImage } from "@/components/site/OptimizedImage";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import type { CommerceImage } from "@/lib/commerce";

type ProductGalleryProps = {
  images: CommerceImage[];
  productName: string;
};

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const galleryImages = images.length > 0 ? images : [{ src: "", alt: productName }];

  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const active = galleryImages[activeIndex] ?? galleryImages[0];

  const selectImage = useCallback((index: number) => {
    setActiveIndex(index);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        setActiveIndex((i) => (i > 0 ? i - 1 : galleryImages.length - 1));
      }
      if (e.key === "ArrowRight") {
        setActiveIndex((i) => (i < galleryImages.length - 1 ? i + 1 : 0));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [galleryImages.length]);

  return (
    <>
      <div className="grid lg:grid-cols-[80px_1fr] gap-4 lg:gap-8">
        <div className="order-2 lg:order-1 flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
          {galleryImages.map((img, i) => (
            <button
              key={`${img.src}-${i}`}
              type="button"
              onClick={() => selectImage(i)}
              aria-label={`View image ${i + 1}`}
              aria-current={i === activeIndex ? "true" : undefined}
              className={`relative shrink-0 w-16 h-16 lg:w-full lg:aspect-square overflow-hidden border transition-colors ${i === activeIndex ? "border-gold" : "border-border/30 hover:border-gold/60"}`}
            >
              {img.src && (
                <OptimizedImage
                  src={img.src}
                  alt={img.alt ?? `${productName} thumbnail ${i + 1}`}
                  fill
                  sizes="80px"
                  className="object-cover"
                  width={img.width}
                  height={img.height}
                />
              )}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setLightboxOpen(true)}
          className="relative order-1 lg:order-2 aspect-[4/5] overflow-hidden bg-card group cursor-zoom-in"
          aria-label="Open image lightbox"
        >
          {active?.src && (
            <OptimizedImage
              src={active.src}
              alt={active.alt ?? productName}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover motion-reduce:transition-none"
              width={active.width}
              height={active.height}
            />
          )}
          <span className="absolute bottom-4 right-4 flex items-center gap-1.5 bg-background/70 backdrop-blur-sm px-3 py-1.5 text-[0.6rem] tracking-[0.2em] uppercase text-cream opacity-0 group-hover:opacity-100 transition-opacity">
            <ZoomIn className="h-3.5 w-3.5" /> Zoom
          </span>
        </button>
      </div>

      <div className="flex justify-center gap-1.5 mt-3 lg:hidden">
        {galleryImages.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => selectImage(i)}
            aria-label={`Image ${i + 1}`}
            className={`h-1.5 rounded-full transition-all ${i === activeIndex ? "w-4 bg-gold" : "w-1.5 bg-border"}`}
          />
        ))}
      </div>

      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-4xl w-[95vw] p-0 bg-background border-border overflow-hidden">
          <DialogTitle className="sr-only">{productName} gallery</DialogTitle>
          <div className="relative aspect-[4/5] w-full bg-card">
            {active?.src && (
              <OptimizedImage
                src={active.src}
                alt={active.alt ?? productName}
                fill
                sizes="95vw"
                className="object-contain"
                width={active.width}
                height={active.height}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
