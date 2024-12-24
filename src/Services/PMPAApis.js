import axios from "axios";

export const fetchPMPA1Page = async page => {
  try {
    const res = await axios.get(`/pmpa1api/imagem/${page}`);

    if (res.status !== 200) {
      throw new Error(`Erro: ${res.status}`);
    }

    return res;
  } catch (error) {
    if (error.code === "ERR_BAD_RESPONSE") return error;
    else {
      console.error("getListItems Error:", error);
      throw error;
    }
  }
};
