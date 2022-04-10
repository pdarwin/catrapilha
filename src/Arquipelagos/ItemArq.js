import { Button, Grid, Typography } from "@mui/material";
import * as React from "react";
import { useNavigate, useParams } from "react-router-dom";
import configData from "../Config.json";

export default function ItemArq({ modalControls }) {
  const [page, setPage] = React.useState();
  const [item, setItem] = React.useState([{}]);
  const [token, setToken] = React.useState();

  React.useEffect(() => {
    getItemList();
  }, []);

  React.useEffect(() => {
    if (page !== undefined) {
      getItemLink();
    }
  }, [page]);

  React.useEffect(() => {
    if (token !== undefined) {
      console.log(token);
      upload();
    }
  }, [token]);

  const navigate = useNavigate();

  const params = useParams();

  function getItemList() {
    setPage(undefined);
    fetch("/arqapi/wp-json/wp/v2/imagem?page=1", {
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
        console.log(response);
        return response.json();
      })
      .then((parsedResponse) => {
        parsedResponse.map((element) => {
          if (parseInt(element.id) === parseInt(params.id)) {
            setPage(element);
          }
        });
        console.log(page);
      })
      .catch((error) => {
        alert(error);
      });
  }

  function getItemLink() {
    fetch(page.link.replace("https://www.arquipelagos.pt", "/arqapi"))
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
        const testFilename = new RegExp('(.*)(/(.*?)" class="card-img mb-2")');

        setItem({
          id: page.id,
          linkhtml: parsedResponse,
          image: testImg.exec(parsedResponse)[3],
          filename: testFilename.exec(parsedResponse)[3],
          content: page.content.rendered,
          title: page.title.rendered,
        });
      })

      .catch((error) => {
        alert(error);
      });
  }

  function upload() {
    const formdata = new FormData();
    formdata.append("file", {
      uri: item.image,
      type: "image/jpeg",
      name: item.filename,
      token: encodeURIComponent(token),
    });

    let bodyParts = {
      token: token,
      "Content-Disposition":
        formdata + '; name="file"; filename="' + item.filename + '"',
      filename: item.filenam,
    };

    var formBody = [];

    for (let bodyPart in bodyParts) {
      let encodedKey = encodeURIComponent(bodyPart);
      let encodedValue = encodeURIComponent(bodyParts[bodyPart]);
      formBody.push(encodedKey + "=" + encodedValue);
    }

    formBody = formBody.join("&");
    console.log(formBody);

    fetch("/comapi/w/api.php?action=upload&format=json", {
      method: "POST",
      headers: {
        "Content-type": "multipart/form-data",
        Authorization: "Bearer " + configData["Access token"],
        "User-Agent": configData["User-Agent"],
      },
      body: formdata,
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
        console.log(parsedResponse);
        if (parsedResponse.error) {
          modalControls.setErr(
            parsedResponse.error.code + ": " + parsedResponse.error.info
          );
          modalControls.setErrLevel("error");
          modalControls.handleOpen();
        }
      })
      .catch((error) => {
        alert(error);
      });
  }

  function getToken() {
    fetch("/comapi/w/api.php?action=query&format=json&meta=tokens", {
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
        setToken(parsedResponse.query.tokens.csrftoken);
      })
      .catch((error) => {
        alert(error);
      });
  }

  return (
    <Grid container>
      <Grid item xs={12}>
        {item.id !== undefined ? (
          <Grid item xs={12} key={item.id}>
            <Typography variant="body1">ID: {item.id}</Typography>
            <React.Fragment>
              <div dangerouslySetInnerHTML={{ __html: item.linkhtml }} />
            </React.Fragment>
          </Grid>
        ) : (
          ""
        )}
      </Grid>
      <Grid item xs={10}>
        <Button
          variant="contained"
          onClick={getToken}
          size="small"
          sx={{ m: 1 }}
          style={{ float: "right" }}
        >
          Carregar no Commons
        </Button>
      </Grid>
      <Grid item xs={2}>
        <Button
          variant="contained"
          onClick={() => {
            navigate(-1);
          }}
          size="small"
          sx={{ m: 1 }}
          style={{ float: "right" }}
        >
          Voltar
        </Button>
      </Grid>
    </Grid>
  );
}
