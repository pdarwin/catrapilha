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
import { useNavigate } from "react-router-dom";
import configData from "../../Config.json";
import { useDataContext } from "../../Reducers/DataContext";
import { actionsD } from "../../Reducers/DataReducer";

const initialState = {
  listItems: null,
  loading: false,
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
  const [nItems] = useState(100);
  const { dataState, dataDispatch } = useDataContext();

  const navigate = useNavigate();

  const init = useCallback(() => {
    if (dataState.data) {
      state.listItems = [];
      state.nListItems = 0;
      getItems();
    }
  }, [dataState.data]);

  useEffect(() => {
    init();
  }, [init]);

  const getNextItem = useCallback(
    index => {
      state.loading = true;
      dataState.currentId = dataState.items[index].id;
      getItem(dataState.currentId);
    },
    [dataState, state, getItem]
  );

  useEffect(() => {
    if (state.nListItems) {
      getNextItem(state.nListItems);
    }
  }, [state.nListItems, getNextItem]);

  useEffect(() => {
    if (dataState.items && dataState.firstId === 0) {
      dataDispatch({
        type: actionsD.setFirstId,
        payload: dataState.items[0].id,
      });
      getNextItem(0);
    }
  }, [dataState.items, getNextItem, dataDispatch, dataState.firstId]);

  async function getItems() {
    try {
      const res = await fetch(
        "arqapi/wp-json/wp/v2/imagem?page=1&per_page=100",
        {
          headers: {
            "Content-type": "application/json",
            "User-Agent": configData["User-Agent"],
          },
        }
      );

      if (res.status !== 200) {
        throw new Error("Erro:" + res.status);
      }
      const items = await res.json();

      const filteredItems = items.filter(
        item => !dataState.data.Arquipelagos.includes(item.id)
      );
      dataDispatch({
        type: actionsD.updateItems,
        payload: items,
      });
    } catch (error) {
      alert(error);
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
      alert(error);
    }
  }

  function getListItem(item) {
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
        alert(error);
      });
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
                  dataDispatch({
                    type: actionsD.setCurrentId,
                    payload: item.id,
                  });
                  navigate("/item/");
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
      state.listItems.length !== nItems ? (
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
              Carregando {state.listItems.length + "de" + nItems}
            </Typography>
          </Box>
        </Box>
      ) : (
        ""
      )}
    </div>
  );
}
