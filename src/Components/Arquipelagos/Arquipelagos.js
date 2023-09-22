import React from "react";
import {
  Box,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  LinearProgress,
  Typography,
} from "@mui/material";
import { indigo } from "@mui/material/colors";
import { useEffect, useReducer, useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import configData from "../../Config.json";
import { useDataContext } from "../../Reducers/DataContext";
import { actionsD } from "../../Reducers/DataReducer";

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
  const [cancelToken, setCancelToken] = useState();
  const { dataState, dataDispatch } = useDataContext();
  const location = useLocation();

  const navigate = useNavigate();

  const init = () => {
    if (dataState.data) {
      state.listItems = [];
      state.nListItems = 0;
      setCancelToken(new AbortController());
      getItems(maxItems);
    }
  };

  useEffect(() => {
    init();
  }, [dataState.data, location]);

  useEffect(() => {
    if (dataState.data) {
      console.log("Total items:", arqItems.length);
      if (arqItems.length < maxItems) {
        console.log("Get more items:", maxItems - arqItems.length);
        getItems(maxItems - arqItems.length);
      } else {
        dataDispatch({
          type: actionsD.setFirstId,
          payload: arqItems[0].id,
        });
        dataDispatch({
          type: actionsD.updateItems,
          payload: arqItems,
        });
        processArqItems(arqItems, cancelToken)
          .then(() => {
            console.log("All items processed successfully");
          })
          .catch(error => {
            console.error("Error processing items:", error);
          });
      }
    }
  }, [arqItems.length]);

  async function getItems(n) {
    try {
      const page = n === maxItems ? 1 : 2;
      const url = `arqapi/wp-json/wp/v2/imagem?page=${page}&per_page=100`;

      const res = await fetch(url, {
        headers: {
          "Content-type": "application/json",
          "User-Agent": configData["User-Agent"],
        },
      });

      if (res.status !== 200) {
        throw new Error("Erro:" + res.status);
      }
      const items = await res.json();

      const filteredItems = items
        .filter(
          item =>
            !dataState.data.Arquipelagos.some(arqItem => arqItem.id === item.id)
        )
        .sort((a, b) => b.id - a.id); // Sort by id in descending order;
      if (n === maxItems) {
        setArqItems(filteredItems);
      } else {
        const topItems = filteredItems.slice(0, n); // Get the first 10 items
        setArqItems(arqItems.concat(topItems)); // Add to the dataset
      }
    } catch (error) {
      console.log(error);
    }
  }

  async function processArqItems(arqItems, cancelToken) {
    for (const item of arqItems) {
      if (cancelToken.signal.aborted) break;
      dataState.currentId = item.id;
      // Get the item.
      await getItem(item.id);
    }
  }

  async function getItem(item) {
    try {
      const res = await fetch("/arqapi/wp-json/wp/v2/imagem/" + item, {
        headers: {
          "Content-type": "application/json",
          "User-Agent": configData["User-Agent"],
        },
      });

      if (res.status !== 200) {
        throw new Error("Erro:" + res.status);
      }

      const parsed = await res.json();

      getListItem(parsed);
    } catch (error) {
      console.log("GetItem:", error);
    }
  }

  function getListItem(item) {
    if (cancelToken.signal.aborted) return;
    fetch(
      item._links["wp:featuredmedia"][0].href.replace(
        "https://www.arquipelagos.pt",
        "arqapi"
      )
    )
      .then(response => {
        if (response.status !== 200) {
          throw new Error("Erro:" + response.status);
        }
        return response.json();
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
    cancelToken.abort();
    state.listItems = [];
    navigate("/item/");
  }

  return (
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
              Carregando {state.listItems.length + " de " + maxItems}
            </Typography>
          </Box>
        </Box>
      ) : (
        ""
      )}
    </div>
  );
}
