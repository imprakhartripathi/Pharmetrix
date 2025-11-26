import { Document } from "mongoose";

export enum NotificationType {
  Sys = "System",
  Auth = "Authentication",
}

export interface INotification extends Document {
  title: string;
  desc: string;
  type: NotificationType;
  isRead: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
