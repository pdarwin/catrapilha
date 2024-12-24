import "@fontsource/roboto"; // Ensure a clean and modern font
import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Checkbox,
  FormControlLabel,
  Grid,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDataContext } from "../../Reducers/DataContext";
import { actionsD } from "../../Reducers/DataReducer";
import { useModalContext } from "../../Reducers/ModalContext";
import { actionsM } from "../../Reducers/ModalReducer";
import { uploadToCommons } from "../../Services/GeneralApis";
import { getProject } from "../../Utils/ProjectUtils";

export default function ItemDetail() {
  const { dataState, dataDispatch } = useDataContext();
  const { id } = useParams(); // Get the item ID from the URL
  const navigate = useNavigate();
  const itemId = parseInt(id);
  const { modalDispatch } = useModalContext();
  const [ignoreWarnings, setIgnoreWarnings] = useState(false);

  // Find the item in dataState.items
  const item = dataState.items.find(item => item.id === parseInt(id));

  const buildInfoPanel = item => {
    if (!item) return "No information available.";

    const categories = item.categories
      ? item.categories.map(category => `[[Category:${category}]]`).join("\n")
      : "";

    const infoPanel =
      `=={{int:filedesc}}==\n` +
      `{{Information\n` +
      `|description={{pt|1=${item.description}}}\n` +
      `|date=${item.date}\n` +
      `|source=${item.source}\n` +
      `|author=${item.author}\n` +
      `|permission=\n` +
      `|other versions=\n}}\n\n` +
      `=={{int:license-header}}==\n` +
      `${item.license}\n\n` +
      `[[Category:Uploaded with Catrapilha]]\n` +
      `${categories}\n`;

    return infoPanel;
  };

  const [editableInfoPanel, setEditableInfoPanel] = useState(
    item ? buildInfoPanel(item) : "No information available."
  );

  useEffect(() => {
    if (item) {
      setEditableInfoPanel(buildInfoPanel(item));
    }
  }, [item]);

  // Find the previous and next items
  const sortedItems = dataState.items.sort((a, b) => a.id - b.id); // Ensure the items are sorted by ID
  const currentIndex = sortedItems.findIndex(item => item.id === itemId);
  const previousItem = sortedItems[currentIndex - 1];
  const nextItem = sortedItems[currentIndex + 1];

  // Reusable function to update dataState and navigate
  const updateDataAndNavigate = async (itemId, nextItem) => {
    // Add new object to dataState.data
    const localDataset = [...dataState.data];
    localDataset.push({ id: itemId, status: "Y" }); // Mark the page as successful

    // Dispatch updated dataset
    dataDispatch({ type: actionsD.updateData, payload: localDataset });

    // Remove the uploaded item from dataState.items
    const updatedItems = dataState.items.filter(
      currentItem => currentItem.id !== itemId
    );
    dataDispatch({ type: actionsD.updateItems, payload: updatedItems });

    // Navigate to the next item or back to the list
    if (nextItem) {
      navigate(`/item/${nextItem.id}`);
    } else {
      navigate("/"); // Return to the list if no next item exists
    }
  };

  const handleUpload = async () => {
    try {
      // Prepare and update the item before uploading
      const project = getProject(dataState.projectId);

      const updatedItem = {
        ...item,
        infoPanel: editableInfoPanel,
        imagelink: project.uploadByLink
          ? item.imagelink
          : item.imagelink.replace(project.baseUrl, project.pathRewrite),
      };

      // Upload the updated item
      const data = await uploadToCommons(
        updatedItem,
        ignoreWarnings,
        project.uploadByLink
      );

      if (data.upload.result === "Warning") {
        const [[type, file]] = Object.entries(data.upload.warnings);

        let msg;
        switch (type) {
          case "exists":
            msg = "Imagem já existente no Commons";
            break;
          case "duplicate":
            msg = "Imagem duplicada no Commons";
            break;
          case "was-deleted":
            msg = "Imagem apagada no Commons";
            break;
          case "badfilename":
            msg = "Nome de ficheiro inválido";
            break;
          default:
            msg = `Aviso não tratado (${type})`;
            break;
        }

        modalDispatch({
          type: actionsM.fireModal,
          payload: {
            msg: msg + ":",
            level: "warning",
            link: "https://commons.wikimedia.org/wiki/File:" + file,
            onClose: () => updateDataAndNavigate(item.id, nextItem),
          },
        });
      }

      if (data.upload.result === "Success") {
        modalDispatch({
          type: actionsM.fireModal,
          payload: {
            msg: "Upload bem sucedido. Imagem disponível em ",
            level: "success",
            link:
              "https://commons.wikimedia.org/wiki/File:" + data.upload.filename,
            onClose: () => updateDataAndNavigate(item.id, nextItem),
          },
        });
      }
    } catch (error) {
      modalDispatch({
        type: actionsM.fireModal,
        payload: {
          msg: error.message || "Erro desconhecido",
          level: "error",
        },
      });
    }
  };

  if (!item) {
    return (
      <Box sx={{ textAlign: "center", marginTop: 4 }}>
        <Typography variant="h6" color="error">
          Item não encontrado.
        </Typography>
        <Button variant="contained" onClick={() => navigate("/")}>
          Voltar para a lista
        </Button>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        maxWidth: 1500,
        margin: "auto",
        marginTop: 4,
        fontFamily: "Roboto",
      }}
    >
      {/* Navigation Buttons */}
      <Box sx={{ textAlign: "center", marginBottom: 2 }}>
        {previousItem && (
          <Button
            variant="outlined"
            onClick={() => navigate(`/item/${previousItem.id}`)}
            sx={{ marginRight: 2 }}
          >
            Previous
          </Button>
        )}
        {nextItem && (
          <Button
            variant="outlined"
            onClick={() => navigate(`/item/${nextItem.id}`)}
          >
            Next
          </Button>
        )}
      </Box>

      {/* Item Details */}
      <Card sx={{ padding: 2 }}>
        <Grid container spacing={2} alignItems="flex-start">
          {/* Image on the left */}
          <Grid item xs={12} md={5}>
            <CardMedia
              component="img"
              height="400"
              image={item.imagelink || "fallback_image_url.jpg"}
              alt={item.title || "Imagem"}
              sx={{
                borderRadius: 2,
                boxShadow: 3,
                maxWidth: "100%",
                objectFit: "contain", // Ensures the full image is visible
              }}
            />
            {/* Upload Controls below the image */}
            <Box
              sx={{
                paddingTop: 2,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Box>
                <Button
                  variant="contained"
                  onClick={handleUpload}
                  size="large"
                  sx={{ marginRight: 2 }}
                >
                  Carregar no Commons
                </Button>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={ignoreWarnings}
                      onChange={() => setIgnoreWarnings(!ignoreWarnings)}
                    />
                  }
                  label="Ignorar avisos"
                />
              </Box>
              <Button
                variant="contained"
                color="primary"
                onClick={() => navigate("/")}
                size="large"
              >
                Voltar para a lista
              </Button>
            </Box>
          </Grid>

          {/* Fields on the right */}
          <Grid item xs={12} md={7}>
            <CardContent>
              <Typography
                variant="h5"
                sx={{ fontWeight: "bold", marginBottom: 2 }}
              >
                Detalhes do Item
              </Typography>

              <Typography variant="body1" sx={{ marginBottom: 1 }}>
                <strong>ID:</strong> {item.id}
              </Typography>

              <Typography variant="body1" sx={{ marginBottom: 1 }}>
                <strong>Nome do Arquivo:</strong> {item.filename}
              </Typography>

              <Typography variant="body1" sx={{ marginBottom: 1 }}>
                <strong>Descrição:</strong> {item.description}
              </Typography>

              <Typography variant="body1" sx={{ marginBottom: 1 }}>
                <strong>Autor:</strong> {item.author || "Desconhecido"}
              </Typography>

              <Typography variant="body1" sx={{ marginBottom: 1 }}>
                <strong>Data:</strong> {item.date || "Desconhecida"}
              </Typography>

              <Typography variant="body1" sx={{ marginBottom: 1 }}>
                <strong>Tags:</strong>{" "}
                {item.tags.length > 0 ? item.tags.join(", ") : "Nenhuma"}
              </Typography>

              <Typography variant="body1" sx={{ marginBottom: 1 }}>
                <strong>Info Panel:</strong>
              </Typography>
              <TextField
                fullWidth
                multiline
                minRows={8}
                value={editableInfoPanel}
                onChange={e => setEditableInfoPanel(e.target.value)}
                variant="outlined"
                sx={{
                  backgroundColor: "#f9f9f9",
                  borderRadius: "4px",
                }}
              />
            </CardContent>
          </Grid>
        </Grid>
      </Card>
    </Box>
  );
}
