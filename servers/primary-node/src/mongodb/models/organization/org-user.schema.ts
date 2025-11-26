import { Schema } from "mongoose";
import { IOrgUser } from "./org-user.types";
import { OrgRole } from "./org.types";

export const OrgUserSchema = new Schema<IOrgUser>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    role: { type: String, enum: Object.values(OrgRole), required: true },
  },
  { _id: false, timestamps: false }
);
