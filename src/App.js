import Arquipelagos from "./Components/Arquipelagos/Arquipelagos";
import { useEffect, useReducer, useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import ItemArq from "./Components/Arquipelagos/ItemArq";
import MyModal from "./Components/MyModal";
import NavBar from "./Components/NavBar";
import configData from "./Config.json";
import { ModalReducer, initialStateM, actionsM } from "./Reducers/ModalReducer";
import { actionsD, DataReducer, initialStateD } from "./Reducers/DataReducer";
import DataContext from "./Reducers/DataContext";
import ModalContext from "./Reducers/ModalContext";

function App() {
  const [modalState, modalDispatch] = useReducer(ModalReducer, initialStateM);
  const [dataState, dataDispatch] = useReducer(DataReducer, initialStateD);

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

  useEffect(() => {
    console.log("passou", dataState.tokenCSRF);
    console.log(dataState.data);
    if (dataState.tokenCSRF.action === "sendData") {
      sendData();
    }
  }, [dataState.tokenCSRF]);

  useEffect(() => {
    console.log("Dados alterados", dataState.data);
  }, [dataState.data]);

  function getData() {
    fetch(
      "/comapi/w/api.php?action=parse&page=User:DarwIn/Catrapilha.data&format=json&prop=wikitext",
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    )
      .then(response => {
        // Validar se o pedido foi feito com sucesso. Pedidos são feitos com sucesso normalmente quando o status é entre 200 e 299
        if (response.status !== 200) {
          modalDispatch({
            type: actionsM.fireModal,
            payload: {
              msg:
                response.status +
                ": " +
                response.statusText +
                " " +
                response.url +
                " (getData)",
              level: "error",
            },
          });
          return Promise.reject(response);
        }
        console.log(response);
        return response.json();
      })
      .then(parsedResponse => {
        console.log(parsedResponse);
        dataDispatch({
          type: actionsD.updateIData,
          payload: JSON.parse(parsedResponse.parse.wikitext["*"]),
        });
      })
      .catch(error => {
        //não faz nada
      });
  }

  function sendData() {
    console.log("send", encodeURIComponent(dataState.tokenCSRF.token));

    const uploadParams = new FormData();
    uploadParams.append("title", "User:DarwIn/Catrapilha.data");
    uploadParams.append("text", JSON.stringify(dataState.data));
    uploadParams.append("summary", "Data updated (Catrapilha 1.0)");
    uploadParams.append("token", dataState.tokenCSRF.token);

    fetch("/comapi/w/api.php?action=edit&format=json", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + configData["Access token"],
        "User-Agent": configData["User-Agent"],
      },
      body: uploadParams,
    })
      .then(response => {
        // Validar se o pedido foi feito com sucesso. Pedidos são feitos com sucesso normalmente quando o status é entre 200 e 299
        if (response.status !== 200) {
          modalDispatch({
            type: actionsM.fireModal,
            payload: {
              msg: response.status + ": " + response.statusText + "(sendData)",
              level: "error",
            },
          });
        }
        //console.log(response);
        return response.json();
      })
      .then(parsedResponse => {
        console.log(parsedResponse);
        if (parsedResponse.error) {
          modalDispatch({
            type: actionsM.fireModal,
            payload: {
              msg: parsedResponse.error.code + ": " + parsedResponse.error.info,
              level: "error",
            },
          });
        }
        if (parsedResponse.edit.result === "Success") {
          modalDispatch({
            type: actionsM.fireModal,
            payload: {
              msg: "Dados remotos atualizados com sucesso",
              level: "success",
              link: "https://commons.wikimedia.org/wiki/User:DarwIn/Catrapilha.data",
            },
          });
          getData();
        }
      })
      .catch(error => {
        alert(error);
      });
  }

  async function getTokenCSRF(action) {
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
        //console.log(response);
        const data = await res.json();

        console.log(data);
        dataDispatch({
          type: actionsD.updateToken,
          payload: {
            token: data.query.tokens.csrftoken,
            action: action,
          },
        });
      }
    } catch (error) {
      alert(error);
    }
  }

  return (
    <div className="App">
      <ModalContext.Provider value={providerStateModal}>
        <DataContext.Provider value={providerStateData}>
          <MyModal />
          <BrowserRouter>
            <NavBar getData={getData} getTokenCSRF={getTokenCSRF} />
            <Routes>
              <Route path="/" element={<Arquipelagos />}></Route>
              <Route
                path="/item"
                element={<ItemArq getTokenCSRF={getTokenCSRF} />}
              ></Route>
            </Routes>
          </BrowserRouter>
        </DataContext.Provider>
      </ModalContext.Provider>
    </div>
  );
}

export default App;
