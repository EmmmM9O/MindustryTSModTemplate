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
  assetsDir: string;
  tmpDir: string;
  buildDir: string;
  name: string;
  buildCommand: string;
  source?: string;
  others?: string[];
}
