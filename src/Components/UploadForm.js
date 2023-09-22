import React from "react";
import { Button, Checkbox, FormControlLabel, Grid } from "@mui/material";
import { useState } from "react";
import { useDataContext } from "../Reducers/DataContext";
import { useModalContext } from "../Reducers/ModalContext";
import { actionsM } from "../Reducers/ModalReducer";
import configData from "../Config.json";
import { actionsD } from "../Reducers/DataReducer";

export default function UploadForm({ getTokenCSRF, remove }) {
  const { modalDispatch } = useModalContext();
  const { dataState, dataDispatch } = useDataContext();
  const [ignoreWarnings, setIgnoreWarnings] = useState(false);

  async function getFile() {
    try {
      console.log("getFile", dataState.item);
      console.log(dataState.item.imagelink);
      const res = await fetch(
        dataState.item.imagelink.replace(
          "https://www.arquipelagos.pt",
          "/arqapi"
        ),
        {}
      );

      // Validar se o pedido foi feito com sucesso. Pedidos são feitos com sucesso normalmente quando o status é entre 200 e 299
      if (res.status !== 200) {
        throw new Error("Erro:" + res.status);
      } else {
        const data = await res.blob();

        const item = dataState.item;
        item.file = data;
        dataDispatch({
          type: actionsD.updateItem,
          payload: item,
        });
      }
    } catch (error) {
      alert(error);
    }
  }

  const upload = async () => {
    try {
      console.log("upload");
      const token = await getTokenCSRF();
      console.log("token: ", token);

      await getFile();
      console.log(dataState.item.file);

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
      uploadParams.append(
        "comment",
        "Uploaded with [[Category:Uploaded with Catrapilha|Catrapilha 1.1]]"
      );
      uploadParams.append("token", token);

      const res = await fetch("/comapi/w/api.php?action=upload&format=json", {
        method: "POST",
        headers: {
          Authorization: "Bearer " + configData["Access token"],
          "User-Agent": configData["User-Agent"],
        },
        body: uploadParams,
      });

      // Validar se o pedido foi feito com sucesso. Pedidos são feitos com sucesso normalmente quando o status é entre 200 e 299
      if (res.status !== 200) {
        modalDispatch({
          type: actionsM.fireModal,
          payload: {
            msg: res.status + ": " + res.statusText + "(Upload)",
            level: "error",
          },
        });
      } else {
        console.log(res);
        const data = await res.json();

        if (data.error) {
          modalDispatch({
            type: actionsM.fireModal,
            payload: {
              msg: data.error.code + ": " + data.error.info,
              level: "error",
            },
          });
        }
        if (data.upload.result === "Warning") {
          //Desestruturação do array
          const [[type, file]] = Object.entries(data.upload.warnings);

          let msg;
          switch (type) {
            case "exists":
              msg = "Imagem já existente no Commons";
              break;
            case "duplicate":
              msg = "Imagem duplicada no Commons";
              break;
            case "was-deleted":
              msg = "Imagem apagada no Commons";
              break;
            case "badfilename":
              msg = "Nome de ficheiro inválido";
              break;
            default:
              msg = `Aviso não tratado (${type}`;
              break;
          }

          modalDispatch({
            type: actionsM.fireModal,
            payload: {
              msg: msg + ":",
              level: "warning",
              link: "https://commons.wikimedia.org/wiki/File:" + file,
            },
          });
        }
        if (data.upload.result === "Success") {
          modalDispatch({
            type: actionsM.fireModal,
            payload: {
              msg: "Upload bem sucedido. Imagem disponível em ",
              level: "success",
              link:
                "https://commons.wikimedia.org/wiki/File:" +
                data.upload.filename,
            },
          });
          remove("Y");
        }
      }
    } catch (error) {
      alert(error);
    }
  };

  return (
    <Grid container>
      <Grid item xs={10}>
        <Button
          variant="contained"
          onClick={upload}
          size="small"
          sx={{ m: 1 }}
          style={{ float: "right" }}
        >
          Carregar no Commons
        </Button>
      </Grid>
      <Grid item xs={2}>
        <FormControlLabel
          control={<Checkbox />}
          label="Ignorar avisos"
          onChange={() => {
            setIgnoreWarnings(true);
          }}
          style={{ float: "right" }}
        />
      </Grid>
    </Grid>
  );
}
