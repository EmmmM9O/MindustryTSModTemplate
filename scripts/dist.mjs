import config from "../mod.config.mjs";
import dist from "../dist.config.mjs";
import chalk from "chalk";
import fs from "fs-extra";
import process from "process";
import path from "path";
import { execSync } from "child_process";
import AdmZip from "adm-zip";
import fg from "fast-glob";
const { globSync } = fg;
console.log(
  `${chalk.yellow.bold(`Start Package Mod`)} : ${chalk.cyan.bold(config.name)}`,
);
const startTime = new Date();
const json = JSON.stringify(config);
const root = process.cwd();
const tmpD = path.join(root, dist.tmpDir);
const scriptsD = path.join(tmpD, "scripts");
const distD = path.join(root, dist.distDir);
const buildD = path.join(root, dist.buildDir);
const assetsD = path.join(root, dist.assetsDir);
if (fs.existsSync(buildD))
  fs.rmSync(buildD, { recursive: true });
if (fs.existsSync(tmpD))
  fs.rmSync(tmpD, { recursive: true });
fs.mkdirSync(tmpD);
if (fs.existsSync(distD))
  fs.rmSync(distD, { recursive: true });
fs.mkdirSync(distD);
if (!fs.existsSync(scriptsD)) fs.mkdirSync(scriptsD);
console.log(`${chalk.green.bold(`Building Typescript`)}`);
console.log(
  execSync(dist.buildCommand, { encoding: "utf-8" }),
);
if (fs.existsSync(buildD))
  for (const f of fs.readdirSync(buildD))
    fs.copySync(
      path.join(buildD, f),
      path.join(scriptsD, f),
    );
console.log(`${chalk.green.bold(`Writing mod.json`)}`);
fs.writeFileSync(path.join(tmpD, "mod.json"), json);
console.log(`${chalk.green.bold(`Cpoying assets`)}`);
if (fs.existsSync(assetsD))
  for (const f of fs.readdirSync(assetsD))
    fs.copySync(path.join(assetsD, f), path.join(tmpD, f));
if (dist.source != undefined) {
  console.log(`${chalk.green.bold(`Cpoying source`)}`);
  fs.copySync(
    path.join(root, dist.source),
    path.join(tmpD, "source"),
  );
}
if (dist.others != null)
  for (const s of dist.others)
    fs.copySync(s, path.join(tmpD, path.parse(s).name));

if (!fs.existsSync(tmpD, "scripts/main.js"))
  console.log(
    `${chalk.yellow("Warn")}:${chalk.cyan("scripts/main.js do not exists")}`,
  );
console.log(`${chalk.green.bold(`Fixing Problems`)}`);
for (const f of globSync(path.join(scriptsD, "**/*.js"))) {
  let str = fs.readFileSync(f, { encoding: "utf8" });
  str = "let exports= {} \n" + str;
  if (!f.includes("main.js"))
    str = str + "\nmodule.exports = exports";
  fs.writeFileSync(f, str);
}
console.log(`${chalk.green.bold(`Packing`)}`);
const zip = new AdmZip();
zip.addLocalFolder(tmpD);
zip.writeZip(path.join(distD, dist.name + ".zip"));
const endTime = new Date();
const ms = endTime - startTime;
console.log(`${chalk.yellow.bold(`Finish`)} in ${chalk.bold(`${(ms / 1000).toFixed(2)}s`)}
${chalk.blue.bold("Output:")}${chalk.cyan(path.join(distD, dist.name + ".zip"))}`);
fs.rmSync(tmpD, { recursive: true });
