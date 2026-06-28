import { actionsD } from "../../../Reducers/DataReducer";
import {
  fetchArqFeaturedMedia,
  fetchArqItemById,
  fetchArqItemHTML,
  fetchArqListPage,
} from "../../../Services/ArqAPIs";
import { getProject } from "../../../Utils/ProjectUtils";
import {
  buildArqItemMetadata,
  normalizeText,
  sanitizeFilename,
  stripHtml,
} from "./ArqMetadataUtils";

const getLatestStatusById = dataset => {
  const statusById = new Map();

  (dataset || []).forEach(record => {
    if (record && record.id !== undefined && record.id !== null) {
      statusById.set(Number(record.id), record.status);
    }
  });

  return statusById;
};

const matchesArqFilter = (rawItem, filterText) => {
  if (!filterText) {
    return true;
  }

  const title = rawItem.title?.rendered || "";
  const content = rawItem.content?.rendered || "";

  return normalizeText(`${title} ${content}`).includes(filterText);
};

export const getArqListItems = async (dataState, dataDispatch) => {
  try {
    const project = getProject(dataState.projectId);
    let page = Number(dataState.root || project.root || 1);

    const localDataset = [...(dataState.data || [])];
    const localItems = [...(dataState.items || [])];

    const latestStatusById = getLatestStatusById(localDataset);
    const addedIds = new Set(localItems.map(item => Number(item.id)));

    const shownItemIds = new Set(
      (dataState.shownItemIds || []).map(id => Number(id)),
    );

    const includeNotTransferred = Boolean(dataState.includeNotTransferred);

    let totalPages = null;
    let processedPages = 0;
    const filterText = normalizeText(dataState.filter);
    const isSearchActive = Boolean(filterText && filterText !== "/clear/");

    let firstFoundPage = null;

    const updateProgress = payload => {
      dataDispatch({
        type: actionsD.setListProgress,
        payload: {
          projectId: dataState.projectId,
          maxItems: dataState.maxItems,
          ...payload,
        },
      });
    };

    updateProgress({
      message: "A iniciar carregamento do Arquipélagos",
      page,
      totalPages: 0,
      found: 0,
      currentId: null,
      currentTitle: "",
    });

    while (
      localItems.length < dataState.maxItems &&
      (totalPages === null || page <= totalPages)
    ) {
      console.log(`Fetching ARQ API page: ${page}`);

      updateProgress({
        message: "A consultar página do Arquipélagos",
        page,
        totalPages: totalPages || 0,
        found: localItems.length,
        currentId: null,
        currentTitle: "",
      });

      const res = await fetchArqListPage(page);

      if (!res || res.status !== 200) {
        throw new Error(`Erro ao carregar página ARQ ${page}`);
      }

      totalPages = Number(res.headers["x-wp-totalpages"] || 0) || null;

      updateProgress({
        message: "A analisar imagens do Arquipélagos",
        page,
        totalPages: totalPages || 0,
        found: localItems.length,
      });

      let rawItems = res.data || [];

      if (isSearchActive) {
        rawItems = rawItems.filter(item => matchesArqFilter(item, filterText));
      }

      for (const rawItem of rawItems) {
        if (localItems.length >= dataState.maxItems) {
          break;
        }

        const rawItemId = Number(rawItem.id);

        const previousStatus = String(
          latestStatusById.get(rawItemId) || "",
        ).toUpperCase();

        const isReviewItem = includeNotTransferred && previousStatus === "N";

        if (
          addedIds.has(rawItemId) ||
          shownItemIds.has(rawItemId) ||
          (previousStatus && !isReviewItem)
        ) {
          continue;
        }

        updateProgress({
          message: "A preparar imagem do Arquipélagos",
          page,
          totalPages: totalPages || 0,
          found: localItems.length,
          currentId: rawItem.id,
          currentTitle: stripHtml(rawItem.title?.rendered || ""),
        });

        const item = await processArqListItem(rawItem);

        if (item) {
          if (firstFoundPage === null) {
            firstFoundPage = page;
          }

          localItems.push({
            ...item,
            reviewStatus: isReviewItem ? "N" : null,
          });
          addedIds.add(Number(rawItem.id));

          updateProgress({
            message: "Imagem adicionada à lista",
            page,
            totalPages: totalPages || 0,
            found: localItems.length,
            currentId: item.id,
            currentTitle: item.title || "",
          });
        }
      }

      page++;
      processedPages++;

      if (processedPages % 5 === 0) {
        console.log(`ARQ batch update after ${processedPages} API pages.`);
      }
    }

    console.log(`ARQ returning ${localItems.length} list items.`);

    updateProgress({
      message: "Lista de imagens pronta",
      page: page - 1,
      totalPages: totalPages || 0,
      found: localItems.length,
      currentId: null,
      currentTitle: "",
    });

    if (
      isSearchActive &&
      localItems.length >= dataState.maxItems &&
      firstFoundPage !== null &&
      firstFoundPage !== Number(dataState.root || 1)
    ) {
      dataDispatch({
        type: actionsD.setRoot,
        payload: firstFoundPage,
      });
    }

    dataDispatch({
      type: actionsD.addShownItemIds,
      payload: localItems.map(item => item.id),
    });

    dataDispatch({
      type: actionsD.updateItems,
      payload: localItems,
    });
  } catch (error) {
    console.error("getArqListItems Error:", error);
    throw error;
  }
};

