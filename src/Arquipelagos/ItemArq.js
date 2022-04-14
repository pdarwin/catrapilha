import {
  Box,
  Button,
  CircularProgress,
  Grid,
  TextField,
  Typography,
} from "@mui/material";
import { Fragment, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import configData from "../Config.json";
import { CheckCircleOutline, RemoveCircleOutline } from "@mui/icons-material";
import { actions } from "../ModalReducer";
import { useCustomContext } from "../CustomContext";

export default function ItemArq({ data, setData, tokenCSRF, getTokenCSRF }) {
  const [rawItem, setRawItem] = useState();
  const [item, setItem] = useState([{}]);
  const [file, setFile] = useState();
  const [info, setInfo] = useState();
  const [filename, setFilename] = useState("");
  const [loading, setLoading] = useState(false);
  const { modalState, modalDispatch } = useCustomContext();

  useEffect(() => {
    if (data !== null) {
      setLoading(true);
      getItem();
    }
  }, []);

  useEffect(() => {
    if (rawItem !== undefined) {
      buildItem();
    }
  }, [rawItem]);

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

  function getItem() {
    setRawItem(undefined);
    fetch("/arqapi/wp-json/wp/v2/imagem/" + params.id, {
      headers: {
        "Content-type": "application/json",
        "User-Agent": configData["User-Agent"],
      },
    })
      .then((response) => {
        // Validar se o pedido foi feito com sucesso. Pedidos são feitos com sucesso normalmente quando o status é entre 200 e 299
        if (response.status !== 200) {
          modalDispatch({
            type: actions.fireModal,
            payload: {
              msg: response.status + ": " + response.statusText + "(getItem)",
              level: "error",
            },
          });
        }
        console.log(response);
        return response.json();
      })
      .then((parsedResponse) => {
        setRawItem(parsedResponse);
      })
      .catch((error) => {
        alert(error);
      });
  }

  function buildItem() {
    fetch(rawItem.link.replace("https://www.arquipelagos.pt", "/arqapi"))
      .then((response) => {
        // Validar se o pedido foi feito com sucesso. Pedidos são feitos com sucesso normalmente quando o status é entre 200 e 299
        if (response.status !== 200) {
          modalDispatch({
            type: actions.fireModal,
            payload: {
              msg: response.status + ": " + response.statusText + "(buildItem)",
              level: "error",
            },
          });
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
          id: rawItem.id,
          link: rawItem.link,
          linkhtml: parsedResponse,
          image: testImg.exec(parsedResponse)[3],
          filename: testFilename.exec(parsedResponse)[3],
          content: rawItem.content.rendered,
          title: rawItem.title.rendered,
        });
        setFilename(
          testFilename
            .exec(parsedResponse)[3]
            .replace(".jpg", " - Image " + rawItem.id + ".jpg")
        );
        setLoading(false);
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
          modalDispatch({
            type: actions.fireModal,
            payload: {
              msg: response.status + ": " + response.statusText + "(Upload)",
              level: "error",
            },
          });
        }
        //console.log(response);
        return response.json();
      })
      .then((parsedResponse) => {
        console.log(parsedResponse);
        if (parsedResponse.error) {
          modalDispatch({
            type: actions.fireModal,
            payload: {
              msg: parsedResponse.error.code + ": " + parsedResponse.error.info,
              level: "error",
            },
          });
        }
        if (parsedResponse.upload.result === "Warning") {
          modalDispatch({
            type: actions.fireModal,
            payload: {
              msg: "Imagem existente no Commons:",
              level: "warning",
              link:
                "https://commons.wikimedia.org/wiki/File:" +
                (parsedResponse.upload.warnings.exists
                  ? parsedResponse.upload.warnings.exists
                  : parsedResponse.upload.warnings.duplicate),
            },
          });
        }
        if (parsedResponse.upload.result === "Success") {
          modalDispatch({
            type: actions.fireModal,
            payload: {
              msg: "Upload bem sucedido. Imagem disponível em ",
              level: "success",
              link:
                "https://commons.wikimedia.org/wiki/File:" +
                parsedResponse.upload.filename,
            },
          });
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

  function remove(type) {
    let tmp = data;
    if (
      tmp[0].Arquipelagos.filter((element) => element.id === item.id).length ===
      0
    ) {
      tmp[0].Arquipelagos.push({
        id: item.id,
        status: type,
      });

      setData(tmp);
    }
  }

  /*   function recurs(n) {
    if (n > 0) {
      let x = n + recurs(n - 1);
      return x;
    } else return n;
  } */

  return (
    <Grid container>
      {item.linkhtml !== "" && loading === false ? (
        <Grid container>
          <Grid item xs={2}>
            <Button
              variant="contained"
              onClick={() => {
                remove("N");
              }}
              size="small"
              sx={{ m: 1 }}
              style={{ float: "left" }}
              startIcon={<RemoveCircleOutline />}
              color="error"
            >
              Não carregar
            </Button>
          </Grid>
          <Grid item xs={8}>
            <Button
              variant="contained"
              onClick={() => {
                remove("Y");
              }}
              size="small"
              sx={{ m: 1 }}
              style={{ float: "left" }}
              startIcon={<CheckCircleOutline />}
              color="success"
            >
              Já no Commons
            </Button>
          </Grid>
          <Grid>
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
          <Grid item xs={12}>
            {item.id !== undefined ? (
              <Grid item xs={12} key={item.id}>
                <Fragment>
                  <div dangerouslySetInnerHTML={{ __html: item.linkhtml }} />
                </Fragment>
              </Grid>
            ) : (
              ""
            )}
          </Grid>

          <Grid item xs={6}>
            <Typography variant="h6" style={{ float: "left" }}>
              Nome: {filename}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body1" style={{ float: "right" }}>
              ID: {item.id}
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Alterar"
              value={filename}
              onChange={(e) => {
                setFilename(e.target.value);
              }}
              style={{ backgroundColor: "white" }}
              type="text"
              required
              fullWidth
            />
            <Grid item xs={12}>
              <Typography component={"span"} variant="body1">
                <pre>{info}</pre>
              </Typography>
            </Grid>
            <Grid container>
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
            </Grid>
          </Grid>
        </Grid>
      ) : (
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
          }}
        >
          <CircularProgress
            style={{ float: "center" }}
            size={200}
            thickness={15}
          />
          <Typography variant="body2" color="text.secondary">
            Loading...
          </Typography>
        </div>
      )}
    </Grid>
  );
}
