import { actionsD } from "../../Reducers/DataReducer";
import { fetchPMPA1Page } from "../../Services/PMPAApis";
import { getProject } from "../../Utils/ProjectUtils";
const cheerio = require("cheerio");

export const getPMPA1ListItems = async (dataState, dataDispatch) => {
  try {
    const project = getProject(dataState.projectId);
    let page = project.root;

    // Local dataset to hold updated records
    const localDataset = [...dataState.data];
    const localItems = []; // Initialize local items array
    const fetchedPages = new Set(localDataset.map(item => item.id));

    // Counter to track processed pages
    let processedPages = 0;

    while (localItems.length < dataState.maxItems) {
      // Skip already fetched pages
      while (fetchedPages.has(page)) {
        page++;
      }

      const res = await fetchPMPA1Page(page);

      if (res && res.data) {
        const metadata = processImageMetadata(res.data);

        // Check if downloadLinks array is empty
        if (!metadata.downloadLinks || metadata.downloadLinks.length === 0) {
          console.log(`Missing download links at page: ${page}`);
          console.log(metadata);

          // Mark the page as failed
          localDataset.push({
            id: page,
            status: "X", // Mark the page as failed
          });

          page++;
          processedPages++;
        } else {
          // Add the item to the localItems array
          const item = {
            id: page,
            title: metadata.description || "No Title",
            filename: `IBPA ${page} - ${processDescription(
              metadata.description
            )} - ${
              formatDateToISO(metadata.humanReadableDate) || "Unknown Date"
            } - ${
              metadata.authorship
                ? metadata.authorship.replace(/\s*\/\s*/g, "-") // Replaces "/" with "-" and removes extra spaces around it
                : "Unknown Author"
            }.${
              metadata.imagePath
                ? metadata.imagePath.split(".").pop()
                : "unknown"
            }`,
            originalFilename: metadata.imagePath
              ? metadata.imagePath.split("/").pop()
              : "No Filename",
            link: `https://bancodeimagens.portoalegre.rs.gov.br/imagem/${page}`,
            linkhtml: "",
            imagelink: metadata.downloadLinks.find(link => link.size === "G")
              ? `https://bancodeimagens.portoalegre.rs.gov.br${
                  metadata.downloadLinks.find(link => link.size === "G").url
                }`
              : "No Image Link",
            content: metadata.description || "No Content",
            description: `${
              metadata.description || "No Description"
            }<br/>Publicado em ${formatFriendlyDate(
              metadata.publicationDate
            )}<br/>${metadata.tags.map(tag => `#${tag}`).join(" ")}`,
            tags: metadata.tags || [], // Tags array
            categories: [
              ...(metadata.categories || []),
              ...getCategoriesFromTags(metadata),
            ],
            author: metadata.authorship || "Unknown Author",
            date: formatDateToISO(metadata.humanReadableDate, true),
            infoPanel: "Additional Info Placeholder",
            file: null, // File placeholder
            license: "{{Agência Porto Alegre}}",
            source: `[https://bancodeimagens.portoalegre.rs.gov.br/imagem/${page} Banco de Imagens da Prefeitura de Porto Alegre]`,
          };

          localItems.push(item); // Add item to the localItems array
          page++;
          processedPages++;
        }
      } else {
        console.error(`Invalid response or bad HTML at page: ${page}`);

        if (res.code !== "ERR_BAD_RESPONSE") {
          console.error(`Unexpected response from server:`);
          console.log(res);
        }

        // Mark the page as failed
        localDataset.push({
          id: page,
          status: "X", // Mark the page as failed
        });

        page++;
        processedPages++;
      }

      // Update the global state every 5 pages processed
      if (processedPages % 5 === 0) {
        console.log(`Batch update after ${processedPages} pages processed.`);
        dataDispatch({
          type: actionsD.updateData,
          payload: [...localDataset],
        });
      }
    }

    // Final update for any remaining pages
    console.log(`Final update after all pages processed.`);
    dataDispatch({
      type: actionsD.updateData,
      payload: [...localDataset],
    });

    console.log(`Returning ${localItems.length} items.`);
    dataDispatch({ type: actionsD.updateItems, payload: localItems });
  } catch (error) {
    console.error("An error occurred:", error);
    throw error; // Ensure any unhandled errors are propagated
  }
};

