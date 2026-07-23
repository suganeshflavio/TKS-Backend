import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { successResponse } from "../../utils/response";
import { resolveIsActive } from "../../utils/resolveIsActive";
import { createVideoSchema, updateVideoSchema } from "./video.validation";
import { createVideoService, getVideosService, updateVideoService, getVideoByIdService } from "./video.service";
import { uploadToCloudinary } from "../../utils/uploadToCloudinary";

export const createVideo = asyncHandler(async (req: Request, res: Response) => {

    const payload = createVideoSchema.parse(req.body);

    if (req.file) {

        const uploaded = await uploadToCloudinary(req.file);

        payload.notesUrl = uploaded.secure_url;

        // payload.notesFileName = req.file.originalname;

        // payload.notesMimeType = req.file.mimetype;

        // payload.notesFileSize = req.file.size;

    }

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

            courseId: req.query.courseId as string,

            subject: req.query.subject as string,

            chapter: req.query.chapter as string,

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

          if (req.file) {
        const uploaded = await uploadToCloudinary(req.file);

        payload.notesUrl = uploaded.secure_url;
        // payload.notesFileName = req.file.originalname;
        // payload.notesMimeType = req.file.mimetype;
        // payload.notesFileSize = req.file.size;
    }

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