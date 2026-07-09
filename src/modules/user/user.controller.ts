import { Request, Response } from "express";

import { createUserSchema } from "./user.validation";

import { createStudentService, getUserByIdService, getUsersService } from "./user.service";

import {

    successResponse,

    errorResponse

} from "../../utils/response";
import { asyncHandler } from "../../utils/asyncHandler";

export const createStudent = async (

    req: Request,

    res: Response

) => {

    // try {

        const payload = createUserSchema.parse(

            req.body

        );

        const student = await createStudentService(

            payload

        );

        return successResponse(

            res,

            "Student Created Successfully",

            student,

            201

        );

    // }

    // catch (error: any) {

        // return errorResponse(

        //     res,

        //     error.message,

        //     400

        // );

    // }

};


export const getUsers = asyncHandler(async (req: Request, res: Response) => {

    const page = Number(req.query.page) || 1;

    const limit = Number(req.query.limit) || 10;

    const search = req.query.search as string;

    const data = await getUsersService(
        page,
        limit,
        search
    );

    return successResponse(
        res,
        "Users fetched successfully",
        data
    );

});

export const getUserById = asyncHandler(
    async (req: Request, res: Response) => {

        const user = await getUserByIdService(
            req.params.id as string
        );
        console.log(req.params.id);

        return successResponse(

            res,

            "User fetched successfully",

            user

        );

    }

);