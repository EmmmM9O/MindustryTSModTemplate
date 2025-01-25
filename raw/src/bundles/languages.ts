import { Metas } from "@raw/bundles/meta";
const M: Metas = {
  zh_CN: {
    ts_template: {
      test: "测试",
      test_lazy: () => "测试懒加载",
    },
  },
};
export default M;
