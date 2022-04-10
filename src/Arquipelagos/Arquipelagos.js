import {
  Button,
  Grid,
  ImageList,
  ImageListItem,
  ImageListItemBar,
} from "@mui/material";
import { indigo } from "@mui/material/colors";
import * as React from "react";
import { useNavigate } from "react-router-dom";
import configData from "../Config.json";

export default function Arquipelagos() {
  const [pages, setPages] = React.useState();
  const [items, setItems] = React.useState([{}]);

  React.useEffect(() => {
    getItemList();
  }, []);

  React.useEffect(() => {
    console.log("Listening: ", pages);
    if (pages !== undefined) {
      getItemLinks();
    }
    console.log("Items: ", { items });
  }, [pages]);

  const navigate = useNavigate();

  function getItemList() {
    setPages(undefined);
    fetch("arqapi/wp-json/wp/v2/imagem?page=1", {
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
        setPages(parsedResponse);
      })
      .catch((error) => {
        alert(error);
      });
  }

  function getItemLinks() {
    setItems([{}]);
    for (let element of pages) {
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

          setItems((items) => [
            ...items,
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
    let newItems = orderItems(items);
    setItems(newItems);
    console.log("aqui", items);
    setPages(undefined);
  }

  const orderItems = (arr) => {
    return arr.sort(function (a, b) {
      if (parseInt(b.id) < parseInt(a.id)) {
        return -1;
      }
      if (parseInt(b.id) > parseInt(a.id)) {
        return 1;
      }
      return 0;
    }); // decrescente
  };

  function handleClick() {
    getItemLinks();
  }

  return (
    <Grid container>
      <ImageList
        sx={{ width: 1000, height: 400 }}
        cols={5}
        rowHeight={200}
        gap={1}
      >
        {items.map((item) =>
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

      {/*       {items
        ? items.map((item) =>
            item.id !== undefined ? (
              <Grid item xs={12} key={item.id}>
                <Typography variant="body1">ID: {item.id}</Typography>
                <Typography variant="body1">Html: {item.linkhtml}</Typography>
                <React.Fragment>
                  <div dangerouslySetInnerHTML={{ __html: item.linkhtml }} />
                  <div dangerouslySetInnerHTML={{ __html: item.rendered }} />
                </React.Fragment>
              </Grid>
            ) : (
              ""
            )
          )
        : ""} */}

      <Grid item xs={12}>
        <Button onClick={handleClick}>Página</Button>
      </Grid>
    </Grid>
  );
}
