import prisma from "../../config/prisma";
import { AppError } from "../../utils/errors/AppError";

export const assignUserAccessService = async (
  userId: string,
  courses: {
    courseId: string;
    videoIds: string[];
  }[]
) => {

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  // Remove all previous access
  await prisma.userAccess.deleteMany({
    where: {
      userId,
    },
  });

  for (const courseItem of courses) {

    const course = await prisma.course.findUnique({
      where: {
        id: courseItem.courseId,
      },
    });

    if (!course) {
      throw new AppError(`Course not found: ${courseItem.courseId}`, 404);
    }

    for (const videoId of courseItem.videoIds) {

      const courseVideo = await prisma.courseVideo.findUnique({
        where: {
          courseId_videoId: {
            courseId: courseItem.courseId,
            videoId,
          },
        },
      });

      if (!courseVideo) {
        throw new AppError(
          `Video '${videoId}' is not linked to course '${course.courseName}'`,
          400
        );
      }

      await prisma.userAccess.create({
        data: {
          userId,
          courseId: courseItem.courseId,
          videoId,
        },
      });

    }

  }

  await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      isAccess: true,
    },
  });

  return true;
};


export const getUserAccessByUserIdService = async (
  userId: string
) => {

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      name: true,
      email: true,
      mobile: true,
    },
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  const accesses = await prisma.userAccess.findMany({
    where: {
      userId,
      isActive: true,
    },
    include: {
      course: {
        select: {
          id: true,
          courseName: true,
        },
      },
      video: {
        select: {
          id: true,
          videoName: true,
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  const courseMap = new Map<string, {
    courseId: string;
    courseName: string;
    videos: { videoId: string; videoName: string }[];
  }>();

  for (const access of accesses) {

    if (!courseMap.has(access.courseId)) {

      courseMap.set(access.courseId, {
        courseId: access.course.id,
        courseName: access.course.courseName,
        videos: [],
      });

    }

    courseMap.get(access.courseId)!.videos.push({
      videoId: access.video.id,
      videoName: access.video.videoName,
    });

  }

  return {
    user,
    courses: Array.from(courseMap.values()),
  };
};
