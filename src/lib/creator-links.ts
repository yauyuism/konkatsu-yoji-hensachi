const defaultXUrl = "https://x.com/yauyuism";
const defaultNoteUrl = "https://note.com/yauyuism";

function resolveLink(value: string | undefined, fallback: string) {
  const input = value?.trim();

  return input ? input : fallback;
}

export function getCreatorLinks() {
  return {
    xUrl: resolveLink(process.env.NEXT_PUBLIC_X_URL, defaultXUrl),
    noteUrl: resolveLink(process.env.NEXT_PUBLIC_NOTE_URL, defaultNoteUrl),
  };
}
