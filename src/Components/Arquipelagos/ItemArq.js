import {
  ArrowBackIos,
  ArrowForwardIos,
  CheckCircleOutline,
  RemoveCircleOutline,
} from "@mui/icons-material";
import { Button, CircularProgress, Grid, Typography } from "@mui/material";
import axios from "axios";
import React, { Fragment, useEffect, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { useNavigate } from "react-router-dom";
import { useDataContext } from "../../Reducers/DataContext";
import { actionsD } from "../../Reducers/DataReducer";
import { useModalContext } from "../../Reducers/ModalContext";
import { actionsM } from "../../Reducers/ModalReducer";
import UploadForm from "../UploadForm";
import ItemArqForm from "./ItemArqForm";

export default function ItemArq({ getTokenCSRF }) {
  const [loading, setLoading] = useState(false);
  const { modalDispatch } = useModalContext();
  const { dataState, dataDispatch } = useDataContext();

  const navigate = useNavigate();

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    init();
  }, [dataState.items]);

  const init = () => {
    if (dataState.data) {
      const filteredItems = dataState.items.filter(
        item =>
          !dataState.data.Arquipelagos.some(itemArq => itemArq.id === item.id)
      );
      if (filteredItems.length > 0) {
        dataDispatch({
          type: actionsD.setFirstId,
          payload: filteredItems[0].id,
        });
        dataDispatch({
          type: actionsD.setLastId,
          payload: filteredItems[filteredItems.length - 1].id,
        });
      }
    } else {
      navigate("/");
    }
  };

  useEffect(() => {
    if (dataState.currentId !== 0) {
      if (
        dataState.data.Arquipelagos.filter(
          element => element.id === dataState.currentId
        ).length === 0
      ) {
        setLoading(true);
        getItem();
      } else {
        dataDispatch({
          type: dataState.forward ? actionsD.moveForward : actionsD.moveBack,
        });
      }
    } else {
      navigate("/");
    }
  }, [dataState.currentId]);

  async function getItem() {
    const res = await axios.get(
      "https://www.arquipelagos.pt/wp-json/wp/v2/imagem/" + dataState.currentId,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (res.status !== 200) {
      throw new Error("Erro:" + res.status);
    }
    const parsed = await res.data;

    if (parsed.data) {
      if (parsed.data.status === 404) {
        remove("X");
      } else if (parsed.data.status === 401) {
        dataDispatch({
          type: actionsD.setCurrentId,
          payload: 0,
        });
        modalDispatch({
          type: actionsM.fireModal,
          payload: {
            msg: "Não existem imagens nas imediações, voltando à lista principal.",
            level: "info",
          },
        });
        navigate("/");
      } else {
        console.log("getitem", parsed);
        modalDispatch({
          type: actionsM.fireModal,
          payload: {
            msg:
              "Erro " +
              parsed.data.status +
              ": Code: " +
              parsed.code +
              ", Message: " +
              parsed.message,
            level: "error",
          },
        });
      }
    } else {
      buildItem(parsed);
    }
  }

  async function buildItem(rawItem) {
    const res = await axios.get(
      rawItem.link.replace("https://www.arquipelagos.pt", "/arqapi")
    );
    if (res.status !== 200) {
      throw new Error("Erro:" + res.status);
    }
    const parsed = await res.data;

    try {
      const testImg = new RegExp(
        '(.*)(<img src="(.*?)" class="card-img mb-2")'
      );
      const testFilename = new RegExp('(.*)(/(.*?)" class="card-img mb-2")');

      const item = dataState.item;
      item.id = rawItem.id;
      item.title = rawItem.title.rendered;
      item.filename = testFilename
        .exec(parsed)[3]
        .replace(".jpg", " - Image " + rawItem.id + ".jpg");
      item.link = rawItem.link;
      item.linkhtml = parsed;
      item.imagelink = testImg.exec(parsed)[3];
      item.content = rawItem.content.rendered;
      item.description = rawItem.content.rendered;
      dataDispatch({
        type: actionsD.updateItem,
        payload: item,
      });
    } catch (error) {
      alert(error);
    }
    setLoading(false);
  }

  const remove = type => {
    let tmp = dataState.data;
    if (
      tmp.Arquipelagos.filter(element => element.id === dataState.currentId)
        .length === 0
    ) {
      tmp.Arquipelagos.push({
        id: dataState.currentId,
        status: type,
      });
      dataDispatch({
        type: actionsD.updateData,
        payload: tmp,
      });

      const isForward = dataState.forward;
      const isAtFirstId = dataState.currentId === dataState.firstId;
      const isAtLastId = dataState.currentId === dataState.lastId;

      if (
        (isForward && !isAtLastId) ||
        (!isForward && isAtFirstId && !isAtLastId)
      ) {
        dataDispatch({ type: actionsD.moveForward });
      } else if (
        (isForward && isAtLastId & !isAtFirstId) ||
        (!isForward && !isAtFirstId)
      ) {
        dataDispatch({ type: actionsD.moveBack });
      } else {
        modalDispatch({
          type: actionsM.fireModal,
          payload: {
            msg: "Chegou ao fim da lista de imagens.",
            level: "info",
          },
        });
      }
      init();
    }
  };

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
                disabled={dataState.currentId >= dataState.firstId}
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
                disabled={dataState.currentId === dataState.lastId}
              >
                Próxima
              </Button>
            </Grid>
            <Grid>
              <Button
                variant="contained"
                onClick={() => {
                  dataDispatch({
                    type: actionsD.setCurrentId,
                    payload: 0,
                  });
                  const project =
                    dataState.project === "Arq" ? "/Arquipelagos" : "/Flickr";
                  navigate(project);
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
