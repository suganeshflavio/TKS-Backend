import { z } from "zod";

export const adminLoginSchema = z.object({
  email: z
    .string()
    .email("Invalid email address"),

  password: z
    .string()
    .min(6, "Password must be at least 6 characters"),

  deviceId: z
    .string()
    .min(1, "Device ID is required")
});


export const studentLoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6),
  deviceId: z.string().min(1)
});