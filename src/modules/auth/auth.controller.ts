import { Request, Response } from "express";

import { loginSchema } from "./auth.validation";

import { adminLogin } from "./auth.service";

import {
    errorResponse,
    successResponse
} from "../../utils/response";

export const login = async (

    req: Request,

    res: Response

) => {

    try {

        const payload = loginSchema.parse(req.body);

        const data = await adminLogin(payload);

        return successResponse(

            res,

            "Login Successful",

            data

        );

    }

    catch (error: any) {

        return errorResponse(

            res,

            error.message,

            400

        );

    }

};