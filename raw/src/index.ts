require("module-alias/register");
import bundle from "@raw/bundles";
import bundleConfig from "@config/bundle.config";
import chalk from "chalk";
import content from "@raw/content";
import contentConfig from "@config/content.config";
import config from "@config/mod.config";
import dist from "@config/dist.config";
import { distMod } from "@tools/dist";
(async () => {
  console.log(
    `${chalk.yellow.bold(`Generate Bundles`)} : ${chalk.cyan(JSON.stringify([...bundle.bundles.keys()]))}`,
  );
  await bundle.writeMeta(
    bundleConfig.metaDir,
    bundleConfig.metaFileName,
    bundleConfig.funcName,
  );
  await bundle.writeProperties(bundleConfig.bundleDir);

  console.log(
    `${chalk.yellow.bold(`Generate Content`)} : ${chalk.cyan(JSON.stringify(content.files()))}`,
  );
  await content.writeMeta(
    contentConfig.metaDir,
    contentConfig.metaFileName,
    contentConfig.funcName,
  );
  await content.writeTo(contentConfig.contentDir);

  console.log(
    `${chalk.yellow.bold(`Start Package Mod`)} : ${chalk.cyan.bold(config.name)}`,
  );
  distMod(
    config,
    dist.tmpDir,
    dist.distDir,
    dist.buildDir,
    dist.buildCommand,
    dist.assetsDir,
    dist.source,
    dist.others,
    dist.name,
  );
})();
