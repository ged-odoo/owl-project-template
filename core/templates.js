import { readdirSync, statSync } from "fs";
import { join } from "path";

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

export async function fetchTemplates(root) {
  const regex = /<templates>([\s\S]*?)<\/templates>/;
  const proms = [];
  for (let file of getFile(root)) {
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
