import axios from "axios";

/**
 * Fetch list items from Arquipelagos API and apply filtering.
 */
export const getArqListItems = async (
  page,
  filter,
  existingItems,
  maxItems
) => {
  try {
    const res = await axios.get(
      `https://www.arquipelagos.pt/wp-json/wp/v2/imagem`,
      {
        params: {
          page: page,
          per_page: 100,
        },
      }
    );

    if (res.status !== 200) {
      throw new Error(`Erro: ${res.status}`);
    }

    const items = res.data;
    const totalPages = parseInt(res.headers["x-wp-totalpages"], 10);

    // Filter out existing items
    let filteredItems = items.filter(
      item => !existingItems.some(arqItem => arqItem.id === item.id)
    );

    // Apply additional filter if provided
    if (filter && filter !== "/CLEAR/") {
      filteredItems = filteredItems.filter(item => {
        const titleStr = item.title.rendered || "";
        const contentStr = item.content.rendered || "";
        return titleStr.includes(filter) || contentStr.includes(filter);
      });
    }

    // Sort items by id in descending order
    filteredItems.sort((a, b) => b.id - a.id);

    // Slice the array to respect the maxItems limit
    const slicedItems = filteredItems.slice(0, maxItems);

    return {
      items: slicedItems,
      totalPages: totalPages,
    };
  } catch (error) {
    console.error("getListItems Error:", error);
    throw error;
  }
};

/**
 * Fetch a single item by ID
 */
export const getArqItem = async itemId => {
  try {
    const res = await axios.get(
      `https://www.arquipelagos.pt/wp-json/wp/v2/imagem/${itemId}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (res.status !== 200) {
      throw new Error(`Erro: ${res.status}`);
    }

    return res.data;
  } catch (error) {
    console.error("getItem Error:", error);
    if (error.response && error.response.status === 400) {
      throw new Error("Bad Request");
    }
    throw error;
  }
};

/**
 * Fetch featured media (image) for a specific item
 */
export const getFeaturedMedia = async featuredMediaUrl => {
  try {
    const modifiedUrl = featuredMediaUrl.replace(
      "https://www.arquipelagos.pt",
      "arqapi"
    );
    const res = await axios.get(modifiedUrl);

    if (res.status !== 200) {
      throw new Error(`Erro: ${res.status}`);
    }

    const parsed = res.data;
    const imageUrl = parsed.media_details.sizes.medium
      ? parsed.media_details.sizes.medium.source_url
      : parsed.media_details.sizes.full.source_url;

    return imageUrl;
  } catch (error) {
    console.error("getFeaturedMedia Error:", error);
    throw error;
  }
};

/**
 * Process a single item to fetch detailed data and return a processed item.
 */
export const processArqItem = async (rawItem, abortController) => {
  if (abortController.signal.aborted) return null;

  try {
    const fetchedItem = await getArqItem(rawItem.id);
    if (abortController.signal.aborted) return null;

    const imageUrl = await getFeaturedMedia(
      fetchedItem._links["wp:featuredmedia"][0].href
    );
    if (abortController.signal.aborted) return null;

    const titleStr =
      fetchedItem.title && typeof fetchedItem.title.rendered === "string"
        ? fetchedItem.title.rendered
        : "Untitled";

    return {
      id: fetchedItem.id,
      image: imageUrl,
      title: titleStr,
    };
  } catch (error) {
    console.error("processSingleItem Error for item ID:", rawItem.id, error);
    return null;
  }
};

/**
 * Fetch a single item from Arquipelagos by its ID.
 */
export const fetchArqItemById = async itemId => {
  const res = await axios.get(
    `https://www.arquipelagos.pt/wp-json/wp/v2/imagem/${itemId}`,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (res.status !== 200) {
    throw new Error("Erro:" + res.status);
  }

  return res.data;
};

/**
 * Fetch the HTML content of an Arquipelagos item page.
 */
export const fetchArqItemHTML = async arqLink => {
  const replacedLink = arqLink.replace(
    "https://www.arquipelagos.pt",
    "/arqapi"
  );
  const res = await axios.get(replacedLink);
  if (res.status !== 200) {
    throw new Error("Erro:" + res.status);
  }
  return res.data;
};
