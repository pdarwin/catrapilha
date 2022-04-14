import { NavigateBefore, NavigateNext } from "@mui/icons-material";
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
import configData from "../Config.json";

const initialState = {
  items: [],
  listItems: [],
  tmpItems: [],
  loading: false,
};

const actions = {
  updateItems: "updateItems",
  addListItem: "addListItem",
};

function reducer(state, action) {
  switch (action.type) {
    case actions.updateItems:
      return { ...state, items: action.payload, listItems: [] };
    case actions.addListItem:
      return {
        ...state,
        listItems: [...state.listItems, action.payload],
        loading: true,
      };
    case actions.loaded:
      return { ...state, loading: false };
    default:
      throw new Error();
  }
}

export default function Arquipelagos({ data, setData }) {
  const [page, setPage] = useState(1);

  const navigate = useNavigate();

  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    console.log("aquI", data);
    if (data !== null) {
      setPage(1);
    }
  }, []);

  useEffect(() => {
    console.log("aquI2", data);
    if (data !== null) {
      console.log("aquI3", data);
      setPage(1);
    }
  }, [data]);

  useEffect(() => {
    if (data !== null) {
      getItems(page);
    }
  }, [page]);

  useEffect(() => {
    if (state.items.length > 0) {
      getListItems();
    }
  }, [state.items]);

  function getItems(page) {
    fetch("arqapi/wp-json/wp/v2/imagem?page=" + page, {
      headers: {
        "Content-type": "application/json",
        "User-Agent": configData["User-Agent"],
      },
    })
      .then((response) => {
        // Validar se o pedido foi feito com sucesso. Pedidos são feitos com sucesso normalmente quando o status é entre 200 e 299
        if (response.status !== 200) {
          throw new Error("Erro:" + response.status);
        }
        //console.log(response);
        return response.json();
      })
      .then((parsedResponse) => {
        const tmp = parsedResponse.filter(
          (item) =>
            !data[0].Arquipelagos.some((element) => element.id === item.id)
        );
        console.log("antes do return", tmp.length);
        dispatch({ type: actions.updateItems, payload: tmp });
      })
      .catch((error) => {
        alert(error);
      });
  }

  function getListItems() {
    for (let item of state.items) {
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

          dispatch({
            type: actions.addListItem,
            payload: {
              id: item.id,
              linkhtml: parsedResponse,
              image: testImg.exec(parsedResponse)[3],
              content: item.content.rendered,
              title: item.title.rendered,
            },
          });
        })
        .catch((error) => {
          alert(error);
        });
    }
  }

  function before() {
    setPage(page - 1);
  }
  function next() {
    setPage(page + 1);
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
      {data !== null ? (
        <ImageList
          sx={{ width: 1000, height: 400 }}
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
                  navigate("/item/" + item.id);
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
      {state.listItems.length !== state.items.length ? (
        <Box
          sx={{ display: "flex", alignItems: "center" }}
          style={{ float: "center" }}
        >
          <Box sx={{ width: 800, mr: 3 }}>
            <LinearProgress
              variant="determinate"
              value={state.listItems.length * 10}
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
      {data !== null ? (
        <Grid container>
          {page > 1 ? (
            <Box>
              <Tooltip title={page - 1}>
                <Button onClick={before} disabled={false}>
                  <NavigateBefore />
                </Button>
              </Tooltip>
            </Box>
          ) : (
            <Button onClick={before} disabled>
              <NavigateBefore />
            </Button>
          )}
          <Typography>{page}</Typography>
          <Tooltip title={page + 1}>
            <Button onClick={next}>
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
