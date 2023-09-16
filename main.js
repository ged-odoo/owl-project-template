import { Server } from "./core/server";
import { argv } from "process";

const inDevMode = argv.includes("--dev");

const server = new Server({ dev: inDevMode });

// express-like api to add route:
// server.get('/someroute', req => {
//     return new Response("some response");
// });

server.serve();
