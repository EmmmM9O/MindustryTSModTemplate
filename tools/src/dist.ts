require("module-alias/register");
import chalk from "chalk";
import fs from "fs-extra";
import process from "process";
import path from "path";
import { execSync } from "child_process";
import AdmZip from "adm-zip";
import fg from "fast-glob";
const { globSync } = fg;
export function distMod(
  config: any,
  tmpDir: string,
  distDir: string,
  buildDir: string[],
  buildCommand: string,
  assetsDir: (string | [string, string])[],
  source: (string | [string, string])[] | undefined,
  others: (string | [string, string])[] | undefined,
  name: string,
) {
  const startTime = new Date();
  const json = JSON.stringify(config);
  const root = process.cwd();
  const tmpD = path.join(root, tmpDir);
  const scriptsD = path.join(tmpD, "scripts");
  const distD = path.join(root, distDir);

  for (let s of buildDir)
    if (fs.existsSync(s)) fs.rmSync(s, { recursive: true });
  if (fs.existsSync(tmpD))
    fs.rmSync(tmpD, { recursive: true });
  fs.mkdirSync(tmpD);
  if (fs.existsSync(distD))
    fs.rmSync(distD, { recursive: true });
  fs.mkdirSync(distD);
  if (!fs.existsSync(scriptsD)) fs.mkdirSync(scriptsD);
  console.log(`${chalk.green.bold(`Building Typescript`)}`);
  console.log(
    execSync(buildCommand, { encoding: "utf-8" }),
  );
  for (let s of buildDir)
    if (fs.existsSync(s))
      for (const f of fs.readdirSync(s))
        fs.copySync(
          path.join(s, f),
          path.join(scriptsD, f),
        );
  console.log(`${chalk.green.bold(`Writing mod.json`)}`);
  fs.writeFileSync(path.join(tmpD, "mod.json"), json);
  console.log(`${chalk.green.bold(`Cpoying assets`)}`);
  for (let s of assetsDir) {
    let p: string,
      k: string | null = null;
    if (typeof s === "string") p = s;
    else {
      p = s[0];
      k = s[1];
    }
    if (fs.existsSync(p))
      for (const f of fs.readdirSync(p))
        fs.copySync(
          path.join(p, f),
          k == null
            ? path.join(tmpD, f)
            : path.join(tmpD, k, f),
        );
  }
  if (source != undefined) {
    console.log(`${chalk.green.bold(`Cpoying source`)}`);
    for (let s of source) {
      let p: string,
        k: string | null = null;
      if (typeof s === "string") p = s;
      else {
        p = s[0];
        k = s[1];
      }
      if (fs.existsSync(p))
        for (const f of fs.readdirSync(p))
          fs.copySync(
            path.join(p, f),
            k == null
              ? path.join(tmpD, "source", f)
              : path.join(tmpD, "source", k, f),
          );
    }
  }
  if (others != null)
    for (const s of others) {
      let p: string,
        k: string | null = null;
      if (typeof s === "string") p = s;
      else {
        p = s[0];
        k = s[1];
      }
      if (fs.existsSync(p))
        for (const f of fs.readdirSync(p))
          fs.copySync(
            path.join(p, f),
            k == null
              ? path.join(tmpD, path.parse(p).name, f)
              : path.join(tmpD, k, f),
          );
    }

  if (!fs.existsSync(path.join(tmpD, "scripts/main.js")))
    console.log(
      `${chalk.yellow("Warn")}:${chalk.cyan("scripts/main.js do not exists")}`,
    );
  console.log(`${chalk.green.bold(`Fixing Problems`)}`);
  for (const f of globSync(
    path.join(scriptsD, "**/*.js"),
  )) {
    let str = fs.readFileSync(f, { encoding: "utf8" });
    str = str.replace(
      /_I_([a-zA-Z0-9_]+)/g,
      (_, word) => word,
    );
    str = str.replace(/extend__([a-zA-Z0-9_]+)/g, "extend");
    str = "let exports= {} \n" + str;
    if (!f.includes("main.js"))
      str = str + "\nmodule.exports = exports";
    fs.writeFileSync(f, str);
  }
  console.log(`${chalk.green.bold(`Packing`)}`);
  const zip = new AdmZip();
  zip.addLocalFolder(tmpD);
  zip.writeZip(path.join(distD, name + ".zip"));
  const endTime = new Date();
  const ms =
    endTime.getMilliseconds() - startTime.getMilliseconds();
  console.log(`${chalk.yellow.bold(`Finish`)} in ${chalk.bold(`${(ms / 1000).toFixed(2)}s`)}
${chalk.blue.bold("Output:")}${chalk.cyan(path.join(distD, name + ".zip"))}`);
  fs.rmSync(tmpD, { recursive: true });
}
