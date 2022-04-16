export const actionsD = {
  updateIData: "updateInitialData",
  updateData: "updateData",
  updateToken: "updateToken",
  setCurrentId: "setCurrentId",
  updateItem: "updateItem",
  moveForward: "moveForward",
  moveBack: "moveBack",
};

export const initialStateD = {
  data: null,
  initialCount: 0,
  rev: 0,
  tokenCSRF: { token: "", action: "" },
  currentId: 0,
  forward: true,
  item: {
    id: 0,
    title: "",
    filename: "",
    link: "",
    linkhtml: "",
    imagelink: "",
    content: "",
    description: "",
    author: "",
    date: "",
    license: "old",
    infoPanel: "",
    file: null,
  },
};

export const DataReducer = (state, action) => {
  switch (action.type) {
    case actionsD.updateIData:
      return {
        ...state,
        data: action.payload,
        initialCount: action.payload[0].Arquipelagos.length,
      };
    case actionsD.updateData:
      return {
        ...state,
        data: action.payload,
      };
    case actionsD.updateToken:
      return {
        ...state,
        tokenCSRF: action.payload,
      };
    case actionsD.setCurrentId:
      return {
        ...state,
        currentId: action.payload,
        item: initialStateD.item,
        tokenCSRF: initialStateD.tokenCSRF,
      };
    case actionsD.updateItem:
      return {
        ...state,
        item: action.payload,
      };
    case actionsD.moveForward:
      console.log();
      return {
        ...state,
        currentId: state.currentId - 1,
        item: initialStateD.item,
        tokenCSRF: initialStateD.tokenCSRF,
        forward: true,
      };
    case actionsD.moveBack:
      return {
        ...state,
        currentId: state.currentId + 1,
        item: initialStateD.item,
        tokenCSRF: initialStateD.tokenCSRF,
        forward: false,
      };
    default:
      throw new Error();
  }
};
