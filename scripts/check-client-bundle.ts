import { readFile } from "node:fs/promises";

const bundle = await readFile(new URL("../lib/client.js", import.meta.url), "utf8");
if (
  !bundle.includes("window.__ModuleLoader__.load({") ||
  !bundle.includes('id: "dsh-custom-models"')
) {
  throw new Error("client bundle does not register the dsh-custom-models module id");
}
if (/require\(["'](?:node:|fs["']|path["']|module["'])/.test(bundle)) {
  throw new Error("client bundle contains a Node builtin require");
}
const pkg = JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8")) as {
  exports?: Record<string, unknown>;
  dsh?: { client?: { platform?: string } };
};
if (pkg.exports?.["./client"] === undefined || pkg.dsh?.client?.platform !== "web") {
  throw new Error("package metadata does not expose the web client bundle");
}
await readFile(new URL("../lib/types/client/index.d.ts", import.meta.url), "utf8");
console.log("client bundle smoke check passed");