const processImageMetadata = htmlResponse => {
  const $ = cheerio.load(htmlResponse);

  // Metadata extraction
  const imagePath = $('meta[property="og:image"]').attr("content") || null;
  const authorship =
    $(".views-field-field-fotografo .field-content").text().trim() ||
    "Unknown Author";
  const description =
    $(".views-field-field-legenda .field-content").text().trim() ||
    "No description available";
  const publicationDate =
    $(".views-field-field-data-de-publicacao time").attr("datetime") || null;
  const humanReadableDate =
    $(".views-field-field-data-de-publicacao time").text().trim() ||
    "Unknown Date";

  const tags =
    $(".views-field-field-tags .field-content a")
      .map((i, el) => $(el).text().trim())
      .get() || [];

  const firstTag = $(".views-field-field-cartola .field-content")
    .text()
    .trim()
    .toLowerCase()
    .split(" ") // Split the string into words
    .map((word, index, arr) => {
      const exceptions = ["e", "de", "da", "do", "das", "dos"]; // Add exceptions
      if (exceptions.includes(word) && index > 0 && index < arr.length - 1) {
        return word; // Keep exceptions lowercase if they are not the first or last word
      }
      return word.charAt(0).toUpperCase() + word.slice(1); // Capitalize the first letter of other words
    })
    .join(" "); // Join the words back into a single string
  if (firstTag && !tags.includes(firstTag)) {
    tags.unshift(firstTag); // Add as the first element if it doesn't exist
  }

  const downloadLinks =
    $(".barra_download a")
      .map((i, el) => ({
        size: $(el).find("b").text().trim(),
        url: $(el).attr("href"),
      }))
      .get() || [];

  return {
    imagePath,
    authorship,
    description,
    publicationDate,
    humanReadableDate,
    tags,
    downloadLinks,
  };
};

const formatFriendlyDate = isoDateString => {
  if (!isoDateString) return "Unknown Date";
  const date = new Date(isoDateString);
  return new Intl.DateTimeFormat("pt-BR", {
    day: "numeric", // Use "numeric" to remove the leading zero
    month: "long",
    year: "numeric",
  }).format(date);
};

const formatDateToISO = (humanReadableDate, includeTime = false) => {
  if (!humanReadableDate) return null;

  const [datePart, timePart] = humanReadableDate.split(" - "); // Split into "DD/MM/YYYY" and "HH:mm" parts
  const [day, month, year] = datePart.split("/"); // Split the date into day, month, year

  // Format date as "YYYY-MM-DD"
  let formattedDate = `${year}-${month}-${day}`;

  // If includeTime is true and timePart exists, append the time
  if (includeTime && timePart) {
    formattedDate += `T${timePart}`; // Append time in ISO format (HH:mm:ss)
  }

  return formattedDate; // Return the formatted date and time
};

const processDescription = description => {
  if (!description) return "No Description";

  // Remove anything after "Foto:" and trim the string
  if (description.includes("Foto:")) {
    description = description.split("Foto:")[0].trim();
  }

  // Split at the first comma or period
  description = description.split(/[,.]/)[0].trim();

  // Truncate at the end of the 5th word with more than 3 characters
  const words = description.split(" ");
  let count = 0;
  const truncatedDescription = [];

  for (const word of words) {
    if (word.length > 3) {
      count++;
    }
    truncatedDescription.push(word);
    if (count >= 6) break; // Stop after 5 words with more than 3 characters
  }

  return truncatedDescription.join(" ") || "No Description";
};

