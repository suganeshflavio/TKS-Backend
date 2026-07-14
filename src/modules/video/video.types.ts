export interface CreateVideoDto {

    courseId: string;

    subject?: string;

    chapter?: string;

    videoName: string;

    youtubeUrl: string;

    description?: string;

    duration?: string;

    order?: number;

    isPreview?: boolean;

    isActive?: boolean;

}

export interface GetVideoQueryDto {

    page?: number;

    limit?: number;

    search?: string;

    courseId?: string;

    subject?: string;

    chapter?: string;

    isActive?: boolean;

}

export interface UpdateVideoDto extends CreateVideoDto {}