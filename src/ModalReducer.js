export const initialState = {
  open: false,
  level: "error",
  msg: "",
  link: "",
};

export const actions = {
  fireModal: "fireModal",
  closeModal: "closeModal",
};

export const ModalReducer = (state, action) => {
  switch (action.type) {
    case actions.fireModal:
      return {
        ...state,
        open: true,
        level: action.payload.level,
        msg: action.payload.msg,
        link: action.payload.link,
      };
    case actions.closeModal:
      return {
        ...state,
        open: false,
        level: initialState.level,
        msg: initialState.msg,
        link: initialState.link,
      };
    default:
      throw new Error();
  }
};
