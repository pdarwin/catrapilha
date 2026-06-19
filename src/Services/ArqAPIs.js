import axios from "axios";

const ARQ_BASE_URL = "https://www.arquipelagos.pt";
const ARQ_API_BASE_URL = `${ARQ_BASE_URL}/wp-json/wp/v2`;

/**
 * Fetch one page from Arquipélagos WordPress API.
 */
export const fetchArqListPage = async page => {
  return axios.get(`${ARQ_API_BASE_URL}/imagem`, {
    params: {
      page: Number(page) || 1,
      per_page: 100,
    },
  });
};

/**
 * Fetch a single Arquipélagos item by ID.
 */
export const fetchArqItemById = async itemId => {
  const res = await axios.get(`${ARQ_API_BASE_URL}/imagem/${itemId}`, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (res.status !== 200) {
    throw new Error("Erro:" + res.status);
  }

  return res.data;
};

/**
 * Fetch featured media metadata from a WordPress media URL.
 */
export const fetchArqFeaturedMedia = async featuredMediaUrl => {
  if (!featuredMediaUrl) {
    return null;
  }

  const replacedUrl = featuredMediaUrl.replace(
    "https://www.arquipelagos.pt",
    "/arqapi",
  );

  const res = await axios.get(replacedUrl);

  if (res.status !== 200) {
    throw new Error("Erro:" + res.status);
  }

  return res.data;
};

/**
 * Fetch the HTML page of an Arquipélagos item.
 */
export const fetchArqItemHTML = async arqLink => {
  if (!arqLink) {
    return "";
  }

  const replacedLink = arqLink.replace(
    "https://www.arquipelagos.pt",
    "/arqapi",
  );

  const res = await axios.get(replacedLink);

  if (res.status !== 200) {
    throw new Error("Erro:" + res.status);
  }

  return res.data;
};
