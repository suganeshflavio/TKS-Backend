// export const env = {
//   PORT: Number(process.env.PORT) || 5000,

//   JWT_SECRET: process.env.JWT_SECRET || "",

//   JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
// };
import dotenv from "dotenv";

dotenv.config();

export const env = {
  PORT: Number(process.env.PORT) || 5000,

  JWT_SECRET: process.env.JWT_SECRET ?? "",

  JWT_EXPIRES_IN: (process.env.JWT_EXPIRES_IN ?? "7d") as
    | "7d"
    | "1d"
    | "30d"
    | `${number}h`
    | `${number}m`
    | `${number}s`,
};