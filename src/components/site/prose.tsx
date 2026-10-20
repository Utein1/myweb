"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Lightbox, type LightboxImage } from "@/components/site/lightbox";

/** 渲染服务端生成的 Markdown HTML，并在客户端增强：代码复制、图片灯箱 */
export function Prose({
  html,
  className,
}: {
  html: string;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [images, setImages] = useState<LightboxImage[]>([]);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [announcement, setAnnouncement] = useState("");

  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    const cleanups: (() => void)[] = [];

    root.querySelectorAll<HTMLPreElement>("pre").forEach((pre) => {
      if (pre.querySelector(".copy-code")) return;
      const button = document.createElement("button");
      button.type = "button";
      button.className = "copy-code";
      button.textContent = "复制";
      const onClick = async () => {
        try {
          await navigator.clipboard.writeText(pre.innerText.replace(/复制$/, "").trimEnd());
          button.textContent = "已复制";
          setAnnouncement("代码已复制到剪贴板");
        } catch {
          button.textContent = "请手动复制";
          setAnnouncement("复制失败，请手动选择代码复制");
        }
        window.setTimeout(() => {
          button.textContent = "复制";
        }, 1500);
      };
      button.addEventListener("click", onClick);
      pre.appendChild(button);
      cleanups.push(() => {
        button.removeEventListener("click", onClick);
        button.remove();
      });
    });

    const imgElements = Array.from(root.querySelectorAll<HTMLImageElement>("img"));
    const collected = imgElements.map((img) => ({
      url: img.getAttribute("src") ?? "",
      alt: img.getAttribute("alt") ?? "",
    })).filter((item) => item.url);
    setImages(collected);

    imgElements.forEach((img, index) => {
      const onClick = () => setOpenIndex(index);
      img.addEventListener("click", onClick);
      cleanups.push(() => img.removeEventListener("click", onClick));
    });

    return () => cleanups.forEach((cleanup) => cleanup());
  }, [html]);

  return (
    <>
      <div
        ref={ref}
        className={cn("prose-ledger", className)}
        dangerouslySetInnerHTML={{ __html: html }}
      />
      <span className="sr-only" aria-live="polite">
        {announcement}
      </span>
      {openIndex !== null && images[openIndex] ? (
        <Lightbox
          images={images}
          index={openIndex}
          onClose={() => setOpenIndex(null)}
          onIndexChange={setOpenIndex}
        />
      ) : null}
    </>
  );
}
