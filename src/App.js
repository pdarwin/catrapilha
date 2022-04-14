import Arquipelagos from "./Arquipelagos/Arquipelagos";
import { useEffect, useReducer, useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import ItemArq from "./Arquipelagos/ItemArq";
import MyModal from "./MyModal";
import NavBar from "./NavBar";
import configData from "./Config.json";
import { actions, initialState, ModalReducer } from "./ModalReducer";
import CustomContext from "./CustomContext";

function App() {
  const [data, setData] = useState(null);
  const [tokenCSRF, setTokenCSRF] = useState({ token: "", action: "" });

  useEffect(() => {
    getData();
  }, []);

  useEffect(() => {
    console.log("passou", tokenCSRF);
    console.log(data);
    if (tokenCSRF.action === "sendData") {
      sendData();
    }
  }, [tokenCSRF]);

  useEffect(() => {
    console.log("Dados alterados", data);
  }, [data]);

  const [modalState, modalDispatch] = useReducer(ModalReducer, initialState);

  const providerState = {
    modalState,
    modalDispatch,
  };

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
      .then((response) => {
        // Validar se o pedido foi feito com sucesso. Pedidos são feitos com sucesso normalmente quando o status é entre 200 e 299
        if (response.status !== 200) {
          modalDispatch({
            type: actions.fireModal,
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
      .then((parsedResponse) => {
        setData(JSON.parse(parsedResponse.parse.wikitext["*"]));
      })
      .catch((error) => {
        //não faz nada
      });
  }

  function sendData() {
    console.log("send", encodeURIComponent(tokenCSRF.token));

    const uploadParams = new FormData();
    uploadParams.append("title", "User:DarwIn/Catrapilha.data");
    uploadParams.append("text", JSON.stringify(data));
    uploadParams.append("summary", "Updating data (Catrapilha 1.0)");
    uploadParams.append("token", tokenCSRF.token);

    fetch("/comapi/w/api.php?action=edit&format=json", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + configData["Access token"],
        "User-Agent": configData["User-Agent"],
      },
      body: uploadParams,
    })
      .then((response) => {
        // Validar se o pedido foi feito com sucesso. Pedidos são feitos com sucesso normalmente quando o status é entre 200 e 299
        if (response.status !== 200) {
          modalDispatch({
            type: actions.fireModal,
            payload: {
              msg: response.status + ": " + response.statusText + "(sendData)",
              level: "error",
            },
          });
        }
        //console.log(response);
        return response.json();
      })
      .then((parsedResponse) => {
        console.log(parsedResponse);
        if (parsedResponse.error) {
          modalDispatch({
            type: actions.fireModal,
            payload: {
              msg: parsedResponse.error.code + ": " + parsedResponse.error.info,
              level: "error",
            },
          });
        }
        if (parsedResponse.edit.result === "Success") {
          modalDispatch({
            type: actions.fireModal,
            payload: {
              msg: "Dados remotos atualizados com sucesso",
              level: "success",
              link: "https://commons.wikimedia.org/wiki/User:DarwIn/Catrapilha.data",
            },
          });
        }
      })
      .catch((error) => {
        alert(error);
      });
  }

  function getTokenCSRF(action) {
    fetch("/comapi/w/api.php?action=query&format=json&meta=tokens", {
      headers: {
        "Content-type": "application/json",
        Authorization: "Bearer " + configData["Access token"],
        "User-Agent": configData["User-Agent"],
      },
    })
      .then((response) => {
        // Validar se o pedido foi feito com sucesso. Pedidos são feitos com sucesso normalmente quando o status é entre 200 e 299
        if (response.status !== 200) {
          modalDispatch({
            type: actions.fireModal,
            payload: {
              msg:
                response.status + ": " + response.statusText + "(getTokenCSRF)",
              level: "error",
            },
          });
        }
        //console.log(response);
        return response.json();
      })
      .then((parsedResponse) => {
        console.log(parsedResponse);
        setTokenCSRF({
          token: parsedResponse.query.tokens.csrftoken,
          action: action,
        });
      })
      .catch((error) => {
        alert(error);
      });
  }

  return (
    <div className="App">
      <CustomContext.Provider value={providerState}>
        <MyModal />
        <BrowserRouter>
          <NavBar getData={getData} getTokenCSRF={getTokenCSRF} />
          <Routes>
            <Route
              path="/"
              element={<Arquipelagos data={data} setData={setData} />}
            ></Route>
            <Route
              path="/item/:id"
              element={
                <ItemArq
                  data={data}
                  setData={setData}
                  tokenCSRF={tokenCSRF}
                  setTokenCSRF={setTokenCSRF}
                  getTokenCSRF={getTokenCSRF}
                />
              }
            ></Route>
          </Routes>
        </BrowserRouter>
      </CustomContext.Provider>
    </div>
  );
}

export default App;
