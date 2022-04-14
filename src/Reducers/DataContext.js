import { createContext, useContext } from "react";

const DataContext = createContext();

export function useDataContext() {
  return useContext(DataContext);
}

export default DataContext;
