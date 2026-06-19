import { actionsD } from "../../../Reducers/DataReducer";
import {
  fetchArqFeaturedMedia,
  fetchArqItemById,
  fetchArqItemHTML,
  fetchArqListPage,
} from "../../../Services/ArqAPIs";
import { getProject } from "../../../Utils/ProjectUtils";

export const getArqListItems = async (dataState, dataDispatch) => {
  try {
    const project = getProject(dataState.projectId);
    let page = Number(dataState.root || project.root || 1);

    const localDataset = [...(dataState.data || [])];
    const localItems = [];

    const existingIds = new Set(localDataset.map(item => Number(item.id)));

    let totalPages = null;
    let processedPages = 0;

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

      const filterText = normalizeText(dataState.filter);

      if (filterText && filterText !== "/clear/") {
        rawItems = rawItems.filter(item => {
          const titleStr = item.title?.rendered || "";
          const contentStr = item.content?.rendered || "";

          const searchableText = normalizeText(`${titleStr} ${contentStr}`);

          return searchableText.includes(filterText);
        });
      }

      for (const rawItem of rawItems) {
        if (localItems.length >= dataState.maxItems) {
          break;
        }

        if (existingIds.has(Number(rawItem.id))) {
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
          localItems.push(item);
          existingIds.add(Number(rawItem.id));

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

const stripHtml = html => {
  if (!html) {
    return "";
  }

  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&#8211;/g, "–")
    .replace(/&#8212;/g, "—")
    .replace(/&#8216;/g, "‘")
    .replace(/&#8217;/g, "’")
    .replace(/&#8220;/g, "“")
    .replace(/&#8221;/g, "”")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
};

const sanitizeFilename = text => {
  if (!text) {
    return "Sem título";
  }

  return text
    .replace(/[/:*?"<>|[\]{}#%]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .substring(0, 120);
};

export const buildArqItemDetail = async (listItem, dataState) => {
  const fetchedItem = await fetchArqItemById(listItem.id);
  const linkhtml = await fetchArqItemHTML(fetchedItem.link || listItem.link);

  const imageData = extractArqImageData(linkhtml);

  const title =
    fetchedItem.title && typeof fetchedItem.title.rendered === "string"
      ? stripHtml(fetchedItem.title.rendered)
      : listItem.title || "Untitled";

  const description = buildArqDescription(
    fetchedItem.content?.rendered || listItem.description || "",
  );

  const author = buildArqAuthor(
    linkhtml,
    description,
    dataState.categories || "",
  );

  const date = buildArqDate(linkhtml, author, title);
  const licenseValue = getArqLicense(author, date);

  const item = {
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
    description,
    author,
    date,
    license: licenseValue,
    source: `{{SourceArquipelagos|${fetchedItem.link || listItem.link}}}`,
    categories: buildArqCategories(author, date, dataState.categories || ""),
    readyToUpload: false,
    needsDetail: false,
  };

  item.infoPanel = buildArqInfoPanel(item, dataState);

  return item;
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

const authorIsKnown = author => {
  return (
    author === "José Lemos Silva" ||
    author === "Lemos Silva" ||
    author === "{{creator:Rui Carita}}" ||
    author === "Virgílio Gomes" ||
    author === "Gilberto Garrido" ||
    author === "João Carita"
  );
};

const buildArqDescription = description => {
  return description
    .replace(/<p (.*?)>/gi, "<p>")
    .replace(/<br \/>\n<\/strong>/gi, "</strong><br />\n")
    .replace(/<b>(.*?)<\/b>/gi, "'''$1'''")
    .replace(/<strong>(.*?)<\/strong>/gi, "'''$1'''")
    .replace(/<a class="normalBlackFont1".*>(.*?)<\/a>/gi, "$1")
    .replace(/<a name.*?>(.*?)<\/a>/gi, "$1")
    .replace(/<em>(.*?)<\/em>/gi, "''$1''")
    .replace(/<i>(.*?)<\/i>/gi, "''$1''")
    .replace(/&#8211;/gi, "–")
    .replace(/&#8216;/gi, "‘")
    .replace(/&#8217;/gi, "’")
    .replace(/&#8220;/gi, "“")
    .replace(/&#8221;/gi, "”")
    .replace(/&#8230;/gi, "…")
    .replace(/<span .*?>(.*?)<\/span>/gi, "$1")
    .replace(/<span .*?>/gi, "")
    .replace(/<\/span>/gi, "")
    .replace(/'''\s'''/gi, " ")
    .replace(/''''''/gi, '"')
    .trim();
};

const buildArqAuthor = (linkhtml, description, categoriesText) => {
  const author = extractArqField(linkhtml, "Autor da Imagem");
  const author2 = extractArqField(linkhtml, "Autor");

  if (author === "Rui Carita" || author === "Perestrellos Photographos") {
    return "{{creator:" + author + "}}";
  }

  if (author === "Fotografia Vicentes" || author2 === "Vicentes Photographos") {
    return "{{creator:Photographia Vicente}}";
  }

  if (
    author === "Perestellos Fotógrafos" ||
    author === "ABM/ARM/Perestrellos" ||
    author === "Foto Perestrellos" ||
    description.indexOf("Fotografia ''Perestrellos''") !== -1
  ) {
    return "{{creator:Perestrellos Photographos}}";
  }

  if (author === "Foto Figueiras") {
    return "{{creator:Foto Figueiras}}";
  }

  if (author === "ABM/ARM") {
    return description;
  }

  if (
    author === "Arquivo Regional da Madeira" ||
    author === "Privado" ||
    author === "Museu Militar da Madeira" ||
    author === "Museu da Quinta das Cruzes" ||
    author === "MASF"
  ) {
    return author2;
  }

  if (authorIsKnown(author)) {
    return author;
  }

  if (
    categoriesText.indexOf("[[Category:Diário de Notícias (Madeira)]]") !== -1
  ) {
    return "Diário de Notícias (Madeira)";
  }

  return author || "Desconhecido";
};

const buildArqDate = (linkhtml, author, title) => {
  const datePattern = /.*Data da Peça.*?text-left"\s?>(.*?)(<\/div>)/s;
  const dateMatch = datePattern.exec(linkhtml);

  if (!dateMatch || dateMatch.length < 2) {
    return "Unknown Date";
  }

  let date = dateMatch[1].replace(" 00:00:00", "").trim();

  if (date.includes("-00-00")) {
    date = date.replace("-00-00", "");
  }

  if (title.includes("(c.)") && !authorIsKnown(author)) {
    date = "{{circa|" + date + "}}";
  }

  return date;
};

const getArqLicense = (author, date) => {
  const currentYear = new Date().getFullYear();

  const dateYear = parseInt(
    String(date).replace("{{circa|", "").replace("}}", "").substring(0, 4),
    10,
  );

  if (authorIsKnown(author)) {
    return "CC-BY-SA 4.0";
  }

  if (!Number.isNaN(dateYear) && currentYear - dateYear < 95) {
    return "PD-Portugal-URAA";
  }

  return "PD-old-100-expired";
};

const buildArqCategories = (author, date, categoriesText) => {
  const categories = ["Uploaded with Catrapilha"];

  if (author === "{{creator:Rui Carita}}") {
    categories.push("Photographs by Rui Carita");
  } else if (author === "José Lemos Silva" || author === "Lemos Silva") {
    categories.push("Photographs by José Lemos Silva");
  } else if (author === "Virgílio Gomes") {
    categories.push("Photographs by Virgílio Gomes");
  } else if (author === "{{creator:Perestrellos Photographos}}") {
    categories.push("Photographs by Perestrellos Photographos in ABM");
  }

  if (
    categoriesText.indexOf("[[Category:Diário de Notícias (Madeira)]]") !== -1
  ) {
    categories.push(`Diário de Notícias (Madeira)|${date}`);
    categories.push(date);
  }

  return categories;
};

const buildArqInfoPanel = (item, dataState) => {
  const extraCategories = item.categories
    .map(category => `[[Category:${category}]]`)
    .join("\n");

  const licenseTemplate =
    item.license === "CC-BY-SA 4.0"
      ? "{{Arquipelagos license|}}"
      : `{{Arquipelagos license|${item.license}}}`;

  return (
    "=={{int:filedesc}}==\n{{Information\n|description={{pt|1=" +
    item.description +
    "}}\n|date=" +
    (dataState.date === "" ? item.date : dataState.date) +
    "\n|source={{SourceArquipelagos|" +
    item.link +
    "}}\n|author=" +
    (dataState.author === "" ? item.author : dataState.author) +
    "\n|permission=\n|other versions=\n}}\n\n" +
    "=={{int:license-header}}==\n" +
    licenseTemplate +
    "\n\n" +
    extraCategories +
    "\n"
  );
};

const cleanExtractedHtml = value => {
  if (!value) {
    return "";
  }

  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
};

const escapeRegExp = value => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

const extractArqField = (linkhtml, label) => {
  const escapedLabel = escapeRegExp(label);

  const pattern = new RegExp(
    `<div[^>]*>\\s*${escapedLabel}:?\\s*<\\/div>\\s*` +
      `<div[^>]*class=["'][^"']*text-left[^"']*["'][^>]*>\\s*([\\s\\S]*?)\\s*<\\/div>`,
    "i",
  );

  const match = pattern.exec(linkhtml);

  return match ? cleanExtractedHtml(match[1]) : "";
};

const normalizeText = value => {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
};
