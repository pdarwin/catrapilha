import {
  Button,
  CircularProgress,
  FormControl,
  Grid,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { Fragment, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import configData from "../../Config.json";
import {
  ArrowBackIos,
  ArrowForwardIos,
  CheckCircleOutline,
  RemoveCircleOutline,
} from "@mui/icons-material";
import { useModalContext } from "../../Reducers/ModalContext";
import { actionsM } from "../../Reducers/ModalReducer";
import { actionsD } from "../../Reducers/DataReducer";
import { useDataContext } from "../../Reducers/DataContext";

export default function ItemArq({ getTokenCSRF }) {
  const [rawItem, setRawItem] = useState(null);
  const [item, setItem] = useState([{}]);
  const [file, setFile] = useState();
  const [info, setInfo] = useState();
  const [filename, setFilename] = useState("");
  const [license, setLicense] = useState("old");
  const [loading, setLoading] = useState(false);
  const [ignorewarnings, setIgnoreWarnings] = useState(false);
  const { modalState, modalDispatch } = useModalContext();
  const { dataState, dataDispatch } = useDataContext();

  const navigate = useNavigate();

  useEffect(() => {
    //console.log("início", dataState.currentId);
  }, []);

  useEffect(() => {
    if (dataState.currentId !== 0) {
      //console.log("alterou currentId", dataState.currentId);
      if (
        dataState.data[0].Arquipelagos.filter(
          (element) => element.id === dataState.currentId
        ).length === 0
      ) {
        setLoading(true);
        getItem();
      } else {
        dataDispatch({
          type: dataState.forward ? actionsD.moveForward : actionsD.moveBack,
        });
      }
    } else {
      navigate("/");
    }
  }, [dataState.currentId]);

  useEffect(() => {
    console.log("rawItem fora", rawItem);
    if (rawItem !== null) {
      console.log("rawItem dentro", rawItem);
      buildItem();
    }
  }, [rawItem]);

  useEffect(() => {
    if (item.image !== undefined && dataState.tokenCSRF.token !== "") {
      console.log("item", item);
      console.log(dataState.tokenCSRF.token);
      getFile();
    }
  }, [dataState.tokenCSRF]);

  useEffect(() => {
    if (
      dataState.data !== null &&
      dataState.data[0].Arquipelagos.length - dataState.initialCounter === 50
    ) {
      console.log("Autosave");
      //getFile();
    }
  }, [dataState.data]);

  useEffect(() => {
    if (file !== undefined) {
      console.log(dataState.tokenCSRF);
      upload();
    }
  }, [file]);

  useEffect(() => {
    if (rawItem) {
      buildInfo();
    }
  }, [license]);

  function getItem() {
    console.log("get item", dataState.currentId);
    fetch("/arqapi/wp-json/wp/v2/imagem/" + dataState.currentId, {
      headers: {
        "Content-type": "application/json",
        "User-Agent": configData["User-Agent"],
      },
    })
      .then((response) => {
        // Validar se o pedido foi feito com sucesso. Pedidos são feitos com sucesso normalmente quando o status é entre 200 e 299
        if (response.status !== 200) {
        }
        return response.json();
      })
      .then((parsedResponse) => {
        if (parsedResponse.data) {
          if (parsedResponse.data.status === 404) {
            wait(
              10000,
              dataDispatch({
                type: dataState.forward
                  ? actionsD.moveForward
                  : actionsD.moveBack,
              })
            );
          } else if (parsedResponse.data.status === 401) {
            modalDispatch({
              type: actionsM.fireModal,
              payload: {
                msg: "Não existem imagens nas imediações, voltando à lista principal.",
                level: "info",
              },
            });
            navigate("/");
          } else {
            console.log("getitem", parsedResponse);
            modalDispatch({
              type: actionsM.fireModal,
              payload: {
                msg:
                  "Erro " +
                  parsedResponse.data.status +
                  ": Code: " +
                  parsedResponse.code +
                  ", Message: " +
                  parsedResponse.message,
                level: "error",
              },
            });
          }
        } else {
          setRawItem(parsedResponse);
        }
      })
      .catch((error) => {
        alert(error);
      });
  }

  function buildItem() {
    console.log("entrou no buildItem", rawItem);
    fetch(rawItem.link.replace("https://www.arquipelagos.pt", "/arqapi"))
      .then((response) => {
        // Validar se o pedido foi feito com sucesso. Pedidos são feitos com sucesso normalmente quando o status é entre 200 e 299
        if (response.status !== 200) {
          modalDispatch({
            type: actionsM.fireModal,
            payload: {
              msg: response.status + ": " + response.statusText + "(buildItem)",
              level: "error",
            },
          });
          return Promise.reject(response);
        }
        console.log("builditem responde", response);
        return response.text();
      })
      .then((parsedResponse) => {
        //console.log("builditem", parsedResponse);
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
        //alert(error);
      });
  }

  function getFile() {
    console.log("getFile", item);
    console.log(item.image);
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
    console.log("Upload: ", dataState.tokenCSRF.token);
    const uploadParams = new FormData();
    uploadParams.append("file", file, {
      knownLength: file.size,
    });
    uploadParams.append("filename", filename);
    uploadParams.append("text", info);
    if (ignorewarnings) {
      uploadParams.append("ignorewarnings", true);
      setIgnoreWarnings(false);
    }
    uploadParams.append("comment", "Uploaded with Catrapilha 1.0");
    uploadParams.append("token", dataState.tokenCSRF.token);

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
            type: actionsM.fireModal,
            payload: {
              msg: response.status + ": " + response.statusText + "(Upload)",
              level: "error",
            },
          });
        }
        console.log(response);
        return response.json();
      })
      .then((parsedResponse) => {
        console.log(parsedResponse);
        if (parsedResponse.error) {
          modalDispatch({
            type: actionsM.fireModal,
            payload: {
              msg: parsedResponse.error.code + ": " + parsedResponse.error.info,
              level: "error",
            },
          });
        }
        if (parsedResponse.upload.result === "Warning") {
          let msg;
          if (parsedResponse.upload.warnings.exists) {
            modalDispatch({
              type: actionsM.fireModal,
              payload: {
                msg: "Imagem já existente no Commons:",
                level: "warning",
                link:
                  "https://commons.wikimedia.org/wiki/File:" +
                  parsedResponse.upload.warnings.exists,
              },
            });
          } else if (parsedResponse.upload.warnings.duplicate) {
            modalDispatch({
              type: actionsM.fireModal,
              payload: {
                msg: "Imagem duplicada no Commons:",
                level: "warning",
                link:
                  "https://commons.wikimedia.org/wiki/File:" +
                  parsedResponse.upload.warnings.duplicate,
              },
            });
          } else if (parsedResponse.upload.warnings["was-deleted"]) {
            modalDispatch({
              type: actionsM.fireModal,
              payload: {
                msg: "Imagem apagada no Commons:",
                level: "warning",
                link:
                  "https://commons.wikimedia.org/wiki/File:" +
                  parsedResponse.upload.warnings["was-deleted"],
              },
            });
          }
        }
        if (parsedResponse.upload.result === "Success") {
          modalDispatch({
            type: actionsM.fireModal,
            payload: {
              msg: "Upload bem sucedido. Imagem disponível em ",
              level: "success",
              link:
                "https://commons.wikimedia.org/wiki/File:" +
                parsedResponse.upload.filename,
            },
          });
          remove("Y");
        }
      })
      .catch((error) => {
        alert(error);
      });
  }

  function buildInfo() {
    console.log(item.content);
    let desc = item.content;
    desc = desc
      .split("<br>")
      .join("\n")
      .split("<br />")
      .join("\n")
      .replace(/<p>/gi, "")
      .replace(/<\/p>/gi, "")
      .replace(/<b>/gi, "'''")
      .replace(/<\/b>/gi, "'''")
      .replace(/<em>/gi, "''")
      .replace(/<\/em>/gi, "''")
      .replace(/&#8220;/gi, "“")
      .replace(/&#8221;/gi, "”")
      .replace(/&#8217;/gi, "’")
      .replace(/<strong>/gi, "'''")
      .replace(/<\/strong>/gi, "'''")
      .replace(/\n'''/gi, "'''\n");

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
        "=={{int:license-header}}==\n{{Arquipelagos license|" +
        license +
        "}}" +
        "\n\n[[Category:Uploaded with Catrapilha]]"
    );
  }

  function remove(type) {
    let tmp = dataState.data;
    if (
      tmp[0].Arquipelagos.filter((element) => element.id === item.id).length ===
      0
    ) {
      tmp[0].Arquipelagos.push({
        id: item.id,
        status: type,
      });
      dataDispatch({
        type: actionsD.updateData,
        payload: tmp,
      });
      dataDispatch({
        type: dataState.forward ? actionsD.moveForward : actionsD.moveBack,
      });
    }
  }

  function wait(milliseconds, foo, arg) {
    setTimeout(function () {
      foo(arg); // will be executed after the specified time
    }, milliseconds);
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
          <Grid item xs={3}>
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
              Já existe no Commons
            </Button>
          </Grid>
          <Grid item xs={2}>
            <Button
              variant="contained"
              onClick={() => {
                dataDispatch({
                  type: actionsD.moveBack,
                });
              }}
              size="small"
              sx={{ m: 1 }}
              style={{ float: "left" }}
              startIcon={<ArrowBackIos />}
            >
              Anterior
            </Button>{" "}
          </Grid>
          <Grid item xs={4}>
            <Button
              variant="contained"
              onClick={() => {
                dataDispatch({
                  type: actionsD.moveForward,
                });
              }}
              size="small"
              sx={{ m: 1 }}
              style={{ float: "left" }}
              startIcon={<ArrowForwardIos />}
            >
              Próxima
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
            <Grid item xs={12}>
              <Typography component={"span"} variant="body1">
                <pre>{info}</pre>
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Select
                value={license}
                label="Licença"
                onChange={(event) => {
                  setLicense(event.target.value);
                }}
                style={{ height: 30 }}
              >
                <MenuItem value="old">PD-old-100-expired</MenuItem>
                <MenuItem value="URAA">URAA</MenuItem>
                <MenuItem value="">CC-BY-SA 4.0</MenuItem>
                <MenuItem value="textlogo">Textlogo</MenuItem>
              </Select>
              <TextField
                label="Alterar"
                value={filename}
                onChange={(e) => {
                  setFilename(e.target.value);
                }}
                style={{
                  backgroundColor: "white",
                  height: 50,
                  width: 500,
                }}
                type="text"
                required
                sx={{ mx: 2 }}
              />
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
              <Grid item xs={3}>
                <Button
                  variant="contained"
                  onClick={() => {
                    setIgnoreWarnings(true);
                    getTokenCSRF();
                  }}
                  size="small"
                  sx={{ m: 1 }}
                  style={{ float: "right" }}
                >
                  Ignorar avisos
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
