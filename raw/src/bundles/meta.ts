import { BundleFrom, Bundles } from "@tools/bundle";
const M = {
  ts_template: {
    test_lazy: () => "test lazy",
    test: "test",
  },
};
export default M;
export type Meta = BundleFrom<typeof M>;
export type Metas = Bundles<typeof M>;
