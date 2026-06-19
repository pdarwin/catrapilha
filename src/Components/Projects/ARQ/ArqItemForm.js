import {
  Box,
  Button,
  Grid,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { useDataContext } from "../../../Reducers/DataContext";
import { actionsD } from "../../../Reducers/DataReducer";

export default function ArqItemForm() {
  const { dataState, dataDispatch } = useDataContext();

  useEffect(() => {
    if (dataState.item?.id && dataState.item?.linkhtml) {
      buildInfo();
    }
    // eslint-disable-next-line
  }, [dataState.item?.id, dataState.item?.linkhtml]);

  const authorIsKnown = author => {
    return (
      author === "José Lemos Silva" ||
      author === "Lemos Silva" ||
      author === "{{creator:Rui Carita}}" ||
      author === "Virgílio Gomes" ||
      author === "Gilberto Garrido" ||
      author === "João Carita"
    );
  };

  const buildInfo = (itemOverride = null, extraState = {}) => {
    const item = {
      ...dataState.item,
      ...(itemOverride || {}),
    };

    const effectiveDate =
      extraState.date !== undefined ? extraState.date : dataState.date;

    const effectiveAuthor =
      extraState.author !== undefined ? extraState.author : dataState.author;

    const effectiveCategories =
      extraState.categories !== undefined
        ? extraState.categories
        : dataState.categories;

    item.description = buildDescription(item.description || "");

    const extractedAuthor = buildAuthor(item.linkhtml || "");
    item.author = extractedAuthor || item.author || "";

    item.date = item.date
      ? item.date
      : buildDate(item.linkhtml || "", item.author);

    item.license = item.license || getLicense(item.author, item.date);

    item.infoPanel =
      "=={{int:filedesc}}==\n{{Information\n|description={{pt|1=" +
      item.description +
      "}}\n|date=" +
      (effectiveDate === "" ? item.date : effectiveDate) +
      "\n|source={{SourceArquipelagos|" +
      item.link +
      "}}\n|author=" +
      (effectiveAuthor === "" ? item.author : effectiveAuthor) +
      "\n|permission=\n|other versions=\n}}\n\n" +
      "=={{int:license-header}}==\n{{Arquipelagos license|" +
      (item.license === "CC-BY-SA 4.0" ? "" : item.license) +
      "}}\n\n" +
      "[[Category:Uploaded with Catrapilha]]\n" +
      (item.author === "{{creator:Rui Carita}}"
        ? "[[Category:Photographs by Rui Carita]]\n"
        : item.author === "José Lemos Silva" || item.author === "Lemos Silva"
          ? "[[Category:Photographs by José Lemos Silva]]\n"
          : item.author === "Virgílio Gomes"
            ? "[[Category:Photographs by Virgílio Gomes]]\n"
            : item.author === "{{creator:Perestrellos Photographos}}"
              ? "[[Category:Photographs by Perestrellos Photographos in ABM]]\n"
              : "") +
      effectiveCategories.replace(
        "[[Category:Diário de Notícias (Madeira)]]",
        "[[Category:Diário de Notícias (Madeira)|" + item.date + "]]",
      ) +
      (effectiveCategories.indexOf(
        "[[Category:Diário de Notícias (Madeira)]]",
      ) !== -1
        ? "\n[[Category:" + item.date + "]]"
        : "");

    dataDispatch({
      type: actionsD.updateItem,
      payload: item,
    });
  };

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
    let author = extractArqField(linkhtml, "Autor da Imagem");
    let author2 = extractArqField(linkhtml, "Autor");

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
      author === "Foto Perestrellos" ||
      dataState.item.description.indexOf("Fotografia ''Perestrellos''") !== -1
    ) {
      return "{{creator:Perestrellos Photographos}}";
    } else if (author === "Foto Figueiras") {
      return "{{creator:Foto Figueiras}}";
    } else if (author === "ABM/ARM") {
      return dataState.item.description;
    } else if (
      author === "Arquivo Regional da Madeira" ||
      author === "Privado" ||
      author === "Museu Militar da Madeira" ||
      author === "Museu da Quinta das Cruzes" ||
      author === "MASF"
    ) {
      return author2;
    } else if (authorIsKnown(author)) {
      return author;
    } else if (
      dataState.categories.indexOf(
        "[[Category:Diário de Notícias (Madeira)]]",
      ) !== -1
    ) {
      return "Diário de Notícias (Madeira)";
    } else {
      return author;
    }
  };

  const buildDate = (linkhtml, author) => {
    // Define a regular expression pattern to extract the date
    const datePattern = new RegExp(
      ".*Data " +
        (true ? "da Peça" : "de Publicação") +
        '.*?text-left"\\s?>(.*?)(</div>)',
      "s",
    );

    // Try to extract the date using the pattern
    const dateMatch = datePattern.exec(linkhtml);

    if (dateMatch && dateMatch.length >= 2) {
      let date = dateMatch[1].replace(" 00:00:00", "");

      if (date.includes("-00-00")) {
        date = date.replace("-00-00", "");
      }

      if (dataState.item.title.includes("(c.)") && !authorIsKnown(author)) {
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

    const dateYear = parseInt(
      date.replace("{{circa|", "").replace("}}", "").substring(0, 4),
      10,
    );

    if (authorIsKnown(author)) {
      return "CC-BY-SA 4.0";
    } else if (currentYear - dateYear < 95) {
      return "PD-Portugal-URAA";
    } else {
      return "PD-old-100-expired";
    }
  };

  const buildFilename1 = () => {
    let item = dataState.item;
    let testFilename = new RegExp('<h5 class="card-title">(.*?)</h5>');

    let filename = testFilename
      .exec(dataState.item.linkhtml)[1]
      .replace(", ilha da Madeira", "")
      .replace(/:/gi, " -")
      .replace("  ", " ")
      .trim();

    item.filename = (filename + " - Image " + item.id + ".jpg").replace(
      /\.\s-/gi,
      " -",
    );
    dataDispatch({
      type: actionsD.updateItem,
      payload: item,
    });
  };

  const buildFilename2 = () => {
    let item = dataState.item;
    item.filename =
      (item.description.includes("<p><b>")
        ? item.description.substring(6, item.description.indexOf("<br"))
        : item.description.substring(
            item.description.indexOf("'''") + 3,
            item.description.indexOf(
              "'''",
              item.description.indexOf("'''") + 3,
            ),
          )
      )
        .replace(".", "")
        .replace(/^''/gm, "")
        .replace(/<\/i>/gm, "")
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

  const insertCirca = () => {
    let item = dataState.item;
    item.date = "{{circa|" + item.date + "}}";
    buildInfo();
  };

  const cleanExtractedHtml = value => {
    if (!value) {
      return "";
    }

    return value
      .replace(/<[^>]*>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/\s+/g, " ")
      .trim();
  };

  const escapeRegExp = value => {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  };

  const extractArqField = (linkhtml, label) => {
    const escapedLabel = escapeRegExp(label);

    const pattern = new RegExp(
      `<div[^>]*>\\s*${escapedLabel}:?\\s*<\\/div>\\s*` +
        `<div[^>]*class=["'][^"']*text-left[^"']*["'][^>]*>\\s*([\\s\\S]*?)\\s*<\\/div>`,
      "i",
    );

    const match = pattern.exec(linkhtml);

    return match ? cleanExtractedHtml(match[1]) : "";
  };

  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        console.log("erro", error);
        console.log("erro", errorInfo);
      }}
    >
      <Box sx={{ width: "100%" }}>
        <Stack spacing={2}>
          {/* Nome do ficheiro + botões */}
          <Box>
            <Typography variant="body2" sx={{ mb: 0.5, fontWeight: "bold" }}>
              Nome do ficheiro
            </Typography>

            <Stack direction="row" spacing={1} alignItems="flex-start">
              <TextField
                value={dataState.item.filename}
                onChange={e => {
                  const item = {
                    ...dataState.item,
                    filename: e.target.value,
                  };

                  dataDispatch({
                    type: actionsD.updateItem,
                    payload: item,
                  });
                }}
                fullWidth
                type="text"
                required
                variant="filled"
                size="small"
              />

              <Button
                variant="contained"
                onClick={buildFilename1}
                size="small"
                sx={{ minWidth: 80 }}
              >
                Gerar 1
              </Button>

              <Button
                variant="contained"
                onClick={buildFilename2}
                size="small"
                sx={{ minWidth: 80 }}
              >
                Gerar 2
              </Button>

              <Button
                variant="contained"
                onClick={insertCirca}
                size="small"
                sx={{ minWidth: 70 }}
              >
                Circa
              </Button>
            </Stack>
          </Box>

          {/* Licença, data, autor, ID */}
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={3}>
              <Typography variant="body2" sx={{ mb: 0.5, fontWeight: "bold" }}>
                Licença
              </Typography>

              <Select
                value={dataState.item.license || ""}
                onChange={e => {
                  const item = {
                    ...dataState.item,
                    license: e.target.value,
                  };

                  dataDispatch({
                    type: actionsD.updateLicense,
                    payload: item.license,
                  });

                  buildInfo(item);
                }}
                fullWidth
                size="small"
              >
                <MenuItem value="PD-old-100-expired">
                  PD-old-100-expired
                </MenuItem>
                <MenuItem value="Art">Art</MenuItem>
                <MenuItem value="PD-Portugal-URAA">URAA</MenuItem>
                <MenuItem value="CC-BY-SA 4.0">CC-BY-SA 4.0</MenuItem>
                <MenuItem value="textlogo">Textlogo</MenuItem>
                <MenuItem value="exempt">Exempt</MenuItem>
              </Select>
            </Grid>

            <Grid item xs={12} sm={3}>
              <Typography variant="body2" sx={{ mb: 0.5, fontWeight: "bold" }}>
                Data
              </Typography>

              <TextField
                value={dataState.date}
                onChange={e => {
                  const newDate = e.target.value;

                  dataDispatch({
                    type: actionsD.updateDate,
                    payload: newDate,
                  });

                  buildInfo(null, { date: newDate });
                }}
                fullWidth
                type="text"
                variant="filled"
                size="small"
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <Typography variant="body2" sx={{ mb: 0.5, fontWeight: "bold" }}>
                Autor
              </Typography>

              <TextField
                value={dataState.author}
                onChange={e => {
                  const newAuthor = e.target.value;

                  dataDispatch({
                    type: actionsD.updateAuthor,
                    payload: newAuthor,
                  });

                  buildInfo(null, { author: newAuthor });
                }}
                fullWidth
                type="text"
                variant="filled"
                size="small"
              />
            </Grid>

            <Grid item xs={12} sm={2}>
              <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                ID
              </Typography>
              <Typography variant="body2">{dataState.item.id}</Typography>
            </Grid>
          </Grid>

          {/* Categorias */}
          <Box>
            <TextField
              label="Categorias"
              multiline
              minRows={3}
              maxRows={6}
              value={dataState.categories}
              onChange={e => {
                const newCategories = e.target.value;

                dataDispatch({
                  type: actionsD.updateCategories,
                  payload: newCategories,
                });

                buildInfo(null, { categories: newCategories });
              }}
              fullWidth
              type="text"
              variant="filled"
            />
          </Box>

          {/* Painel informativo */}
          <Box>
            <TextField
              label="Painel informativo"
              multiline
              minRows={12}
              maxRows={30}
              value={dataState.item.infoPanel}
              onChange={e => {
                const item = {
                  ...dataState.item,
                  infoPanel: e.target.value,
                };

                dataDispatch({
                  type: actionsD.updateItem,
                  payload: item,
                });
              }}
              fullWidth
              variant="filled"
              InputProps={{ style: { fontSize: 15 } }}
            />
          </Box>
        </Stack>
      </Box>
    </ErrorBoundary>
  );
}
