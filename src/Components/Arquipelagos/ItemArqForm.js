import { Grid, MenuItem, Select, TextField, Typography } from "@mui/material";
import { useEffect } from "react";
import { useDataContext } from "../../Reducers/DataContext";
import { ErrorBoundary } from "react-error-boundary";

export default function ItemArqForm() {
  const { dataState, dataDispatch } = useDataContext();

  useEffect(() => {
    if (dataState.item.id !== 0) {
      console.log("data entrando no form item", dataState.data);
      buildInfo();
    }
  }, [dataState.item]);

  function buildInfo() {
    console.log("buildInfo1", dataState.item);
    dataState.item.description = dataState.item.description
      .replace(/<b>/gi, "'''")
      .replace(/<\/b>/gi, "'''")
      .replace(/<em>/gi, "''")
      .replace(/<\/em>/gi, "''")
      .replace(/&#8220;/gi, "“")
      .replace(/&#8221;/gi, "”")
      .replace(/&#8217;/gi, "’")
      .replace(/<strong>/gi, "'''")
      .replace(/<\/strong>/gi, "'''")
      .replace(/<br \/>\n'''/gi, "'''<br />\n");

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
    dataState.item.date = dateTmp;

    const testAutor = new RegExp(
      ".*Autor" + (false ? " da Imagem" : "") + ':.*?text-left">(.*?)(</div>)',
      "s"
    );
    dataState.item.author = testAutor.exec(dataState.item.linkhtml)[1];

    dataState.item.infoPanel =
      "=={{int:filedesc}}==\n{{Information\n|description={{pt|1=" +
      dataState.item.description +
      "}}\n|date=" +
      dataState.item.date +
      "\n|source={{SourceArquipelagos|" +
      dataState.item.link +
      "}}\n|author=" +
      dataState.item.author +
      "\n|permission=\n|other versions=\n}}\n\n" +
      "=={{int:license-header}}==\n{{Arquipelagos license|" +
      dataState.item.license +
      "}}" +
      "\n\n[[Category:Uploaded with Catrapilha]]";
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
          <Typography variant="h6" style={{ float: "left" }}>
            Nome: {dataState.item.filename}
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="body1" style={{ float: "right" }}>
            ID: {dataState.item.id}
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Grid item xs={12}>
            <Typography component={"span"} variant="body1">
              <pre>{dataState.item.infoPanel}</pre>
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Select
              value={""}
              label="Licença"
              onChange={(event) => {
                dataState.item.license = event.target.value;
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
              value={dataState.item.filename}
              onChange={(e) => {
                dataState.item.filename = e.target.value;
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
        </Grid>
      </Grid>
    </ErrorBoundary>
  );
}
