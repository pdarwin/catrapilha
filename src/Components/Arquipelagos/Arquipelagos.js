import { FirstPage, NavigateBefore, NavigateNext } from "@mui/icons-material";
import {
  Box,
  Button,
  Grid,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  LinearProgress,
  Tooltip,
  Typography,
} from "@mui/material";
import { indigo } from "@mui/material/colors";
import { useEffect, useReducer, useState } from "react";
import { useNavigate } from "react-router-dom";
import configData from "../../Config.json";
import { useDataContext } from "../../Reducers/DataContext";
import { useModalContext } from "../../Reducers/ModalContext";
import { actionsM } from "../../Reducers/ModalReducer";
import { actionsD } from "../../Reducers/DataReducer";

const initialState = {
  items: null,
  listItems: null,
  tmpItems: null,
  loading: false,
  nListItems: 0,
};

const actions = {
  addTmpItems: "addTmpItems",
  updateItems: "updateItems",
  addListItem: "addListItem",
};

function reducer(state, action) {
  switch (action.type) {
    case actions.updateItems:
      console.log("updateitems", action.payload);
      return {
        ...state,
        items: action.payload,
        listItems: null,
        nListItems: 0,
        tmpItems: null,
      };
    case actions.addTmpItems:
      console.log("addTmpItems", action.payload);
      return { ...state, tmpItems: action.payload, items: null };
    case actions.addListItem:
      //console.log("addlistitem", state.listItems, action.payload);
      return {
        ...state,
        listItems: action.payload,
        nListItems: action.payload.length,
        loading: true,
      };
    case actions.loaded:
      return { ...state, loading: false };
    default:
      throw new Error();
  }
}

