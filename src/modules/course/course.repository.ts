import prisma from "../../config/prisma";
import { Prisma } from "@prisma/client";
import { CreateCourseDto } from "./course.types";
import { UpdateCourseDto } from "./course.types";

export const findCourseByName = async (
    courseName: string
) => {

    return prisma.course.findFirst({
        where: {
            courseName
        }
    });

};

export const createCourseRepository = async (
    payload: CreateCourseDto
) => {

    return prisma.course.create({
        data: payload
    });

};

export const getCoursesRepository = async (
    page: number,
    limit: number,
    search?: string,
    isActive?: boolean
) => {

    const skip = (page - 1) * limit;

    const where: Prisma.CourseWhereInput = {};

    if (search) {
        where.courseName = {
            contains: search,
            mode: "insensitive"
        };
    }

    if (typeof isActive === "boolean") {
        where.isActive = isActive;
    }

    const [courses, total] = await Promise.all([

        prisma.course.findMany({

            where,

            skip,

            take: limit,

            orderBy: {
                createdAt: "desc"
            }

        }),

        prisma.course.count({
            where
        })

    ]);

    return {

        courses,

        total

    };

};

const courseDetailInclude = {

    subjects: {
        orderBy: { order: "asc" as const },
        include: {
            subject: {
                select: { id: true, name: true }
            }
        }
    },

    videos: {
        orderBy: { order: "asc" as const },
        include: {
            video: {
                select: { id: true, videoName: true, isActive: true }
            }
        }
    },

    notes: {
        orderBy: { order: "asc" as const },
        include: {
            notes: {
                select: { id: true, title: true, isActive: true }
            }
        }
    },

    mcqTests: {
        orderBy: { order: "asc" as const },
        include: {
            test: {
                select: { id: true, testName: true }
            }
        }
    }

};

export const getCourseByIdRepository = async (
    courseId: string
) => {

    return prisma.course.findUnique({

        where: {
            id: courseId
        },

        include: courseDetailInclude

    });

};

export const updateCourseRepository = async (

    courseId: string,

    payload: UpdateCourseDto

) => {

    return prisma.course.update({

        where: {

            id: courseId

        },

        data: payload

    });

};

export const deactivateCourseCascadeRepository = async (
    courseId: string
) => {

    await prisma.$transaction([

        prisma.courseVideo.updateMany({
            where: {
                courseId
            },
            data: {
                isActive: false
            }
        }),

        prisma.userAccess.updateMany({
            where: {
                courseId
            },
            data: {
                isActive: false
            }
        })

    ]);

};

export const setCourseActiveRepository = async (
    courseId: string,
    isActive: boolean
) => {

    return prisma.course.update({
        where: {
            id: courseId
        },
        data: {
            isActive
        }
    });

};

export const permanentDeleteCourseRepository = async (
    courseId: string
) => {

    return prisma.course.delete({
        where: {
            id: courseId
        }
    });

};

export const getSubjectByIdRepository = async (subjectId: string) => {
    return prisma.subject.findUnique({ where: { id: subjectId } });
};

export const getVideoByIdRepository = async (videoId: string) => {
    return prisma.video.findUnique({ where: { id: videoId } });
};

export const getNotesByIdRepository = async (notesId: string) => {
    return prisma.notes.findUnique({ where: { id: notesId } });
};

export const getMcqTestByIdRepository = async (testId: string) => {
    return prisma.testQuestion.findUnique({ where: { id: testId } });
};

export const linkSubjectRepository = async (
    courseId: string,
    subjectId: string,
    order?: number
) => {

    return prisma.courseSubject.create({
        data: { courseId, subjectId, order }
    });

};

export const unlinkSubjectRepository = async (
    courseId: string,
    subjectId: string
) => {

    await prisma.courseSubject.deleteMany({
        where: { courseId, subjectId }
    });

};

export const findCourseSubjectRepository = async (
    courseId: string,
    subjectId: string
) => {

    return prisma.courseSubject.findUnique({
        where: { courseId_subjectId: { courseId, subjectId } }
    });

};

export const linkVideoRepository = async (
    courseId: string,
    videoId: string,
    order?: number
) => {

    return prisma.courseVideo.create({
        data: { courseId, videoId, order }
    });

};

export const unlinkVideoRepository = async (
    courseId: string,
    videoId: string
) => {

    await prisma.courseVideo.deleteMany({
        where: { courseId, videoId }
    });

};

export const findCourseVideoRepository = async (
    courseId: string,
    videoId: string
) => {

    return prisma.courseVideo.findUnique({
        where: { courseId_videoId: { courseId, videoId } }
    });

};

export const linkNotesRepository = async (
    courseId: string,
    notesId: string,
    order?: number
) => {

    return prisma.courseNotes.create({
        data: { courseId, notesId, order }
    });

};

export const unlinkNotesRepository = async (
    courseId: string,
    notesId: string
) => {

    await prisma.courseNotes.deleteMany({
        where: { courseId, notesId }
    });

};

export const findCourseNotesRepository = async (
    courseId: string,
    notesId: string
) => {

    return prisma.courseNotes.findUnique({
        where: { courseId_notesId: { courseId, notesId } }
    });

};

export const linkMcqTestRepository = async (
    courseId: string,
    testId: string,
    order?: number
) => {

    return prisma.courseMcqTest.create({
        data: { courseId, testId, order }
    });

};

export const unlinkMcqTestRepository = async (
    courseId: string,
    testId: string
) => {

    await prisma.courseMcqTest.deleteMany({
        where: { courseId, testId }
    });

};

export const findCourseMcqTestRepository = async (
    courseId: string,
    testId: string
) => {

    return prisma.courseMcqTest.findUnique({
        where: { courseId_testId: { courseId, testId } }
    });

};
