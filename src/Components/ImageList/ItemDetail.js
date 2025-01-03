import "@fontsource/roboto"; // Ensure a clean and modern font
import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Checkbox,
  CircularProgress,
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
  const [autoCloseTimer, setAutoCloseTimer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [localItems, setLocalItems] = useState([...dataState.items]);
  const [localData, setLocalData] = useState([...dataState.data]);

  // Find the item in localItems
  const item = localItems.find(item => item.id === parseInt(id));

  useEffect(() => {
    //if (localItems.length === 0) {
    dataDispatch({ type: actionsD.updateItems, payload: localItems });
    dataDispatch({ type: actionsD.updateData, payload: localData });
    //}
  }, [localItems, localData, dataDispatch]);

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
  // Ensure the items are sorted by ID
  const sortedItems = [...localItems].sort((a, b) => a.id - b.id);
  const currentIndex = sortedItems.findIndex(item => item.id === itemId);
  const previousItem = sortedItems[currentIndex - 1];
  const nextItem = sortedItems[currentIndex + 1];

  const handleUpload = async (currentItem, items, dataset) => {
    setLocalItems(items);
    setLocalData(dataset);

    if (!currentItem) {
      console.error("Invalid item passed to handleUpload");
      return;
    }

    setLoading(true); // Signal that the upload has started

    try {
      const project = getProject(dataState.projectId);

      const updatedItem = {
        ...currentItem,
        infoPanel: item.readyToUpload
          ? buildInfoPanel(currentItem)
          : editableInfoPanel,
        imagelink: project.uploadByLink
          ? currentItem.imagelink
          : currentItem.imagelink.replace(project.baseUrl, project.pathRewrite),
      };

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
            modalDispatch({
              type: actionsM.fireModal,
              payload: {
                msg: msg + ":",
                level: "warning",
                link: "https://commons.wikimedia.org/wiki/File:" + file,
                onManualClose: () => {
                  // If user closes early
                  if (autoCloseTimer) clearTimeout(autoCloseTimer);
                  modalDispatch({ type: actionsM.closeModal });
                  // do NOT remove item => user has canceled the chain
                },
              },
            });
            // If we want auto-advance in 5s:
            if (currentItem.readyToUpload) {
              const timerId = setTimeout(() => {
                // 1) close modal automatically
                modalDispatch({ type: actionsM.closeModal });
                // 2) remove item & go next
                removeAndGoNext(currentItem.id, "Y", items, dataset);
              }, 2000);
              setAutoCloseTimer(timerId);
            }
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

        if (type !== "exists") {
          modalDispatch({
            type: actionsM.fireModal,
            payload: {
              msg: msg + ":",
              level: "warning",
              link: "https://commons.wikimedia.org/wiki/File:" + file,
            },
          });
        }
      }

      if (data.upload.result === "Success" && currentItem.readyToUpload) {
        modalDispatch({
          type: actionsM.fireModal,
          payload: {
            msg: "Upload bem sucedido. Imagem disponível em ",
            level: "success",
            link:
              "https://commons.wikimedia.org/wiki/File:" + data.upload.filename,
            onManualClose: () => {
              // If user closes early
              if (autoCloseTimer) clearTimeout(autoCloseTimer);
              modalDispatch({ type: actionsM.closeModal });
              // do NOT remove item => user has canceled the chain
            },
          },
        });
        // If we want auto-advance in 5s:
        if (currentItem.readyToUpload) {
          const timerId = setTimeout(() => {
            // 1) close modal automatically
            modalDispatch({ type: actionsM.closeModal });
            // 2) remove item & go next
            removeAndGoNext(currentItem.id, "Y", items, dataset);
          }, 2000);
          setAutoCloseTimer(timerId);
        }
      }
    } catch (error) {
      modalDispatch({
        type: actionsM.fireModal,
        payload: {
          msg: error.message || "Erro desconhecido",
          level: "error",
        },
      });
    } finally {
      setLoading(false); // Reset loading state when done
    }
  };

  const removeAndGoNext = (itemId, status, items, dataset) => {
    setLocalItems(items);

    const updatedDataset = [...dataset, { id: itemId, status }];
    setLocalData(updatedDataset);

    // Update localItems
    const updatedItems = items.filter(it => it.id !== itemId);
    setLocalItems(updatedItems); // Update local state

    // Sort the updated local list
    const sortedUpdated = updatedItems.sort((a, b) => a.id - b.id);
    const nextIndex = sortedUpdated.findIndex(it => it.id > itemId);

    // Navigate using the updated local list
    if (nextIndex >= 0) {
      const nextCandidate = sortedUpdated[nextIndex];
      navigate(`/item/${nextCandidate.id}`);
      if (nextCandidate.readyToUpload) {
        handleUpload(nextCandidate, updatedItems, updatedDataset); // Continue processing
      }
    } else {
      // Process ends, update global state
      dataDispatch({ type: actionsD.updateItems, payload: updatedItems });
      dataDispatch({ type: actionsD.updateData, payload: updatedDataset });
      navigate("/"); // Navigate home
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
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => {
                    dataDispatch({
                      type: actionsD.updateItems,
                      payload: localItems,
                    });
                    navigate("/"); // Navigate home
                  }}
                  size="large"
                  sx={{ marginRight: 2 }}
                >
                  Voltar
                </Button>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={ignoreWarnings}
                      onChange={() => setIgnoreWarnings(!ignoreWarnings)}
                    />
                  }
                  label="Ignorar avisos"
                  sx={{ marginRight: 2 }}
                />
                <Button
                  variant="contained"
                  color="warning"
                  onClick={() =>
                    removeAndGoNext(item.id, "N", localItems, localData)
                  }
                  size="large"
                  sx={{ marginRight: 2 }}
                >
                  Não carregar
                </Button>
                <Button
                  variant="contained"
                  color="warning"
                  onClick={() =>
                    removeAndGoNext(item.id, "Y", localItems, localData)
                  }
                  size="large"
                  sx={{ marginRight: 2 }}
                >
                  Já existe
                </Button>
                <Button
                  variant="contained"
                  onClick={() =>
                    handleUpload(
                      item,
                      [...dataState.items],
                      [...dataState.data]
                    )
                  }
                  size="large"
                  sx={{ marginRight: 2 }}
                  disabled={loading} // Disable button while loading
                  startIcon={
                    loading && <CircularProgress size={20} color="inherit" />
                  }
                >
                  Carregar no Commons
                </Button>
              </Box>
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
