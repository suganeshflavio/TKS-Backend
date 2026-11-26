import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { successResponse } from "../../utils/response";
import { AppError } from "../../utils/errors/AppError";
import { resolveIsActive } from "../../utils/resolveIsActive";
import {
    createVideoSchema,
    thumbnailUploadUrlSchema,
    updateVideoSchema,
    videoUploadUrlSchema
} from "./video.validation";
import {
    createVideoService,
    getVideosService,
    updateVideoService,
    getVideoByIdService,
    deleteVideoService,
    permanentDeleteVideoService,
    requestThumbnailUploadUrlService,
    requestVideoUploadUrlService,
    uploadVideoThumbnailService
} from "./video.service";

export const createVideo = asyncHandler(async (req: Request, res: Response) => {

    const payload = createVideoSchema.parse(req.body);

    const video = await createVideoService(payload);

    return successResponse(
        res,
        "Video Created Successfully",
        video,
        201
    );

});


export const getVideos = asyncHandler(

    async (

        req: Request,

        res: Response

    ) => {

        const data = await getVideosService({

            page: req.query.page
                ? Number(req.query.page)
                : 1,

            limit: req.query.limit
                ? Number(req.query.limit)
                : 10,

            search: req.query.search as string,

            isActive: resolveIsActive(req.query.isActive)

        });

        return successResponse(

            res,

            "Videos fetched successfully",

            data

        );

    }

);

export const updateVideo = asyncHandler(

    async (

        req: Request,

        res: Response

    ) => {

        const payload = updateVideoSchema.parse(

            req.body

        );

        const video = await updateVideoService(

            req.params.id as string,

            payload

        );

        return successResponse(

            res,

            "Video Updated Successfully",

            video

        );

    }

);


export const getVideoById = asyncHandler(async (req: Request, res: Response) => {

    const video = await getVideoByIdService(req.params.id as string);

    return successResponse(
        res,
        "Video fetched successfully",
        video
    );

});

export const deleteVideo = asyncHandler(async (req: Request, res: Response) => {

    const video = await deleteVideoService(req.params.id as string);

    return successResponse(
        res,
        "Video Deactivated Successfully",
        video
    );

});

export const permanentDeleteVideo = asyncHandler(async (req: Request, res: Response) => {

    const result = await permanentDeleteVideoService(req.params.id as string);

    return successResponse(
        res,
        "Video Permanently Deleted",
        result
    );

});

export const requestVideoUploadUrl = asyncHandler(async (req: Request, res: Response) => {

    const payload = videoUploadUrlSchema.parse(req.body);

    const data = await requestVideoUploadUrlService(payload);

    return successResponse(
        res,
        "Upload URL generated successfully",
        data
    );

});

export const requestThumbnailUploadUrl = asyncHandler(async (req: Request, res: Response) => {

    const payload = thumbnailUploadUrlSchema.parse(req.body);

    const data = await requestThumbnailUploadUrlService(payload);

    return successResponse(
        res,
        "Thumbnail upload URL generated successfully",
        data
    );

});

export const uploadVideoThumbnail = asyncHandler(async (req: Request, res: Response) => {

    if (!req.file) {
        throw new AppError("Thumbnail image file is required", 400);
    }

    const data = await uploadVideoThumbnailService(req.file);

    return successResponse(
        res,
        "Thumbnail uploaded successfully",
        data,
        201
    );

});
