export const actionsD = {
  changeProject: "changeProject",
  moveBack: "moveBack",
  moveForward: "moveForward",
  updateIData: "updateInitialData",
  updateData: "updateData",
  updateItems: "updateItems",
  setCurrentId: "setCurrentId",
  setFirstId: "setFirstId",
  setLastId: "setLastId",
  updateItem: "updateItem",
  updateCategories: "updateCategories",
  updateIterations: "updateIterations",
  updateDate: "updateDate",
  updateLicense: "updateLicense",
  updateAuthor: "updateAuthor",
  setFilter: "setFilter",
  setRoot: "setRoot",
  setTotalPages: "setTotalPages",
  setListLoading: "setListLoading",
  resetState: "resetState",
  finishProjectReset: "finishProjectReset",
};

export const initialStateD = {
  projectId: "",
  data: [],
  initialCount: 0,
  initialCountC: 0,
  rev: 0,
  firstId: 0,
  currentId: 0,
  forward: true,
  categories: "",
  license: "PD-old-100-expired",
  date: "",
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
    infoPanel: "",
    file: null,
  },
  filter: "",
  root: 1,
  author: "",
  totalPages: 0,
  maxItems: 10,
  listLoading: false,
  items: [], // Initialize items as an empty array
  projectReseted: true,
};

export const DataReducer = (state, action) => {
  switch (action.type) {
    //Project
    case actionsD.changeProject:
      return {
        ...state,
        projectId: action.payload,
        data: [],
        items: [],
        projectReseted: true,
      };
    case actionsD.finishProjectReset:
      return {
        ...state,
        projectReseted: false,
      };

    // Data
    case actionsD.updateIData:
      return {
        ...state,
        data: action.payload,
        initialCount: action.payload.length,
        initialCountC: action.payload.filter(element => element.status === "Y")
          .length,
      };
    case actionsD.updateData:
      return {
        ...state,
        data: action.payload,
      };
    case actionsD.updateItems:
      return {
        ...state,
        items: action.payload, // Update the items array in the global state
      };
    case actionsD.moveBack:
      return {
        ...state,
        currentId:
          state.items[
            state.items.findIndex(elem => elem.id === state.currentId) - 1
          ].id,
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
          infoPanel: "",
          file: null,
        },
        forward: false,
      };
    case actionsD.moveForward:
      return {
        ...state,
        currentId:
          state.items[
            state.items.findIndex(elem => elem.id === state.currentId) + 1
          ].id,
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
          infoPanel: "",
          file: null,
        },
        forward: true,
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
          infoPanel: "",
          file: null,
        },
      };
    case actionsD.setFirstId:
      return {
        ...state,
        firstId: action.payload,
      };
    case actionsD.setLastId:
      return {
        ...state,
        lastId: action.payload,
      };
    case actionsD.updateItem:
      return {
        ...state,
        item: action.payload,
      };
    case actionsD.updateLicense:
      return {
        ...state,
        license: action.payload,
      };
    case actionsD.updateCategories:
      return {
        ...state,
        categories: action.payload,
      };
    case actionsD.updateDate:
      return {
        ...state,
        date: action.payload,
      };
    case actionsD.updateAuthor:
      return {
        ...state,
        author: action.payload,
      };
    case actionsD.setFilter:
      return {
        ...state,
        filter: action.payload,
      };
    case actionsD.setRoot:
      return {
        ...state,
        root: action.payload,
      };
    case actionsD.setTotalPages:
      return {
        ...state,
        totalPages: action.payload,
      };
    case actionsD.updateIterations:
      return {
        ...state,
        iterations: action.payload,
      };
    case actionsD.setListLoading:
      return {
        ...state,
        listLoading: action.payload,
      };
    default:
      throw new Error();
  }
};
