type ResultImageSaveResult = {
  mode: "download" | "preview" | "native-share";
};

function isIosSafari() {
  const userAgent = window.navigator.userAgent;
  const isIos = /iP(ad|hone|od)/.test(userAgent) || (userAgent.includes("Macintosh") && navigator.maxTouchPoints > 1);
  const isWebKit = /WebKit/.test(userAgent);
  const isChromium = /CriOS|FxiOS|EdgiOS/.test(userAgent);

  return isIos && isWebKit && !isChromium;
}

async function renderResultImage(element: HTMLElement) {
  if ("fonts" in document) {
    await document.fonts.ready;
  }

  const { default: html2canvas } = await import("html2canvas");
  const clone = element.cloneNode(true) as HTMLElement;
  clone.classList.add("capture-mode");
  clone.style.position = "fixed";
  clone.style.left = "-99999px";
  clone.style.top = "0";
  clone.style.width = `${element.getBoundingClientRect().width}px`;
  clone.style.maxWidth = "none";
  clone.style.zIndex = "-1";
  document.body.appendChild(clone);

  try {
    await new Promise((resolve) => window.requestAnimationFrame(() => resolve(undefined)));

    const canvas = await html2canvas(clone, {
      backgroundColor: "#ffffff",
      scale: 2,
      useCORS: true,
      logging: false,
    });
    const dataUrl = canvas.toDataURL("image/png");
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((imageBlob) => {
        if (!imageBlob) {
          reject(new Error("画像データを作成できませんでした"));
          return;
        }

        resolve(imageBlob);
      }, "image/png");
    });

    return { dataUrl, blob };
  } finally {
    clone.remove();
  }
}

function canNativeShareImage(fileName: string) {
  if (typeof navigator.share !== "function" || typeof navigator.canShare !== "function") {
    return false;
  }

  try {
    const testFile = new File([new Blob(["test"], { type: "image/png" })], fileName, { type: "image/png" });

    return navigator.canShare({ files: [testFile] });
  } catch {
    return false;
  }
}

function downloadDataUrl(dataUrl: string, fileName: string): ResultImageSaveResult | null {
  const link = document.createElement("a");

  if (typeof link.download !== "string") {
    return null;
  }

  link.download = fileName;
  link.href = dataUrl;
  link.click();

  return { mode: "download" };
}

function writePreviewImage(previewWindow: Window, dataUrl: string, fileName: string) {
  previewWindow.document.open();
  previewWindow.document.write(`
    <!doctype html>
    <html lang="ja">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>${fileName}</title>
        <style>
          body {
            margin: 0;
            padding: 24px;
            min-height: 100vh;
            display: grid;
            gap: 16px;
            place-items: center;
            background: #f7f3ee;
            color: #332822;
            font-family: system-ui, -apple-system, BlinkMacSystemFont, "Helvetica Neue", sans-serif;
          }
          p {
            max-width: 28rem;
            margin: 0;
            font-size: 14px;
            font-weight: 700;
            line-height: 1.8;
            text-align: center;
          }
          img {
            display: block;
            width: min(100%, 440px);
            height: auto;
            border-radius: 24px;
            box-shadow: 0 18px 54px rgba(90, 64, 48, 0.18);
          }
        </style>
      </head>
      <body>
        <img src="${dataUrl}" alt="${fileName}" />
        <p>画像を長押しして保存し、XやInstagramの投稿に添付してください。</p>
      </body>
    </html>
  `);
  previewWindow.document.close();
}

export async function shareOrDownloadResultImage(
  element: HTMLElement,
  fileName: string,
  shareData?: { title?: string; text?: string }
): Promise<ResultImageSaveResult> {
  if (!canNativeShareImage(fileName)) {
    return downloadResultImage(element, fileName);
  }

  const { blob } = await renderResultImage(element);
  const file = new File([blob], fileName, { type: "image/png" });

  await navigator.share({
    files: [file],
    title: shareData?.title,
    text: shareData?.text,
  });

  return { mode: "native-share" };
}

export async function downloadResultImage(element: HTMLElement, fileName: string): Promise<ResultImageSaveResult> {
  const shouldOpenPreview = isIosSafari();
  const previewWindow = shouldOpenPreview ? window.open("", "_blank") : null;

  if (shouldOpenPreview && !previewWindow) {
    throw new Error("画像プレビューを開けませんでした");
  }

  if (previewWindow) {
    previewWindow.opener = null;
    previewWindow.document.write("<p style=\"font-family: system-ui, sans-serif; padding: 24px;\">画像を準備しています...</p>");
  }

  const { dataUrl } = await renderResultImage(element);

  if (previewWindow) {
    writePreviewImage(previewWindow, dataUrl, fileName);
    return { mode: "preview" };
  }

  const downloadResult = downloadDataUrl(dataUrl, fileName);

  if (downloadResult) {
    return downloadResult;
  }

  const imageWindow = window.open(dataUrl, "_blank", "noopener,noreferrer");

  if (!imageWindow) {
    throw new Error("画像を新規タブで開けませんでした");
  }

  return { mode: "preview" };
}
