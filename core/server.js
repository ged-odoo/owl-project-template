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
      if (this.dev) {
        toInject += autoreloadCode(this.config.port);
      }
      toInject += `<script>
      TEMPLATES = document.querySelector('script[type="application/xml"]').text;
      DEV = ${this.dev};</script>`;
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
    this.dev = params.dev;
    this.config = {
      port: params.port,
      fetch: this.handleRequest.bind(this),
      error: this.handleError.bind(this)
    }
    if (this.dev) {
      this.handlers["/autoreload"] = handleAutoReload;
      this.config.websocket = autoReloadWebSocket;
    }
  }
  handleError() {
    return new Response(null, { status: 404 });
  }
  async handleRequest(req, server) {
    const pathName = new URL(req.url).pathname;
    let response;
    if (pathName in this.handlers) {
      response =  await this.handlers[pathName](req, server);
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
  }
}
