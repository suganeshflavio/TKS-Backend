import { z } from "zod";

export const createVideoSchema = z.object({

    courseId: z.string().min(1, "Course is required"),

    subject: z.string().optional(),

    chapter: z.string().optional(),

    videoName: z.string().min(3, "Video name is required"),

    youtubeUrl: z.string().url("Invalid YouTube URL"),

    description: z.string().optional(),

    duration: z.string().optional(),

    order: z.number().optional(),

    isPreview: z.boolean().default(false)

});

export const updateVideoSchema = createVideoSchema;