import { z } from "zod";

const ALLOWED_THUMBNAIL_EXTENSIONS = /\.(png|jpe?g|webp|gif|svg)$/i;

export const THUMBNAIL_MIME_BY_EXT = {
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    webp: "image/webp",
    gif: "image/gif",
    svg: "image/svg+xml"
} as const;

export const ALLOWED_THUMBNAIL_MIME_TYPES = [
    "image/png",
    "image/jpeg",
    "image/webp",
    "image/gif",
    "image/svg+xml"
] as const;

export const createVideoSchema = z.object({

    videoName: z.string().min(3, "Video name is required"),

    videoFileId: z.string().min(1, "videoFileId is required"),

    videoFileName: z.string().min(1, "videoFileName is required"),

    videoSize: z.coerce.number().optional(),

    thumbnailFileId: z.string().min(1).nullable().optional(),

    thumbnailFileName: z.string().min(1).nullable().optional(),

    description: z.string().optional(),

    duration: z.string().optional(),

    isPreview: z.coerce.boolean().optional()

});

export const updateVideoSchema = createVideoSchema.partial().extend({

    isActive: z.boolean().optional()

});

export const videoUploadUrlSchema = z.object({

    fileName: z
        .string()
        .min(1, "fileName is required")
        .refine((name) => /\.mp4$/i.test(name), "Only .mp4 files are supported")

});

export const thumbnailUploadUrlSchema = z.object({

    fileName: z
        .string()
        .min(1, "fileName is required")
        .refine(
            (name) => ALLOWED_THUMBNAIL_EXTENSIONS.test(name),
            "Only PNG, JPEG, WEBP, GIF, or SVG images are supported"
        ),

    contentType: z.enum(ALLOWED_THUMBNAIL_MIME_TYPES).optional()

});
