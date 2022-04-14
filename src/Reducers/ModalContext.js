import { createContext, useContext } from "react";

const ModalContext = createContext();

export function useModalContext() {
  return useContext(ModalContext);
}

export default ModalContext;
