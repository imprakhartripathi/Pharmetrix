import { Schema } from "mongoose";
import { INotification } from "./notification.types";

export const NotificationSchema = new Schema<INotification>(
  {
    title: { type: String, required: true },
    desc: { type: String, required: true },
    isRead: { type: Boolean, required: true },
    type: { type: String, required: true },
  },
  { timestamps: true }
);
