import { actionsD } from "../Reducers/DataReducer";
import { actionsM } from "../Reducers/ModalReducer";
import { getDataAPI, sendDataAPI } from "../Services/GeneralApis";

/**
 * Fetches project data based on the provided project ID.
 *
 * @param {number|string} projectId - The ID of the project to fetch data for.
 * @param {function} dataDispatch - The dispatch function from DataReducer.
 * @param {function} modalDispatch - The dispatch function from ModalReducer.
 */
export const getData = async (projectId, dataDispatch, modalDispatch) => {
  if (!projectId) {
    modalDispatch({
      type: actionsM.fireModal,
      payload: {
        msg: "Project ID is missing.",
        level: "error",
      },
    });
    return;
  }

  try {
    const res = await getDataAPI(projectId);
    const parsedData = JSON.parse(res.data.parse.wikitext["*"])["data"];
    dataDispatch({
      type: actionsD.updateIData,
      payload: parsedData || [],
    });
    dataDispatch({
      type: actionsD.finishProjectReset,
    });
  } catch (error) {
    console.error("getData() Error:", error);
    modalDispatch({
      type: actionsM.fireModal,
      payload: {
        msg: error.message,
        level: "error",
      },
    });
  }
};

export const sendData = async (dataState, modalDispatch) => {
  try {
    const res = await sendDataAPI(dataState);
    const data = res.data;

    if (data.error) {
      modalDispatch({
        type: actionsM.fireModal,
        payload: {
          msg: `${data.error.code}: ${data.error.info}`,
          level: "error",
        },
      });
      throw new Error(`${data.error.code}: ${data.error.info}`);
    }

    if (data.edit.result === "Success") {
      modalDispatch({
        type: actionsM.fireModal,
        payload: {
          msg: "Dados remotos atualizados com sucesso",
          level: "success",
          link: `https://commons.wikimedia.org/wiki/${data.edit.title}`,
        },
      });
      return true;
    } else {
      throw new Error("Edit was not successful");
    }
  } catch (error) {
    console.error("getData() Error:", error);
    modalDispatch({
      type: actionsM.fireModal,
      payload: {
        msg: error.message,
        level: "error",
      },
    });
  }
};
