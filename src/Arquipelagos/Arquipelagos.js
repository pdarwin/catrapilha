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
import { Fragment, useEffect, useReducer, useState } from "react";
import { useNavigate } from "react-router-dom";
import configData from "../Config.json";

const initialState = {
  items: null,
  page: 0,
  listItems: null,
  tmpItems: null,
};

export default function Arquipelagos({ data, setData }) {
  const navigate = useNavigate();

  function reducer(state, action) {
    switch (action.type) {
      case "getItems":
        getItems(action.payload);
        return { ...state, items: null, page: action.payload };
      case "getItems_Success":
        return { ...state, listItems: null, items: action.payload };
      case "getMoreItems":
        getItems(action.payload);
        return { ...state, tmpItems: null };
      case "getMoreItems_Success":
        return { ...state, tmpItems: action.payload };
      case "getListItems_Success":
        return { ...state, listItems: action.payload };
      default:
        throw new Error();
    }
  }

  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    if (data !== null) {
      dispatch({ type: "getItems", payload: 1 });
      console.log("effect data items ", state.items);
    }
  }, [data]);

  useEffect(() => {
    //console.log("effect state items fora", state.items);
    if (state.items !== null) {
      //console.log("effect state items dentro", state.items);
      getListItems(state.items);
    }
  }, [state.items]);

  useEffect(() => {
    //console.log("effect state listitems fora", state.listItems);
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
          if (tmp.length >= 10) {
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
        }
      })
      .catch((error) => {
        alert(error);
      });
  }

  function getListItems(items) {
    //console.log("test", items);
    let listItems = [];
    let listItems2 = items;
    for (let element of listItems2) {
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
          dispatch({ type: "getListItems_Success", payload: listItems });
        })
        .catch((error) => {
          alert(error);
        });
    }
    //console.log("list", listItems);

    return listItems;
  }

  function before() {
    dispatch({ type: "getItems", payload: state.page - 1 });
  }
  function next() {
    dispatch({ type: "getItems", payload: state.page + 1 });
  }

  function test() {
    getListItems(state.items);
  }

  return (
    <Grid container>
      <ImageList
        sx={{ width: 1000, height: 400 }}
        cols={5}
        rowHeight={200}
        gap={1}
      >
        {state.listItems !== null
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
          {state.page > 1 ? (
            <Box>
              <Tooltip title={state.page - 1}>
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
          <Typography>{state.page}</Typography>
          <Tooltip title={state.page + 1}>
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
