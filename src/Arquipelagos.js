import { Box, Button, Grid, Typography } from "@mui/material";
import * as React from "react";
import configData from "./Config.json";

export default function Arquipelagos() {
  const [user, setUser] = React.useState();
  const [pages, setPages] = React.useState();
  const [items, setItems] = React.useState([{}]);

  React.useEffect(() => {
    getUser();
    getItemList();
  }, []);

  React.useEffect(() => {
    console.log("Listening: ", pages);
    if (pages != undefined) {
      getItemLinks();
    }
    console.log("Items: " + items);
  }, [pages]);

  function getUser() {
    fetch("comapi/w/api.php?action=query&meta=userinfo&format=json", {
      headers: {
        "Content-type": "application/json",
        Authorization: "Bearer " + configData["Access token"],
        "User-Agent":
          "Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US) AppleWebKit/525.13 (KHTML, like Gecko) Chrome/0.A.B.C Safari/525.13",
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
        //console.log(parsedResponse);
        setUser(parsedResponse.query.userinfo.name);
      })
      .catch((error) => {
        alert(error);
      });
  }

  function getItemList() {
    fetch("arqapi/wp-json/wp/v2/imagem?page=1", {
      headers: {
        "Content-type": "application/json",
        "User-Agent":
          "Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US) AppleWebKit/525.13 (KHTML, like Gecko) Chrome/0.A.B.C Safari/525.13",
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
    //let newItems = [];

    pages.map((element) => {
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
          //newItems.push(parsedResponse);
          setItems((items) => [...items, { linkhtml: parsedResponse }]);
        })
        .catch((error) => {
          alert(error);
        });
    });
    //console.log(newItems);

    console.log(items);
  }

  function handleClick() {
    getItemLinks();
  }

  return (
    <Grid container>
      <Grid item xs={12}>
        <Typography align="right" p={2}>
          User: {user}
        </Typography>
      </Grid>
      <Grid item xs={12}>
        {pages
          ? pages.map((page) => (
              <React.Fragment key={page.id}>
                <div
                  dangerouslySetInnerHTML={{ __html: page.content.rendered }}
                />
              </React.Fragment>
            ))
          : ""}
      </Grid>
      <Grid item xs={12}>
        {items
          ? items.map((item) => (
              <React.Fragment>
                <div dangerouslySetInnerHTML={{ __html: item.linkhtml }} />
              </React.Fragment>
            ))
          : ""}
      </Grid>
      <Grid item xs={12}>
        <Button onClick={handleClick}>Página</Button>
      </Grid>
    </Grid>
  );
}
