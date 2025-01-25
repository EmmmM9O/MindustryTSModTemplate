import { getLazy, LazyValue, format } from "@tools/util";
import * as ts from "typescript";
import fs from "fs-extra";
import _path from "path";
export enum ContentType {
  block,
  typeid_UNUSED,
  loadout_UNUSED,
  sector,
  effect_UNUSED,
  weather,
  unit,
  mech_UNUSED,
  status,
  item,
  team,
  ammo_UNUSED,
  planet,
  error,
  liquid,
  bullet,
}
export type ContentTypeValues = keyof typeof ContentType;
export type ContentTypeArr = ContentTypeValues[];
export const MappableContentArr: ContentTypeArr = [
  "block",
  "item",
  "unit",
  "weather",
  "liquid",
  "sector",
  "team",
  "status",
  "planet",
];
export type MappableContentArrT =
  | "block"
  | "item"
  | "unit"
  | "weather"
  | "liquid"
  | "sector"
  | "team"
  | "status"
  | "planet";
export const MappableContentRef: {
  [index in MappableContentArrT]: string;
} = {
  block: "Block",
  planet: "Planet",
  item: "Item",
  unit: "UnitType",
  liquid: "Liquid",
  team: "TeamEntry",
  status: "StatusEffect",
  weather: "Weather",
  sector: "SectorPreset",
};
export interface ContentPlugin {
  types: {
    [index in ContentTypeValues]?: unknown;
  };
  types_common: {
    [index in ContentTypeValues]?: unknown;
  };
}
export type Content<
  M extends ContentMap,
  C extends ContentTypeValues,
  Type extends keyof M[C],
> = {
  type: Type;
  file_name?: LazyValue<string>;
} & M[C][Type];
export type ContentValue<
  M extends ContentMap,
  C extends ContentTypeValues,
  Type extends keyof M[C],
> = {
  content_type: C;
} & Content<M, C, Type>;

export type ContentMap = {
  [key in ContentTypeValues]: unknown;
};
export type ContentArr<
  M extends ContentMap,
  C extends ContentTypeValues,
  Type extends (keyof M[C])[],
