import { Server } from "./core/server";
import { argv } from "process";

const inDevMode = argv.includes("--dev");

const server = new Server({ dev: inDevMode });

server.serve();
