export const actionsD = {
  updateIData: "updateInitialData",
  updateData: "updateData",
  setCurrentId: "setCurrentId",
  updateItem: "updateItem",
  moveForward: "moveForward",
  moveBack: "moveBack",
};

export const initialStateD = {
  data: null,
  initialCount: 0,
  rev: 0,
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
    license: "PD-old-100-expired",
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
    case actionsD.setCurrentId:
      return {
        ...state,
        currentId: action.payload,
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
          license: "PD-old-100-expired",
          infoPanel: "",
          file: null,
        },
      };
    case actionsD.updateItem:
      return {
        ...state,
        item: action.payload,
      };
    case actionsD.moveForward:
      return {
        ...state,
        currentId: state.currentId - 1,
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
          license: "PD-old-100-expired",
          infoPanel: "",
          file: null,
        },
        forward: true,
      };
    case actionsD.moveBack:
      return {
        ...state,
        currentId: state.currentId + 1,
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
          license: "PD-old-100-expired",
          infoPanel: "",
          file: null,
        },
        forward: false,
      };
    default:
      throw new Error();
  }
};
