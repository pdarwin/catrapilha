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
import { useEffect, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { useNavigate } from "react-router-dom";
import configData from "../Config.json";
import { useDataContext } from "../Reducers/DataContext";

export default function NavBar({ getData, getTokenCSRF }) {
  const { dataState, dataDispatch } = useDataContext();
  const [user, setUser] = useState();

  const navigate = useNavigate();

  useEffect(() => {
    //console.log("data antes do getuser", dataState.data);
    getUser();
  }, []);

  useEffect(() => {
    //console.log("data navbar", dataState.data);
    if (
      dataState.data !== null &&
      dataState.data[0].Arquipelagos.length - dataState.initialCounter === 50
    ) {
      console.log("Autosave");
      //getFile();
    }
  }, [dataState.data]);

  function getUser() {
    fetch("/comapi/w/api.php?action=query&meta=userinfo&format=json", {
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
        //console.log(parsedResponse);
        setUser(parsedResponse.query.userinfo.name);
      })
      .catch((error) => {
        alert(error);
      });
  }

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
                  navigate("/");
                }}
                sx={{ p: 0 }}
                style={{ color: "white" }}
              >
                <Avatar
                  alt="Catrapilha"
                  src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/Bulldozer-svgrepo-com-white.svg/240px-Bulldozer-svgrepo-com-white.svg.png"
                  sx={{ p: 1 }}
                />
                Catrapilha 1.0
              </IconButton>
            </Typography>
            <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}>
              <Button
                onClick={() => {
                  getData();
                }}
                sx={{ my: 2, color: "white", display: "block" }}
                startIcon={<FileDownload />}
                size="small"
              >
                Puxar dados
              </Button>
              <Button
                onClick={() => {
                  getTokenCSRF("sendData");
                }}
                sx={{ my: 2, color: "white", display: "block" }}
                startIcon={<UploadFile />}
                size="small"
              >
                Enviar dados
              </Button>
            </Box>
            <Typography style={{ float: "left", color: "white" }} mx={2}>
              {dataState.currentId === 0 ? "" : "Item: " + dataState.currentId}
            </Typography>
            <Typography style={{ float: "left", color: "white" }} mx={2}>
              {"Processados: " +
                (dataState.data !== null
                  ? dataState.data[0].Arquipelagos.length
                  : 0) +
                " (" +
                (dataState.data !== null
                  ? dataState.data[0].Arquipelagos.length -
                    dataState.initialCount
                  : 0) +
                " novos)"}
            </Typography>
            <Typography style={{ float: "left", color: "white" }} mx={2}>
              {"Carregados: " +
                (dataState.data !== null
                  ? dataState.data[0].Arquipelagos.filter(
                      (element) => element.status === "Y"
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
