import { buildArqItemDetail } from "../Components/Projects/ARQ/Arq";

export const buildProjectItemDetail = async (projectId, item, dataState) => {
  if (projectId === "ARQ") {
    return buildArqItemDetail(item, dataState);
  }

  return item;
};
