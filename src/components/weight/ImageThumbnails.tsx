"use client";

import Image from "next/image";
import { useEffect, useMemo } from "react";

type ImageThumbnailsProps = {
  files: File[];
  maxCount: number;
  onRemove: (index: number) => void;
};

export function ImageThumbnails({ files, maxCount, onRemove }: ImageThumbnailsProps) {
  const previewUrls = useMemo(() => files.map((file) => URL.createObjectURL(file)), [files]);

  useEffect(() => {
    return () => {
      for (const url of previewUrls) {
        URL.revokeObjectURL(url);
      }
    };
  }, [previewUrls]);

  return (
    <div className="grid gap-3">
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {files.map((file, index) => (
          <div
            key={`${file.name}-${file.lastModified}-${index}`}
            className="relative overflow-hidden rounded-[1rem] border border-[rgba(16,185,129,0.36)] bg-white"
          >
            <Image
              src={previewUrls[index] ?? ""}
              alt={`${index + 1}枚目のスクショ`}
              width={320}
              height={320}
              unoptimized
              className="h-28 w-full object-cover sm:h-32"
            />
            <button
              type="button"
              onClick={() => onRemove(index)}
              className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-[rgba(26,26,26,0.72)] text-sm font-black text-white"
              aria-label={`${index + 1}枚目のスクショを削除`}
            >
              ×
            </button>
            <span className="absolute bottom-2 left-2 rounded-full bg-[rgba(26,26,26,0.72)] px-2 py-1 text-[0.7rem] font-bold text-white">
              {index + 1}枚目
            </span>
          </div>
        ))}
      </div>

      <p className="text-sm leading-7 text-[var(--text-sub)]">
        {files.length}枚 / {maxCount}枚。{files.length < 3 ? "3枚以上あると精度が上がりやすいです。" : "このまま測定できます。"}
      </p>
    </div>
  );
}
