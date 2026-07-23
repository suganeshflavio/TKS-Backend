import { AppError } from "../../utils/errors/AppError";
import { CreateVideoDto, GetVideoQueryDto, UpdateVideoDto } from "./video.types";
import {
    createVideoRepository,
    deactivateVideoAccessRepository,
    getCourseRepository,
    getVideoByIdRepository,
    getVideosRepository,
    updateVideoRepository
} from "./video.repository";

export const createVideoService = async (
    payload: CreateVideoDto
) => {

    const course = await getCourseRepository(payload.courseId);

    if (!course) {
        throw new AppError("Course not found", 404);
    }

    if (!course.isActive) {
        throw new AppError("Course is inactive", 400);
    }

    return createVideoRepository(payload);

};

export const getVideosService = async (

    query: GetVideoQueryDto

) => {

    const page = query.page || 1;

    const limit = query.limit || 10;

    const result = await getVideosRepository(query);

    return {

        ...result,

        page,

        limit,

        totalPages: Math.ceil(

            result.total / limit

        )

    };

};


export const updateVideoService = async (

    videoId: string,

    payload: UpdateVideoDto

) => {

    const video = await getVideoByIdRepository(

        videoId

    );

    if (!video) {

        throw new AppError(

            "Video not found",

            404

        );

    }

    const course = await getCourseRepository(

        payload.courseId

    );

    if (!course) {

        throw new AppError(

            "Course not found",

            404

        );

    }

    if (!course.isActive) {

        throw new AppError(

            "Course is inactive",

            400

        );

    }

    const updatedVideo = await updateVideoRepository(

        videoId,

        payload

    );

    if (payload.isActive === false) {

        await deactivateVideoAccessRepository(videoId);

    }

    return updatedVideo;

};

export const getVideoByIdService = async (
    videoId: string
) => {

    const video = await getVideoByIdRepository(videoId);

    if (!video) {
        throw new AppError("Video not found", 404);
    }

    return video;
};