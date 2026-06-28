const KNOWN_CC_AUTHORS = new Set([
  "José Lemos Silva",
  "Lemos Silva",
  "{{creator:Álvaro Nascimento Figueira}}",
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
  const normalized = normalizeText(value).replace(/[’']/g, "");

  return (
    normalized.includes("atelier vicente") ||
    normalized.includes("fotografia vicentes") ||
    normalized.includes("photographia museu vicentes") ||
    normalized.includes("photographia-museu vicentes") ||
    normalized.includes("museu vicentes") ||
    normalized.includes("vicentes photographos") ||
    normalized.includes("vicentes fotografos")
  );
};

const hasVicentesCreditInDescription = description => {
  const firstParagraph = String(description || "").split(
    new RegExp(String.raw`</p>`, "i"),
  )[0];

  const lineBreakPattern = new RegExp(String.raw`<br\s*/?>|\r?\n`, "i");

  const lines = firstParagraph
    .split(lineBreakPattern)
    .map(cleanExtractedHtml)
    .filter(Boolean)
    .slice(0, 12);

  return lines.some(line => {
    const isCreditLine = /^(?:photographia|fotografia|atelier|museu)\b/i.test(
      line.trim(),
    );

    return isCreditLine && isVicentes(line);
  });
};

const hasPerestrellosCreditInDescription = description => {
  const firstParagraph = String(description || "").split(
    new RegExp(String.raw`</p>`, "i"),
  )[0];

  const lineBreakPattern = new RegExp(String.raw`<br\s*/?>|\r?\n`, "i");

  const lines = firstParagraph
    .split(lineBreakPattern)
    .map(cleanExtractedHtml)
    .filter(Boolean)
    .slice(0, 12);

  return lines.some(line => {
    const isCreditLine = /^fotografia\b/i.test(line.trim());

    return isCreditLine && isPerestrellos(line);
  });
};

const isAlvaroNascimentoFigueira = value => {
  return normalizeText(value).includes("alvaro nascimento figueira");
};

const isFranciscoFranco = value => {
  const normalized = normalizeText(value)
    .replace(/[.,;:]+$/g, "")
    .trim();

  return normalized === "francisco franco";
};

const formatAuthorForCommons = author => {
  const value = String(author || "").trim();

  if (isFranciscoFranco(value)) {
    return "{{creator:Francisco Franco}}";
  }

  return value;
};

export const buildArqAuthor = ({
  linkhtml = "",
  description = "",
  categoriesText = "",
  preferWorkAuthor = false,
} = {}) => {
  const imageAuthor = extractArqField(linkhtml, "Autor da Imagem");
  const author = extractArqField(linkhtml, "Autor");

  const candidate = preferWorkAuthor && author ? author : imageAuthor || author;

  const normalizedDescription = normalizeText(description);

  const normalizedCandidate = normalizeText(candidate);

  if (
    isPerestrellos(candidate) ||
    isPerestrellos(author) ||
    hasPerestrellosCreditInDescription(description) ||
    normalizedDescription.includes("fotografia perestrellos") ||
    normalizedDescription.includes("colecao perestrellos") ||
    normalizedDescription.includes("coleccao perestrellos")
  ) {
    return "{{creator:Perestrellos Photographos}}";
  }

  if (normalizedCandidate === "rui carita") {
    return "{{creator:Rui Carita}}";
  }

  if (isFranciscoFranco(candidate)) {
    return "{{creator:Francisco Franco}}";
  }

  if (
    isVicentes(candidate) ||
    isVicentes(author) ||
    hasVicentesCreditInDescription(description)
  ) {
    return "{{creator:Photographia Vicente}}";
  }

  if (normalizeText(candidate) === "foto figueiras") {
    return "{{creator:Foto Figueiras}}";
  }

  if (
    isAlvaroNascimentoFigueira(candidate) ||
    isAlvaroNascimentoFigueira(author)
  ) {
    return "{{creator:Álvaro Nascimento Figueira}}";
  }

  if (authorIsKnown(candidate)) {
    return candidate;
  }

  const institutionalAuthors = new Set([
    "abm",
    "abm/arm",
    "arquivo regional da madeira",
    "associacao academica da universidade da madeira",
    "biblioteca municipal do funchal",
    "bnl",
    "cam",
    "drac",
    "direcao regional da cultura",
    "direccao regional da cultura",
    "hemeroteca digital",
    "museu da quinta das cruzes",
    "museu henrique e francisco franco",
    "museu militar da madeira",
    "museu nacional de arte contemporanea",
    "masf",
    "privado",
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

const PORTUGUESE_MONTHS = {
  janeiro: "01",
  fevereiro: "02",
  marco: "03",
  abril: "04",
  maio: "05",
  junho: "06",
  julho: "07",
  agosto: "08",
  setembro: "09",
  outubro: "10",
  novembro: "11",
  dezembro: "12",
};

export const extractArqPhotographDate = description => {
  const text = stripHtml(description);

  const textDatePattern =
    /\b(?:fotografia|foto)\b[^.\n]{0,160}?(?:\b(?:de|em)\s*)?(\d{1,2})\s+de\s+([A-Za-zÀ-ÖØ-öø-ÿ]+)\s+de\s+(\d{4})\b/i;

  const textDateMatch = textDatePattern.exec(text);

  if (textDateMatch) {
    const [, rawDay, rawMonth, year] = textDateMatch;
    const month = PORTUGUESE_MONTHS[normalizeText(rawMonth)];
    const day = Number(rawDay);

    if (month && day >= 1 && day <= 31) {
      return `${year}-${month}-${String(day).padStart(2, "0")}`;
    }
  }

  const numericDatePattern = new RegExp(
    String.raw`\b(?:fotografia|foto)\b[^.\n]{0,160}?(?:\b(?:de|em)\s*)?(\d{1,2})(?:/|\.|-)(\d{1,2})(?:/|\.|-)(\d{4})\b`,
    "i",
  );

  const numericDateMatch = numericDatePattern.exec(text);

  if (numericDateMatch) {
    const [, rawDay, rawMonth, year] = numericDateMatch;
    const day = Number(rawDay);
    const month = Number(rawMonth);

    if (day >= 1 && day <= 31 && month >= 1 && month <= 12) {
      return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(
        2,
        "0",
      )}`;
    }
  }

  const photographMonthYearOnlyPattern = new RegExp(
    String.raw`\b(?:fotografia|foto)\b\s+(?:de|em)\s+([A-Za-zÀ-ÖØ-öø-ÿ]+)\s+de\s+((?:18|19|20)\d{2})(?:\s*\(\s*(c\.)\s*\))?`,
    "i",
  );

  const photographMonthYearOnlyMatch =
    photographMonthYearOnlyPattern.exec(text);

  if (photographMonthYearOnlyMatch) {
    const [, rawMonth, year, circaMarker] = photographMonthYearOnlyMatch;

    const month = PORTUGUESE_MONTHS[normalizeText(rawMonth)];

    if (month) {
      const date = `${year}-${month}`;

      return circaMarker ? `{{circa|${date}}}` : date;
    }
  }

  const photographerMonthYearPattern = new RegExp(
    String.raw`\b(?:fotografia|foto)\b\s+de\s+[^,.\n]{1,160},\s*([A-Za-zÀ-ÖØ-öø-ÿ]+)\s+de\s+((?:18|19|20)\d{2})(?:\s*\(\s*(c\.)\s*\))?`,
    "i",
  );

  const photographerMonthYearMatch = photographerMonthYearPattern.exec(text);

  if (photographerMonthYearMatch) {
    const [, rawMonth, year, circaMarker] = photographerMonthYearMatch;

    const month = PORTUGUESE_MONTHS[normalizeText(rawMonth)];

    if (month) {
      const date = `${year}-${month}`;

      return circaMarker ? `{{circa|${date}}}` : date;
    }
  }

  const photographerYearPattern = new RegExp(
    String.raw`\b(?:fotografia|foto)\b\s+de\s+[^,.\n]{1,160},\s*((?:18|19|20)\d{2})(?:\s*\(\s*(c\.)\s*\))?`,
    "i",
  );

  const photographerYearMatch = photographerYearPattern.exec(text);

  if (photographerYearMatch) {
    const [, year, circaMarker] = photographerYearMatch;

    return circaMarker ? `{{circa|${year}}}` : year;
  }

  const perestrellosDatePattern = new RegExp(
    String.raw`\bfotografia\s+(?:de\s+)?["“']?perestrellos(?:\s+photographos)?["”']?\s*,?\s*((?:18|19|20)\d{2})(?:\s*\(\s*(c\.)\s*\))?`,
    "i",
  );

  const perestrellosDateMatch = perestrellosDatePattern.exec(text);

  if (perestrellosDateMatch) {
    const [, year, circaMarker] = perestrellosDateMatch;

    return circaMarker ? `{{circa|${year}}}` : year;
  }

  const yearOnlyPattern = new RegExp(
    String.raw`\b(?:fotografia|foto)\b\s*(?:de|em)\s*((?:18|19|20)\d{2})(?:\s*\(\s*(c\.)\s*\))?`,
    "i",
  );

  const yearOnlyMatch = yearOnlyPattern.exec(text);

  if (yearOnlyMatch) {
    const [, year, circaMarker] = yearOnlyMatch;

    return circaMarker ? `{{circa|${year}}}` : year;
  }

  return "";
};

export const buildArqDate = (
  linkhtml,
  author,
  title = "",
  description = "",
) => {
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

  const yearMatch = /^(\d{4})/.exec(date);
  const year = yearMatch ? yearMatch[1] : "";

  const firstParagraph = String(description || "").split(
    new RegExp(String.raw`</p>`, "i"),
  )[0];

  const circaPattern = year
    ? new RegExp(`${escapeRegExp(year)}\\s*\\(\\s*c\\.\\s*\\)`, "i")
    : null;

  if (circaPattern && circaPattern.test(`${title}\n${firstParagraph}`)) {
    return `{{circa|${date}}}`;
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

export const getArqLicense = date => {
  const value = String(date || "")
    .replace("{{circa|", "")
    .replace("}}", "")
    .trim();

  const match = /^(\d{4})(?:-(\d{2})-(\d{2}))?/.exec(value);

  if (!match) {
    return "PD-old-100-expired";
  }

  const year = Number(match[1]);
  const month = Number(match[2] || 0);
  const day = Number(match[3] || 0);

  const currentYear = new Date().getFullYear();
  const urraStartYear = currentYear - 95;
  const old70StartYear = currentYear - 100;

  const isAfterUrraLimit =
    year > 1970 ||
    (year === 1970 && month && day && (month > 7 || (month === 7 && day >= 1)));

  if (isAfterUrraLimit) {
    return "CC-BY-SA 4.0";
  }

  if (year >= urraStartYear) {
    return "PD-Portugal-URAA";
  }

  if (year >= old70StartYear) {
    return "PD-old-70-expired";
  }

  return "PD-old-100-expired";
};

export const formatArqLicenseTemplate = license => {
  const licenseValue = normalizeArqLicenseValue(license);

  return licenseValue === "CC-BY-SA 4.0"
    ? "{{Arquipelagos license|}}"
    : `{{Arquipelagos license|${licenseValue}}}`;
};

export const buildArqCategories = (author, linkhtml = "") => {
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
    categories.push("Photographs by Photographia Vicente in ABM");
  } else if (author === "{{creator:Foto Figueiras}}") {
    categories.push("Photographs by Foto Figueiras");
  } else if (author === "{{creator:Álvaro Nascimento Figueira}}") {
    categories.push("Photographs by Álvaro Nascimento Figueira in ABM");
  }

  const imageOwner = extractArqField(linkhtml, "Proprietário da Imagem");

  const pieceOwner = extractArqField(linkhtml, "Proprietário da Peça");

  if (isVicentes(imageOwner) || isVicentes(pieceOwner)) {
    categories.push(
      "Photographs in Arquivo Regional e Biblioteca Pública da Madeira",
    );
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

  const rawAuthor = authorOverride === "" ? item.author : authorOverride;

  const effectiveAuthor = formatAuthorForCommons(rawAuthor);

  const autoCategories = buildArqCategories(item.author, item.linkhtml)
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

  const manualLicense = normalizeArqLicenseValue(updatedItem.manualLicense);

  const normalizedManualLicense = normalizeText(manualLicense).replace(
    /\s+/g,
    "",
  );

  const isArtLicense =
    normalizedManualLicense === "art" || normalizedManualLicense === "art70";

  const automaticAuthor = buildArqAuthor({
    linkhtml: html,
    description: updatedItem.description,
    categoriesText,
    preferWorkAuthor: isArtLicense,
  });

  const manualAuthor = String(authorOverride || "").trim();

  const hasManualAuthor =
    Object.prototype.hasOwnProperty.call(updatedItem, "manualAuthor") ||
    manualAuthor !== "";

  if (hasManualAuthor) {
    updatedItem.manualAuthor = manualAuthor;
  }

  updatedItem.author = manualAuthor
    ? formatAuthorForCommons(manualAuthor)
    : automaticAuthor;

  const pieceDate = buildArqDate(
    html,
    updatedItem.author,
    updatedItem.title,
    updatedItem.description,
  );

  const photographDate = extractArqPhotographDate(updatedItem.description);

  const automaticDate = photographDate || pieceDate;

  updatedItem.license = manualLicense || getArqLicense(automaticDate);

  const manualDate = String(dateOverride || "").trim();

  const hasManualDate =
    Object.prototype.hasOwnProperty.call(updatedItem, "manualDate") ||
    manualDate !== "";

  if (hasManualDate) {
    updatedItem.manualDate = manualDate;
  }

  updatedItem.date = manualDate
    ? manualDate
    : isArtLicense
      ? pieceDate || automaticDate
      : photographDate || pieceDate || updatedItem.date || "Unknown Date";

  updatedItem.categories = buildArqCategories(updatedItem.author, html);

  updatedItem.infoPanel = buildArqInfoPanel(updatedItem, {
    categoriesText,
  });

  return updatedItem;
};
