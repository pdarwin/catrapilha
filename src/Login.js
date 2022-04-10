import { Grid, Typography } from "@mui/material";
import * as React from "react";
import configData from "./Config.json";

export default function Login() {
  const [user, setUser] = React.useState();

  React.useEffect(() => {
    getUser();
  }, []);

  function getUser() {
    fetch("comapi/w/api.php?action=query&meta=userinfo&format=json", {
      headers: {
        "Content-type": "application/json",
        Authorization: "Bearer " + configData["Access token"],
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
        //console.log(parsedResponse);
        setUser(parsedResponse.query.userinfo.name);
      })
      .catch((error) => {
        alert(error);
      });
  }

  return (
    <Grid container>
      <Grid item xs={12}>
        <Typography align="right" p={2}>
          User: {user}
        </Typography>
      </Grid>
    </Grid>
  );
}
