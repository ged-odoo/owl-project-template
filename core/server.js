import { join } from "path";
import { name, app_config } from "../package.json";
import {
  autoReloadWebSocket,
  handleAutoReload,
  watchFiles,
} from "./autoreload";
import { buildIndex, buildOwl, bundleApp } from "./assets";

export class Server {
  handlers = {};

  constructor(params) {
    this.dev = params.dev;
    this.config = {
      port: app_config.port,
      fetch: this.handleRequest.bind(this),
      error: this.handleError.bind(this),
    };
    this.root = join(
      "__dirname",
      "../",
      this.dev ? app_config.public_path : app_config.build_path
    );
    if (this.dev) {
      this.handlers["/autoreload"] = handleAutoReload;
      this.config.websocket = autoReloadWebSocket;
      this.handlers["/index.html"] = async () => {
        const html = await buildIndex(this.dev);
        return new Response(html, {
          headers: { "Content-Type": "text/html" },
        });
      };
      this.handlers["/app.js"] = async () => {
        const bundle = await bundleApp(this.dev);
        return new Response(bundle.outputs[0]);
      };
      this.handlers["/owl.js"] = async () => {
        const owl = await buildOwl(this.dev);
        return new Response(owl, {
          headers: {
            "Cache-Control": "public, max-age=31536000, immutable",
          },
        });
      };
    }
  }
  handleError() {
    return new Response(null, { status: 404 });
  }
  async handleRequest(req, server) {
    let pathName = new URL(req.url).pathname;
    if (pathName === "/") {
      pathName = "/index.html";
    }
    let response;
    if (pathName in this.handlers) {
      response = await this.handlers[pathName](req, server);
    } else {
      response = new Response(Bun.file(join(this.root, pathName)));
    }
    console.log(`${new Date().toLocaleTimeString()} GET ${pathName}`);
    return response;
  }
  serve() {
    Bun.serve(this.config);
    if (this.dev) {
      watchFiles(this.root);
    }
    console.log(
      `[${name}] server started. Listening on http://localhost:${app_config.port}`
    );
  }
}
