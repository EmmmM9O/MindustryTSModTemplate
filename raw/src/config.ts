export interface ModConfig {
  name: string;
  internalName?: string;
  minGameVersion?: string;
  displayName?: string;
  author?: string;
  description?: string;
  version?: string;
  main?: string;
  repo?: string;
  hidden?: boolean /*true*/;
  java?: boolean /*false*/;
  texturescale?: number /*1*/;
  pregenerated?: boolean;
  contentOrder?: Array<string>;
  dependencies?: Array<string>;
  softDependencies?: Array<string>;
}
export interface DistConfig {
  distDir: string;
  tmpDir: string;
  name: string;
  buildDir: string[];
  assetsDir: Array<string | [string, string]>;
  buildCommand: string;
  source?: Array<string | [string, string]>;
  others?: Array<string | [string, string]>;
}
export interface BundleConfig {
  bundleDir: string;
  metaDir: string;
  metaFileName: string;
  funcName: string;
}
export interface ContentConfig {
  contentDir: string;
  metaDir: string;
  metaFileName: string;
  funcName: string;
}
