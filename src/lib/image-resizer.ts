const DEFAULT_MAX_WIDTH = 1024;
const DEFAULT_QUALITY = 0.85;

async function loadImage(file: File) {
  const objectUrl = URL.createObjectURL(file);

  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const element = new Image();
      element.onload = () => resolve(element);
      element.onerror = () => reject(new Error("画像を開けませんでした"));
      element.src = objectUrl;
    });

    return image;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export async function resizeImageFile(file: File, maxWidth = DEFAULT_MAX_WIDTH) {
  const image = await loadImage(file);
  const ratio = Math.min(maxWidth / image.width, 1);
  const width = Math.max(1, Math.round(image.width * ratio));
  const height = Math.max(1, Math.round(image.height * ratio));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("画像の変換に失敗しました");
  }

  context.drawImage(image, 0, 0, width, height);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((value) => {
      if (!value) {
        reject(new Error("画像の変換に失敗しました"));
        return;
      }

      resolve(value);
    }, "image/jpeg", DEFAULT_QUALITY);
  });

  const normalizedName = file.name.replace(/\.[^.]+$/, "") || "line-screenshot";
  return new File([blob], `${normalizedName}.jpg`, {
    type: "image/jpeg",
    lastModified: Date.now(),
  });
}
