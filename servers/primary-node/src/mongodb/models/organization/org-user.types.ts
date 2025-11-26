import { Document, Types } from "mongoose";
import { OrgRole } from "./org.types";

export interface IOrgUser extends Document {
  user: Types.ObjectId;
  role: OrgRole;
}
