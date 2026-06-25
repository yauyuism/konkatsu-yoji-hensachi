import { NOTE_URL, X_URL } from "@/lib/service-links";

function resolveLink(value: string | undefined, fallback: string) {
  const input = value?.trim();

  return input ? input : fallback;
}

export function getCreatorLinks() {
  return {
    xUrl: resolveLink(process.env.NEXT_PUBLIC_X_URL, X_URL),
    noteUrl: resolveLink(process.env.NEXT_PUBLIC_NOTE_URL, NOTE_URL),
  };
}
