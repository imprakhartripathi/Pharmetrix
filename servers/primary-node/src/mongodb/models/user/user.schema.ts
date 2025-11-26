import { Schema } from "mongoose";
import { IUser, IUserNotification, Expiration } from "./user.types";

const UserNotificationSchema = new Schema<IUserNotification>(
  {
    title: { type: String, required: true },
    desc: { type: String, required: true },
    isRead: { type: Boolean, required: true },
    type: { type: String, required: true },
  },
  { timestamps: true }
);

export const UserSchema = new Schema<IUser>(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    image: { type: String, default: null },
    contact: { type: String, default: null },
    sessionTimeOut: {
      type: String,
      enum: Object.values(Expiration),
      default: Expiration.Default,
    },
    notifications: { type: [UserNotificationSchema], default: [] },
    notificationsOn: { type: Boolean, default: true },
    emailNotificationsOn: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export { UserNotificationSchema };
