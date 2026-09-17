import { mkdir, readFile, rm, writeFile } from "node:fs/promises";

await rm(new URL("./dist/", import.meta.url), { recursive: true, force: true });
await mkdir(new URL("./dist/", import.meta.url), { recursive: true });
const source = await readFile(new URL("./src/index.mjs", import.meta.url), "utf8");
await writeFile(new URL("./dist/index.mjs", import.meta.url), source);