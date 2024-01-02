import {
  Button,
  Grid,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { useDataContext } from "../../Reducers/DataContext";
import { actionsD } from "../../Reducers/DataReducer";

export default function ItemArqForm() {
  const { dataState, dataDispatch } = useDataContext();

  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    buildInfo();
  }, []);
  /* eslint-enable react-hooks/exhaustive-deps */

  function buildInfo() {
    const item = dataState.item;

    item.description = buildDescription(item.description);

    item.date =
      item.date === "" ? buildDate(dataState.item.linkhtml) : item.date;

    item.author = buildAuthor(dataState.item.linkhtml);

    item.license = item.license ?? getLicense(item.author, item.date);

    item.infoPanel =
      "=={{int:filedesc}}==\n{{Information\n|description={{pt|1=" +
      item.description +
      "}}\n|date=" +
      (dataState.date === "" ? item.date : dataState.date) +
      "\n|source={{SourceArquipelagos|" +
      item.link +
      "}}\n|author=" +
      item.author +
      "\n|permission=\n|other versions=\n}}\n\n" +
      "=={{int:license-header}}==\n{{Arquipelagos license|" +
      (item.license === "CC-BY-SA 4.0" ? "" : dataState.item.license) +
      "}}\n\n" +
      "[[Category:Uploaded with Catrapilha]]\n" +
      (item.author === "{{creator:Rui Carita}}"
        ? "[[Category:Photographs by Rui Carita]]\n"
        : item.author === "José Lemos Silva"
        ? "[[Category:Photographs by José Lemos Silva]]\n"
        : item.author === "Virgílio Gomes"
        ? "[[Category:Photographs by Virgílio Gomes]]\n"
        : item.author === "{{creator:Perestrellos Photographos}}"
        ? "[[Category:Photographs by Perestrellos Photographos in ABM]]\n"
        : "") +
      dataState.categories.replace(
        "[[Category:Diário de Notícias (Madeira)]]",
        "[[Category:Diário de Notícias (Madeira)|" + item.date + "]]"
      ) +
      (dataState.categories.indexOf(
        "[[Category:Diário de Notícias (Madeira)]]"
      ) !== -1
        ? "\n[[Category:" + item.date + "]]"
        : "");

    dataDispatch({
      type: actionsD.updateItem,
      payload: item,
    });
  }

  const buildDescription = description => {
    return description
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
      .replace(/<\/span>/gi, "")
      .replace(/'''\s'''/gi, " ")
      .replace(/''''''/gi, '"');
  };

  const buildAuthor = linkhtml => {
    // Define a regular expression pattern to extract the author
    let authorPattern = /.*Autor da Imagem:.*?text-left">(.*?)(<\/div>)/s;
    // Try to extract the author using the pattern
    let authorMatch = authorPattern.exec(linkhtml);
    let author = authorMatch[1].trim();

    authorPattern = /.*Autor:.*?text-left">(.*?)(<\/div>)/s;
    authorMatch = authorPattern.exec(linkhtml);
    let author2 = authorMatch[1].replace(/<\/?i>/gi, "").trim();

    if (author === "Rui Carita" || author === "Perestrellos Photographos") {
      return "{{creator:" + author + "}}";
    } else if (
      author === "Fotografia Vicentes" ||
      author2 === "Vicentes Photographos"
    ) {
      return "{{creator:Photographia Vicente}}";
    } else if (
      author === "Perestellos Fotógrafos" ||
      author === "ABM/ARM/Perestrellos" ||
      dataState.item.description.indexOf("Fotografia ''Perestrellos''") !== -1
    ) {
      return "{{creator:Perestrellos Photographos}}";
    } else if (author === "Foto Figueiras") {
      return "{{creator:Foto Figueiras}}";
    } else if (author === "ABM/ARM") {
      return dataState.item.description;
    } else if (
      author === "Arquivo Regional da Madeira" ||
      author === "Privado"
    ) {
      return author2;
    } else if (
      author === "José Lemos Silva" ||
      author === "Virgílio Gomes" ||
      author === "Gilberto Garrido"
    ) {
      return author;
    } else if (
      dataState.categories.indexOf(
        "[[Category:Diário de Notícias (Madeira)]]"
      ) !== -1
    ) {
      return "Diário de Notícias (Madeira)";
    } else {
      return author;
    }
  };

  const buildDate = linkhtml => {
    // Define a regular expression pattern to extract the date
    const datePattern = new RegExp(
      ".*Data " +
        (true ? "da Peça" : "de Publicação") +
        '.*?text-left"\\s?>(.*?)(</div>)',
      "s"
    );

    // Try to extract the date using the pattern
    const dateMatch = datePattern.exec(linkhtml);

    if (dateMatch && dateMatch.length >= 2) {
      let date = dateMatch[1].replace(" 00:00:00", "");

      if (date.includes("-00-00")) {
        date = date.replace("-00-00", "");
      }

      if (dataState.item.title.includes("(c.)")) {
        date = date.replace(date, "{{circa|" + date + "}}");
      }

      return date;
    } else {
      // Return a default value or handle the case where the date is not found
      return "Unknown Date";
    }
  };

  const getLicense = (author, date) => {
    const currentYear = new Date().getFullYear();
    const authorIsKnown =
      author === "José Lemos Silva" ||
      author === "{{creator:Rui Carita}}" ||
      author === "Virgílio Gomes" ||
      author === "Gilberto Garrido";

    const dateYear = parseInt(date.substring(0, 4), 10);

    if (authorIsKnown) {
      return "CC-BY-SA 4.0";
    } else if (currentYear - dateYear < 95) {
      return "PD-Portugal-URAA";
    } else {
      return "PD-old-100-expired";
    }
  };

  const buildFilename2 = () => {
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
  };

  const buildFilename1 = () => {
    let item = dataState.item;
    let testFilename = new RegExp('<h5 class="card-title">(.*?)</h5>');

    let filename = testFilename
      .exec(dataState.item.linkhtml)[1]
      .replace(", ilha da Madeira", "")
      .replace(/:/gi, " -")
      .trim();

    item.filename = (filename + " - Image " + item.id + ".jpg").replace(
      /\.\s-/gi,
      " -"
    );
    dataDispatch({
      type: actionsD.updateItem,
      payload: item,
    });
  };

  const insertCirca = () => {
    let item = dataState.item;
    item.date = "{{circa|" + item.date + "}}";
    buildInfo();
  };

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
            <Grid item xs={1}>
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
            <Grid item xs={1}>
              <Button
                variant="contained"
                onClick={() => {
                  insertCirca();
                }}
                size="small"
                style={{ float: "right" }}
              >
                Circa
              </Button>
            </Grid>
          </Grid>
          <Grid container>
            <Grid item xs={2}>
              <Select
                value={dataState.item.license || ""}
                label="Licença"
                onChange={e => {
                  dataState.item.license = e.target.value;
                  dataDispatch({
                    type: actionsD.updateLicense,
                    payload: dataState.item.license,
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
