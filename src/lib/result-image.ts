export async function downloadResultImage(element: HTMLElement, fileName: string) {
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
    const link = document.createElement("a");

    if (typeof link.download === "string") {
      link.download = fileName;
      link.href = dataUrl;
      link.click();
      return;
    }

    const imageWindow = window.open(dataUrl, "_blank", "noopener,noreferrer");

    if (!imageWindow) {
      throw new Error("画像を新規タブで開けませんでした");
    }
  } finally {
    clone.remove();
  }
}
