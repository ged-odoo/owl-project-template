import { app_config } from "../package.json";
import { readdirSync, statSync } from "fs";
import { join } from "path";
import { autoreloadCode } from "./autoreload";

const PUBLIC_PATH = join(__dirname, "../", app_config.public_path);

export async function bundleApp(dev, outdir) {
  const bundle = await Bun.build({
    entrypoints: [join(PUBLIC_PATH, "app.js")],
    external: ["@odoo/owl"],
    minify: !dev,
    outdir: outdir,
  });
  return bundle;
}

export async function buildIndex(dev) {
  const file = Bun.file(join(PUBLIC_PATH, "app.html"));
  const html = await file.text();
  const templates = await fetchTemplates();
  let toInject = `<script type="application/xml">${templates}</script>`;
  if (dev) {
    toInject += autoreloadCode;
  }
  toInject += `<script>
  TEMPLATES = document.querySelector('script[type="application/xml"]').text;
  DEV = ${dev};</script>`;
  return html.replace(/<\/head>/, (match) => toInject + match);
}

export async function buildOwl(dev, outdir) {
  const path = join(__dirname, "../", "node_modules/@odoo/owl/dist/owl.es.js");
  let file;
  if (dev) {
    file = Bun.file(path);
  } else {
    file = (
      await Bun.build({
        entrypoints: [path],
        minify: true,
        outdir,
        naming: "[dir]/owl.[ext]",
      })
    ).outputs[0];
  }
  return file;
}

function* getFile(path) {
  for (let file of readdirSync(path)) {
    const filePath = join(path, file);
    const isDirectory = statSync(filePath).isDirectory();
    if (isDirectory) {
      yield* getFile(join(path, file));
    } else {
      yield Bun.file(filePath);
    }
  }
}

async function fetchTemplates() {
  const regex = /<templates>([\s\S]*?)<\/templates>/;
  const proms = [];
  for (let file of getFile(PUBLIC_PATH)) {
    if (file.type === "application/xml") {
      proms.push(
        file.text().then((xmlStr) => {
          const match = regex.exec(xmlStr);
          return match ? match[1].trim() : "";
        })
      );
    }
  }
  const templates = await Promise.all(proms);
  return `<templates>${templates.join("")}</templates>`;
}
