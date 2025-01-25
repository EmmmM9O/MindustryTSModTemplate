import * as prettier from "prettier";
export type LazyValue<T> = T | (() => T);
export type LazyF<P, T> = T | ((arg: P) => T);
export type valueOf<T> = T[keyof T];
export type cast<O, T> = O extends T ? T : never;
export async function format(content: string) {
  return await prettier.format(content, {
    parser: "typescript",
  });
}
export function getLazy<T>(l: LazyValue<T>): T {
  if (typeof l === "function") return (l as any)();
  return l;
}
