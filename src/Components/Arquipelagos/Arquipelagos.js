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
  listItems: null,
  nListItems: 0,
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
    case actions.loaded:
      return { ...state, loading: false };
    default:
      throw new Error();
  }
}

export default function Arquipelagos(getData) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [maxItems] = useState(100);
  const [arqItems, setArqItems] = useState([]);
  const [filter, setFilter] = useState();
  const { dataState, dataDispatch } = useDataContext();
  const location = useLocation();

  const navigate = useNavigate();

  useEffect(() => {
    if (dataState.data) {
      state.cancelToken = new AbortController();
      async function getMoreItems() {
        let items = [];
        let i = 1;
        while (items.length < maxItems) {
          console.log("Total items at " + i + " iteration:", items.length);
          const n = maxItems - items.length;
          console.log("Getting more items:", n);

          try {
            const newItems = await getItems(i);
            items = [...items, ...newItems.slice(0, n)];
          } catch (error) {
            console.log("Error:", error);
          }

          console.log("Total items now:", items.length);

          if (items.length === maxItems) {
            setArqItems(items);
            dataDispatch({
              type: actionsD.setFirstId,
              payload: items[0].id,
            });
            dataDispatch({
              type: actionsD.updateItems,
              payload: items,
            });
            state.listItems = [];
            state.nListItems = 0;
            state.page = 1;
            processArqItems(items)
              .then(() => {
                console.log("All items processed successfully");
              })
              .catch(error => {
                console.error("Error processing items:", error);
              });
          }

          i++;
        }
      }
      getMoreItems();
    }
  }, [dataState.data, location, filter]);

  async function getItems(page) {
    try {
      const res = await axios.get(`arqapi/wp-json/wp/v2/imagem`, {
        params: {
          page: page,
          per_page: maxItems,
        },
      });
      if (res.status !== 200) {
        throw new Error("Erro:" + res.status);
      }

      const items = res.data;
      let filteredItems = items
        .filter(
          item =>
            !dataState.data.Arquipelagos.some(arqItem => arqItem.id === item.id)
        )
        .sort((a, b) => b.id - a.id); // Sort by id in descending order;
      if (filter) {
        filteredItems = filteredItems.filter(item => {
          return (
            item.title.rendered.includes(filter) ||
            item.content.rendered.includes(filter)
          );
        });
      }
      return filteredItems;
    } catch (error) {
      console.log(error);
    }
  }

  async function processArqItems(items) {
    for (const item of items) {
      if (state.cancelToken.signal.aborted) break;
      dataState.currentId = item.id;
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
    <div>
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
        }}
      >
        {dataState.data && state.listItems ? (
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
            Sem dados, carregue dados para iniciar.
          </Typography>
        )}
        {dataState.data &&
        state.listItems &&
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
                Carregando {state.listItems.length + " de " + arqItems.length}
              </Typography>
            </Box>
          </Box>
        ) : (
          ""
        )}
      </div>
      <Filters setFilter={setFilter} />
    </div>
  );
}
