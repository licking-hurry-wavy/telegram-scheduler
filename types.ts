export type MediaType = "photo" | "video";

export interface Button {
  text: string;
  url: string;
}

export interface Draft {
  media: string[];
  caption: string;
  buttons: Button[];
  schedule: string | null;
  groupIds: string[];
}

export interface ScheduledPost extends Draft {
  userId: string;
}