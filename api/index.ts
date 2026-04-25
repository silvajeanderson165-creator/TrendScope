import { handle } from "hono/vercel";
// @ts-ignore
import app from "../dist/boot.js";

export default handle(app);
