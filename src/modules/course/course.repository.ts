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

export const getCourseByIdRepository = async (
    courseId: string
) => {

    return prisma.course.findUnique({

        where: {
            id: courseId
        }

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