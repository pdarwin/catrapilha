import { actionsD } from "../../Reducers/DataReducer";
import { getArqListItems } from "../../Services/ArqAPIs";
import { getPMPA1ListItems } from "../Projects/PMPA";

export const fetchListItems = async (dataState, dataDispatch) => {
  try {
    dataDispatch({ type: actionsD.setListLoading, payload: true });

    if (dataState.projectId === "ARQ") {
      await getArqListItems(dataState, dataDispatch);
    } else if (dataState.projectId === "PMPA1") {
      await getPMPA1ListItems(dataState, dataDispatch);
    } else {
      console.warn(`Project ID ${dataState.projectId} not recognized.`);
    }
  } catch (error) {
    console.error("Error fetching list items:", error);
  } finally {
    dataDispatch({ type: actionsD.setListLoading, payload: false });
  }
};
