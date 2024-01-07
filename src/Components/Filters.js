import { HighlightOff, Search } from "@mui/icons-material";
import { Button, Grid, TextField, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useDataContext } from "../Reducers/DataContext";
import { actionsD } from "../Reducers/DataReducer";

export default function Filters() {
  const { dataState, dataDispatch } = useDataContext();
  const [query, setQuery] = useState("");
  const [root, setRoot] = useState(1);

  useEffect(() => {
    dataState.previousFilter = dataState.filter ? dataState.filter : "none";
    console.log("Previous filter set to:", dataState.previousFilter);
    setQuery(dataState.filter);
  }, [dataState.filter]);

  const handleSubmit = event => {
    event.preventDefault();
    dataDispatch({
      type: actionsD.updateItems,
      payload: [],
    });
    dataDispatch({
      type: actionsD.setFilter,
      payload: query,
    });
    dataDispatch({
      type: actionsD.setRoot,
      payload: root,
    });
    if (dataState.filter) {
      console.log(`Searching for ${dataState.filter}`);
    }
  };

  const handleClear = event => {
    event.preventDefault();
    dataDispatch({
      type: actionsD.updateItems,
      payload: [],
    });
    dataDispatch({
      type: actionsD.setFilter,
      payload: "",
    });
    dataDispatch({
      type: actionsD.setRoot,
      payload: 1,
    });
    // Update the value of the textfield
    document.getElementById("outlined-basic").value = "";
    console.log(`Filter cleared`);
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
      {/* First row with text input */}
      <Grid item xs={12}>
        <TextField
          id="outlined-basic"
          label="Filtrar por:"
          variant="standard"
          onChange={event => setQuery(event.target.value)}
          defaultValue={query}
          sx={{
            color: "white",
            backgroundColor: "white",
            width: "100%", // Take up the full width
          }}
        />
      </Grid>

      {/* Second row with centered buttons */}
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
            margin: "auto", // Center the button horizontally
          }}
        >
          Filtrar
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
            margin: "auto", // Center the button horizontally
          }}
        >
          Limpar
        </Button>
      </Grid>

      {/* Third row with text and text input wrapped in a single Grid item */}
      <Grid item xs={12}>
        <Grid container>
          <Grid item xs={6}>
            {/* TextField with 70% width */}
            <TextField
              id="outlined-basic"
              label="Raiz:"
              variant="standard"
              // Adjust the width as needed
              onChange={event => setRoot(event.target.value)}
              defaultValue={root}
              sx={{
                color: "white",
                backgroundColor: "white",
                width: "70%",
              }}
            />
          </Grid>
          <Grid item xs={6} sx={{ marginTop: 2.5 }}>
            {/* Typography with default width */}
            <Typography variant="standard" color="text.secondary">
              Iterações: {dataState.iterations}
            </Typography>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
}
