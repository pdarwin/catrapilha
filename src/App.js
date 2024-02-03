import React, { useEffect, useReducer, useRef } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import CatraItem from "./Components/CatraList/CatraItem";
import CatraList from "./Components/CatraList/CatraList";
import MyModal from "./Components/MyModal";
import NavBar from "./Components/NavBar";
import configData from "./Config.json";
import DataContext from "./Reducers/DataContext";
import { DataReducer, actionsD, initialStateD } from "./Reducers/DataReducer";
import ModalContext from "./Reducers/ModalContext";
import { ModalReducer, actionsM, initialStateM } from "./Reducers/ModalReducer";

function App() {
  const [modalState, modalDispatch] = useReducer(ModalReducer, initialStateM);
  const [dataState, dataDispatch] = useReducer(DataReducer, initialStateD);
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
    getData();
  }, []);

  async function getTokenCSRF() {
    try {
      const res = await fetch(
        "/comapi/w/api.php?action=query&format=json&meta=tokens",
        {
          headers: {
            "Content-type": "application/json",
            Authorization: "Bearer " + configData["Access token"],
            "User-Agent": configData["User-Agent"],
          },
        }
      );

      // Validar se o pedido foi feito com sucesso. Pedidos são feitos com sucesso normalmente quando o status é entre 200 e 299
      if (res.status !== 200) {
        modalDispatch({
          type: actionsM.fireModal,
          payload: {
            msg: res.status + ": " + res.statusText + "(getTokenCSRF)",
            level: "error",
          },
        });
      } else {
        const data = await res.json();

        return data.query.tokens.csrftoken;
      }
    } catch (error) {
      alert(error);
    }
  }

  const getData = async () => {
    try {
      await getTokenCSRF();

      const res = await fetch(
        "/comapi/w/api.php?action=parse&page=User:DarwIn/Catrapilha.data&format=json&prop=wikitext",
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      // Validar se o pedido foi feito com sucesso. Pedidos são feitos com sucesso normalmente quando o status é entre 200 e 299
      if (res.status !== 200) {
        modalDispatch({
          type: actionsM.fireModal,
          payload: {
            msg:
              res.status + ": " + res.statusText + " " + res.url + " (getData)",
            level: "error",
          },
        });
        return Promise.reject(res);
      }

      const data = await res.json();

      dataDispatch({
        type: actionsD.updateIData,
        payload: JSON.parse(data.parse.wikitext["*"]),
      });
      return JSON.parse(data.parse.wikitext["*"]);
    } catch (err) {
      alert(err);
    }
  };

  return (
    <div className="App">
      <ModalContext.Provider value={providerStateModal}>
        <DataContext.Provider value={providerStateData}>
          <MyModal />
          <BrowserRouter>
            <NavBar
              getData={getData}
              getTokenCSRF={getTokenCSRF}
              stopRef={stopRef}
            />
            <Routes>
              <Route
                path="/"
                element={<CatraList getData={getData} stopRef={stopRef} />}
              ></Route>
              <Route
                path="/List"
                element={<CatraList stopRef={stopRef} />}
              ></Route>
              <Route
                path="/item"
                element={<CatraItem getTokenCSRF={getTokenCSRF} />}
              ></Route>
            </Routes>
          </BrowserRouter>
        </DataContext.Provider>
      </ModalContext.Provider>
    </div>
  );
}

export default App;
