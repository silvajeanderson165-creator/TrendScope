import { handle } from "hono/vercel";
import app from "./boot";

export const config = {
  runtime: "edge",
};

export default handle(app);
