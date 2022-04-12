import { NavigateBefore, NavigateNext } from "@mui/icons-material";
import {
  Button,
  Grid,
  ImageList,
  ImageListItem,
  ImageListItemBar,
} from "@mui/material";
import { indigo } from "@mui/material/colors";
import { useEffect, useReducer, useState } from "react";
import { useNavigate } from "react-router-dom";
import configData from "../Config.json";

const initialState = {
  items: null,
  page: 0,
};

export default function Arquipelagos({ data, setData }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [listItems, setListItems] = useState([{}]);

  useEffect(() => {
    if (data !== null) {
      dispatch({ type: "getItems", payload: 1 });
    }
  }, [data]);

  useEffect(() => {
    console.log(state.items);
    if (state.items !== null) {
      getItemLinks();
    }
    //console.log("Items: ", { items });
  }, [state.items]);

  const navigate = useNavigate();

  function reducer(state, action) {
    switch (action.type) {
      case "getItems":
        getItems(action.payload);
        return { ...state, page: action.payload };
      case "getItems_Success":
        return { ...state, items: action.payload };
      default:
        throw new Error();
    }
  }

  function getItems(page) {
    console.log(page);
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
          console.log("antes do return", tmp);
          dispatch({ type: "getItems_Success", payload: tmp });
        } /* else {
          const tmp = getItems(pageN + 1).filter(
            (item) =>
              !data[0].Arquipelagos.some((element) => element.id === item.id)
          );
          const tmp2 = items;
          console.log(tmp2);
          tmp.map((item) => {
            tmp2.push(item);
          });
          dispatch({ type: "getItems_Success", payload: tmp2 });
        } */
      })
      .catch((error) => {
        alert(error);
      });
  }

  function getItemLinks() {
    setListItems([{}]);
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

          setListItems((listItems) => [
            ...listItems,
            {
              id: element.id,
              linkhtml: parsedResponse,
              image: testImg.exec(parsedResponse)[3],
              content: element.content.rendered,
              title: element.title.rendered,
            },
          ]);
        })

        .catch((error) => {
          alert(error);
        });
    }
  }

  function before() {
    dispatch({ type: "getItems", payload: state.page - 1 });
  }
  function next() {
    dispatch({ type: "getItems", payload: state.page + 1 });
  }

  return (
    <Grid container>
      <ImageList
        sx={{ width: 1000, height: 400 }}
        cols={5}
        rowHeight={200}
        gap={1}
      >
        {listItems.map((item) =>
          item.id !== undefined ? (
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
          ) : (
            ""
          )
        )}
      </ImageList>
      <Grid item xs={12}>
        <Button onClick={before} disabled={state.page < 2}>
          <NavigateBefore />
        </Button>
        <Button onClick={next}>
          <NavigateNext />
        </Button>
      </Grid>
    </Grid>
  );
}
