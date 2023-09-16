import { argv } from "process";
import { buildIndex, buildOwl, bundleApp } from "./assets";
import { app_config } from "../package.json";
import { join } from "path";
import fs from "fs";

const BUILD_PATH = join(__dirname, "../", app_config.build_path);

if (argv.includes("--build")) {
  buildApp();
}

async function buildApp() {
  if (!fs.existsSync(BUILD_PATH)) {
    fs.mkdirSync(BUILD_PATH);
  }
  // index page
  const html = await buildIndex(false);
  await Bun.write(join(BUILD_PATH, "index.html"), html);
  // app
  await bundleApp(false, BUILD_PATH);
  console.log(`App is ready in folder: ${BUILD_PATH}`);
  // owl
  await buildOwl(false, BUILD_PATH);
  // todo: bundle all css files from app.html
  // todo: copy all remaining static files from public to build_path
}