const getCategoriesFromTags = metadata => {
  const categories = [];
  const tags = metadata.tags;

  if (
    tags.includes("Transporte") ||
    tags.includes("Transporte e Circulação") ||
    tags.includes("Circulação") ||
    tags.includes("Agentes de Trânsito")
  ) {
    categories.push("Transport in Porto Alegre");
  }

  if (tags.includes("Agentes de Trânsito")) {
    categories.push("Traffic police of Brazil");
    categories.push("Police of Porto Alegre");
  }

  if (tags.includes("Executivo")) {
    categories.push("Politics of Porto Alegre");
  }

  if (
    tags.includes("Executivo") ||
    tags.includes("Serviços Urbanos") ||
    tags.includes("Limpeza Urbana") ||
    tags.includes("Procuradoria") ||
    tags.includes("Arrecadação Fiscal") ||
    tags.includes("Atendimento") ||
    tags.includes("Secretariado") ||
    (metadata.description && metadata.description.includes("SMS"))
  ) {
    categories.push("Prefeitura Municipal de Porto Alegre");
  }

  // Check if metadata includes the word "Marchezan"
  if (
    tags.includes("Prefeito") ||
    (metadata.description && metadata.description.includes("Marchezan"))
  ) {
    categories.push("Nelson Marchezan Júnior");
  }

  if (tags.includes("Câmara Municipal de Porto Alegre (CMPA)")) {
    categories.push("Câmara Municipal de Porto Alegre");
  }

  if (tags.includes("Prédio público")) {
    categories.push("Municipal buildings in Porto Alegre");
  }

  if (tags.includes("Projeto de Lei")) {
    categories.push("Law of Porto Alegre");
  }

  if (tags.includes("Diversidade sexual")) {
    categories.push("Society of Porto Alegre");
    categories.push("LGBT in Brazil");
  }

  if (tags.includes("Turismo")) {
    categories.push("Tourism in Porto Alegre");
  }

  if (
    tags.includes("Cultura") ||
    tags.includes("Dança") ||
    tags.includes("Companhia Jovem de Dança")
  ) {
    categories.push("Culture of Porto Alegre");
  }

  if (tags.includes("Dança") || tags.includes("Companhia Jovem de Dança")) {
    categories.push("Dance of Rio Grande do Sul");
  }

  if (tags.includes("Companhia Jovem de Dança")) {
    categories.push("Dance companies from Brazil");
  }

  if (
    tags.includes("Meio Ambiente e Sustentabilidade") ||
    tags.includes("Meio Ambiente")
  ) {
    categories.push("Nature of Porto Alegre");
  }

  if (tags.includes("Meio Ambiente e Sustentabilidade")) {
    categories.push("Conservation in Brazil");
  }

  if (tags.includes("Arrecadação Fiscal")) {
    categories.push("Economy of Porto Alegre");
    categories.push("Tax offices");
    categories.push("Municipal buildings in Porto Alegre");
  }

  if (tags.includes("Obras") || tags.includes("Pintura")) {
    categories.push("Construction in Porto Alegre");
    categories.push(`${getYear(metadata.humanReadableDate)} in construction`);
  }

  if (tags.includes("Praças e Parques")) {
    categories.push("Parks in Porto Alegre");
  }

  if (tags.includes("Previsão do Tempo")) {
    categories.push("Weather and climate of Porto Alegre");
  }

  if (tags.includes("Carnaval")) {
    categories.push("Carnival of Porto Alegre");
  }

  if (
    tags.includes("Saúde") ||
    tags.includes("Primeira Infância Melhor (PIM)") ||
    tags.includes("Alimentação") ||
    tags.includes("Vigilância de Alimentos") ||
    tags.includes("CGVS") ||
    (metadata.description && metadata.description.includes("SMS"))
  ) {
    categories.push("Health in Porto Alegre");
  }

  if (tags.includes("Farmácia")) {
    categories.push("Pharmacies in Porto Alegre");
  }

  if (tags.includes("Vigilância de Alimentos")) {
    categories.push("Food security in Brazil");
  }

  if (tags.includes("Ambulância")) {
    categories.push(" Ambulances in Porto Alegre");
  }

  if (tags.includes("Consumidor")) {
    categories.push("Consumer protection in Porto Alegre");
  }

  if (tags.includes("Esgoto Pluvial")) {
    categories.push("Storm drains in Brazil");
    categories.push("Street furniture in Porto Alegre");
    categories.push("Storms in Rio Grande do Sul");
  }

  if (tags.includes("DMAP")) {
    categories.push("DMAP (Porto Alegre)");
  }

  if (tags.includes("DMLU")) {
    categories.push("DMLU (Porto Alegre)");
  }

  if (tags.includes("Limpeza Urbana")) {
    categories.push("Municipal cleaning services");
  }

  if (
    tags.includes("Serviços Urbanos") ||
    tags.includes("Limpeza Urbana") ||
    tags.includes("Atendimento")
  ) {
    categories.push("Public services of Porto Alegre");
  }

  if (tags.includes("Campeonato")) {
    categories.push("Events in Porto Alegre");
  }

  if (
    tags.includes("Educação") ||
    tags.includes("Curso") ||
    tags.includes("Capacitação") ||
    tags.includes("Oficina")
  ) {
    categories.push("Education in Porto Alegre");
  }

  if (tags.includes("Oficina")) {
    categories.push("Workshops (meetings)");
  }

  if (tags.includes("Água")) {
    categories.push("Water in Porto Alegre");
  }

  if (tags.includes("Esgoto")) {
    categories.push("Sewage treatment in Brazil");
    if (!categories.includes("Porto Alegre")) {
      categories.push("Porto Alegre");
    }
  }

  if (tags.includes("Drenagem")) {
    categories.push("Drainage in Brazil");
    if (!categories.includes("Porto Alegre")) {
      categories.push("Porto Alegre");
    }
  }

  if (tags.includes("Consumidor")) {
    categories.push("Consumer protection in Porto Alegre");
  }

  if (tags.includes("Brechocão")) {
    categories.push("Brechocão");
  }

  if (tags.includes("Parque Farroupilha (Redenção)")) {
    categories.push("Parque da Redenção");
  }

  if (tags.includes("Colégio Militar de Porto Alegre")) {
    categories.push("Colégio Militar de Porto Alegre");
  }

  if (tags.includes("Viaduto Otávio Rocha")) {
    categories.push("Viaduto Otávio Rocha");
  }

  if (tags.includes("Direitos dos Animais")) {
    categories.push("Animal rights in Brazil");
  }

  if (tags.includes("Reserva Biológica do Lami José Lutzenberger")) {
    categories.push("Reserva Biológica do Lami José Lutzenberger");
  }

  if (categories.length === 0) {
    categories.push("Porto Alegre");
  }

  // Always include the year-based category
  categories.push(`${getYear(metadata.humanReadableDate)} in Porto Alegre`);

  return categories;
};

const getYear = date => {
  return new Date(formatDateToISO(date, true)).getFullYear();
};
