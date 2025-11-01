export function isValidCaption(text: string): boolean {
  return text && text.length >= 3;
}

export function isValidLink(text: string): boolean {
  const parts = text.split(" - ");
  if (parts.length !== 2) return false;
  const url = parts[1].trim();
  return /^https?:\/\/\S+$/.test(url);
}