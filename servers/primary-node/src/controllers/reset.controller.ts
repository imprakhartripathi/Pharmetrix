import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import { User } from "../mongodb/models/user";
import { verifyOtpRecord } from "./otp.controller";

export const resetPassword = async (req: Request, res: Response, _next: NextFunction) => {
  try {
    const { email, code, password } = req.body as { email?: string; code?: string; password?: string };

    if (!email || !code || !password) {
      res.status(400).json({ message: "Email, code and new password are required" });
      return;
    }

    // Verify OTP (will throw with message on failure)
    try {
      await verifyOtpRecord(email, code);
    } catch (err: any) {
      return res.status(400).json({ message: err?.message || "OTP verification failed" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.password = await bcrypt.hash(password, 10);
    await user.save();

    return res.status(200).json({ message: "Password reset successful" });
  } catch (err: any) {
    return res.status(500).json({ message: err?.message || "Failed to reset password" });
  }
};
