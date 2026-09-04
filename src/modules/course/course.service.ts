import { AppError } from "../../utils/errors/AppError";
import { GetCourseQueryDto } from "./course.types";
import { deactivateCourseCascadeRepository, getCoursesRepository, updateCourseRepository } from "./course.repository";
import { CreateCourseDto } from "./course.types";
import { getCourseByIdRepository } from "./course.repository";
import { UpdateCourseDto } from "./course.types";

import {
    createCourseRepository,
    findCourseByName,
    setCourseActiveRepository,
    permanentDeleteCourseRepository,
    getSubjectByIdRepository,
    getVideoByIdRepository,
    getNotesByIdRepository,
    getMcqTestByIdRepository,
    linkSubjectRepository,
    unlinkSubjectRepository,
    findCourseSubjectRepository,
    linkVideoRepository,
    unlinkVideoRepository,
    findCourseVideoRepository,
    linkNotesRepository,
    unlinkNotesRepository,
    findCourseNotesRepository,
    linkMcqTestRepository,
    unlinkMcqTestRepository,
    findCourseMcqTestRepository
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

      if (payload.accessType === "free") {

    payload.enableEmi = false;

    payload.price = null as any;

    payload.strikePrice = null as any;

    payload.validityMonths = null as any;

    payload.installments = null as any;
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

    if (payload.courseName) {

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

    }

    const course = await updateCourseRepository(

        courseId,

        payload

    );

    if (payload.isActive === false) {

        await deactivateCourseCascadeRepository(courseId);

    }

    return course;

};

export const deleteCourseService = async (
    courseId: string
) => {

    const existingCourse = await getCourseByIdRepository(courseId);

    if (!existingCourse) {

        throw new AppError("Course not found", 404);

    }

    const course = await setCourseActiveRepository(courseId, false);

    await deactivateCourseCascadeRepository(courseId);

    return course;

};

export const permanentDeleteCourseService = async (
    courseId: string
) => {

    const existingCourse = await getCourseByIdRepository(courseId);

    if (!existingCourse) {

        throw new AppError("Course not found", 404);

    }

    await permanentDeleteCourseRepository(courseId);

    return { id: courseId };

};

const ensureCourseExists = async (courseId: string) => {

    const course = await getCourseByIdRepository(courseId);

    if (!course) {
        throw new AppError("Course not found", 404);
    }

    return course;

};

export const linkCourseSubjectService = async (
    courseId: string,
    subjectId: string,
    order?: number
) => {

    await ensureCourseExists(courseId);

    const subject = await getSubjectByIdRepository(subjectId);

    if (!subject) {
        throw new AppError("Subject not found", 404);
    }

    const existing = await findCourseSubjectRepository(courseId, subjectId);

    if (existing) {
        throw new AppError("Subject already linked to this course", 409);
    }

    return linkSubjectRepository(courseId, subjectId, order);

};

export const unlinkCourseSubjectService = async (
    courseId: string,
    subjectId: string
) => {

    await ensureCourseExists(courseId);

    await unlinkSubjectRepository(courseId, subjectId);

    return { courseId, subjectId };

};

export const linkCourseVideoService = async (
    courseId: string,
    videoId: string,
    order?: number
) => {

    await ensureCourseExists(courseId);

    const video = await getVideoByIdRepository(videoId);

    if (!video) {
        throw new AppError("Video not found", 404);
    }

    const existing = await findCourseVideoRepository(courseId, videoId);

    if (existing) {
        throw new AppError("Video already linked to this course", 409);
    }

    return linkVideoRepository(courseId, videoId, order);

};

export const unlinkCourseVideoService = async (
    courseId: string,
    videoId: string
) => {

    await ensureCourseExists(courseId);

    await unlinkVideoRepository(courseId, videoId);

    return { courseId, videoId };

};

export const linkCourseNotesService = async (
    courseId: string,
    notesId: string,
    order?: number
) => {

    await ensureCourseExists(courseId);

    const notes = await getNotesByIdRepository(notesId);

    if (!notes) {
        throw new AppError("Notes not found", 404);
    }

    const existing = await findCourseNotesRepository(courseId, notesId);

    if (existing) {
        throw new AppError("Notes already linked to this course", 409);
    }

    return linkNotesRepository(courseId, notesId, order);

};

export const unlinkCourseNotesService = async (
    courseId: string,
    notesId: string
) => {

    await ensureCourseExists(courseId);

    await unlinkNotesRepository(courseId, notesId);

    return { courseId, notesId };

};

export const linkCourseMcqTestService = async (
    courseId: string,
    testId: string,
    order?: number
) => {

    await ensureCourseExists(courseId);

    const test = await getMcqTestByIdRepository(testId);

    if (!test) {
        throw new AppError("MCQ test not found", 404);
    }

    const existing = await findCourseMcqTestRepository(courseId, testId);

    if (existing) {
        throw new AppError("MCQ test already linked to this course", 409);
    }

    return linkMcqTestRepository(courseId, testId, order);

};

export const unlinkCourseMcqTestService = async (
    courseId: string,
    testId: string
) => {

    await ensureCourseExists(courseId);

    await unlinkMcqTestRepository(courseId, testId);

    return { courseId, testId };

};
