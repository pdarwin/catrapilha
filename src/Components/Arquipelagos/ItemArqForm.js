import {
  Button,
  Grid,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect } from "react";
import { useDataContext } from "../../Reducers/DataContext";
import { ErrorBoundary } from "react-error-boundary";
import { actionsD } from "../../Reducers/DataReducer";

export default function ItemArqForm() {
  const { dataState, dataDispatch } = useDataContext();

  useEffect(() => {
    if (dataState.item.id !== undefined && dataState.item.id !== 0) {
      buildInfo();
    }
  }, [dataState.item]);

  useEffect(() => {
    if (dataState.item.id !== undefined && dataState.item.id !== 0) {
      buildInfo();
    }
  }, [dataState.item.license]);

  function buildInfo() {
    console.log("buildInfo1", dataState.item);
    const item = dataState.item;

    try {
      item.description = item.description
        .replace(/<p (.*?)>/gi, "<p>")
        .replace(/<br \/>\n<\/strong>/gi, "</strong><br />\n")
        .replace(/<b>(.*?)<\/b>/gi, "'''$1'''")
        .replace(/<strong>(.*?)<\/strong>/gi, "'''$1'''")
        .replace(/<a class="normalBlackFont1".*>(.*?)<\/a>/gi, "$1")
        .replace(/<a name.*?>(.*?)<\/a>/gi, "$1")
        .replace(/<em>(.*?)<\/em>/gi, "''$1''")
        .replace(/<i>(.*?)<\/i>/gi, "''$1''")
        .replace(/&#8211;/gi, "–")
        .replace(/&#8216;/gi, "‘")
        .replace(/&#8217;/gi, "’")
        .replace(/&#8220;/gi, "“")
        .replace(/&#8221;/gi, "”")
        .replace(/&#8230;/gi, "…")
        .replace(/<span .*?>(.*?)<\/span>/gi, "$1")
        .replace(/<span .*?>/gi, "")
        .replace(/<\/span>/gi, "");
    } catch (error) {
      alert(error);
    }
    const testDate = new RegExp(
      ".*Data " +
        (true ? "da Peça" : "de Publicação") +
        '.*?text-left"\\s?>(.*?)(</div>)',
      "s"
    );

    let dateTmp = testDate.exec(dataState.item.linkhtml)[1];
    if (dateTmp.includes("-00-00")) {
      dateTmp = dateTmp.replace("-00-00", "").replace(" 00:00:00", "");
      dateTmp = dateTmp.replace(dateTmp, "{{circa|" + dateTmp + "}}");
    }
    item.date = dateTmp;

    let testAutor = new RegExp(
      '.*Autor da Imagem:.*?text-left">(.*?)(</div>)',
      "s"
    );
    if (
      testAutor.exec(dataState.item.linkhtml)[1] === "José Lemos Silva" ||
      testAutor.exec(dataState.item.linkhtml)[1] === "Rui Carita" ||
      testAutor.exec(dataState.item.linkhtml)[1] === "Virgílio Gomes"
    ) {
      item.license = "";
    } else {
      testAutor = new RegExp(
        ".*Autor" +
          (false ? " da Imagem" : "") +
          ':.*?text-left">(.*?)(</div>)',
        "s"
      );
    }
    item.author = testAutor.exec(dataState.item.linkhtml)[1];

    console.log("antes do Infopanel", dataState.item);
    item.infoPanel =
      "=={{int:filedesc}}==\n{{Information\n|description={{pt|1=" +
      item.description +
      "}}\n|date=" +
      (dataState.date == "" ? item.date : dataState.date) +
      "\n|source={{SourceArquipelagos|" +
      item.link +
      "}}\n|author=" +
      item.author +
      "\n|permission=\n|other versions=\n}}\n\n" +
      "=={{int:license-header}}==\n{{Arquipelagos license|" +
      (dataState.license == "CC-BY-SA 4.0" ? "" : dataState.license) +
      "}}\n\n" +
      "[[Category:Uploaded with Catrapilha]]\n" +
      dataState.categories;

    dataDispatch({
      type: actionsD.updateItem,
      payload: item,
    });
  }

  function buildFilename2() {
    let item = dataState.item;
    item.filename =
      item.description
        .substring(
          item.description.indexOf("'''") + 3,
          item.description.indexOf("'''", item.description.indexOf("'''") + 3)
        )
        .replace(".", "")
        .trim() +
      " - " +
      (dataState.date ? dataState.date : item.date) +
      " - Image " +
      item.id +
      ".jpg";
    dataDispatch({
      type: actionsD.updateItem,
      payload: item,
    });
  }

  function buildFilename1() {
    let item = dataState.item;
    let testFilename = new RegExp('<h5 class="card-title">(.*?)</h5>');

    let filename = testFilename
      .exec(dataState.item.linkhtml)[1]
      .replace(", ilha da Madeira", "")
      .replace(".", "")
      .trim();

    item.filename = filename + " - Image " + item.id + ".jpg";
    dataDispatch({
      type: actionsD.updateItem,
      payload: item,
    });
  }

  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        console.log("erro", error);
        console.log("erro", errorInfo);
      }}
    >
      <Grid container>
        <Grid item xs={8}>
          <Grid container>
            <Grid item xs={6}>
              <TextField
                value={dataState.item.filename}
                onChange={e => {
                  let item = dataState.item;
                  item.filename = e.target.value;
                  dataDispatch({
                    type: actionsD.updateItem,
                    payload: item,
                  });
                }}
                style={{
                  backgroundColor: "white",
                  height: 40,
                  width: 600,
                }}
                type="text"
                required
                sx={{ mx: 2 }}
                variant="filled"
              />
            </Grid>
            <Grid item xs={2}>
              <Button
                variant="contained"
                onClick={() => {
                  buildFilename1();
                }}
                size="small"
                style={{ float: "right" }}
              >
                Gerar 1
              </Button>
            </Grid>
            <Grid item xs={2}>
              <Button
                variant="contained"
                onClick={() => {
                  buildFilename2();
                }}
                size="small"
                style={{ float: "right" }}
              >
                Gerar 2
              </Button>
            </Grid>
          </Grid>
          <Grid container>
            <Grid item xs={2}>
              <Select
                value={dataState.license}
                label="Licença"
                onChange={e => {
                  dataState.license = e.target.value;
                  dataDispatch({
                    type: actionsD.updateLicense,
                    payload: dataState.license,
                  });
                  buildInfo();
                }}
                style={{ height: 30 }}
                sx={{ mx: 2 }}
              >
                <MenuItem value="PD-old-100-expired">
                  PD-old-100-expired
                </MenuItem>
                <MenuItem value="Art">Art</MenuItem>
                <MenuItem value="PD-Portugal-URAA">URAA</MenuItem>
                <MenuItem value="CC-BY-SA 4.0">CC-BY-SA 4.0</MenuItem>
                <MenuItem value="textlogo">Textlogo</MenuItem>
              </Select>
            </Grid>
            <Grid item xs={1}>
              <Typography variant="body2" style={{ float: "right" }}>
                Data:
              </Typography>
            </Grid>
            <Grid item xs={2}>
              <TextField
                value={dataState.date}
                onChange={e => {
                  dataState.date = e.target.value;
                  dataDispatch({
                    type: actionsD.updateDate,
                    payload: dataState.date,
                  });
                  buildInfo();
                }}
                style={{
                  backgroundColor: "white",
                }}
                type="text"
                sx={{ mx: 2 }}
                variant="filled"
              />
            </Grid>
            <Grid item xs={2}>
              <Typography variant="body1" style={{ float: "right" }}>
                ID: {dataState.item.id}
              </Typography>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={4}>
          <TextField
            label="Categorias"
            multiline
            value={dataState.categories}
            onChange={e => {
              dataState.categories = e.target.value;
              dataDispatch({
                type: actionsD.updateCategories,
                payload: dataState.categories,
              });
              buildInfo();
            }}
            style={{
              backgroundColor: "white",
              width: 400,
            }}
            type="text"
            sx={{ mx: 2 }}
            variant="filled"
            maxRows={4}
          />
        </Grid>
        <Grid item xs={12}>
          <Grid item xs={12}>
            <TextField
              label="Painel informativo"
              multiline
              defaultValue=""
              value={dataState.item.infoPanel}
              onChange={e => {
                let item = dataState.item;
                item.infoPanel = e.target.value;
                dataDispatch({
                  type: actionsD.updateItem,
                  payload: item,
                });
              }}
              style={{
                backgroundColor: "white",
              }}
              fullWidth
              variant="filled"
              InputProps={{ style: { fontSize: 15 } }}
            />
          </Grid>
        </Grid>
      </Grid>
    </ErrorBoundary>
  );
}
