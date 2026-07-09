import { AppError } from "../../utils/errors/AppError";
import { GetCourseQueryDto } from "./course.types";
import { getCoursesRepository, updateCourseRepository } from "./course.repository";
import { CreateCourseDto } from "./course.types";
import { getCourseByIdRepository } from "./course.repository";
import { UpdateCourseDto } from "./course.types";

import {
    createCourseRepository,
    findCourseByName
} from "./course.repository";

export const createCourseService = async (
    payload: CreateCourseDto
) => {

    const existingCourse = await findCourseByName(
        payload.courseName
    );

    if (existingCourse) {
        throw new AppError(
            "Course already exists",
            409
        );
    }

    const course = await createCourseRepository(payload);

    return course;
};


export const getCoursesService = async (
    query: GetCourseQueryDto
) => {

    const page = query.page || 1;

    const limit = query.limit || 10;

    const result = await getCoursesRepository(
        page,
        limit,
        query.search,
        query.isActive
    );

    return {

        ...result,

        page,

        limit,

        totalPages: Math.ceil(result.total / limit)

    };

};

export const getCourseByIdService = async (
    courseId: string
) => {

    const course = await getCourseByIdRepository(
        courseId
    );

    if (!course) {

        throw new AppError(
            "Course not found",
            404
        );

    }

    return course;

};

export const updateCourseService = async (

    courseId: string,

    payload: UpdateCourseDto

) => {

    const existingCourse = await getCourseByIdRepository(

        courseId

    );

    if (!existingCourse) {

        throw new AppError(

            "Course not found",

            404

        );

    }

    const duplicate = await findCourseByName(

        payload.courseName

    );

    if (

        duplicate &&

        duplicate.id !== courseId

    ) {

        throw new AppError(

            "Course name already exists",

            409

        );

    }

    return updateCourseRepository(

        courseId,

        payload

    );

};