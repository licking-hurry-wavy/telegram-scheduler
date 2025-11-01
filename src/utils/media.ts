export function extractMedia(message: any): { type: string; file_id: string } | null {
  if (message.photo?.length) {
    const largest = message.photo[message.photo.length - 1];
    return { type: "photo", file_id: largest.file_id };
  }
  if (message.video) {
    return { type: "video", file_id: message.video.file_id };
  }
  if (message.document) {
    return { type: "document", file_id: message.document.file_id };
  }
  if (message.animation) {
    return { type: "animation", file_id: message.animation.file_id };
  }
  return null;
}