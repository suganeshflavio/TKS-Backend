import { Request, Response } from "express";

import { adminLoginSchema, studentLoginSchema } from "./auth.validation";

import { adminLogin, logout, studentLogin } from "./auth.service";

import {
    errorResponse,
    successResponse
} from "../../utils/response";

export const adminLoginController = async (

    req: Request,

    res: Response

) => {

    try {

        const payload = adminLoginSchema.parse(req.body);

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

export const studentLoginController = async (
    req: Request,
    res: Response
) => {

    try {

        const payload = studentLoginSchema.parse(req.body);

        const data = await studentLogin(payload);

        return successResponse(
            res,
            "Login Successful",
            data
        );

    } catch (error: any) {

        return errorResponse(
            res,
            error.message,
            400
        );

    }

};


export const logoutController = async (
    req: Request,
    res: Response
) => {

    await logout(
        req.user!.userId
    );

    return successResponse(
        res,
        "Logout Successful"
    );

};