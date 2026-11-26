import { AppError } from "../../utils/errors/AppError";
import { CreateVideoDto, GetVideoQueryDto, UpdateVideoDto } from "./video.types";
import {
    createPresignedB2UploadPayload,
    deleteB2File,
    resolveSignedUrl,
    uploadFileToB2
} from "../../utils/b2";
import { THUMBNAIL_MIME_BY_EXT } from "./video.validation";
import {
    createVideoRepository,
    deactivateVideoAccessRepository,
    getVideoByIdRepository,
    getVideosRepository,
    updateVideoRepository,
    setVideoActiveRepository,
    permanentDeleteVideoRepository
} from "./video.repository";

const enrichVideo = async <T extends {
    videoFileName: string | null;
    thumbnailFileName: string | null;
}>(video: T) => {

    const [videoUrl, thumbnailUrl] = await Promise.all([
        resolveSignedUrl(video.videoFileName),
        resolveSignedUrl(video.thumbnailFileName)
    ]);

    return {
        ...video,
        videoUrl,
        thumbnailUrl
    };

};

export const createVideoService = async (
    payload: CreateVideoDto
) => {

    const video = await createVideoRepository(payload);

    return enrichVideo(video);

};

export const getVideosService = async (

    query: GetVideoQueryDto

) => {

    const page = query.page || 1;

    const limit = query.limit || 10;

    const result = await getVideosRepository(query);

    const videos = await Promise.all(result.videos.map(enrichVideo));

    return {

        ...result,

        videos,

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

    const updatedVideo = await updateVideoRepository(

        videoId,

        payload

    );

    const cleanupDeletions: Promise<void>[] = [];

    if (
        payload.videoFileName &&
        video.videoFileId &&
        video.videoFileName &&
        payload.videoFileName !== video.videoFileName
    ) {

        cleanupDeletions.push(
            deleteB2File(video.videoFileId, video.videoFileName).catch(() => {})
        );

    }

    if (
        payload.thumbnailFileName !== undefined &&
        video.thumbnailFileId &&
        video.thumbnailFileName &&
        payload.thumbnailFileName !== video.thumbnailFileName
    ) {

        cleanupDeletions.push(
            deleteB2File(video.thumbnailFileId, video.thumbnailFileName).catch(() => {})
        );

    }

    if (cleanupDeletions.length > 0) {

        await Promise.all(cleanupDeletions);

    }

    if (payload.isActive === false) {

        await deactivateVideoAccessRepository(videoId);

    }

    return enrichVideo(updatedVideo);

};

export const getVideoByIdService = async (
    videoId: string
) => {

    const video = await getVideoByIdRepository(videoId);

    if (!video) {
        throw new AppError("Video not found", 404);
    }

    return enrichVideo(video);
};

export const deleteVideoService = async (
    videoId: string
) => {

    const video = await getVideoByIdRepository(videoId);

    if (!video) {
        throw new AppError("Video not found", 404);
    }

    const updated = await setVideoActiveRepository(videoId, false);

    await deactivateVideoAccessRepository(videoId);

    return updated;

};

export const permanentDeleteVideoService = async (
    videoId: string
) => {

    const video = await getVideoByIdRepository(videoId);

    if (!video) {
        throw new AppError("Video not found", 404);
    }

    const deletions: Promise<void>[] = [];

    if (video.videoFileId && video.videoFileName) {
        deletions.push(deleteB2File(video.videoFileId, video.videoFileName));
    }

    if (video.thumbnailFileId && video.thumbnailFileName) {
        deletions.push(deleteB2File(video.thumbnailFileId, video.thumbnailFileName));
    }

    if (deletions.length > 0) {
        await Promise.all(deletions);
    }

    await permanentDeleteVideoRepository(videoId);

    return { id: videoId };

};

export const requestVideoUploadUrlService = async (
    payload: { fileName: string }
) => {

    return createPresignedB2UploadPayload("videos", payload.fileName, "video/mp4");

};

export const requestThumbnailUploadUrlService = async (
    payload: { fileName: string; contentType?: string }
) => {

    const ext = payload.fileName.split(".").pop()?.toLowerCase() as
        | keyof typeof THUMBNAIL_MIME_BY_EXT
        | undefined;

    const contentType =
        payload.contentType ??
        (ext ? THUMBNAIL_MIME_BY_EXT[ext] : undefined) ??
        "image/jpeg";

    return createPresignedB2UploadPayload("video-thumbnails", payload.fileName, contentType);

};

export const uploadVideoThumbnailService = async (
    file: Express.Multer.File
) => {

    const uploaded = await uploadFileToB2(file, "video-thumbnails");
    const thumbnailUrl = await resolveSignedUrl(uploaded.fileName);

    return {
        thumbnailFileId: uploaded.fileId,
        thumbnailFileName: uploaded.fileName,
        thumbnailUrl
    };

};