> = {
  [index in keyof Type]: Content<M, C, Type[index]>;
};
export class ContentBuilder<M extends ContentMap> {
  values: ContentValue<M, any, any>[] = [];
  add<C extends ContentTypeValues, T extends keyof M[C]>(
    value: ContentValue<M, C, T>,
  ) {
    this.values.push(value);
    return this;
  }
  put<C extends ContentTypeValues, T extends keyof M[C]>(
    content_type: C,
    value: Content<M, C, T>,
  ) {
    this.add({ content_type, ...value });
    return this;
  }
  putAll<
    C extends ContentTypeValues,
    T extends (keyof M[C])[],
  >(content_type: C, value: ContentArr<M, C, T>) {
    for (const v of value) {
      this.put(content_type, v);
    }
    return this;
  }
  get(): ContentTypes {
    return this.values;
  }
  resolveObj(obj: object): object {
    let result = {};
    for (const key in obj) {
      const value = obj[key];
      if (
        typeof value === "function" &&
        value.constructor.name === "Function"
      ) {
        if (value.length === 0) {
          result[key] = value();
        }
      } else if (typeof value === "object") {
        result[key] = this.resolveObj(value);
      } else {
        if (["content_type", "file_name"].includes(key))
          continue;
        if (value == "__") continue;
        result[key] = value;
      }
    }
    return result;
  }
  generate<
    C extends ContentTypeValues,
    T extends keyof M[C],
  >(
    id: string,
    value: ContentValue<M, C, T>,
  ): [string, string, string] {
    return [
      value.content_type,
      value.file_name == undefined
        ? `gen_${id}.json`
        : getLazy(value.file_name),
      JSON.stringify(this.resolveObj(value)),
    ];
  }
  files() {
    const map: { [index: string]: string[] } = {};
    for (const key of Object.values(ContentType)) {
      if (typeof key !== "number") map[key] = [];
    }
    for (const id in this.values) {
      const r = this.generate(id, this.values[id]);
      map[r[0]].push(r[1]);
    }
    return map;
  }
  names() {
    const map: { [index: string]: string[] } = {};
    for (const key of MappableContentArr) {
      map[key] = [];
    }
    for (const value of this.values) {
      if (!MappableContentArr.includes(value.content_type))
        continue;
      if (value["name"] == undefined) continue;
      map[value.content_type].push(getLazy(value.name));
    }
    return map;
  }
  generateAll() {
    const map: {
      [index: string]: { [k: string]: string };
    } = {};
    for (const key of Object.values(ContentType)) {
      if (typeof key !== "number") map[key] = {};
    }
    for (const id in this.values) {
      const [r1, r2, r3] = this.generate(
        id,
        this.values[id],
      );
      map[r1][r2] = r3;
    }
    return map;
  }
  getUnion(arr: string[]) {
    return ts.factory.createUnionTypeNode(
      arr.map((v) =>
        ts.factory.createLiteralTypeNode(
          ts.factory.createStringLiteral(v),
        ),
      ),
    );
  }
  async generateMeta(metaF: string) {
    const funcI = ts.factory.createIdentifier(metaF);
    const typeParamName =
      ts.factory.createIdentifier("type");
    const typeParameter =
      ts.factory.createParameterDeclaration(
        undefined,
        undefined,
        typeParamName,
        undefined,
        this.getUnion(MappableContentArr),
      );
    const names = this.names();
    const nameParamName =
      ts.factory.createIdentifier("name");
    const nameParameter =
      ts.factory.createParameterDeclaration(
        undefined,
        undefined,
        nameParamName,
        undefined,
        this.getUnion(Object.values(names).flat()),
      );

    const statements = [
      ts.factory.createReturnStatement(
        ts.factory.createAsExpression(
          ts.factory.createCallExpression(
            ts.factory.createPropertyAccessExpression(
              ts.factory.createPropertyAccessExpression(
                ts.factory.createIdentifier("Vars"),
                "content",
              ),
              "getByName",
            ),
            undefined,
            [
              ts.factory.createElementAccessExpression(
                ts.factory.createIdentifier("ContentType"),
                typeParamName,
              ),
              nameParamName,
            ],
          ),
          ts.factory.createKeywordTypeNode(
            ts.SyntaxKind.AnyKeyword,
          ),
        ),
      ),
    ];

    const resultFile = ts.createSourceFile(
      "content_meta.ts",
      "",
      ts.ScriptTarget.Latest,
      /*setParentNodes*/ false,
      ts.ScriptKind.TS,
    );

    const printer = ts.createPrinter({
      newLine: ts.NewLineKind.LineFeed,
    });
    let result = "";
    for (const c in names) {
      if (names[c].length == 0) continue;
      const func = ts.factory.createFunctionDeclaration(
        [
          ts.factory.createModifier(
            ts.SyntaxKind.ExportKeyword,
          ),
        ],
        undefined,
        funcI,
        undefined,
        [
          ts.factory.createParameterDeclaration(
            undefined,
            undefined,
            typeParamName,
            undefined,
            ts.factory.createLiteralTypeNode(
              ts.factory.createStringLiteral(c),
            ),
          ),
          ts.factory.createParameterDeclaration(
            undefined,
            undefined,
            nameParamName,
            undefined,
            this.getUnion(names[c]),
          ),
        ],
        ts.factory.createTypeReferenceNode(
          MappableContentRef[c],
          [],
        ),
        undefined,
      );
      result =
        result +
        printer.printNode(
          ts.EmitHint.Unspecified,
          func,
          resultFile,
        ) +
        "\n";
    }
    const func = ts.factory.createFunctionDeclaration(
      [
        ts.factory.createModifier(
          ts.SyntaxKind.ExportKeyword,
        ),
      ],
      undefined,
      funcI,
      undefined,
      [typeParameter, nameParameter],
      ts.factory.createUnionTypeNode(
        MappableContentArr.map((b) =>
          ts.factory.createTypeReferenceNode(
            MappableContentRef[b],
            [],
          ),
        ),
      ),
      ts.factory.createBlock(statements, true),
    );

    result =
      result +
      printer.printNode(
        ts.EmitHint.Unspecified,
        func,
        resultFile,
      ) +
      "\n";
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
  async writeTo(dir: string) {
    const r = this.generateAll();
    for (const t in r) {
      const v = r[t];
      for (const f in v) {
        await this.writeFile(_path.join(dir, t), f, v[f]);
      }
    }
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
}
export class Helper<M extends ContentMap> {
  as<C extends ContentTypeValues, T extends keyof M[C]>(
    content_type: C,
    value: Content<M, C, T>,
  ) {
    return value;
  }
  arr<
    C extends ContentTypeValues,
    T extends (keyof M[C])[],
  >(content_type: C, value: ContentArr<M, C, T>) {
    return value;
  }
}
export type MapFrom<T extends ContentPlugin> = {
  [c in ContentTypeValues]: {
    [index in keyof T["types"][c]]: T["types"][c][index] &
      T["types_common"][c];
  };
};
export type PluginBuilder<T extends ContentPlugin> = T;
export type ContentTypes = ContentValue<any, any, any>[];
export function setup<T extends ContentPlugin>() {
  return new ContentBuilder<MapFrom<T>>();
}
export type BundleType = {
  name?: LazyValue<string>;
  description?: LazyValue<string>;
};
export type Consumes = [
  "ConsumePowerDynamic",
  "ConsumePowerCondition",
  "ConsumePower",
  "ConsumePayloads",
  "ConsumePayloadFilter",
  "ConsumePayloadDynamic",
  "ConsumeLiquidsDynamic",
  "ConsumeLiquids",
  "ConsumeLiquidFlammable",
  "ConsumeLiquidBase",
  "ConsumeLiquidFilter",
  "ConsumeLiquid",
  "ConsumeItems",
  "ConsumeItemRadioactive",
  "ConsumeItemFlammable",
  "ConsumeItemFilter",
  "ConsumeItemExplosive",
  "ConsumeItemExplode",
  "ConsumeItemDynamic",
  "ConsumeItemCharged",
  "ConsumeCoolant",
];
export type MindustryContent = PluginBuilder<{
  types_common: {
    block: {
      consumes?: {
        remove?: LazyValue<Consumes[keyof Consumes]>;
        item?:LazyValue<string>
      };
    } & BundleType;
  };
  types: {
    block: {
      __: object;
    };
  };
}>;
//TODD I am lazy to finish this
