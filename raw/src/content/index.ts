import {
  MindustryContent,
  setup,
  Helper,
  MapFrom,
} from "@tools/content";
export type CUCon = MindustryContent;
export const helper = new Helper<MapFrom<CUCon>>();
import blocks from "@raw/content/blocks";
const M = setup<CUCon>().putAll("block", [...blocks]);
export default M;
