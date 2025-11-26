import { Document } from "mongoose";

export enum Expiration {
  Default = "7d",
  None = "never",
  OneMonth = "30d",
  TwoMonth = "60d",
}

export interface IUserNotification extends Document {
  title: string;
  desc: string;
  type: string;
  isRead: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IUser extends Document {
  fullName: string;
  email: string;
  password: string;
  image: string;
  contact: string;
  sessionTimeOut: Expiration;
  notifications: IUserNotification[];
  notificationsOn: boolean;
  emailNotificationsOn: boolean;
  createdAt: Date;
  updatedAt: Date;
}
