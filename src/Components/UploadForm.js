import { Button, Grid } from "@mui/material";
import { useEffect, useState } from "react";
import { useDataContext } from "../Reducers/DataContext";
import { useModalContext } from "../Reducers/ModalContext";
import { actionsM } from "../Reducers/ModalReducer";
import configData from "../Config.json";

export default function UploadForm({ getTokenCSRF, remove }) {
  const { modalState, modalDispatch } = useModalContext();
  const { dataState, dataDispatch } = useDataContext();
  const { ignoreWarnings, setIgnoreWarnings } = useState(false);

  useEffect(() => {
    if (
      dataState.item.id !== 0 &&
      dataState.tokenCSRF.action !== "" &&
      dataState.tokenCSRF.action === "upload"
    ) {
      console.log("uploading item", dataState.item);
      console.log(dataState.tokenCSRF.token);
      getFile();
    }
  }, [dataState.tokenCSRF]);

  useEffect(() => {
    if (dataState.item.file) {
      console.log("ficheiro carregado localmente", dataState.tokenCSRF);
      upload();
    }
  }, [dataState.item.file]);

  function getFile() {
    console.log("getFile", dataState.item);
    console.log(dataState.item.imagelink);
    fetch(
      dataState.item.imagelink.replace(
        "https://www.arquipelagos.pt",
        "/arqapi"
      ),
      {}
    )
      .then((response) => {
        // Validar se o pedido foi feito com sucesso. Pedidos são feitos com sucesso normalmente quando o status é entre 200 e 299
        if (response.status !== 200) {
          throw new Error("Erro:" + response.status);
        }
        //console.log(response);
        return response.blob();
      })
      .then((parsedResponse) => {
        //console.log(parsedResponse);
        dataState.item.file = parsedResponse;
      })
      .catch((error) => {
        alert(error);
      });
  }

  function upload() {
    console.log("Upload: ", dataState.tokenCSRF.token);
    const uploadParams = new FormData();
    uploadParams.append("file", dataState.item.file, {
      knownLength: dataState.item.file.size,
    });
    uploadParams.append("filename", dataState.item.filename);
    uploadParams.append("text", dataState.item.infoPanel);
    if (ignoreWarnings) {
      uploadParams.append("ignorewarnings", true);
      setIgnoreWarnings(false);
    }
    uploadParams.append("comment", "Uploaded with Catrapilha 1.0");
    uploadParams.append("token", dataState.tokenCSRF.token);

    fetch("/comapi/w/api.php?action=upload&format=json", {
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
            type: actionsM.fireModal,
            payload: {
              msg: response.status + ": " + response.statusText + "(Upload)",
              level: "error",
            },
          });
        }
        console.log(response);
        return response.json();
      })
      .then((parsedResponse) => {
        console.log(parsedResponse);
        dataState.tokenCSRF.token = "";
        if (parsedResponse.error) {
          modalDispatch({
            type: actionsM.fireModal,
            payload: {
              msg: parsedResponse.error.code + ": " + parsedResponse.error.info,
              level: "error",
            },
          });
        }
        if (parsedResponse.upload.result === "Warning") {
          if (parsedResponse.upload.warnings.exists) {
            modalDispatch({
              type: actionsM.fireModal,
              payload: {
                msg: "Imagem já existente no Commons:",
                level: "warning",
                link:
                  "https://commons.wikimedia.org/wiki/File:" +
                  parsedResponse.upload.warnings.exists,
              },
            });
          } else if (parsedResponse.upload.warnings.duplicate) {
            modalDispatch({
              type: actionsM.fireModal,
              payload: {
                msg: "Imagem duplicada no Commons:",
                level: "warning",
                link:
                  "https://commons.wikimedia.org/wiki/File:" +
                  parsedResponse.upload.warnings.duplicate,
              },
            });
          } else if (parsedResponse.upload.warnings["was-deleted"]) {
            modalDispatch({
              type: actionsM.fireModal,
              payload: {
                msg: "Imagem apagada no Commons:",
                level: "warning",
                link:
                  "https://commons.wikimedia.org/wiki/File:" +
                  parsedResponse.upload.warnings["was-deleted"],
              },
            });
          }
        }
        if (parsedResponse.upload.result === "Success") {
          modalDispatch({
            type: actionsM.fireModal,
            payload: {
              msg: "Upload bem sucedido. Imagem disponível em ",
              level: "success",
              link:
                "https://commons.wikimedia.org/wiki/File:" +
                parsedResponse.upload.filename,
            },
          });
          remove("Y");
        }
      })
      .catch((error) => {
        alert(error);
      });
  }

  return (
    <Grid container>
      <Grid item xs={2}></Grid>
      <Grid item xs={3}>
        <Button
          variant="contained"
          onClick={getTokenCSRF}
          size="small"
          sx={{ m: 1 }}
          style={{ float: "right" }}
        >
          Carregar no Commons
        </Button>
      </Grid>
      <Grid item xs={3}>
        <Button
          variant="contained"
          onClick={() => {
            setIgnoreWarnings(true);
            getTokenCSRF();
          }}
          size="small"
          sx={{ m: 1 }}
          style={{ float: "right" }}
        >
          Ignorar avisos
        </Button>
      </Grid>
    </Grid>
  );
}
