import { useContext, useEffect, useReducer, useRef } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Dashboard from "./Components/ImageList/Dashboard";
import ItemDetail from "./Components/ImageList/ItemDetail";
import MyModal from "./Components/MyModal";
import NavBar from "./Components/NavBar";
import { ConfigContext } from "./ConfigContext";
import DataContext from "./Reducers/DataContext";
import { actionsD, DataReducer, initialStateD } from "./Reducers/DataReducer";
import ModalContext from "./Reducers/ModalContext";
import { initialStateM, ModalReducer } from "./Reducers/ModalReducer";

function App() {
  const { config } = useContext(ConfigContext);

  const [modalState, modalDispatch] = useReducer(ModalReducer, initialStateM);
  const [dataState, dataDispatch] = useReducer(
    DataReducer,
    initialStateD,
    initial => ({
      ...initial,
      projectId: config.start_project || "",
      maxItems: config.n_list_items || 10,
    })
  );
  let stopRef = useRef(false);

  const providerStateModal = {
    modalState,
    modalDispatch,
  };
  const providerStateData = {
    dataState,
    dataDispatch,
  };

  useEffect(() => {
    // If config changes, update the state accordingly
    dataDispatch({
      type: actionsD.changeProject,
      payload: config.start_project,
    });
    // You might want to dispatch other actions based on config
  }, [config]);

  return (
    <div className="App">
      <ModalContext.Provider value={providerStateModal}>
        <DataContext.Provider value={providerStateData}>
          <MyModal />
          <BrowserRouter>
            <NavBar stopRef={stopRef} />
            <Routes>
              <Route path="/" element={<Dashboard stopRef={stopRef} />}></Route>
              <Route
                path="/List"
                element={<Dashboard stopRef={stopRef} />}
              ></Route>
              <Route path="/item/:id" element={<ItemDetail />}></Route>
            </Routes>
          </BrowserRouter>
        </DataContext.Provider>
      </ModalContext.Provider>

      {/* Conditional Rendering for Loading State */}
      {!config && <div>Loading application...</div>}
    </div>
  );
}

export default App;
