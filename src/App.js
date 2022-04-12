import Arquipelagos from "./Arquipelagos/Arquipelagos";
import { useEffect, useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import ItemArq from "./Arquipelagos/ItemArq";
import MyModal from "./MyModal";
import NavBar from "./NavBar";
import configData from "./Config.json";

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

  //Gestão do MyModal
  const [open, setOpen] = useState(false);
  const [errLevel, setErrLevel] = useState("error");
  const [err, setErr] = useState("");
  const [errlink, setErrlink] = useState("");

  const handleOpen = () => setOpen(true);

  const handleClose = () => {
    setOpen(false);
    setErrLevel("");
    setErr("");
    setErrlink("");
  };

  function getData() {
    fetch(
      "comapi/w/api.php?action=parse&page=User:DarwIn/Catrapilha.data&format=json&prop=wikitext",
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
          throw new Error("Erro:" + response.status);
        }
        console.log(response);
        return response.json();
      })
      .then((parsedResponse) => {
        setData(JSON.parse(parsedResponse.parse.wikitext["*"]));
      })
      .catch((error) => {
        alert(error);
      });
  }

  function sendData() {
    console.log("send", encodeURIComponent(tokenCSRF.token));

    const uploadParams = new FormData();
    uploadParams.append("title", "User:DarwIn/Catrapilha.data");
    uploadParams.append("text", JSON.stringify(data));
    uploadParams.append("summary", "Edited with Catrapilha 1.0");
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
          throw new Error("Erro:" + response.status);
        }
        //console.log(response);
        return response.json();
      })
      .then((parsedResponse) => {
        console.log(parsedResponse);
        if (parsedResponse.error) {
          setErr(parsedResponse.error.code + ": " + parsedResponse.error.info);
          setErrLevel("error");
          handleOpen();
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
          throw new Error("Erro:" + response.status);
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
      <MyModal
        open={open}
        err={err}
        errLevel={errLevel}
        errlink={errlink}
        handleOpen={handleOpen}
        handleClose={handleClose}
      />
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
                modalControls={{
                  setOpen: setOpen,
                  setErr: setErr,
                  setErrlink: setErrlink,
                  setErrLevel: setErrLevel,
                  handleOpen: handleOpen,
                  handleClose: handleClose,
                }}
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
    </div>
  );
}

export default App;
