import express from "express";
import cors from "cors";
import authRoutes from "./modules/auth/auth.routes";
import userRoutes from "./modules/user/user.routes";
import { errorMiddleware } from "./middleware/error.middleware";
import courseRoutes from "./modules/course/course.routes";
import videoRoutes from "./modules/video/video.routes";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use(express.json());

app.use("/api/auth", authRoutes);

app.use("/api/videos", videoRoutes);

app.use("/api/courses", courseRoutes);

app.use(errorMiddleware);
app.use(
  "/api/users",

  userRoutes,
);
// app.use(errorHandler);
app.get("/", (_, res) => {
  res.json({
    message: "Tks Academy Backend Running",
  });
});

export default app;
