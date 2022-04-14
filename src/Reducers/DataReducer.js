export const actionsD = {
  updateIData: "updateInitialData",
  updateData: "updateData",
  updateToken: "updateToken",
};

export const initialStateD = {
  data: null,
  initialCount: 0,
  rev: 0,
  tokenCSRF: { token: "", action: "" },
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
    default:
      throw new Error();
  }
};
