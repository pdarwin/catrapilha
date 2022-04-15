export const actionsD = {
  updateIData: "updateInitialData",
  updateData: "updateData",
  updateToken: "updateToken",
  setCurrentId: "setCurrentId",
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
      };
    case actionsD.moveForward:
      return {
        ...state,
        currentId: state.currentId - 1,
        forward: true,
      };
    case actionsD.moveBack:
      return {
        ...state,
        currentId: state.currentId + 1,
        forward: false,
      };
    default:
      throw new Error();
  }
};
