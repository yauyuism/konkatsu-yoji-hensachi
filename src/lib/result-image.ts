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

  await new Promise((resolve) => window.requestAnimationFrame(() => resolve(undefined)));

  const canvas = await html2canvas(clone, {
    backgroundColor: "#ffffff",
    scale: 2,
    useCORS: true,
    logging: false,
  });
  clone.remove();

  const link = document.createElement("a");
  link.download = fileName;
  link.href = canvas.toDataURL("image/png");
  link.click();
}
