import { hashPassword } from "../../utils/bcrypt";
import { AppError } from "../../utils/errors/AppError";

import {

    createStudent,

    findStudentByEmail,
    getUserByIdRepository,
    getUsersRepository

} from "./user.repository";

interface CreateStudentPayload {

    name: string;

    email: string;

    password: string;

    mobile?: string;

}

export const createStudentService = async (

    payload: CreateStudentPayload

) => {

    const existingUser = await findStudentByEmail(

        payload.email

    );

    if (existingUser) {

        throw new Error("Email already exists");

    }

    const hashedPassword = await hashPassword(

        payload.password

    );

    const user = await createStudent({

        ...payload,

        password: hashedPassword

    });

    return {

        id: user.id,

        name: user.name,

        email: user.email

    };

};


export const getUsersService = async (
    page: number,
    limit: number,
    search?: string
) => {

    const result = await getUsersRepository(
        page,
        limit,
        search
    );

    return {

        ...result,

        page,

        limit,

        totalPages: Math.ceil(result.total / limit)

    };

};

export const getUserByIdService = async (
    userId: string
) => {

    const user = await getUserByIdRepository(userId);

    if (!user) {

        throw new AppError(
            "User not found",
            404
        );

    }

    return user;

};

