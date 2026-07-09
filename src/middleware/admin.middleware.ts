import { NextFunction, Request, Response } from "express";

export const isAdmin = (
    req: Request,
    res: Response,
    next: NextFunction
) => {

    if (req.user?.role !== "ADMIN") {

        return res.status(403).json({
            success: false,
            message: "Access Denied"
        });

    }

    next();

};