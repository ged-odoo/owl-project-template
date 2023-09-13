import { join } from "path";
import { cwd } from "process";
import { autoReloadWebSocket, autoreloadCode, handleAutoReload, watchFiles } from "./autoreload";
import { fetchTemplates } from "./templates";

export class Server {
  handlers = {
    "/": async () => {
      const file = Bun.file(join(this.root, "app.html"));
      const html = await file.text();
      const templates = await fetchTemplates(this.root);
      let toInject = `<script type="application/xml">${templates}</script>`;
      if (this.autoreload) {
        toInject += autoreloadCode(this.config.port);
      }
      const finalHtml = html.replace(/<\/head>/, match => toInject + match);
      return new Response(finalHtml, {
        headers: { "Content-Type": "text/html" },
      });    
    },
    "/app.js": async () => {
      const bundle = await Bun.build({
        entrypoints: [join(this.root, "app.js")],
        external: ["@odoo/owl"],
      });
      return new Response(bundle.outputs[0]);

    },
    "/owl.js": () => {
      const path = join(cwd(), "node_modules/@odoo/owl/dist/owl.es.js");
      return new Response(Bun.file(path), {
        headers: {
          "Cache-Control": "public, max-age=31536000, immutable"
        }
      });
    }
  };

  constructor(params) {
    this.root = params.root;
    this.autoreload = params.autoreload;
    this.config = {
      port: params.port,
      fetch: this.handleRequest.bind(this),
      error: this.handleError.bind(this)
    }
    if (this.autoreload) {
      this.handlers["/autoreload"] = handleAutoReload;
      this.config.websocket = autoReloadWebSocket;
    }
  }
  handleError() {
    return new Response(null, { status: 404 });
  }
  handleRequest(req, server) {
    const pathName = new URL(req.url).pathname;
    console.log(`[GET] ${pathName}`);
    if (pathName in this.handlers) {
      return this.handlers[pathName](req, server);
    }
    return new Response(Bun.file(join(this.root, pathName)));
  }
  serve() {
    Bun.serve(this.config);
    if (this.autoreload) {
      watchFiles(this.root);
    }
  }
}