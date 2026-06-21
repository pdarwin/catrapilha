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
import { buildArqItemMetadata } from "./ArqMetadataUtils";

export default function ArqItemForm() {
  const { dataState, dataDispatch } = useDataContext();

  useEffect(() => {
    if (dataState.item?.id && dataState.item?.linkhtml) {
      buildInfo();
    }
    // eslint-disable-next-line
  }, [dataState.item?.id, dataState.item?.linkhtml]);

  const buildInfo = (itemOverride = null, extraState = {}) => {
    const categoriesText =
      extraState.categories !== undefined
        ? extraState.categories
        : dataState.categories;

    const dateOverride =
      extraState.date !== undefined ? extraState.date : dataState.date;

    const authorOverride =
      extraState.author !== undefined ? extraState.author : dataState.author;

    const baseItem = {
      ...dataState.item,
      ...(itemOverride || {}),
    };

    const item = buildArqItemMetadata({
      item: baseItem,
      linkhtml: baseItem.linkhtml || "",
      categoriesText,
      dateOverride,
      authorOverride,
    });

    dataDispatch({
      type: actionsD.updateItem,
      payload: item,
    });
  };

  const getSourceTitleForFilename = linkhtml => {
    const titlePattern = new RegExp(
      String.raw`<h5[^>]*class=["'][^"']*card-title[^"']*["'][^>]*>([\s\S]*?)</h5>`,
      "i",
    );

    const match = titlePattern.exec(linkhtml || "");

    if (!match) {
      return "";
    }

    return match[1]
      .replace(/<[^>]*>/g, "")
      .replace(/,\s*ilha da Madeira(?:\s*[,.;:])*\s*$/i, "")
      .replace(/:/g, " -")
      .replace(/\s+/g, " ")
      .trim();
  };

  const getDescriptionTitleForFilename = description => {
    const source = String(description || "");

    const wikiBoldMatch = /'''([\s\S]*?)'''/.exec(source);

    const htmlBoldPattern = new RegExp(
      String.raw`<(?:b|strong)>([\s\S]*?)</(?:b|strong)>`,
      "i",
    );

    const htmlBoldMatch = htmlBoldPattern.exec(source);

    const title =
      (wikiBoldMatch && wikiBoldMatch[1]) ||
      (htmlBoldMatch && htmlBoldMatch[1]) ||
      source.split(new RegExp(String.raw`<br\s*/?>|\n`, "i"))[0];

    return String(title || "")
      .replace(/<[^>]*>/g, "")
      .replace(/''/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .replace(/[,\s]+$/, "");
  };

  const getLocationTailFromSourceTitle = sourceTitle => {
    const parts = String(sourceTitle || "")
      .split(",")
      .map(part => part.trim())
      .filter(Boolean);

    let datePartIndex = -1;

    parts.forEach((part, index) => {
      if (/\b\d{3,4}\b/.test(part)) {
        datePartIndex = index;
      }
    });

    if (datePartIndex === -1 || datePartIndex >= parts.length - 1) {
      return "";
    }

    return parts.slice(datePartIndex + 1).join(", ");
  };

  const formatDateForFilename = date => {
    const value = String(date || "").trim();

    const normalized = value.toLowerCase();

    if (normalized.startsWith("{{circa|") && value.endsWith("}}")) {
      const innerValue = value
        .slice("{{circa|".length, -2)
        .split("|")[0]
        .trim();

      return innerValue ? `c. ${innerValue}` : "";
    }

    return value;
  };

  const buildFilename1 = () => {
    const item = { ...dataState.item };
    const sourceTitle = getSourceTitleForFilename(item.linkhtml);

    if (!sourceTitle) {
      return;
    }

    item.filename = `${sourceTitle} - Image ${item.id}.jpg`;

    dataDispatch({
      type: actionsD.updateItem,
      payload: item,
    });
  };

  const buildFilename2 = () => {
    const item = { ...dataState.item };

    const descriptionTitle = getDescriptionTitleForFilename(item.description);
    const sourceTitle = getSourceTitleForFilename(item.linkhtml);
    const locationTail = getLocationTailFromSourceTitle(sourceTitle);

    const titleAlreadyHasLocation =
      locationTail &&
      descriptionTitle
        .toLocaleLowerCase("pt-PT")
        .includes(locationTail.toLocaleLowerCase("pt-PT"));

    const filenameTitle =
      descriptionTitle && locationTail && !titleAlreadyHasLocation
        ? `${descriptionTitle}, ${locationTail}`
        : descriptionTitle || sourceTitle || "Sem título";

    const filenameDate = formatDateForFilename(dataState.date || item.date);

    item.filename = [filenameTitle, filenameDate, `Image ${item.id}`]
      .filter(Boolean)
      .join(" - ")
      .concat(".jpg");

    dataDispatch({
      type: actionsD.updateItem,
      payload: item,
    });
  };

  const insertCirca = () => {
    const cleanDate = String(dataState.item.date || "")
      .replace("{{circa|", "")
      .replace("}}", "");

    buildInfo({
      ...dataState.item,
      date: "{{circa|" + cleanDate + "}}",
    });
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
