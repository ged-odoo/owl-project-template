import { join } from "path";
import { name, app_config } from "../package.json";
import {
  autoReloadWebSocket,
  handleAutoReload,
  watchFiles,
} from "./autoreload";
import {
  buildIndex,
  buildOwl,
  bundleApp,
  fetchStyles,
  fetchTemplates,
} from "./assets";

export class Server {
  handlers = {
    GET: {},
    POST: {},
  };

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
    if (app_config.other_static_files) {
      for (let file in app_config.other_static_files) {
        const path = app_config.other_static_files[file];
        this.get(
          "/" + file,
          () => new Response(Bun.file(join(__dirname, "../", path)))
        );
      }
    }
    if (this.dev) {
      if (!app_config.inline_css) {
        this.get(
          "/app.css",
          async () =>
            new Response(await fetchStyles(), {
              headers: { "Content-Type": "text/css" },
            })
        );
      }
      if (!app_config.inline_xml) {
        this.get(
          "/app.xml",
          async () =>
            new Response(await fetchTemplates(), {
              headers: { "Content-Type": "application/xml" },
            })
        );
      }
      this.config.websocket = autoReloadWebSocket;
      this.get("/autoreload", handleAutoReload)
        .get("/index.html", async () => {
          const html = await buildIndex(this.dev);
          return new Response(html, {
            headers: { "Content-Type": "text/html" },
          });
        })
        .get("/app.js", async () => {
          const bundle = await bundleApp(this.dev);
          return new Response(bundle.outputs[0]);
        })
        .get("/owl.js", async () => {
          const owl = await buildOwl(this.dev);
          return new Response(owl, {
            headers: {
              "Cache-Control": "public, max-age=31536000, immutable",
            },
          });
        });
    }
  }
  /**
   * @param {string} route
   * @param {Function} handler
   * @returns Server
   */
  get(route, handler) {
    this.handlers.GET[route] = handler;
    return this;
  }
  /**
   * @param {string} route
   * @param {Function} handler
   * @returns Server
   */
  post(route, handler) {
    this.handlers.POST[route] = handler;
    return this;
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
    if (pathName in this.handlers[req.method]) {
      response = await this.handlers[req.method][pathName](req, server);
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
