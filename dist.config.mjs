import config from "./mod.config.mjs";
/** @type {import("./scripts/config").DistConfig} */
export default {
  distDir: "./dist",
  assetsDir: "./assets",
  tmpDir: "./tmp",
  buildDir: "./build",
  source: "./src",
  buildCommand: "yarn build",
  others: ["./types"],
  name: config.name + "-" + config.version,
};
