import mongoose from "mongoose";
import { IOrganization } from "./org.types";
import { OrganizationSchema } from "./org.schema";

export const Organization = mongoose.model<IOrganization>(
  "Organization",
  OrganizationSchema
);
