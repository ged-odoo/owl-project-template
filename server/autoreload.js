import { watch } from "fs";

export function handleAutoReload(req, server) {
  if (server.upgrade(req)) {
    return; // do not return a Response
  }
  return new Response("Upgrade failed :(", { status: 500 });
}

export const autoReloadWebSocket = {
  message(ws, message) { },
  open(ws) {
    sockets.add(ws);
  },
  close(ws, code, message) {
    sockets.delete(ws);
  },
};


const sockets = new Set();

export function watchFiles(path) {
  watch(path, { recursive: true }, (event, filename) => {
    console.log(`Detected ${event} in ${filename}`);
    const msg = filename.endsWith(".css") ? "reload_css" : "reload";
    for (let socket of sockets) {
      socket.send(msg)
    }
  });
}

export const autoreloadCode = port => `
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
  const socket = new WebSocket("ws://localhost:${port}/autoreload");
  socket.addEventListener("message", ev => {
    if (ev.data === "reload") { location.reload(); }
    if (ev.data === "reload_css") { reloadCSS(); }
  });
})();
</script>`;