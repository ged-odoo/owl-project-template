import { readdirSync, statSync, watch } from "fs";
import { join } from "path";
import { argv} from "process";

const inDevMode = argv.includes("--dev");
const BASE_PATH = "./public";
const FULL_PATH = join(__dirname, BASE_PATH);
const PORT = 3000;

const handlers = {
  "/templates": fetchTemplates,
  "/owl.js"() {
    const path = join(__dirname, "node_modules/@odoo/owl/dist/owl.es.js");
    return new Response(Bun.file(path));
  }
};

const server = {
  port: 3000,
  async fetch(req, server) {
    let pathName = new URL(req.url).pathname;
    console.log(`[GET] ${pathName}`);
    if (pathName in handlers) {
      return handlers[pathName](req, server);
    }
    // if no handler, fall back on static files  
    if (pathName === "/") {
      pathName = "/index.html";
    }
    const file = Bun.file(BASE_PATH + pathName);
    if (inDevMode && pathName === "/index.html") {
    }
    const response = new Response(file);
    return response;
  },
  error() {
    return new Response(null, { status: 404 });
  },
};


// ----------------------------------------------------------------
// template handler
// ----------------------------------------------------------------
function* getFile(path) {
  for (let file of readdirSync(path)) {
    const filePath = join(__dirname, path, file);
    const isDirectory = statSync(filePath).isDirectory();
    if (isDirectory) {
      yield *getFile(join(path, file));
    } else {
      yield Bun.file(filePath);
    }
  }
}

async function fetchTemplates() {
  const regex = /<templates>([\s\S]*?)<\/templates>/;
  const proms = [];
  for (let file of getFile(BASE_PATH)) {
    if (file.type === "application/xml") {
      proms.push(file.text().then(xmlStr => {
        const match = regex.exec(xmlStr)
        return match ? match[1].trim() : "";
      }));
    }
  }
  const templates = await Promise.all(proms);
  return new Response(`<templates>${templates.join("")}</templates>`);
}

// ----------------------------------------------------------------
// auto reload
// ----------------------------------------------------------------
if (inDevMode) {
  const sockets = new Set();
  watch(FULL_PATH, { recursive: true }, (event, filename) => {
    console.log(`Detected ${event} in ${filename}`);
    const msg = filename.endsWith(".css") ? "reload_css" : "reload";
    for (let socket of sockets) {
      socket.send(msg)
    }
  });
  handlers["/autoreload"] = (req, server) => {
    if (server.upgrade(req)) {
      return; // do not return a Response
    }
    return new Response("Upgrade failed :(", { status: 500 });
  }
  const autoreloadCode = `<script>(function autoreload() {
    function reloadCSS() {
      for (let link of document.getElementsByTagName('link')) {
        if (link.rel === "stylesheet" && link.href) {
          const url = new URL(link.href, location.href);
          url.searchParams.set('forceReload', Date.now());
          link.href = url.href;
        }
      }
    }  
    const socket = new WebSocket("ws://localhost:${PORT}/autoreload");
    socket.addEventListener("message", ev => {
      if (ev.data === "reload") { location.reload(); }
      if (ev.data === "reload_css") { reloadCSS(); }
    });
  })();</script>`;
  
  
  handlers["/"] = handlers["/index.html"] = async () => {
    const html = await Bun.file(BASE_PATH + '/index.html').text();
    const autorelaodHtml = html.replace(/<\/head>/, match => autoreloadCode + match);
    const headers = {
      headers: {
        "Content-Type": "text/html",
        "Cache-Control": "no-transform", // disables response body auto compression, see https://deno.land/manual/runtime/http_server_apis#automatic-body-compression
      },
    };
    const response = new Response(autorelaodHtml, headers)
    return response;
  }

  server.websocket = {
    message(ws, message) {},
    open(ws) {
      sockets.add(ws);
    },
    close(ws, code, message) {
      sockets.delete(ws);
    },
  };
}

Bun.serve(server);

console.log(`[owl_from_scratch] server started. Listening on http://localhost:${PORT}`);

