import { FileDownload, UploadFile } from "@mui/icons-material";
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Container,
  IconButton,
  Toolbar,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { useNavigate } from "react-router-dom";
import configData from "../Config.json";
import { useDataContext } from "../Reducers/DataContext";
import { useModalContext } from "../Reducers/ModalContext";
import { actionsM } from "../Reducers/ModalReducer";
import catrapilha from "../Resources/catrapilha.png";

export default function NavBar({ getData, getTokenCSRF }) {
  const { dataState } = useDataContext();
  const { modalDispatch } = useModalContext();
  const [user, setUser] = useState();

  const navigate = useNavigate();

  useEffect(() => {
    getUser();
  }, []);

  useEffect(() => {
    if (
      dataState.data !== null &&
      dataState.data.Arquipelagos.length - dataState.initialCounter === 50
    ) {
      console.log("Autosave");
      //getFile();
    }
  }, [dataState.data, dataState.initialCounter]);

  function getUser() {
    fetch("/comapi/w/api.php?action=query&meta=userinfo&format=json", {
      headers: {
        "Content-type": "application/json",
        Authorization: "Bearer " + configData["Access token"],
        "User-Agent": configData["User-Agent"],
      },
    })
      .then(response => {
        // Validar se o pedido foi feito com sucesso. Pedidos são feitos com sucesso normalmente quando o status é entre 200 e 299
        if (response.status !== 200) {
          throw new Error("Erro:" + response.status);
        }
        return response.json();
      })
      .then(parsedResponse => {
        setUser(parsedResponse.query.userinfo.name);
      })
      .catch(error => {
        alert(error);
      });
  }

  const sendData = async () => {
    try {
      const token = await getTokenCSRF();
      const uploadParams = new FormData();
      uploadParams.append("title", "User:DarwIn/Catrapilha.data");
      uploadParams.append("text", JSON.stringify(dataState.data));
      uploadParams.append("summary", "Data updated (Catrapilha 1.1)");
      uploadParams.append("token", token);

      const res = await fetch("/comapi/w/api.php?action=edit&format=json", {
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
            msg: res.status + ": " + res.statusText + "(sendData)",
            level: "error",
          },
        });
      } else {
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
        if (data.edit.result === "Success") {
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
      }
    } catch (err) {
      alert(err);
    }
  };

  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        console.log("erro", error);
        console.log("erro", errorInfo);
      }}
    >
      <AppBar position="static">
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{ mr: 2, display: { xs: "none", md: "flex" } }}
            >
              <IconButton
                onClick={() => {
                  const project =
                    dataState.project === "Arq" ? "/Arquipelagos" : "/Flickr";
                  navigate(project);
                }}
                sx={{ p: 0 }}
                style={{ color: "white" }}
              >
                <Avatar alt="Catrapilha" src={catrapilha} sx={{ p: 1 }} />
                Catrapilha 1.1
              </IconButton>
            </Typography>
            <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}>
              <Button
                onClick={getData}
                sx={{ my: 2, color: "white", display: "block" }}
                startIcon={<FileDownload />}
                size="small"
              >
                Puxar dados
              </Button>
              <Button
                onClick={sendData}
                sx={{ my: 2, color: "white", display: "block" }}
                startIcon={<UploadFile />}
                size="small"
              >
                Enviar dados
              </Button>
            </Box>
            <Button
              // Mudar de projecto
              // onClick={() => {
              //   dataDispatch({
              //     type: actionsD.changeProject,
              //     payload: dataState.project == "Arq" ? "Flickr" : "Arq"
              //   });
              //   let project =
              //     dataState.project == "Arq" ? "/Arquipelagos" : "/Flickr";
              //   navigate(project);
              // }}
              sx={{ my: 2, color: "white", display: "block" }}
              size="small"
            >
              {dataState.project === "Arq" ? "Arquipélagos" : "Flickr"}
            </Button>
            <Typography style={{ float: "left", color: "white" }} mx={2}>
              {dataState.currentId === 0 ? "" : "Item: " + dataState.currentId}
            </Typography>
            <Typography style={{ float: "left", color: "white" }} mx={2}>
              {"Processados: " +
                (dataState.data !== null
                  ? dataState.data.Arquipelagos.length
                  : 0) +
                " (" +
                (dataState.data !== null
                  ? dataState.data.Arquipelagos.length - dataState.initialCount
                  : 0) +
                " novos)"}
            </Typography>
            <Typography style={{ float: "left", color: "white" }} mx={2}>
              {"Carregados: " +
                (dataState.data !== null
                  ? dataState.data.Arquipelagos.filter(
                      element => element.status === "Y"
                    ).length
                  : 0)}
            </Typography>
            <Typography style={{ float: "right", color: "white" }}>
              {user ? user : ""}
            </Typography>
          </Toolbar>
        </Container>
      </AppBar>
    </ErrorBoundary>
  );
}
