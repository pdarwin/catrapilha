import axios from "axios";
import { getProject } from "../Utils/ProjectUtils";

const API_BASE_URL = "/comapi/w/api.php";
const AUTH_TOKEN = process.env.REACT_APP_ACCESS_TOKEN;

const createHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${AUTH_TOKEN}`,
});

/**
 * Function to retrieve CSRF token.
 * @returns {String} - The CSRF token.
 */
export const getTokenCSRF = async () => {
  try {
    const res = await axios.get(
      `${API_BASE_URL}?action=query&format=json&meta=tokens`,
      {
        headers: createHeaders(),
      }
    );
    if (res.status !== 200) {
      throw new Error(`${res.status}: ${res.statusText} (getTokenCSRF)`);
    }
    return res.data.query?.tokens?.csrftoken || null;
  } catch (error) {
    throw error;
  }
};

/**
 * Fetch data based on the project.
 */
export const getDataAPI = async projectId => {
  try {
    const project = getProject(projectId);
    const { dataFile } = project;

    const res = await axios.get(
      `${API_BASE_URL}?action=parse&page=${encodeURIComponent(
        dataFile
      )}&format=json&prop=wikitext`,
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );
    if (res.status !== 200) {
      throw new Error(`${res.status}: ${res.statusText} (getDataAPI)`);
    }
    if (res.data.error) {
      if (res.data.error === "missingtitle") {
        throw new Error(`O ficheiro ${dataFile} não existe no servidor`);
      } else {
        throw new Error(
          `${res.data.error.code}: ${res.data.error.info} (getDataAPI)`
        );
      }
    }
    return res;
  } catch (error) {
    throw error;
  }
};

/**
 * Get user info.
 */
export const getUser = async () => {
  try {
    const res = await axios.get(
      `${API_BASE_URL}?action=query&meta=userinfo&format=json`,
      {
        headers: createHeaders(),
      }
    );

    if (res.status !== 200) {
      throw new Error(`Error: ${res.status} ${res.statusText}`);
    }

    const parsedResponse = res.data;
    const userName = parsedResponse.query.userinfo.name;
    return userName;
  } catch (error) {
    console.error("getUser Error:", error);
    throw error;
  }
};

/**
 * Send data to the server.
 */
export const sendDataAPI = async dataState => {
  try {
    const project = getProject(dataState.projectId);
    const { dataFile } = project;

    const csrfToken = await getTokenCSRF();

    if (!csrfToken) {
      throw new Error("Failed to retrieve CSRF token.");
    }

    const uploadParams = new FormData();
    uploadParams.append("title", dataFile);
    uploadParams.append("text", JSON.stringify({ data: dataState.data }));
    uploadParams.append("summary", "Data updated (Catrapilha 1.3)");
    uploadParams.append("token", csrfToken);

    const res = await axios.post(
      `${API_BASE_URL}?action=edit&format=json`,
      uploadParams,
      {
        headers: { Authorization: `Bearer ${AUTH_TOKEN}` },
      }
    );

    if (res.status !== 200) {
      throw new Error(`Error: ${res.status} ${res.statusText} (sendData)`);
    }

    return res;
  } catch (err) {
    console.error("sendData Error:", err);
    throw err;
  }
};

export const uploadToCommons = async (item, ignoreWarnings, uploadByLink) => {
  try {
    const token = await getTokenCSRF();

    const uploadParams = new FormData();
    if (!uploadByLink) {
      // Fetch the file as a Blob
      const fileRes = await axios.get(item.imagelink, {
        responseType: "blob", // Important: Fetch as a Blob
      });

      const fileBlob = new Blob([fileRes.data], {
        type: fileRes.headers["content-type"],
      });
      uploadParams.append("file", fileBlob, item.filename); // Append file with filename
    } else {
      uploadParams.append("url", item.imagelink);
    }
    uploadParams.append("filename", item.filename);
    uploadParams.append("text", item.infoPanel);

    if (ignoreWarnings) {
      uploadParams.append("ignorewarnings", true);
    }

    uploadParams.append(
      "comment",
      "Uploaded with experimental media library-assisted upload tool [[Category:Uploaded with Catrapilha|Catrapilha 1.3]] (contact [[User talk:DarwIn|DarwIn]] for any issues)"
    );
    uploadParams.append("token", token);

    // Perform the upload request
    const res = await axios.post(
      "/comapi/w/api.php?action=upload&format=json",
      uploadParams,
      {
        headers: {
          "Content-Type": "multipart/form-data", // Ensure correct content type
          Authorization: `Bearer ${AUTH_TOKEN}`,
        },
      }
    );

    if (res.status !== 200) {
      throw new Error(`${res.status}: ${res.statusText}`);
    }

    const data = res.data;

    if (data.error) {
      throw new Error(`${data.error.code}: ${data.error.info}`);
    }

    return data;
  } catch (error) {
    console.error("Upload failed:", error);
    throw error;
  }
};

export const getFile = async imagelink => {
  try {
    const res = await axios.get(imagelink);

    // Validar se o pedido foi feito com sucesso. Pedidos são feitos com sucesso normalmente quando o status é entre 200 e 299
    if (res.status !== 200) {
      throw new Error("Erro:" + res.status);
    } else {
      return res;
    }
  } catch (error) {
    console.error("getFile failed:", error);
  }
};
