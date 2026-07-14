import { comparePassword } from "../../utils/bcrypt";
import { generateToken } from "../../utils/jwt";

import {
    clearSession,
    findUserByEmail,
    updateSession
} from "./auth.repository";

import { v4 as uuid } from "uuid";

interface LoginPayload {

    email: string;

    password: string;

    deviceId: string;

}

export const adminLogin = async (
    payload: LoginPayload
) => {

    const user = await findUserByEmail(payload.email);

    if (!user) {

        throw new Error("Invalid Email or Password");

    }

    if (user.role !== "ADMIN") {

        throw new Error("Unauthorized");

    }

    const passwordMatched = await comparePassword(

        payload.password,

        user.password

    );

    if (!passwordMatched) {

        throw new Error("Invalid Email or Password");

    }

    const sessionToken = uuid();

    await updateSession(

        user.id,

        sessionToken,

        payload.deviceId

    );

    const token = generateToken({

        userId: user.id,

        role: user.role,

        sessionToken

    });

    return {

        token,

        user: {

            id: user.id,

            name: user.name,

            email: user.email

        }

    };

};


export const studentLogin = async (
    payload: LoginPayload
) => {
const user = await findUserByEmail(payload.email);

if (!user) {
    throw new Error("Invalid Email or Password");
}

if(user.role !== "STUDENT"){
    throw new Error("Unauthorized User");
}

if(!user.isActive){
    throw new Error("Account Disabled");
}

const passwordMatched = await comparePassword(
    payload.password,
    user.password
);

if (!passwordMatched) {
    throw new Error("Invalid Email or Password");
}

if (
    user.deviceId &&
    user.deviceId !== payload.deviceId
) {

    throw new Error(
        "Your account is already logged in on another device."
    );

}

const sessionToken = uuid();

await updateSession(
    user.id,
    sessionToken,
    payload.deviceId
);

const token = generateToken({
    userId: user.id,
    role: user.role,
    sessionToken
});

return {
    token,
    user: {
        id: user.id,
        name: user.name,
        email: user.email
    }
};
}


export const logout = async (
    userId: string
) => {

    await clearSession(userId);

};