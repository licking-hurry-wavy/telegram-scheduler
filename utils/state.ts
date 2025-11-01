export function getPreviousState(current: string): string | null {
  const flow = [
    "awaiting_media",
    "awaiting_caption",
    "awaiting_buttons",
    "awaiting_group",
    "awaiting_group_selection",
    "awaiting_schedule",
    "awaiting_preview"
  ];
  const index = flow.indexOf(current);
  return index > 0 ? flow[index - 1] : null;
}