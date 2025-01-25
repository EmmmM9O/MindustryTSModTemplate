import { DistConfig } from "@raw/config";
import config from "@config/mod.config";
const M: DistConfig = {
  distDir: "./dist",
  assetsDir: ["./main/assets", "./gen"],
  tmpDir: "./tmp",
  buildDir: ["./main/build"],
  source: [
    ["./main/src", "main"],
    ["./content/src", "content"],
  ],
  buildCommand: "yarn build",
  others: ["./main/types"],
  name: config.name + "-" + config.version,
};
export default M;
