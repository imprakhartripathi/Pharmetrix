import { Request, Response, NextFunction } from "express";
import { User } from "../mongodb/models/user";
import { NotificationType } from "../mongodb/models/notifications";

export const notifyUser = async (userId: string, title: string, desc: string) => {
  try {
    const user = await User.findById(userId);
    if (!user) return;
    // Using embedded notifications in User
    (user as any).notifications.push({
      title,
      desc,
      isRead: false,
      type: NotificationType.Sys,
    });
    await user.save();
  } catch {}
};

export const notifyUsers = async (userIds: string[], title: string, desc: string) => {
  for (const id of userIds) {
    await notifyUser(id, title, desc);
  }
};