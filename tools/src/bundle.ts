import { LazyValue, format, getLazy } from "@tools/util";
import * as ts from "typescript";
import fs from "fs-extra";
import _path from "path";
export enum Locales {
  en,
  be,
  bg,
  ca,
  cs,
  da,
  de,
  es,
  et,
  eu,
  fi,
  fil,
  fr,
  hu,
  id_ID,
  it,
  ja,
  ko,
  lt,
  nl,
  nl_BE,
  pl,
  pt_BR,
  pt_PT,
  ro,
  ru,
  sr,
  sv,
  th,
  tk,
  tr,
  uk_UA,
  vi,
  zh_CN,
  zh_TW,
}
export type LocalesValues = keyof typeof Locales;
export type BundleType<V> = {
  [key in keyof V]: V[key] extends string
    ? LazyValue<string>
    : BundleType<V[key]>;
};
export type MetaBundleFrom<T> = {
  [key in keyof T]: T[key] extends LazyValue<string>
    ? string
    : T[key];
};
export type BundleFrom<T> = BundleType<MetaBundleFrom<T>>;
export type Bundles<T> = {
  [index in LocalesValues]?: BundleFrom<T>;
};
export type Properties = { [index: string]: string };
export class BundleBuilder<T> {
  meta: T;
  bundles: Map<LocalesValues, BundleFrom<T>>;
  constructor(meta: T, data?: Bundles<T>) {
    this.meta = meta;
    this.bundles = new Map();
    if (data) this.addAll(data);
  }
  addAll(data: Bundles<T>) {
    for (const key in data) {
      this.bundles.set(key as LocalesValues, data[key]);
    }
  }
  flatMeta(
    obj: any = this.meta,
    prefix: string = "",
  ): string[] {
    let result: string[] = [];
    for (const key in obj) {
      const value = obj[key];
      const newKey = prefix ? `${prefix}.${key}` : key;
      if (typeof value === "object" && value !== null) {
        result = result.concat(
          this.flatMeta(value, newKey),
        );
      } else {
        result.push(newKey);
      }
    }
    return result;
  }
  flatValues(obj: any, prefix: string = ""): Properties {
    let result = {};
    for (const key in obj) {
      const value = obj[key];
      const newKey = prefix ? `${prefix}.${key}` : key;
      if (typeof value === "object" && value !== null) {
        Object.assign(
          result,
          this.flatValues(value, newKey),
        );
      } else {
        if (typeof value === "function")
          result[newKey] = value();
        result[newKey] = value;
      }
    }
    return result;
  }
  add(key: LocalesValues, bundle: BundleFrom<T>) {
    this.bundles.set(key, bundle);
  }
  generateProperties(values: Properties) {
    let str = "";
    for (const key in values) {
      str += `${key} = ${getLazy(values[key])}\n`;
    }
    return str;
  }
  async writeFile(
    path: string,
    file: string,
    context: string,
  ) {
    if (!fs.existsSync(path))
      await fs.mkdir(path, { recursive: true });
    await fs.writeFile(_path.join(path, file), context);
  }
  async generateMeta(fname: string) {
    let arr: ts.TypeNode[] = this.flatMeta().map((v) =>
      ts.factory.createLiteralTypeNode(
        ts.factory.createStringLiteral(v),
      ),
    );
    const paramName = ts.factory.createIdentifier("key");
    const parameter = ts.factory.createParameterDeclaration(
      undefined,
      undefined,
      paramName,
      undefined,
      ts.factory.createUnionTypeNode(arr),
    );
    const statements = [
      ts.factory.createReturnStatement(
        ts.factory.createCallExpression(
          ts.factory.createPropertyAccessExpression(
            ts.factory.createPropertyAccessExpression(
              ts.factory.createIdentifier("Core"),
              "bundle",
            ),
            "get",
          ),
          undefined,
          [paramName],
        ),
      ),
    ];
    const func = ts.factory.createFunctionDeclaration(
      [
        ts.factory.createModifier(
          ts.SyntaxKind.ExportKeyword,
        ),
      ],
      undefined,
      fname,
      undefined,
      [parameter],
      ts.factory.createKeywordTypeNode(
        ts.SyntaxKind.StringKeyword,
      ),
      ts.factory.createBlock(statements, true),
    );

    const resultFile = ts.createSourceFile(
      "bundle_meta.ts",
      "",
      ts.ScriptTarget.Latest,
      /*setParentNodes*/ false,
      ts.ScriptKind.TS,
    );

    const printer = ts.createPrinter({
      newLine: ts.NewLineKind.LineFeed,
    });

    const result = printer.printNode(
      ts.EmitHint.Unspecified,
      func,
      resultFile,
    );
    return await format(result);
  }
  async writeMeta(
    path: string,
    fileName: string,
    fname: string,
  ) {
    await this.writeFile(
      path,
      fileName,
      await this.generateMeta(fname),
    );
  }
  async writeProperties(path: string) {
    this.writeFile(
      path,
      "bundle.properties",
      this.generateProperties(this.flatValues(this.meta)),
    );
    for (const bundle of this.bundles.keys()) {
      this.writeFile(
        path,
        `bundle_${bundle}.properties`,
        this.generateProperties(
          this.flatValues(this.bundles.get(bundle)),
        ),
      );
    }
  }
}
export function setup<T>(meta: T, data?: Bundles<T>) {
  return new BundleBuilder<T>(meta, data);
}
