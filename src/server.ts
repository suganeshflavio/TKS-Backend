import dotenv from "dotenv";
import app from "./app";
import "../src/type/auth.types";
import { env } from "./config/env";

dotenv.config();
console.log("deno", process.env.JWT_SECRET);
const PORT = env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
