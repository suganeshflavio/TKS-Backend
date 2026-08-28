import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { successResponse } from "../../utils/response";
import { AppError } from "../../utils/errors/AppError";
import { resolveIsActive } from "../../utils/resolveIsActive";
import { createNotesSchema, updateNotesSchema } from "./notes.validation";
import { UpdateNotesDto } from "./notes.types";
import { uploadToCloudinary } from "../../utils/uploadToCloudinary";
import {
    createNotesService,
    deleteNotesService,
    getNotesByIdService,
    getNotesListService,
    permanentDeleteNotesService,
    updateNotesService
} from "./notes.service";

export const createNotes = asyncHandler(async (req: Request, res: Response) => {

    const payload = createNotesSchema.parse(req.body);

    if (!req.file) {
        throw new AppError("Notes file is required", 400);
    }

    const uploaded = await uploadToCloudinary(req.file, "notes");

    const notes = await createNotesService({
        ...payload,
        notesFileId: uploaded.publicId,
        notesFileName: req.file.originalname,
        notesUrl: uploaded.url
    });

    return successResponse(res, "Notes Created Successfully", notes, 201);

});

export const getNotesList = asyncHandler(async (req: Request, res: Response) => {

    const data = await getNotesListService({

        page: req.query.page ? Number(req.query.page) : 1,

        limit: req.query.limit ? Number(req.query.limit) : 10,

        search: req.query.search as string,

        isActive: resolveIsActive(req.query.isActive)

    });

    return successResponse(res, "Notes fetched successfully", data);

});

export const getNotesById = asyncHandler(async (req: Request, res: Response) => {

    const notes = await getNotesByIdService(req.params.id as string);

    return successResponse(res, "Notes fetched successfully", notes);

});

export const updateNotes = asyncHandler(async (req: Request, res: Response) => {

    const payload = updateNotesSchema.parse(req.body);

    const data: UpdateNotesDto = { ...payload };

    if (req.file) {

        const uploaded = await uploadToCloudinary(req.file, "notes");

        data.notesFileId = uploaded.publicId;
        data.notesFileName = req.file.originalname;
        data.notesUrl = uploaded.url;

    }

    const notes = await updateNotesService(req.params.id as string, data);

    return successResponse(res, "Notes Updated Successfully", notes);

});

export const deleteNotes = asyncHandler(async (req: Request, res: Response) => {

    const notes = await deleteNotesService(req.params.id as string);

    return successResponse(res, "Notes Deactivated Successfully", notes);

});

export const permanentDeleteNotes = asyncHandler(async (req: Request, res: Response) => {

    const result = await permanentDeleteNotesService(req.params.id as string);

    return successResponse(res, "Notes Permanently Deleted", result);

});
