import { z } from "zod";

export const assignUserAccessSchema = z.object({
  userId: z.string().min(1, "User is required"),

  courses: z.array(
    z.object({
      courseId: z.string().min(1, "Course is required"),

      videoIds: z
        .array(z.string().min(1))
        .min(1, "Select at least one video"),
    })
  ).min(1, "At least one course is required"),
});
