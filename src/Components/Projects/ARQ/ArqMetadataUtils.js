const KNOWN_CC_AUTHORS = new Set([
  "José Lemos Silva",
  "Lemos Silva",
  "{{creator:Rui Carita}}",
  "Virgílio Gomes",
  "Gilberto Garrido",
  "João Carita",
]);

export const normalizeText = value => {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
};

export const stripHtml = html => {
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
    .replace(/&#8230;/g, "…")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
};

export const sanitizeFilename = text => {
  if (!text) {
    return "Sem título";
  }

  return text
    .replace(/[/:*?"<>|[\]{}#%]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .substring(0, 120);
};

export const buildArqDescription = description => {
  return String(description || "")
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

export const cleanExtractedHtml = value => {
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
  return String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

const extractArqFieldWithRegex = (linkhtml, label) => {
  const escapedLabel = escapeRegExp(label);

  const pattern = new RegExp(
    `<div[^>]*>\\s*${escapedLabel}:?\\s*<\\/div>\\s*` +
      `<div[^>]*class=["'][^"']*text-left[^"']*["'][^>]*>\\s*([\\s\\S]*?)\\s*<\\/div>`,
    "i",
  );

  const match = pattern.exec(linkhtml);

  return match ? cleanExtractedHtml(match[1]) : "";
};

const extractArqFieldWithDomParser = (linkhtml, label) => {
  if (typeof DOMParser === "undefined") {
    return "";
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(linkhtml, "text/html");
  const divs = Array.from(doc.querySelectorAll("div"));

  const wantedLabel = normalizeText(label).replace(/:$/, "");

  for (const div of divs) {
    const text = normalizeText(div.textContent).replace(/:$/, "");

    if (text === wantedLabel) {
      let sibling = div.nextElementSibling;

      while (sibling) {
        if (
          sibling.tagName?.toLowerCase() === "div" &&
          (sibling.className || "").toString().includes("text-left")
        ) {
          return cleanExtractedHtml(sibling.innerHTML);
        }

        sibling = sibling.nextElementSibling;
      }
    }
  }

  return "";
};

export const extractArqField = (linkhtml, label) => {
  if (!linkhtml) {
    return "";
  }

  return (
    extractArqFieldWithDomParser(linkhtml, label) ||
    extractArqFieldWithRegex(linkhtml, label)
  );
};

export const authorIsKnown = author => {
  return KNOWN_CC_AUTHORS.has(author);
};

const isPerestrellos = value => {
  const normalized = normalizeText(value);

  return (
    normalized.includes("perestrellos") || normalized.includes("perestellos")
  );
};

const isVicentes = value => {
  const normalized = normalizeText(value);

  return (
    normalized === "fotografia vicentes" ||
    normalized === "vicentes photographos" ||
    normalized === "vicentes fotografos"
  );
};

export const buildArqAuthor = ({
  linkhtml = "",
  description = "",
  categoriesText = "",
} = {}) => {
  const imageAuthor = extractArqField(linkhtml, "Autor da Imagem");
  const author = extractArqField(linkhtml, "Autor");

  const candidate = imageAuthor || author;
  const normalizedDescription = normalizeText(description);

  if (normalizeText(candidate) === "rui carita") {
    return "{{creator:Rui Carita}}";
  }

  if (
    isPerestrellos(candidate) ||
    isPerestrellos(author) ||
    normalizedDescription.includes("fotografia perestrellos") ||
    normalizedDescription.includes("colecao perestrellos") ||
    normalizedDescription.includes("coleccao perestrellos")
  ) {
    return "{{creator:Perestrellos Photographos}}";
  }

  if (isVicentes(candidate) || isVicentes(author)) {
    return "{{creator:Photographia Vicente}}";
  }

  if (normalizeText(candidate) === "foto figueiras") {
    return "{{creator:Foto Figueiras}}";
  }

  if (authorIsKnown(candidate)) {
    return candidate;
  }

  const institutionalAuthors = new Set([
    "arquivo regional da madeira",
    "privado",
    "museu militar da madeira",
    "museu da quinta das cruzes",
    "masf",
    "abm/arm",
  ]);

  if (institutionalAuthors.has(normalizeText(candidate))) {
    return author || candidate || "Desconhecido";
  }

  if (
    categoriesText.indexOf("[[Category:Diário de Notícias (Madeira)]]") !== -1
  ) {
    return "Diário de Notícias (Madeira)";
  }

  return candidate || author || "Desconhecido";
};

export const buildArqDate = (linkhtml, author, title = "") => {
  let date =
    extractArqField(linkhtml, "Data da Peça") ||
    extractArqField(linkhtml, "Data de Publicação");

  if (!date) {
    return "Unknown Date";
  }

  date = date.replace(" 00:00:00", "").trim();

  if (date.includes("-00-00")) {
    date = date.replace("-00-00", "");
  }

  if (String(title).includes("(c.)") && !authorIsKnown(author)) {
    date = "{{circa|" + date + "}}";
  }

  return date;
};

export const normalizeArqLicenseValue = license => {
  if (!license) {
    return "";
  }

  const value = String(license).trim();

  const templateMatch = /\{\{Arquipelagos license\|(.*?)\}\}/i.exec(value);

  if (templateMatch) {
    return templateMatch[1] || "CC-BY-SA 4.0";
  }

  return value;
};

export const getArqLicense = (author, date) => {
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

export const formatArqLicenseTemplate = license => {
  const licenseValue = normalizeArqLicenseValue(license);

  return licenseValue === "CC-BY-SA 4.0"
    ? "{{Arquipelagos license|}}"
    : `{{Arquipelagos license|${licenseValue}}}`;
};

export const buildArqCategories = author => {
  const categories = ["Uploaded with Catrapilha"];

  if (author === "{{creator:Rui Carita}}") {
    categories.push("Photographs by Rui Carita");
  } else if (author === "José Lemos Silva" || author === "Lemos Silva") {
    categories.push("Photographs by José Lemos Silva");
  } else if (author === "Virgílio Gomes") {
    categories.push("Photographs by Virgílio Gomes");
  } else if (author === "{{creator:Perestrellos Photographos}}") {
    categories.push("Photographs by Perestrellos Photographos in ABM");
  } else if (author === "{{creator:Photographia Vicente}}") {
    categories.push("Photographs by Photographia Vicente");
  } else if (author === "{{creator:Foto Figueiras}}") {
    categories.push("Photographs by Foto Figueiras");
  }

  return categories;
};

const formatExtraCategories = (categoriesText, date) => {
  if (!categoriesText) {
    return "";
  }

  const hasDiarioNoticias =
    categoriesText.indexOf("[[Category:Diário de Notícias (Madeira)]]") !== -1;

  const replaced = categoriesText.replace(
    "[[Category:Diário de Notícias (Madeira)]]",
    "[[Category:Diário de Notícias (Madeira)|" + date + "]]",
  );

  return (
    replaced + (hasDiarioNoticias ? "\n[[Category:" + date + "]]" : "")
  ).trim();
};

export const buildArqInfoPanel = (
  item,
  { dateOverride = "", authorOverride = "", categoriesText = "" } = {},
) => {
  const effectiveDate = dateOverride === "" ? item.date : dateOverride;
  const effectiveAuthor = authorOverride === "" ? item.author : authorOverride;

  const autoCategories = buildArqCategories(item.author)
    .map(category => `[[Category:${category}]]`)
    .join("\n");

  const extraCategories = formatExtraCategories(categoriesText, item.date);

  const allCategories = [autoCategories, extraCategories]
    .filter(Boolean)
    .join("\n");

  return (
    "=={{int:filedesc}}==\n{{Information\n|description={{pt|1=" +
    item.description +
    "}}\n|date=" +
    effectiveDate +
    "\n|source={{SourceArquipelagos|" +
    item.link +
    "}}\n|author=" +
    effectiveAuthor +
    "\n|permission=\n|other versions=\n}}\n\n" +
    "=={{int:license-header}}==\n" +
    formatArqLicenseTemplate(item.license) +
    "\n\n" +
    allCategories +
    "\n"
  );
};

export const buildArqItemMetadata = ({
  item,
  linkhtml = "",
  categoriesText = "",
  dateOverride = "",
  authorOverride = "",
} = {}) => {
  const updatedItem = {
    ...item,
  };

  const html = linkhtml || updatedItem.linkhtml || "";

  updatedItem.description = buildArqDescription(
    updatedItem.description || updatedItem.content || "",
  );

  updatedItem.author = buildArqAuthor({
    linkhtml: html,
    description: updatedItem.description,
    categoriesText,
  });

  updatedItem.date =
    updatedItem.date ||
    buildArqDate(html, updatedItem.author, updatedItem.title);

  updatedItem.license =
    normalizeArqLicenseValue(updatedItem.license) ||
    getArqLicense(updatedItem.author, updatedItem.date);

  updatedItem.categories = buildArqCategories(updatedItem.author);

  updatedItem.infoPanel = buildArqInfoPanel(updatedItem, {
    dateOverride,
    authorOverride,
    categoriesText,
  });

  return updatedItem;
};
