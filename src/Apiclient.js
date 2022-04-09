import { Button } from "@mui/material";
import * as React from "react";
import configData from "./Config.json";

export default function Apiclient() {
  console.log(configData["Access token"]);

  function getUser() {
    fetch(
      "http://localhost:3000/w/api.php?action=query&meta=userinfo&format=json",
      {
        headers: {
          "Content-type": "application/json",
          Authorization: "Bearer " + configData["Access token"],
          "User-Agent": "Estapwiki/1.0 (User:DarwIn)",
        },
      }
    )
      .then((response) => {
        // Validar se o pedido foi feito com sucesso. Pedidos são feitos com sucesso normalmente quando o status é entre 200 e 299
        if (response.status !== 200) {
          throw new Error("Erro:" + response.status);
        }
        console.log(response);
        return response.json();
      })
      .then((parsedResponse) => {
        console.log(parsedResponse);
        alert(parsedResponse.query.userinfo.id);
      })
      .catch((error) => {
        alert(error);
      });
  }

  function handleClick() {
    getUser();
  }

  return (
    <Button variant="contained" onClick={handleClick}>
      Login
    </Button>
  );
}
