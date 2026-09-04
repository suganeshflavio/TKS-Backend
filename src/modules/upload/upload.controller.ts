import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { successResponse } from "../../utils/response";
import { AppError } from "../../utils/errors/AppError";
import { uploadImageToCloudinary } from "../../utils/uploadToCloudinary";

export const uploadInlineImage = asyncHandler(async (req: Request, res: Response) => {

    if (!req.file) {
        throw new AppError("Image file is required", 400);
    }

    const uploaded = await uploadImageToCloudinary(req.file, "inline-content");

    return successResponse(res, "Image uploaded successfully", {
        url: uploaded.url,
        publicId: uploaded.publicId
    }, 201);

});
