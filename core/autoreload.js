import chokidar from "chokidar";
import { app_config } from "../package.json";

export function handleAutoReload(req, server) {
  if (server.upgrade(req)) {
    return; // do not return a Response
  }
  return new Response("Upgrade failed :(", { status: 500 });
}

export const autoReloadWebSocket = {
  message(ws, message) {},
  open(ws) {
    sockets.add(ws);
  },
  close(ws, code, message) {
    sockets.delete(ws);
  },
};

const sockets = new Set();

export function watchFiles(path) {
  const watcher = chokidar.watch(path);
  watcher.on("ready", () => {
    watcher.on("all", (event, path) => {
      console.log(`Detected ${event} in ${path}`);
      if (event === "addDir") {
        return;
      }
      const msg =
        path.endsWith(".css") && !app_config.inline_css
          ? "reload_css"
          : "reload";
      for (let socket of sockets) {
        socket.send(msg);
      }
    });
  });
}

export const autoreloadCode = `
<script>
(function autoreload() {
  function reloadCSS() {
    for (let link of document.getElementsByTagName('link')) {
      if (link.rel === "stylesheet" && link.href) {
        const url = new URL(link.href, location.href);
        url.searchParams.set('forceReload', Date.now());
        link.href = url.href;
      }
    }
  }  
  const socket = new WebSocket("ws://localhost:${app_config.port}/autoreload");
  socket.addEventListener("message", ev => {
    if (ev.data === "reload") { location.reload(); }
    if (ev.data === "reload_css") { reloadCSS(); }
  });
  socket.addEventListener("close", () => {
    console.warn("websocket connection lost. Make sure server is running, and refresh this page");
  });
})();
</script>`;
