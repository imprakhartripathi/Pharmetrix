import mongoose from "mongoose";
import { IUser } from "./user.types";
import { UserSchema } from "./user.schema";

export const User = mongoose.model<IUser>("User", UserSchema);
