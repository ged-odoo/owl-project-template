import { Server } from "./core/server";
import { name } from "./package.json";
import { argv} from "process";
import { join } from "path";

const inDevMode = argv.includes("--dev");
const PORT = 3000;
const FULL_PATH = join(__dirname, "public");

const server = new Server({ port: PORT, root: FULL_PATH, autoreload: inDevMode });
server.serve();

console.log(`[${name}] server started. Listening on http://localhost:${PORT}`);
