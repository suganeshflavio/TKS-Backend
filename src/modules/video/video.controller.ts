import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { successResponse } from "../../utils/response";
import { createVideoSchema, updateVideoSchema } from "./video.validation";
import { createVideoService, getVideosService, updateVideoService, getVideoByIdService } from "./video.service";

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

            courseId: req.query.courseId as string,

            subject: req.query.subject as string,

            chapter: req.query.chapter as string

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