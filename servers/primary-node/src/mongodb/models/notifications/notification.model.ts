import mongoose from "mongoose";
import { INotification } from "./notification.types";
import { NotificationSchema } from "./notification.schema";

export const Notification = mongoose.model<INotification>(
  "Notification",
  NotificationSchema
);
