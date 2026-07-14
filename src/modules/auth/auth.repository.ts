import prisma from "../../config/prisma";

export const findUserByEmail = async (email: string) => {
  return prisma.user.findUnique({
    where: {
      email
    }
  });
};

export const updateSession = async (
  userId: string,
  sessionToken: string,
  deviceId: string
) => {

  return prisma.user.update({
    where: {
      id: userId
    },

    data: {
      sessionToken,
      deviceId
    }
  });

};


export const clearSession = async (
    userId: string
) => {

    return prisma.user.update({

        where: {
            id: userId
        },

        data: {

            sessionToken: null,

            deviceId: null

        }

    });

};