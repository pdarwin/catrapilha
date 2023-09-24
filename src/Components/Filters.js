import { Search } from "@mui/icons-material";
import { Button, TextField } from "@mui/material";
import React, { useState } from "react";

export default function Filters({ setFilter }) {
  const [query, setQuery] = useState("");

  const handleSubmit = event => {
    event.preventDefault();
    if (query) {
      console.log(`Searching for ${query}`);

      setFilter(query);
    }
  };

  return (
    <div
      style={{
        position: "absolute",
        right: "2%",
        top: "20%",
      }}
    >
      <TextField
        id="outlined-basic"
        label="Filtrar por:"
        variant="standard"
        value={query}
        onChange={event => setQuery(event.target.value)}
        sx={{
          color: "white",
          backgroundColor: "white",
          height: 40,
          p: 0,
        }}
      />
      <Button variant="outlined" startIcon={<Search />} onClick={handleSubmit}>
        Filtrar
      </Button>
    </div>
  );
}
