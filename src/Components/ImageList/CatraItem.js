// src/Components/CatraList/CatraItem.js

import {
  ArrowBackIos,
  ArrowForwardIos,
  CheckCircleOutline,
  RemoveCircleOutline,
} from "@mui/icons-material";
import { Button, CircularProgress, Grid, Typography } from "@mui/material";
import { Fragment, useCallback, useEffect, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { useNavigate } from "react-router-dom";
import { useDataContext } from "../../Reducers/DataContext";
import { actionsD } from "../../Reducers/DataReducer";
import { useModalContext } from "../../Reducers/ModalContext";
import { actionsM } from "../../Reducers/ModalReducer";
import { fetchArqItemById, fetchArqItemHTML } from "../../Services/ArqAPIs";
import UploadForm from "../UploadForm";
import CatraItemForm from "./CatraItemForm";

export default function CatraItem() {
  const [loading, setLoading] = useState(false);
  const { modalDispatch } = useModalContext();
  const { dataState, dataDispatch } = useDataContext();

  const navigate = useNavigate();

  /**
   * Initialize the component by setting first and last IDs based on unprocessed items.
   */
  const init = useCallback(() => {
    if (dataState.data && dataState.items) {
      const filteredItems = dataState.items.filter(
        item => !dataState.data.some(itemArq => itemArq.id === item.id)
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
      } else {
        // No items available to edit
        modalDispatch({
          type: actionsM.fireModal,
          payload: {
            msg: "Nenhum item disponível para editar. Voltando à lista principal.",
            level: "info",
          },
        });
        navigate("/");
      }
    } else {
      navigate("/");
    }
  }, [dataState.data, dataState.items, dataDispatch, modalDispatch, navigate]);

  /**
   * Build the item details from the raw data.
   */
  const buildItem = useCallback(
    async rawItem => {
      try {
        const parsed = await fetchArqItemHTML(rawItem.link);

        const testImg = new RegExp(
          '(.*)(<img src="(.*?)" class="card-img mb-2")'
        );
        const testFilename = new RegExp('(.*)(/(.*?)" class="card-img mb-2")');

        const filenameMatch = testFilename.exec(parsed);
        const imgMatch = testImg.exec(parsed);

        if (!filenameMatch || !imgMatch) {
          throw new Error("Formato de resposta inesperado.");
        }

        const item = { ...dataState.item }; // Ensure dataState.item is defined
        item.id = rawItem.id;
        item.title =
          rawItem.title && typeof rawItem.title.rendered === "string"
            ? rawItem.title.rendered
            : "Untitled";
        item.filename = filenameMatch[3].replace(
          ".jpg",
          ` - Image ${rawItem.id}.jpg`
        );
        item.link = rawItem.link;
        item.linkhtml = parsed;
        item.imagelink = imgMatch[3];
        item.content = rawItem.content.rendered;
        item.description = rawItem.content.rendered;

        dataDispatch({
          type: actionsD.updateItem,
          payload: item,
        });
      } catch (error) {
        console.error("buildItem Error:", error);
        modalDispatch({
          type: actionsM.fireModal,
          payload: {
            msg: "Erro ao construir o item. Por favor, tente novamente.",
            level: "error",
          },
        });
      } finally {
        setLoading(false);
      }
    },
    [dataState.item, dataDispatch, modalDispatch]
  );

  /**
   * Remove the current item from the list based on the type.
   */
  const remove = useCallback(
    type => {
      let tmp = { ...dataState.data };
      const alreadyExists = tmp.some(
        element => element.id === dataState.currentId
      );
      if (!alreadyExists) {
        tmp.push({
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
          (isForward && isAtLastId && !isAtFirstId) ||
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
        init(); // Reinitialize after removal
      }
    },
    [
      dataState.data,
      dataState.currentId,
      dataState.forward,
      dataState.firstId,
      dataState.lastId,
      dataDispatch,
      modalDispatch,
      init, // Now safe to include since init is defined before
    ]
  );

  /**
   * Fetch and build the item details if not already processed.
   */
  const getItem = useCallback(async () => {
    try {
      const rawItem = await fetchArqItemById(dataState.currentId);

      if (rawItem.data) {
        if (rawItem.data.status === 404) {
          remove("X");
        } else if (rawItem.data.status === 401) {
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
          console.log("getitem", rawItem);
          modalDispatch({
            type: actionsM.fireModal,
            payload: {
              msg:
                "Erro " +
                rawItem.data.status +
                ": Code: " +
                rawItem.code +
                ", Message: " +
                rawItem.message,
              level: "error",
            },
          });
        }
      } else {
        await buildItem(rawItem);
      }
    } catch (error) {
      console.error("getItem Error:", error);
      modalDispatch({
        type: actionsM.fireModal,
        payload: {
          msg: "Erro ao obter o item. Por favor, tente novamente.",
          level: "error",
        },
      });
      navigate("/");
    }
  }, [
    dataState.currentId,
    dataDispatch,
    modalDispatch,
    navigate,
    buildItem,
    remove,
  ]);

  /**
   * Handle fetching the current item if not already processed.
   */
  useEffect(() => {
    if (dataState.currentId !== 0) {
      const itemInData = dataState.data.filter(
        element => element.id === dataState.currentId
      );
      if (itemInData.length === 0) {
        // Only fetch if item not found
        getItem(dataState.currentId);
      }
      // else do nothing if item is found
    } else {
      navigate("/");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataState.currentId, dataState.data, navigate]);

  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        console.log("Erro capturado:", error);
        console.log("Informações do erro:", errorInfo);
      }}
    >
      <Grid container>
        {dataState.item && dataState.item.id !== 0 && !loading ? (
          <Grid container>
            <Grid item xs={2}>
              <Button
                variant="contained"
                onClick={() => remove("N")}
                size="small"
                sx={{ m: 1 }}
                startIcon={<RemoveCircleOutline />}
                color="error"
              >
                Não carregar
              </Button>
            </Grid>
            <Grid item xs={3}>
              <Button
                variant="contained"
                onClick={() => remove("Y")}
                size="small"
                sx={{ m: 1 }}
                startIcon={<CheckCircleOutline />}
                color="success"
              >
                Já existe no Commons
              </Button>
            </Grid>
            <Grid item xs={2}>
              <Button
                variant="contained"
                onClick={() => dataDispatch({ type: actionsD.moveBack })}
                size="small"
                sx={{ m: 1 }}
                startIcon={<ArrowBackIos />}
                disabled={dataState.currentId === dataState.firstId}
              >
                Anterior
              </Button>
            </Grid>
            <Grid item xs={4}>
              <Button
                variant="contained"
                onClick={() => dataDispatch({ type: actionsD.moveForward })}
                size="small"
                sx={{ m: 1 }}
                startIcon={<ArrowForwardIos />}
                disabled={dataState.currentId === dataState.lastId}
              >
                Próxima
              </Button>
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="contained"
                onClick={() => {
                  dataDispatch({
                    type: actionsD.setCurrentId,
                    payload: 0,
                  });
                  const project =
                    dataState.projectId === "Arq" ? "/Arquipelagos" : "/Flickr";
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
              {dataState.item.id !== 0 && (
                <Grid item xs={12} key={dataState.item.id}>
                  <Fragment>
                    <div
                      dangerouslySetInnerHTML={{
                        __html: dataState.item.linkhtml,
                      }}
                    />
                  </Fragment>
                </Grid>
              )}
            </Grid>
            <CatraItemForm />
            <UploadForm remove={remove} />
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
            <CircularProgress size={200} thickness={15} />
            <Typography variant="body2" color="text.secondary">
              Loading...
            </Typography>
          </div>
        )}
      </Grid>
    </ErrorBoundary>
  );
}
