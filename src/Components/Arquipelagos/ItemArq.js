import { Button, CircularProgress, Grid, Typography } from "@mui/material";
import { Fragment, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import configData from "../../Config.json";
import {
  ArrowBackIos,
  ArrowForwardIos,
  CheckCircleOutline,
  RemoveCircleOutline,
} from "@mui/icons-material";
import { useModalContext } from "../../Reducers/ModalContext";
import { actionsM } from "../../Reducers/ModalReducer";
import { actionsD } from "../../Reducers/DataReducer";
import { useDataContext } from "../../Reducers/DataContext";
import UploadForm from "../UploadForm";
import ItemArqForm from "./ItemArqForm";
import { ErrorBoundary } from "react-error-boundary";

export default function ItemArq({ getTokenCSRF }) {
  const [loading, setLoading] = useState(false);
  const { modalState, modalDispatch } = useModalContext();
  const { dataState, dataDispatch } = useDataContext();

  const navigate = useNavigate();

  useEffect(() => {
    //console.log("data inicio item arq", dataState.data);
    console.log("início", dataState.tokenCSRF);
  }, []);

  useEffect(() => {
    //console.log("data antes do getitem", dataState.data);
    if (dataState.currentId !== 0) {
      //console.log("alterou currentId", dataState.currentId);
      if (
        dataState.data[0].Arquipelagos.filter(
          (element) => element.id === dataState.currentId
        ).length === 0
      ) {
        setLoading(true);

        //Temporizador para não fazer DOS ao site (retorna 401)
        //console.log("data antes de ir buscar o getitem", dataState.data);
        wait(1000, getItem);
      } else {
        dataDispatch({
          type: dataState.forward ? actionsD.moveForward : actionsD.moveBack,
        });
      }
    } else {
      navigate("/");
    }
  }, [dataState.currentId]);

  function getItem() {
    console.log("get item", dataState.currentId);
    fetch("/arqapi/wp-json/wp/v2/imagem/" + dataState.currentId, {
      headers: {
        "Content-type": "application/json",
        "User-Agent": configData["User-Agent"],
      },
    })
      .then((response) => {
        // Validar se o pedido foi feito com sucesso. Pedidos são feitos com sucesso normalmente quando o status é entre 200 e 299
        if (response.status !== 200) {
        }
        return response.json();
      })
      .then((parsedResponse) => {
        if (parsedResponse.data) {
          if (parsedResponse.data.status === 404) {
            remove("X");
          } else if (parsedResponse.data.status === 401) {
            modalDispatch({
              type: actionsM.fireModal,
              payload: {
                msg: "Não existem imagens nas imediações, voltando à lista principal.",
                level: "info",
              },
            });
            navigate("/");
          } else {
            console.log("getitem", parsedResponse);
            modalDispatch({
              type: actionsM.fireModal,
              payload: {
                msg:
                  "Erro " +
                  parsedResponse.data.status +
                  ": Code: " +
                  parsedResponse.code +
                  ", Message: " +
                  parsedResponse.message,
                level: "error",
              },
            });
          }
        } else {
          buildItem(parsedResponse);
        }
      })
      .catch((error) => {
        alert(error);
      });
  }

  function buildItem(rawItem) {
    console.log("data início builditem", dataState.data);
    console.log("entrou no buildItem", rawItem);
    fetch(rawItem.link.replace("https://www.arquipelagos.pt", "/arqapi"))
      .then((response) => {
        // Validar se o pedido foi feito com sucesso. Pedidos são feitos com sucesso normalmente quando o status é entre 200 e 299
        if (response.status !== 200) {
          modalDispatch({
            type: actionsM.fireModal,
            payload: {
              msg: response.status + ": " + response.statusText + "(buildItem)",
              level: "error",
            },
          });
          return Promise.reject(response);
        }
        console.log("builditem responde", response);
        return response.text();
      })
      .then((parsedResponse) => {
        try {
          const testImg = new RegExp(
            '(.*)(<img src="(.*?)" class="card-img mb-2")'
          );
          const testFilename = new RegExp(
            '(.*)(/(.*?)" class="card-img mb-2")'
          );

          const item = dataState.item;
          item.id = rawItem.id;
          item.title = rawItem.title.rendered;
          item.filename = testFilename
            .exec(parsedResponse)[3]
            .replace(".jpg", " - Image " + rawItem.id + ".jpg");
          item.link = rawItem.link;
          item.linkhtml = parsedResponse;
          item.imagelink = testImg.exec(parsedResponse)[3];
          item.content = rawItem.content.rendered;
          item.description = rawItem.content.rendered;
          dataDispatch({
            type: actionsD.updateItem,
            payload: item,
          });
          console.log("Completou buildItem");
          //console.log("data fim do BuildItem", dataState.data);
        } catch (error) {
          alert(error);
        }
        setLoading(false);
      })
      .catch((error) => {
        //alert(error);
      });
  }

  function remove(type) {
    let tmp = dataState.data;
    if (
      tmp[0].Arquipelagos.filter(
        (element) => element.id === dataState.currentId
      ).length === 0
    ) {
      tmp[0].Arquipelagos.push({
        id: dataState.currentId,
        status: type,
      });
      dataDispatch({
        type: actionsD.updateData,
        payload: tmp,
      });
      dataDispatch({
        type: dataState.forward ? actionsD.moveForward : actionsD.moveBack,
      });
    }
  }

  function wait(milliseconds, foo) {
    setTimeout(function () {
      foo(); // will be executed after the specified time
    }, milliseconds);
  }

  /*   function recurs(n) {
    if (n > 0) {
      let x = n + recurs(n - 1);
      return x;
    } else return n;
  } */

  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        console.log("erro", error);
        console.log("erro", errorInfo);
      }}
    >
      <Grid container>
        {dataState.item.id !== 0 && loading === false ? (
          <Grid container>
            <Grid item xs={2}>
              <Button
                variant="contained"
                onClick={() => {
                  remove("N");
                }}
                size="small"
                sx={{ m: 1 }}
                style={{ float: "left" }}
                startIcon={<RemoveCircleOutline />}
                color="error"
              >
                Não carregar
              </Button>
            </Grid>
            <Grid item xs={3}>
              <Button
                variant="contained"
                onClick={() => {
                  remove("Y");
                }}
                size="small"
                sx={{ m: 1 }}
                style={{ float: "left" }}
                startIcon={<CheckCircleOutline />}
                color="success"
              >
                Já existe no Commons
              </Button>
            </Grid>
            <Grid item xs={2}>
              <Button
                variant="contained"
                onClick={() => {
                  dataDispatch({
                    type: actionsD.moveBack,
                  });
                }}
                size="small"
                sx={{ m: 1 }}
                style={{ float: "left" }}
                startIcon={<ArrowBackIos />}
              >
                Anterior
              </Button>{" "}
            </Grid>
            <Grid item xs={4}>
              <Button
                variant="contained"
                onClick={() => {
                  dataDispatch({
                    type: actionsD.moveForward,
                  });
                }}
                size="small"
                sx={{ m: 1 }}
                style={{ float: "left" }}
                startIcon={<ArrowForwardIos />}
              >
                Próxima
              </Button>
            </Grid>
            <Grid>
              <Button
                variant="contained"
                onClick={() => {
                  navigate(-1);
                }}
                size="small"
                sx={{ m: 1 }}
                style={{ float: "right" }}
              >
                Voltar
              </Button>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6" style={{ float: "left" }}>
                Nome: {dataState.item.filename}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              {dataState.item.id !== 0 ? (
                <Grid item xs={12} key={dataState.item.id}>
                  <Fragment>
                    <div
                      dangerouslySetInnerHTML={{
                        __html: dataState.item.linkhtml,
                      }}
                    />
                  </Fragment>
                </Grid>
              ) : (
                ""
              )}
            </Grid>
            <ItemArqForm />
            <UploadForm getTokenCSRF={getTokenCSRF} remove={remove} />
          </Grid>
        ) : (
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
            }}
          >
            <CircularProgress
              style={{ float: "center" }}
              size={200}
              thickness={15}
            />
            <Typography variant="body2" color="text.secondary">
              Loading...
            </Typography>
          </div>
        )}
      </Grid>
    </ErrorBoundary>
  );
}
