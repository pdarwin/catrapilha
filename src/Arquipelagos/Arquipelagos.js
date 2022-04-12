import { NavigateBefore, NavigateNext } from "@mui/icons-material";
import {
  Box,
  Button,
  Grid,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  Tooltip,
  Typography,
} from "@mui/material";
import { indigo } from "@mui/material/colors";
import { useEffect, useReducer, useState } from "react";
import { useNavigate } from "react-router-dom";
import configData from "../Config.json";

const initialState = {
  items: null,
  listItems: null,
  tmpItems: null,
  loading: false,
};

const actions = {
  getItems_success: "getItems_success",
  getListItems_success: "getListItems_success",
  loaded: "loaded",
};

function reducer(state, action) {
  switch (action.type) {
    case actions.getItems_success:
      return { ...state, items: action.payload };
    case "getMoreItems_Success":
      return { ...state, tmpItems: action.payload, listItems: null };
    case actions.getListItems_success:
      return {
        ...state,
        items: null,
        listItems: action.payload,
        loading: true,
      };
    case actions.loaded:
      return { ...state, loading: false };
    default:
      throw new Error();
  }
}

export default function Arquipelagos({ data, setData }) {
  const [page, setPage] = useState(0);

  const navigate = useNavigate();

  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    if (data !== null) {
      setPage(1);
      console.log("effect data items ", state.items);
    }
  }, [data]);

  useEffect(() => {
    if (data !== null) {
      getItems(page);
      console.log("effect data items ", state.items);
    }
  }, [page]);

  useEffect(() => {
    //console.log("effect state items fora: items", state.items);
    //console.log("effect state items fora: listItems", state.listItems);
    if (state.items !== null) {
      console.log("effect state items dentro: items", state.items);
      console.log("effect state items dentro: listItems", state.listItems);
      getListItems();
    }
  }, [state.items]);

  useEffect(() => {
    console.log("effect state listitems fora", state.listItems);
    if (state.items !== null) {
      console.log("effect state listitems dentro", state.listItems);
      dispatch({ type: actions.loaded });
    }
  }, [state.listItems]);

  function getItems(page) {
    //console.log(page);
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
        if (state.items === null) {
          const tmp = parsedResponse.filter(
            (item) =>
              !data[0].Arquipelagos.some((element) => element.id === item.id)
          );
          console.log("antes do return", tmp.length);
          dispatch({ type: actions.getItems_success, payload: tmp });
        }
        /* if (tmp.length >= 10) {
            if (page === state.page) {
              console.log("sucesso à 1ª", state.page);
              dispatch({ type: "getItems_Success", payload: tmp });
            } else {
              console.log("teve items", state.page);
              dispatch({ type: "getMoreItems_Success", payload: tmp });
            }
          } else {
            console.log("faltam items, pede mais", state.page);
            dispatch({ type: "getMoreItems", payload: page + 1 });
            console.log("tmpItems1", state.tmpItems);
            if (state.tmpItems !== null) {
              let tmpItems = state.tmpItems;
              const tmp2 = tmpItems.filter(
                (item) =>
                  !data[0].Arquipelagos.some(
                    (element) => element.id === item.id
                  )
              );
              tmp2.map((item) => {
                tmp.push(item);
              });
              dispatch({ type: "getItems_Success", payload: tmp });
            } else {
              dispatch({ type: "getItems_Success", payload: tmp });
            }
          }
        } */
      })
      .catch((error) => {
        alert(error);
      });
  }

  function getListItems() {
    //console.log("test", items);
    let listItems = [];
    for (let element of state.items) {
      fetch(element.link.replace("https://www.arquipelagos.pt", "arqapi"))
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

          listItems.push({
            id: element.id,
            linkhtml: parsedResponse,
            image: testImg.exec(parsedResponse)[3],
            content: element.content.rendered,
            title: element.title.rendered,
          });
        })
        .catch((error) => {
          alert(error);
        });
    }
    //console.log("list", listItems);

    dispatch({ type: actions.getListItems_success, payload: listItems });
  }

  function before() {
    setPage(page - 1);
  }
  function next() {
    setPage(page + 1);
  }

  function test() {
    console.log(state.items);
    console.log(state.listItems);
    console.log(state.loading);
    dispatch({ type: actions.loaded });
  }

  console.log("renderizou ", page);
  console.log("renderizou ", state.listItems);

  return (
    <Grid container>
      <ImageList
        sx={{ width: 1000, height: 400 }}
        cols={5}
        rowHeight={200}
        gap={1}
      >
        {state.listItems !== null && state.listItems.length > 0
          ? state.listItems.map((item) => (
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
            ))
          : ""}
      </ImageList>
      <Grid item xs={12}>
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

          <Button onClick={test}>test</Button>
        </Grid>
      </Grid>
    </Grid>
  );
}
