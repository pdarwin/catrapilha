import {
  Box,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  LinearProgress,
  Typography,
} from "@mui/material";
import { indigo } from "@mui/material/colors";
import axios from "axios";
import React, { useEffect, useReducer, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDataContext } from "../../Reducers/DataContext";
import { actionsD } from "../../Reducers/DataReducer";
import Filters from "../Filters";

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

export default function Arquipelagos() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [maxItems] = useState(100);
  const { dataState, dataDispatch } = useDataContext();
  const location = useLocation();

  const navigate = useNavigate();

  useEffect(() => {
    if (dataState.data) {
      // Actualiza a lista de items filtrando os items processados e carregando novos

      if (dataState.items) {
        state.items = !dataState.previousFilter ? dataState.items : [];
      }
      state.listItems = [];
      state.page = 1;
      getAllItems().catch(error => {
        console.error("Error getting more items:", error);
      });
      dataState.previousFilter = "";
    }
  }, [dataState.data, location, dataState.filter]);

  async function getAllItems() {
    let i = dataState.root;
    while (state.items.length < maxItems) {
      await getMoreItems(i)
        .then(() => {
          processArqItems(state.tmpItems)
            .then(() => {
              console.log("All items processed successfully");
            })
            .catch(error => {
              console.error("Error processing items:", error);
            });
        })
        .catch(error => {
          console.error("Error getting more items:", error);
        });
      i++;
    }
  }

  async function getMoreItems(i) {
    state.cancelToken = new AbortController();
    console.log("Total items at " + i + " iterations:", state.items.length);
    dataDispatch({
      type: actionsD.updateIterations,
      payload: i,
    });
    const n = maxItems - state.items.length;
    console.log("Getting more items:", n);

    try {
      const newItems = await getItems(i);
      state.items = [...state.items, ...newItems.slice(0, n)];
      state.tmpItems = newItems.slice(0, n);
    } catch (error) {
      console.log("Error:", error);
    }

    console.log("Total items now:", state.items.length);

    if (state.items.length === maxItems) {
      dataDispatch({
        type: actionsD.setFirstId,
        payload: state.items[0].id,
      });
      dataDispatch({
        type: actionsD.updateItems,
        payload: state.items,
      });
    }
  }

  async function getItems(page) {
    try {
      const res = await axios.get(`arqapi/wp-json/wp/v2/imagem`, {
        params: {
          page: page,
          per_page: 100,
        },
      });
      if (res.status !== 200) {
        throw new Error("Erro:" + res.status);
      }

      const items = res.data;
      let filteredItems = items
        .filter(
          item =>
            !dataState.data.Arquipelagos.some(
              arqItem => arqItem.id === item.id
            ) ||
            item.content.rendered.indexOf("Garrido") !== -1 ||
            item.excerpt.rendered.indexOf("Garrido") !== -1 ||
            item.title.rendered.indexOf("Garrido") !== -1
        )
        .sort((a, b) => b.id - a.id); // Sort by id in descending order;
      if (dataState.filter) {
        filteredItems = filteredItems.filter(item => {
          return (
            item.title.rendered.includes(dataState.filter) ||
            item.content.rendered.includes(dataState.filter)
          );
        });
      }
      return filteredItems.slice(0, maxItems);
    } catch (error) {
      console.log(error);
    }
  }

  async function processArqItems(items) {
    for (const item of items) {
      if (state.cancelToken.signal.aborted) break;
      // Get the item.
      await getItem(item.id);
    }
  }

  async function getItem(item) {
    try {
      const res = await axios.get(`/arqapi/wp-json/wp/v2/imagem/${item}`, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (res.status !== 200) {
        throw new Error("Erro:" + res.status);
      }

      const parsed = await res.data;

      getListItem(parsed);
    } catch (error) {
      console.log("GetItem:", error);
      if (error.response.status === 400) {
        state.cancelToken.abort();
      }
    }
  }

  function getListItem(item) {
    if (state.cancelToken.signal.aborted) return;
    axios
      .get(
        item._links["wp:featuredmedia"][0].href.replace(
          "https://www.arquipelagos.pt",
          "arqapi"
        )
      )
      .then(response => {
        if (response.status !== 200) {
          throw new Error("Erro:" + response.status);
        }
        return response.data;
      })
      .then(parsed => {
        const tmp = state.listItems;
        tmp.push({
          id: item.id,
          image: parsed.media_details.sizes.medium
            ? parsed.media_details.sizes.medium.source_url
            : parsed.media_details.sizes.full.source_url,
          title: item.title.rendered,
        });

        state.listItems = tmp;
        dispatch({
          type: actions.updateNListItems,
        });
      })
      .catch(error => {
        console.log("GetListItem:", error);
      });
  }

  function clickItem(item) {
    dataDispatch({
      type: actionsD.setCurrentId,
      payload: item.id,
    });
    state.cancelToken.abort();
    state.listItems = [];
    navigate("/item/");
  }

  return (
    <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
      <div style={{ width: "60%", paddingLeft: 20 }}>
        {dataState.data ? (
          state.listItems.length > 0 ? (
            <ImageList sx={{ width: 1000, height: 550 }} cols={5} gap={5}>
              {state.listItems.map(item => (
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
              ))}
            </ImageList>
          ) : (
            <Typography
              variant="h5"
              color="text.secondary"
              style={{ float: "center" }}
            >
              Preparando lista de imagens, aguarde por favor.
            </Typography>
          )
        ) : (
          <Typography
            variant="h5"
            color="text.secondary"
            style={{ float: "center" }}
          >
            Sem dados, carregue dados para iniciar.
          </Typography>
        )}
        {dataState.data &&
        state.listItems.length > 0 &&
        state.listItems.length !== maxItems ? (
          <Box
            sx={{ display: "flex", alignItems: "center" }}
            style={{ float: "center" }}
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

      <div style={{ borderWidth: 1, borderColor: "black" }}>
        <Filters />
      </div>
    </div>
  );
}
