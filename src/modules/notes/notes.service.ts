import { AppError } from "../../utils/errors/AppError";
import { deleteFromCloudinary } from "../../utils/uploadToCloudinary";
import { CreateNotesDto, GetNotesQueryDto, UpdateNotesDto } from "./notes.types";
import {
    createNotesRepository,
    getNotesByIdRepository,
    getNotesListRepository,
    permanentDeleteNotesRepository,
    setNotesActiveRepository,
    updateNotesRepository
} from "./notes.repository";

export const createNotesService = async (
    payload: CreateNotesDto
) => {

    return createNotesRepository(payload);

};

export const getNotesListService = async (
    query: GetNotesQueryDto
) => {

    const page = query.page || 1;

    const limit = query.limit || 10;

    const result = await getNotesListRepository(query);

    return {

        ...result,

        page,

        limit,

        totalPages: Math.ceil(result.total / limit)

    };

};

export const getNotesByIdService = async (
    notesId: string
) => {

    const notes = await getNotesByIdRepository(notesId);

    if (!notes) {
        throw new AppError("Notes not found", 404);
    }

    return notes;

};

export const updateNotesService = async (
    notesId: string,
    payload: UpdateNotesDto
) => {

    const notes = await getNotesByIdRepository(notesId);

    if (!notes) {
        throw new AppError("Notes not found", 404);
    }

    const updated = await updateNotesRepository(notesId, payload);

    if (
        payload.notesFileId &&
        notes.notesFileId &&
        payload.notesFileId !== notes.notesFileId
    ) {

        await deleteFromCloudinary(notes.notesFileId);

    }

    return updated;

};

export const deleteNotesService = async (
    notesId: string
) => {

    const notes = await getNotesByIdRepository(notesId);

    if (!notes) {
        throw new AppError("Notes not found", 404);
    }

    return setNotesActiveRepository(notesId, false);

};

export const permanentDeleteNotesService = async (
    notesId: string
) => {

    const notes = await getNotesByIdRepository(notesId);

    if (!notes) {
        throw new AppError("Notes not found", 404);
    }

    if (notes.notesFileId) {
        await deleteFromCloudinary(notes.notesFileId);
    }

    await permanentDeleteNotesRepository(notesId);

    return { id: notesId };

};
