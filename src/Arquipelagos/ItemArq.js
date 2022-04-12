import {
  Button,
  FormControl,
  Grid,
  TextField,
  Typography,
} from "@mui/material";
import { Fragment, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import configData from "../Config.json";
import { CheckCircleOutline, RemoveCircleOutline } from "@mui/icons-material";

export default function ItemArq({
  modalControls,
  data,
  setData,
  tokenCSRF,
  getTokenCSRF,
}) {
  const [page, setPage] = useState();
  const [item, setItem] = useState([{}]);
  const [file, setFile] = useState();
  const [info, setInfo] = useState();
  const [filename, setFilename] = useState("");

  useEffect(() => {
    if (data !== null) {
      getItemList();
    }
  }, []);

  useEffect(() => {
    if (page !== undefined) {
      getItemLink();
    }
  }, [page]);

  useEffect(() => {
    if (tokenCSRF.token !== "") {
      console.log(tokenCSRF.token);
      //getFile();
    }
  }, [tokenCSRF]);

  useEffect(() => {
    if (file !== undefined) {
      console.log(tokenCSRF);
      upload();
    }
  }, [file]);

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
        //console.log(page);
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
          link: page.link,
          linkhtml: parsedResponse,
          image: testImg.exec(parsedResponse)[3],
          filename: testFilename.exec(parsedResponse)[3],
          content: page.content.rendered,
          title: page.title.rendered,
        });
        setFilename(
          testFilename
            .exec(parsedResponse)[3]
            .replace(".jpg", " - Image " + page.id + ".jpg")
        );
      })
      .catch((error) => {
        alert(error);
      });
  }

  function getFile() {
    fetch(item.image.replace("https://www.arquipelagos.pt", "/arqapi"), {})
      .then((response) => {
        // Validar se o pedido foi feito com sucesso. Pedidos são feitos com sucesso normalmente quando o status é entre 200 e 299
        if (response.status !== 200) {
          throw new Error("Erro:" + response.status);
        }
        //console.log(response);
        return response.blob();
      })
      .then((parsedResponse) => {
        //console.log(parsedResponse);
        setFile(parsedResponse);
      })
      .catch((error) => {
        alert(error);
      });
  }

  function upload() {
    const uploadParams = new FormData();
    uploadParams.append("file", file, {
      knownLength: file.size,
    });
    uploadParams.append("filename", filename);
    uploadParams.append("text", info);
    uploadParams.append("comment", "Uploaded with Catrapilha 1.0");
    uploadParams.append("token", tokenCSRF);

    fetch("/comapi/w/api.php?action=upload&format=json", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + configData["Access token"],
        "User-Agent": configData["User-Agent"],
      },
      body: uploadParams,
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
        if (parsedResponse.upload.result === "Warning") {
          modalControls.setErr("Imagem existente no Commons:");
          modalControls.setErrlink(
            "https://commons.wikimedia.org/wiki/File:" +
              (parsedResponse.upload.warnings.exists
                ? parsedResponse.upload.warnings.exists
                : parsedResponse.upload.warnings.duplicate)
          );
          modalControls.setErrLevel("warning");
          modalControls.handleOpen();
        }
        if (parsedResponse.upload.result === "Success") {
          modalControls.setErr("Upload bem sucedido. Imagem disponível em ");
          modalControls.setErrlink(
            "https://commons.wikimedia.org/wiki/File:" +
              parsedResponse.upload.filename
          );
          modalControls.setErrLevel("success");
          modalControls.handleOpen();
        }
      })
      .catch((error) => {
        alert(error);
      });
  }

  function buildInfo() {
    let desc = item.content;
    desc = desc
      .replace(/<p>/gi, "")
      .replace(/<\/p>/gi, "\n")
      .replace(/<br \/>/gi, "")
      .replace(/<b>/gi, "'''")
      .replace(/<\/b>/gi, "'''")
      .replace(/<em>/gi, "''")
      .replace(/<\/em>/gi, "''")
      .replace("\n'''", "'''\n")
      .replace("\n'''", "'''\n")
      .replace(/&#8220;/gi, "“")
      .replace(/&#8221;/gi, "”")
      .replace(/&#8217;/gi, "’");

    const testDate = new RegExp(
      '.*Data da Peça.*text-left" >(.*?)(</div>)',
      "s"
    );

    let date = testDate.exec(item.linkhtml)[1];
    if (date.includes("-00-00")) {
      date = date.replace("-00-00", "");
      date = date.replace(date, "{{circa|" + date + "}}");
    }

    const testAutor = new RegExp('.*Autor:.*?text-left">(.*?)(</div>)', "s");
    let autor = testAutor.exec(item.linkhtml)[1];

    setInfo(
      "=={{int:filedesc}}==\n{{Information\n|description={{pt|1=" +
        desc +
        "}}\n|date=" +
        date +
        "\n|source={{SourceArquipelagos|" +
        item.link +
        "}}\n|author=" +
        autor +
        "\n|permission=\n|other versions=\n}}\n\n" +
        "=={{int:license-header}}==\n{{PD-old-100-expired}}" +
        "\n\n[[Category:Uploaded with Catrapilha]]"
    );
  }

  function markN() {
    console.log(data);
    setData((data) => [
      ...data,
      {
        Arquipelagos: {
          id: item.id,
          status: "N",
        },
      },
    ]);
  }
  console.log(data);
  function markY() {
    console.log(data);
  }

  /*   function recurs(n) {
    if (n > 0) {
      let x = n + recurs(n - 1);
      return x;
    } else return n;
  } */

  return (
    <Grid container>
      <Grid item xs={12}>
        {item.id !== undefined ? (
          <Grid item xs={12} key={item.id}>
            <Typography variant="h5">{filename}</Typography>
            <Typography variant="body1">ID: {item.id}</Typography>
            <Fragment>
              <div dangerouslySetInnerHTML={{ __html: item.linkhtml }} />
            </Fragment>
          </Grid>
        ) : (
          ""
        )}
      </Grid>
      <Grid item xs={12}>
        <FormControl fullWidth>
          <TextField
            label="Filename"
            value={filename}
            onChange={(e) => {
              setFilename(e.target.value);
            }}
            style={{ backgroundColor: "white" }}
            type="text"
            required
          />
        </FormControl>
      </Grid>
      <Grid item xs={12}>
        <Typography component={"span"} variant="body1">
          <pre>{info}</pre>
        </Typography>
      </Grid>
      <Grid item xs={2}>
        <Button
          variant="contained"
          onClick={markN}
          size="small"
          sx={{ m: 1 }}
          style={{ float: "left" }}
          startIcon={<RemoveCircleOutline />}
          color="error"
        >
          Não carregar
        </Button>
      </Grid>
      <Grid item xs={3}>
        <Button
          variant="contained"
          onClick={markY}
          size="small"
          sx={{ m: 1 }}
          style={{ float: "left" }}
          startIcon={<CheckCircleOutline />}
          color="success"
        >
          Carregado
        </Button>
      </Grid>
      <Grid item xs={2}>
        <Button
          variant="contained"
          onClick={buildInfo}
          size="small"
          sx={{ m: 1 }}
          style={{ float: "right" }}
        >
          Descrição
        </Button>
      </Grid>
      <Grid item xs={3}>
        <Button
          variant="contained"
          onClick={getTokenCSRF}
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
