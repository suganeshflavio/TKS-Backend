import { z } from "zod";

export const createUserSchema = z.object({

    name: z
        .string()
        .min(3, "Name should contain minimum 3 characters"),

    email: z
        .string()
        .email("Invalid Email"),

    password: z
        .string()
        .min(6, "Password should contain minimum 6 characters"),

    mobile: z
        .string(),
        // .optional()

        isActive: z
        .boolean().optional()

});