export default function Arquipelagos() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [page, setPage] = useState(1);
  const { dataState, dataDispatch } = useDataContext();
  const { modalState, modalDispatch } = useModalContext();

  const navigate = useNavigate();

  useEffect(() => {
    //console.log("aqui", dataState.data);
    if (dataState.data) {
      setPage(1);
    }
  }, []);

  useEffect(() => {
    //console.log("aqui2", dataState.data);
    if (dataState.data) {
      //console.log("aqui3", dataState.data);

      getItems(page);
    }
  }, [dataState.data]);

  useEffect(() => {
    console.log("useeffect página: ", page);
    if (dataState.data) {
      //console.log("useeffect página2: ", page);
      getItems(page);
    }
  }, [page]);

  useEffect(() => {
    //console.log("useeffect stateitems ", state.items.length);
    if (state.items) {
      getListItem(state.items[0]);
    }
  }, [state.items]);

  useEffect(() => {
    console.log("useeffect listitems ", state.listItems);
    if (
      state.nListItems > 0 &&
      state.items &&
      state.nListItems < state.items.length
    ) {
      getListItem(state.items[state.listItems.length]);
    }
  }, [state.nListItems]);

  function getItems(page) {
    console.log("puxando items da página " + page);
    fetch(
      "arqapi/wp-json/wp/v2/imagem?page=" +
        page +
        (state.tmpItems ? "&per_page=50" : ""),
      {
        headers: {
          "Content-type": "application/json",
          "User-Agent": configData["User-Agent"],
        },
      }
    )
      .then((response) => {
        // Validar se o pedido foi feito com sucesso. Pedidos são feitos com sucesso normalmente quando o status é entre 200 e 299
        if (response.status !== 200) {
          throw new Error("Erro:" + response.status);
        }
        //console.log(response);
        return response.json();
      })
      .then((parsedResponse) => {
        console.log("parsed", parsedResponse);
        const tmp = parsedResponse.filter(
          (item) =>
            !dataState.data[0].Arquipelagos.some(
              (element) => element.id === item.id
            )
        );
        console.log("tmp", tmp);
        // Sem tmp
        if (!state.tmpItems) {
          // Fez os 10
          if (tmp.length === 10) {
            console.log("Fez os 10");
            dispatch({ type: actions.updateItems, payload: tmp });
          } else if (tmp.length < 10) {
            // Não fez os 10
            console.log("Não fez os 10");
            dispatch({ type: actions.addTmpItems, payload: tmp });
            setPage(page === 1 ? 1 : page + 1);
          } else {
            modalDispatch({
              type: actionsM.fireModal,
              payload: {
                msg:
                  "Algo estranho aconteceu. Tamanho da fila de items:" +
                  tmp.length,
                level: "error",
              },
            });
          }
        } else {
          //console.log("entrou em recuperação", tmp, state.tmpItems);
          console.log(
            "entrou com tmpitems: " +
              state.tmpItems.length +
              " e novos items: " +
              tmp.length
          );
          const n = 10 - state.tmpItems.length;
          const tmp2 = state.tmpItems;
          tmp.map((element, i) => {
            if (i < n) {
              tmp2.push(element);
            }
          });
          if (tmp2.length < 10) {
            console.log("Não fez os 10 - 2");
            dispatch({ type: actions.addTmpItems, payload: tmp2 });
            setPage(page + 1);
          } else {
            console.log("antes do return", tmp2.length);
            dispatch({ type: actions.updateItems, payload: tmp2 });
          }
        }
      })
      .catch((error) => {
        alert(error);
      });
  }

  function getListItem(item) {
    fetch(item.link.replace("https://www.arquipelagos.pt", "arqapi"))
      .then((response) => {
        // Validar se o pedido foi feito com sucesso. Pedidos são feitos com sucesso normalmente quando o status é entre 200 e 299
        if (response.status !== 200) {
          throw new Error("Erro:" + response.status);
        }
        //console.log(response);
        return response.text();
      })
      .then((parsedResponse) => {
        const testImg = new RegExp(
          '(.*)(<img src="(.*?)" class="card-img mb-2")'
        );

        //console.log("antes de tudo", state.listItems);

        const tmp = state.listItems ? state.listItems : [];

        //console.log("antes do push", item.id, tmp);

        tmp.push({
          id: item.id,
          linkhtml: parsedResponse,
          image: testImg.exec(parsedResponse)[3],
          content: item.content.rendered,
          title: item.title.rendered,
        });

        //console.log("depois do push", tmp);

        dispatch({
          type: actions.addListItem,
          payload: tmp,
        });
      })
      .catch((error) => {
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
        <ImageList
          sx={{ width: 1000, height: 600 }}
          cols={5}
          rowHeight={200}
          gap={5}
        >
          {state.listItems.map((item) => (
            <ImageListItem key={item.id}>
              <img
                src={item.image}
                loading="lazy"
                onClick={() => {
                  dataDispatch({
                    type: actionsD.setCurrentId,
                    payload: item.id,
                  });
                  navigate("/item/");
                }}
                style={{ cursor: "pointer" }}
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
      state.items &&
      state.listItems.length !== state.items.length ? (
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
              Carregando {state.listItems.length + "de" + state.items.length}
            </Typography>
          </Box>
        </Box>
      ) : (
        ""
      )}
      {dataState.data ? (
        <Grid container>
          <Tooltip title="Página inicial">
            <Button
              onClick={() => {
                setPage(1);
              }}
              style={{ float: "left" }}
            >
              <FirstPage />
            </Button>
          </Tooltip>
          {page > 1 ? (
            <Box>
              <Tooltip title={page - 1}>
                <Button
                  onClick={() => {
                    setPage(page - 1);
                  }}
                  disabled={false}
                  style={{ float: "left" }}
                >
                  <NavigateBefore />
                </Button>
              </Tooltip>
            </Box>
          ) : (
            <Button disabled style={{ float: "left" }}>
              <NavigateBefore />
            </Button>
          )}
          <Typography style={{ float: "left" }}>{page}</Typography>
          <Tooltip title={page + 1}>
            <Button
              onClick={() => {
                setPage(page + 1);
              }}
              style={{ float: "left" }}
            >
              <NavigateNext />
            </Button>
          </Tooltip>
        </Grid>
      ) : (
        ""
      )}
    </div>
  );
}
