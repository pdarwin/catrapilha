import Arquipelagos from "./Arquipelagos/Arquipelagos";
import { useState } from "react";
import Login from "./Login";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import ItemArq from "./Arquipelagos/ItemArq";
import MyModal from "./MyModal";

function App() {
  //Gestão do MyModal
  const [open, setOpen] = useState(false);
  const [errLevel, setErrLevel] = useState("error");
  const [err, setErr] = useState("");

  const handleOpen = () => setOpen(true);

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div className="App">
      <MyModal
        open={open}
        err={err}
        errLevel={errLevel}
        handleOpen={handleOpen}
        handleClose={handleClose}
      />
      <Login />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Arquipelagos />}></Route>
          <Route
            path="/item/:id"
            element={
              <ItemArq
                modalControls={{
                  setOpen: setOpen,
                  setErr: setErr,
                  setErrLevel: setErrLevel,
                  handleOpen: handleOpen,
                  handleClose: handleClose,
                }}
              />
            }
          ></Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