const processArqListItem = async rawItem => {
  try {
    const featuredMediaUrl =
      rawItem._links?.["wp:featuredmedia"]?.[0]?.href || null;

    const media = await fetchArqFeaturedMedia(featuredMediaUrl);
    const imageUrl = getBestImageUrl(media);

    const originalFilename = getOriginalFilename(media, imageUrl);
    const extension = getExtension(originalFilename || imageUrl);

    return {
      ...rawItem,

      id: rawItem.id,

      image: imageUrl || "",
      imagelink: imageUrl || "",

      title: stripHtml(rawItem.title?.rendered || "Untitled"),
      rawTitle: rawItem.title || { rendered: "Untitled" },
      rawContent: rawItem.content || { rendered: "" },

      link: rawItem.link || "",
      linkhtml: "",

      originalFilename:
        originalFilename || `arquipelagos-${rawItem.id}.${extension}`,
      filename: buildInitialFilename(rawItem, originalFilename, extension),

      description: rawItem.content?.rendered || "",
      author: "",
      date: "",
      license: "",
      source: rawItem.link ? `{{SourceArquipelagos|${rawItem.link}}}` : "",
      infoPanel: "",

      tags: [],
      categories: [],
      file: null,
      readyToUpload: false,

      needsDetail: true,
      reviewStatus: null,
    };
  } catch (error) {
    console.error("processArqListItem Error for item ID:", rawItem.id, error);
    return null;
  }
};

const buildInitialFilename = (rawItem, originalFilename, extension) => {
  if (originalFilename) {
    const baseName = originalFilename.replace(/\.[^.]+$/, "");
    return `${baseName} - Image ${rawItem.id}.${extension}`;
  }

  const title = stripHtml(rawItem.title?.rendered || "Arquipelagos");
  return `${sanitizeFilename(title)} - Image ${rawItem.id}.${extension}`;
};

const getBestImageUrl = media => {
  if (!media) {
    return "";
  }

  return (
    media.media_details?.sizes?.full?.source_url ||
    media.media_details?.sizes?.large?.source_url ||
    media.media_details?.sizes?.medium?.source_url ||
    media.source_url ||
    ""
  );
};

const getOriginalFilename = (media, imageUrl) => {
  if (media?.media_details?.file) {
    return media.media_details.file.split("/").pop();
  }

  if (imageUrl) {
    return imageUrl.split("/").pop().split("?")[0];
  }

  return "";
};

const getExtension = filename => {
  if (!filename || !filename.includes(".")) {
    return "jpg";
  }

  return filename.split(".").pop().split("?")[0].toLowerCase() || "jpg";
};

export const buildArqItemDetail = async (listItem, dataState) => {
  const fetchedItem = await fetchArqItemById(listItem.id);
  const linkhtml = await fetchArqItemHTML(fetchedItem.link || listItem.link);

  const imageData = extractArqImageData(linkhtml);

  const title =
    fetchedItem.title && typeof fetchedItem.title.rendered === "string"
      ? stripHtml(fetchedItem.title.rendered)
      : listItem.title || "Untitled";

  const baseItem = {
    ...listItem,
    id: fetchedItem.id,
    title,
    filename: imageData.filename
      ? imageData.filename.replace(".jpg", ` - Image ${fetchedItem.id}.jpg`)
      : listItem.filename,
    link: fetchedItem.link || listItem.link,
    linkhtml,
    imagelink: imageData.imageUrl || listItem.imagelink,
    content: fetchedItem.content?.rendered || "",
    description: fetchedItem.content?.rendered || listItem.description || "",
    source: `{{SourceArquipelagos|${fetchedItem.link || listItem.link}}}`,
    readyToUpload: false,
    needsDetail: false,
  };

  return buildArqItemMetadata({
    item: baseItem,
    linkhtml,
    categoriesText: dataState.categories || "",
    dateOverride: Object.prototype.hasOwnProperty.call(listItem, "manualDate")
      ? listItem.manualDate
      : dataState.date || "",

    authorOverride: Object.prototype.hasOwnProperty.call(
      listItem,
      "manualAuthor",
    )
      ? listItem.manualAuthor
      : dataState.author || "",
  });
};

const extractArqImageData = linkhtml => {
  const imgMatch =
    /<img[^>]+src=["']([^"']+)["'][^>]*class=["'][^"']*card-img mb-2[^"']*["']/i.exec(
      linkhtml,
    );

  const imageUrl = imgMatch ? imgMatch[1] : "";

  const filename = imageUrl ? imageUrl.split("/").pop().split("?")[0] : "";

  return {
    imageUrl,
    filename,
  };
};
