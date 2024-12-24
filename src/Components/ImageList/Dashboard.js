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
import { useEffect, useReducer, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useDataContext } from "../../Reducers/DataContext";
import { actionsD } from "../../Reducers/DataReducer";
import Filters from "../Filters";
import { fetchListItems } from "./ListServices";

const initialState = {
  listItems: [],
  items: [],
  page: 1,
  totalPages: 0,
};

const actions = {
  updateListItems: "updateListItems",
  resetState: "resetState",
};

function reducer(state, action) {
  switch (action.type) {
    case actions.updateListItems:
      return {
        ...state,
        listItems: [...state.listItems, ...action.payload],
      };
    case actions.resetState:
      return {
        ...initialState,
      };
    default:
      throw new Error(`Unhandled action type: ${action.type}`);
  }
}

export default function Dashboard({ stopRef }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { dataState, dataDispatch } = useDataContext();
  const navigate = useNavigate();
  const cancelLoadItemRef = useRef(null);

  // Ref to hold the current items without triggering re-renders
  const itemsRef = useRef(dataState.items);
  const isInitRunning = useRef(false);

  // Update the ref whenever dataState.items changes
  useEffect(() => {
    itemsRef.current = dataState.items;
    // Reset the listItems state when the component is mounted or dataState.items changes
    dispatch({ type: actions.resetState });
    if (Array.isArray(dataState.items) && dataState.items.length > 0) {
      dispatch({
        type: actions.updateListItems,
        payload: dataState.items, // Pass the array directly
      });
    }
  }, [dataState.items]);

  const initVariables = async () => {
    dispatch({ type: actions.resetState });
    cancelLoadItemRef.current = new AbortController();
  };

  const init = async () => {
    isInitRunning.current = true;
    try {
      await initVariables();
      if (dataState.filter === "/CLEAR/") {
        dataDispatch({
          type: actionsD.setFilter,
          payload: "",
        });
      } else {
        await fetchListItems(dataState, dataDispatch);
      }
    } catch (error) {
      console.error("Error in init():", error);
    } finally {
      isInitRunning.current = false; // Always reset the flag
    }
  };

  useEffect(() => {
    if (!isInitRunning.current && !dataState.projectReseted) {
      init();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataState.projectReseted]);

  const clickItem = item => {
    dataDispatch({
      type: actionsD.setCurrentId,
      payload: item.id,
    });
    navigate(`/item/${item.id}`);
  };

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
                  title={
                    typeof item.title === "string"
                      ? item.title.replace("&#8217;", "'")
                      : "Untitled"
                  }
                  placement="top"
                >
                  <ImageListItem>
                    <img
                      src={item.imagelink}
                      alt={
                        typeof item.title === "string" ? item.title : "Image"
                      }
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
          ) : dataState.listLoading ? (
            <Typography
              variant="h5"
              color="text.secondary"
              sx={{ textAlign: "center" }}
            >
              Preparando lista de imagens, aguarde por favor.
            </Typography>
          ) : (
            <Typography
              variant="h5"
              color="text.secondary"
              sx={{ textAlign: "center" }}
            >
              Sem imagens disponíveis.
            </Typography>
          )
        ) : (
          <Typography
            variant="h5"
            color="text.secondary"
            sx={{ textAlign: "center" }}
          >
            Sem dados, carregue dados para iniciar.
          </Typography>
        )}

        {dataState.data &&
        state.listItems.length > 0 &&
        state.listItems.length < dataState.maxItems ? (
          <Box
            sx={{ display: "flex", alignItems: "center" }}
            style={{ textAlign: "center" }}
          >
            <Box sx={{ width: 800, mr: 3 }}>
              <LinearProgress
                variant="determinate"
                value={(state.listItems.length / dataState.maxItems) * 100}
              />
            </Box>
            <Box sx={{ minWidth: 35 }}>
              <Typography variant="body2" color="text.secondary">
                Carregando {state.listItems.length} de {dataState.maxItems}
              </Typography>
            </Box>
          </Box>
        ) : null}
      </div>

      <div>
        <Filters stopRef={stopRef} />
      </div>
    </div>
  );
}
