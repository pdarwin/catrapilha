import {
  Box,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  LinearProgress,
  Tooltip,
  Typography,
} from "@mui/material";
import { indigo } from "@mui/material/colors";
import React, { useEffect, useReducer } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import configData from "../../Config.json";
import { useDataContext } from "../../Reducers/DataContext";
import { actionsD } from "../../Reducers/DataReducer";
import Filters from "../Filters";
import { getItemsArq, processItems } from "../Projects/Arq";
import { getItemsProject1 } from "../Projects/Project1";

const initialState = {
  listItems: [],
  items: [],
};

const actions = {
  updateNListItems: "updateNListItems",
};

function reducer(state, action) {
  switch (action.type) {
    case actions.updateNListItems:
      return {
        ...state,
        nListItems: ++state.nListItems,
      };
    default:
      throw new Error();
  }
}

export default function CatraList({ stopRef }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { dataState, dataDispatch } = useDataContext();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {}, []);

  useEffect(() => {
    init();
  }, [
    dataState.data,
    location,
    dataState.filter,
    dataState.project,
    stopRef.current,
  ]);

  const init = async () => {
    if (dataState.filter === "/CLEAR/") {
      dataState.filter = "";
      return;
    }
    if (dataState.data) {
      setTimeout(async () => {
        if (!stopRef.current) {
          await initVariables()
            .then(() => {
              console.log("passou!");
              getAllItems()
                .catch(error => {
                  console.error("Error getting more items:", error);
                })
                .finally(() => {
                  dataDispatch({
                    type: actionsD.setListLoading,
                    payload: false,
                  });
                  stopRef.current = false;
                });
            })
            .catch(error => {
              console.error("Error initializing variables:", error);
            });
        }
      }, 0);
    }
  };

  const initVariables = async () => {
    dataState.listLoading = true;
    dataState.totalPages = 0;
    state.items = [];
    state.tmpItems = [];
    state.listItems = [];
    state.page = 1;
    state.cancelLoadItem = new AbortController();
  };

  const getAllItems = async () => {
    let i =
      dataState.project === "Arq"
        ? dataState.root
        : configData["Project1-root"];
    while (
      state.items.length < dataState.maxItems &&
      (!dataState.totalPages || i <= dataState.totalPages) &&
      !stopRef.current
    ) {
      await getMoreItems(i)
        .then(() => {
          if (dataState.project === "Arq") {
            processItems(
              state.tmpItems,
              state.cancelLoadItem,
              dispatch,
              state,
              actions
            )
              .then(() => {
                console.log("All items processed successfully");
              })
              .catch(error => {
                console.error("Error processing items:", error);
              });
          }
        })
        .catch(error => {
          console.error("Error getting more items:", error);
        });
      i++;
    }
  };

  const getMoreItems = async i => {
    console.log("Total items at " + i + " iterations:", state.items.length);
    dataDispatch({
      type: actionsD.updateIterations,
      payload: i,
    });
    const n = dataState.maxItems - state.items.length;
    console.log("Getting more items:", n);
    if (dataState.project === "Project1") {
      await getItemsProject1(i, dispatch, state, actions);
      return;
    }
    try {
      const newItems = await getItemsArq(i, dataState, dataDispatch);
      state.items = [...state.items, ...newItems.slice(0, n)];
      state.tmpItems = newItems.slice(0, n);
    } catch (error) {
      console.log("Error:", error);
    }

    console.log("Total items now:", state.items.length);

    if (state.items.length > 1) {
      dataDispatch({
        type: actionsD.updateItems,
        payload: state.items,
      });
    }
  };

  function clickItem(item) {
    dataDispatch({
      type: actionsD.setCurrentId,
      payload: item.id,
    });
    state.cancelLoadItem.abort();
    state.listItems = [];
    navigate("/item/");
  }

  return (
    <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
      <div
        style={{
          width: "60%",
          paddingLeft: 20,
          paddingTop: 25,
          textAlign: "center",
        }}
      >
        {dataState.data ? (
          state.listItems.length > 0 ? (
            <ImageList sx={{ width: 1000, height: 720 }} cols={5} gap={5}>
              {state.listItems.map(item => (
                <Tooltip
                  key={item.id}
                  title={item.title.replace("&#8217;", "'")}
                  placement="top"
                >
                  <ImageListItem key={item.id}>
                    <img
                      src={item.image}
                      alt=""
                      loading="lazy"
                      onClick={() => {
                        clickItem(item);
                      }}
                      style={{
                        cursor: "pointer",
                        height: "100px",
                      }}
                    />
                    <ImageListItemBar
                      title={item.id}
                      position="below"
                      sx={{ color: indigo[100] }}
                    />
                  </ImageListItem>
                </Tooltip>
              ))}
            </ImageList>
          ) : (
            <Typography
              variant="h5"
              color="text.secondary"
              sx={{ float: "center" }}
            >
              {dataState.listLoading
                ? "Preparando lista de imagens, aguarde por favor."
                : "Sem imagens disponíveis."}
            </Typography>
          )
        ) : (
          <Typography
            variant="h5"
            color="text.secondary"
            sx={{ float: "center" }}
          >
            Sem dados, carregue dados para iniciar.
          </Typography>
        )}
        {dataState.data &&
        state.listItems.length > 0 &&
        state.listItems.length !== dataState.maxItems ? (
          <Box
            sx={{ display: "flex", alignItems: "center" }}
            style={{ textAlign: "center" }}
          >
            <Box sx={{ width: 800, mr: 3 }}>
              <LinearProgress
                variant="determinate"
                value={state.listItems.length * 5}
              />
            </Box>
            <Box sx={{ minWidth: 35 }}>
              <Typography variant="body2" color="text.secondary">
                Carregando{" "}
                {state.listItems?.length + " de " + dataState.items?.length}
              </Typography>
            </Box>
          </Box>
        ) : (
          ""
        )}
      </div>

      <div>
        <Filters stopRef={stopRef} />
      </div>
    </div>
  );
}
