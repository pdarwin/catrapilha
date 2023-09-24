import { HighlightOff, Search } from "@mui/icons-material";
import { Button, TextField } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useDataContext } from "../Reducers/DataContext";
import { actionsD } from "../Reducers/DataReducer";

export default function Filters() {
  const { dataState, dataDispatch } = useDataContext();
  const [query, setQuery] = useState("");

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
    // Update the value of the textfield
    document.getElementById("outlined-basic").value = "";
    console.log(`Filter cleared`);
  };

  return (
    <div
      style={{
        position: "absolute",
        right: "2%",
        top: "20%",
      }}
    >
      <div>
        <TextField
          id="outlined-basic"
          label="Filtrar por:"
          variant="standard"
          onChange={event => setQuery(event.target.value)}
          sx={{
            color: "white",
            backgroundColor: "white",
          }}
        />
        <Button
          variant="outlined"
          startIcon={<Search />}
          onClick={handleSubmit}
          sx={{
            backgroundColor: "#1976d2",
            color: "white",
            m: 1,
          }}
        >
          Filtrar
        </Button>
      </div>
      <div>
        <Button
          variant="outlined"
          startIcon={<HighlightOff />}
          onClick={handleClear}
          sx={{
            backgroundColor: "#1976d2",
            color: "white",
            height: 40,
            my: 3,
          }}
        >
          Limpar
        </Button>
      </div>
    </div>
  );
}
