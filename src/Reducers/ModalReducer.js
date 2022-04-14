export const actionsM = {
  fireModal: "fireModal",
  closeModal: "closeModal",
};

export const initialStateM = {
  open: false,
  level: "error",
  msg: "",
  link: "",
};

export const ModalReducer = (state, action) => {
  switch (action.type) {
    case actionsM.fireModal:
      return {
        ...state,
        open: true,
        level: action.payload.level,
        msg: action.payload.msg,
        link: action.payload.link,
      };
    case actionsM.closeModal:
      return {
        ...state,
        open: false,
        level: initialStateM.level,
        msg: initialStateM.msg,
        link: initialStateM.link,
      };
    default:
      throw new Error();
  }
};
