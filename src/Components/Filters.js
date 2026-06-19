import { HighlightOff, Search } from "@mui/icons-material";
import { Button, Grid, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useDataContext } from "../Reducers/DataContext";
import { actionsD } from "../Reducers/DataReducer";
import { fetchListItems } from "./ImageList/ListServices";

export default function Filters({ stopRef }) {
  const { dataState, dataDispatch } = useDataContext();

  const [query, setQuery] = useState(dataState.filter || "");
  const [root, setRoot] = useState(dataState.root || 1);

  useEffect(() => {
    setQuery(dataState.filter || "");
    setRoot(dataState.root || 1);
  }, [dataState.filter, dataState.root]);

  const runSearch = async (nextFilter, nextRoot) => {
    const normalizedRoot = Number(nextRoot) || 1;

    if (dataState.listLoading) {
      stopRef.current = true;
      dataDispatch({
        type: actionsD.setListLoading,
        payload: false,
      });
    }

    const nextState = {
      ...dataState,
      filter: nextFilter,
      root: normalizedRoot,
      items: [],
    };

    dataDispatch({
      type: actionsD.updateItems,
      payload: [],
    });

    dataDispatch({
      type: actionsD.setCurrentId,
      payload: 0,
    });

    dataDispatch({
      type: actionsD.setFilter,
      payload: nextFilter,
    });

    dataDispatch({
      type: actionsD.setRoot,
      payload: normalizedRoot,
    });

    await fetchListItems(nextState, dataDispatch);
  };

  const handleSubmit = async event => {
    event.preventDefault();

    await runSearch(query.trim(), root);
  };

  const handleClear = async event => {
    event.preventDefault();

    setQuery("");
    setRoot(1);

    await runSearch("", 1);
  };

  return (
    <Grid
      container
      spacing={1}
      style={{
        maxWidth: 250,
        marginTop: 100,
        maxHeight: 200,
        overflow: "auto",
        justifyContent: "flex-start",
        alignItems: "flex-start",
      }}
    >
      <Grid item xs={12}>
        <TextField
          id="filter-query"
          label="Filtrar por:"
          variant="standard"
          value={query}
          onChange={event => setQuery(event.target.value)}
          sx={{
            color: "white",
            backgroundColor: "white",
            width: "100%",
          }}
        />
      </Grid>

      <Grid item xs={12} sx={{ display: "flex", justifyContent: "center" }}>
        <Button
          variant="outlined"
          startIcon={<Search />}
          onClick={handleSubmit}
          sx={{
            backgroundColor: "#1976d2",
            color: "white",
            width: "45%",
            height: "30px",
            margin: "auto",
          }}
        >
          Pesquisar
        </Button>

        <Button
          variant="outlined"
          startIcon={<HighlightOff />}
          onClick={handleClear}
          sx={{
            backgroundColor: "#1976d2",
            color: "white",
            width: "45%",
            height: "30px",
            margin: "auto",
          }}
        >
          Limpar
        </Button>
      </Grid>

      <Grid item xs={12}>
        <Grid container>
          <Grid item xs={6}>
            <TextField
              id="filter-root"
              label="Raiz:"
              variant="standard"
              value={root}
              onChange={event => setRoot(event.target.value)}
              sx={{
                color: "white",
                backgroundColor: "white",
                width: "70%",
              }}
            />
          </Grid>

          <Grid item xs={6} sx={{ marginTop: 2.5 }}>
            <Typography variant="body2" color="text.secondary">
              Iterações: {dataState.iterations || ""}
            </Typography>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
}
