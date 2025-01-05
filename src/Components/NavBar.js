import { FileDownload, UploadFile } from "@mui/icons-material";
import {
  AppBar,
  Avatar,
  Button,
  Container,
  IconButton,
  MenuItem,
  Select,
  Toolbar,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { useNavigate } from "react-router-dom";
import ProjectConfig from "../Config/ProjectConfig";
import { useDataContext } from "../Reducers/DataContext";
import { actionsD } from "../Reducers/DataReducer";
import { useModalContext } from "../Reducers/ModalContext";
import { actionsM } from "../Reducers/ModalReducer";
import catrapilha from "../Resources/catrapilha.png";
import { getUser } from "../Services/GeneralApis";
import { getData, sendData } from "../Utils/DataUtils";

export default function NavBar({ stopRef }) {
  const { dataState, dataDispatch } = useDataContext();
  const { modalDispatch } = useModalContext();
  const [user, setUser] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userName = await getUser();
        setUser(userName);
      } catch (error) {
        modalDispatch({
          type: actionsM.fireModal,
          payload: {
            msg: "Failed to fetch user information.",
            level: "error",
          },
        });
      }
    };

    fetchUser();
  }, [modalDispatch]);

  useEffect(() => {
    if (dataState.projectId) {
      const fetchData = async () => {
        await getData(dataState.projectId, dataDispatch, modalDispatch);
      };

      fetchData();
    }

    // eslint-disable-next-line
  }, [dataState.projectId]);

  // Handle sending data
  const handleSendData = async () => {
    try {
      const success = await sendData(dataState, modalDispatch, dataDispatch);

      if (success) {
        // Optionally navigate or perform other actions upon success
        // navigate("/success");
      }
    } catch (error) {
      console.error("Error sending data:", error);
      modalDispatch({
        type: actionsM.fireModal,
        payload: {
          msg: "Error sending data.",
          level: "error",
        },
      });
    }
  };

  // Handle project selection change
  const handleProjectChange = e => {
    e.preventDefault();
    const selectedProjectId = e.target.value;

    if (dataState.listLoading) {
      dataDispatch({ type: actionsD.setListLoading, payload: false });
    }
    stopRef.current = true;
    // Dispatch the changeProject action
    dataDispatch({
      type: actionsD.changeProject,
      payload: selectedProjectId,
    });
  };

  const handleGetData = async () => {
    stopRef.current = true;
    await getData(dataState.projectId, dataDispatch, modalDispatch);
    //findNaFotos(dataState);
  };

  // Memoize project options to prevent unnecessary re-renders
  const projectOptions = useMemo(() => {
    return Object.values(ProjectConfig).map(project => (
      <MenuItem key={project.id} value={project.id}>
        {project.name}
      </MenuItem>
    ));
  }, []);

  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        console.error("Error in NavBar:", error, errorInfo);
        modalDispatch({
          type: actionsM.fireModal,
          payload: {
            msg: "Error in NavBar: " + error + " " + errorInfo,
            level: "error",
          },
        });
      }}
      fallback={<div>Something went wrong.</div>}
    >
      <AppBar position="static">
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            {/* Logo and Title */}
            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{ mr: 2, display: { xs: "none", md: "flex" } }}
            >
              <IconButton
                onClick={() => {
                  if (dataState.listLoading) {
                    stopRef.current = true;
                  }
                  navigate("/List");
                }}
                sx={{ p: 0 }}
                style={{ color: "white" }}
              >
                <Avatar alt="Catrapilha" src={catrapilha} sx={{ p: 1 }} />
                Catrapilha 1.3
              </IconButton>
            </Typography>

            {/* Data Fetching Buttons */}
            <Button
              onClick={handleGetData}
              sx={{ my: 2, color: "white", display: "block" }}
              startIcon={<FileDownload />}
              size="small"
            >
              Puxar dados
            </Button>
            <Button
              onClick={handleSendData}
              sx={{ my: 2, color: "white", display: "block" }}
              startIcon={<UploadFile />}
              size="small"
            >
              Enviar dados
            </Button>

            {/* Project Selection */}
            <Select
              value={dataState.projectId}
              label="Projeto"
              onChange={handleProjectChange}
              style={{ height: 30, width: 250 }}
              sx={{ mx: 2, color: "white" }}
            >
              {projectOptions}
            </Select>

            {/* Status Indicators */}
            <Typography style={{ float: "left", color: "white" }} mx={2}>
              {dataState.currentId === 0 ? "" : "Item: " + dataState.currentId}
            </Typography>
            <Typography style={{ float: "left", color: "white" }} mx={2}>
              {"Processados: " +
                (dataState.data !== null ? dataState.data.length : 0) +
                " (" +
                (dataState.data !== null
                  ? dataState.data.length - dataState.initialCount
                  : 0) +
                " novos)"}
            </Typography>
            <Typography style={{ float: "left", color: "white" }} mx={2}>
              {"Carregados: " +
                (dataState.data.length > 0
                  ? dataState.data.filter(element => element.status === "Y")
                      .length
                  : 0) +
                " (" +
                (dataState.data.length > 0
                  ? dataState.data.filter(element => element.status === "Y")
                      .length - dataState.initialCountC
                  : 0) +
                " novos)"}
            </Typography>

            {/* User Information */}
            <Typography style={{ float: "right", color: "white" }}>
              {user ? user : ""}
            </Typography>
          </Toolbar>
        </Container>
      </AppBar>
    </ErrorBoundary>
  );
}
