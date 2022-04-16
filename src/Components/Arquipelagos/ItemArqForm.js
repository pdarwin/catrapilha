import { Grid, MenuItem, Select, TextField, Typography } from "@mui/material";
import { useEffect } from "react";
import { useDataContext } from "../../Reducers/DataContext";
import { ErrorBoundary } from "react-error-boundary";
import { actionsD } from "../../Reducers/DataReducer";

export default function ItemArqForm() {
  const { dataState, dataDispatch } = useDataContext();

  useEffect(() => {
    if (dataState.item.id !== undefined && dataState.item.id !== 0) {
      console.log("data entrando no form item", dataState.item.id);
      buildInfo();
    }
  }, [dataState.item]);

  useEffect(() => {
    if (dataState.item.id !== undefined && dataState.item.id !== 0) {
      console.log("data entrando no form item", dataState.item.id);
      buildInfo();
    }
  }, [dataState.item.license]);

  function buildInfo() {
    console.log("buildInfo1", dataState.item);
    const item = dataState.item;

    try {
      item.description = item.description
        .replace(/<b>/gi, "'''")
        .replace(/<\/b>/gi, "'''")
        .replace(/<em>/gi, "''")
        .replace(/<\/em>/gi, "''")
        .replace(/<i>/gi, "''")
        .replace(/<\/i>/gi, "''")
        .replace(/&#8220;/gi, "“")
        .replace(/&#8221;/gi, "”")
        .replace(/&#8217;/gi, "’")
        .replace(/<strong>/gi, "'''")
        .replace(/<\/strong>/gi, "'''")
        .replace(/<span .*>/gi, "")
        .replace(/<\/span>/gi, "")
        .replace(/<br \/>\n'''/gi, "'''<br />\n");
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

    const testAutor = new RegExp(
      ".*Autor" + (false ? " da Imagem" : "") + ':.*?text-left">(.*?)(</div>)',
      "s"
    );
    item.author = testAutor.exec(dataState.item.linkhtml)[1];

    console.log("antes do Infopanel", dataState.item);
    item.infoPanel =
      "=={{int:filedesc}}==\n{{Information\n|description={{pt|1=" +
      item.description +
      "}}\n|date=" +
      item.date +
      "\n|source={{SourceArquipelagos|" +
      item.link +
      "}}\n|author=" +
      item.author +
      "\n|permission=\n|other versions=\n}}\n\n" +
      "=={{int:license-header}}==\n{{Arquipelagos license|" +
      item.license +
      "}}" +
      "\n\n[[Category:Uploaded with Catrapilha]]";

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
        <Grid item xs={6}>
          <TextField
            label=""
            value={dataState.item.filename}
            onChange={(e) => {
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
        <Grid item xs={4}>
          <Select
            defaultValue="old"
            value={dataState.item.license}
            label="Licença"
            onChange={(e) => {
              let item = dataState.item;
              item.license = e.target.value;
              console.log("alterou licença", item);
              dataDispatch({
                type: actionsD.updateItem,
                payload: item,
              });
            }}
            style={{ height: 30 }}
          >
            <MenuItem value="old">PD-old-100-expired</MenuItem>
            <MenuItem value="URAA">URAA</MenuItem>
            <MenuItem value="">CC-BY-SA 4.0</MenuItem>
            <MenuItem value="textlogo">Textlogo</MenuItem>
          </Select>
        </Grid>
        <Grid item xs={2}>
          <Typography variant="body1" style={{ float: "right" }}>
            ID: {dataState.item.id}
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Grid item xs={12}>
            <TextField
              label="Painel informativo"
              multiline
              defaultValue=""
              value={dataState.item.infoPanel}
              onChange={(e) => {
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
            />
          </Grid>
        </Grid>
      </Grid>
    </ErrorBoundary>
  );
}
