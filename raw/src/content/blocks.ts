import { helper } from "@raw/content/index";
const M = helper.arr("block", [
  {
    type: "__",
    name: "testB",
    description: "test Block",
    file_name: () => "test.json",
    consumes: {},
  },
]);
export default M;
