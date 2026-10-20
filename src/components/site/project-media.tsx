"use client";

import Image from "next/image";
import { useState } from "react";
import { Maximize2 } from "lucide-react";
import { Lightbox, type LightboxImage } from "@/components/site/lightbox";

export function ProjectMedia({
  title,
  coverUrl,
  images,
}: {
  title: string;
  coverUrl: string | null;
  images: { id: string; url: string; alt: string | null }[];
}) {
  const gallery: LightboxImage[] = [
    ...(coverUrl ? [{ url: coverUrl, alt: `${title} 封面` }] : []),
    ...images.map((image, index) => ({
      url: image.url,
      alt: image.alt || `${title} 截图 ${index + 1}`,
    })),
  ];
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <>
      {coverUrl ? (
        <figure className="overflow-hidden rounded-[12px] border border-line">
          <button
            type="button"
            className="group relative block aspect-video w-full cursor-zoom-in"
            onClick={() => setOpenIndex(0)}
            aria-label={`查看 ${title} 封面大图`}
          >
            <Image
              src={coverUrl}
              alt={`${title} 封面`}
              fill
              sizes="(min-width: 1024px) 1200px, 100vw"
              priority
              className="object-cover"
            />
            <span className="absolute bottom-3 right-3 inline-flex h-9 items-center gap-1.5 rounded-[6px] border border-line bg-surface/90 px-3 text-xs text-ink opacity-0 transition-opacity group-hover:opacity-100">
              <Maximize2 size={14} aria-hidden />
              查看大图
            </span>
          </button>
        </figure>
      ) : null}

      {images.length > 0 ? (
        <section className="mt-10" aria-labelledby="gallery-title">
          <h2 id="gallery-title" className="font-serif text-xl font-medium">
            图集
          </h2>
          <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3">
            {images.map((image, index) => (
              <button
                key={image.id}
                type="button"
                onClick={() => setOpenIndex((coverUrl ? 1 : 0) + index)}
                className="group relative aspect-video cursor-zoom-in overflow-hidden rounded-[8px] border border-line"
                aria-label={`查看第 ${index + 1} 张截图`}
              >
                <Image
                  src={image.url}
                  alt={image.alt || `${title} 截图 ${index + 1}`}
                  fill
                  sizes="(min-width: 768px) 33vw, 50vw"
                  className="object-cover transition-transform duration-250 group-hover:scale-[1.02]"
                />
              </button>
            ))}
          </div>
        </section>
      ) : null}

      {openIndex !== null && gallery[openIndex] ? (
        <Lightbox
          images={gallery}
          index={openIndex}
          onClose={() => setOpenIndex(null)}
          onIndexChange={setOpenIndex}
        />
      ) : null}
    </>
  );
}
