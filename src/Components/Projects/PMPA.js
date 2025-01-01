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

  // Remove anything after "Foto:" and trim the string
  if (description.includes("Local:")) {
    description = description.split("Local:")[0].trim();
  }

  description = description.replace(/[/:]/g, "-").replace(/[#]/g, "");

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
    tags.includes("Executivo") ||
    tags.includes("Gabinete") ||
    tags.includes("Conselhos Municipais") ||
    tags.includes("CMDUA") ||
    tags.includes("Grupos de Trabalho") ||
    tags.includes("PPA") ||
    tags.includes("Coordenações")
  ) {
    categories.push(
      "Executive office of the Porto Alegre municipal government"
    );
  }

  if (
    tags.includes("Atendimento") ||
    tags.includes("Arrecadação Fiscal") ||
    tags.includes("Agentes de Trânsito")
  ) {
    categories.push("Municipal services in Porto Alegre");
  }

  if (!tags.includes("Salão Nobre") && tags.includes("Paço dos Açorianos")) {
    categories.push("Paço Municipal de Porto Alegre");
  }

  categories.push(...getPplCategories(metadata));

  if (
    tags.includes("Prédio público") ||
    tags.includes("Prédios e Edificações")
  ) {
    categories.push("Municipal buildings in Porto Alegre");
  }

  if (
    tags.includes("Projeto de Lei") ||
    tags.includes("Lei") ||
    tags.includes("Alvará")
  ) {
    categories.push("Law of Porto Alegre");
  }

  if (
    (!tags.includes("EPTC") &&
      (tags.includes("Transporte") ||
        tags.includes("Transporte e Circulação") ||
        tags.includes("Circulação"))) ||
    tags.includes("Agentes de Trânsito") ||
    tags.includes("Educação no Trânsito") ||
    tags.includes("Mobilidade") ||
    tags.includes("Mobilidade Urbana")
  ) {
    categories.push("Transport in Porto Alegre");
  }

  if (tags.includes("Agentes de Trânsito")) {
    categories.push("Traffic police of Brazil");
    categories.push("Police of Porto Alegre");
  }

  if (tags.includes("Sustentabilidade")) {
    categories.push("Conservation in Brazil");
    categories.push("Sustainable development");
    categories.push("Environmental protection");
  }

  if (tags.includes("Arrecadação Fiscal")) {
    categories.push("Tax offices");
    categories.push("Municipal buildings in Porto Alegre");
  }

  if (
    tags.includes("Arrecadação Fiscal") ||
    tags.includes("Tarifa") ||
    tags.includes("Sustentabilidade") ||
    tags.includes("Tributação") ||
    tags.includes("OP")
  ) {
    categories.push("Economy of Porto Alegre");
  }

  if (
    tags.includes("Arrecadação Fiscal") ||
    tags.includes("Tarifa") ||
    tags.includes("Tributação")
  ) {
    categories.push("Taxation in Brazil");
  }

  if (
    !tags.includes("Parque Marechal Mascarenhas de Moraes") &&
    tags.includes("Praças e Parques")
  ) {
    categories.push("Parks in Porto Alegre");
  }

  if (
    !(
      tags.includes("CGVS") ||
      tags.includes("Unidade de Saúde Alto Embratel") ||
      tags.includes("Unidade de Saúde Osmar Freitas") ||
      tags.includes("Unidade de Saúde Santo Alfredo") ||
      tags.includes("Farmácia")
    ) &&
    tags.includes("Saúde")
  ) {
    categories.push("Secretaria Municipal de Saúde (Porto Alegre)");
  }

  if (
    !(
      tags.includes("Capacitação") ||
      tags.includes("Primeira Infância Melhor (PIM)")
    ) &&
    tags.includes("Educação")
  ) {
    categories.push("Secretaria Municipal de Educação (Porto Alegre)");
  }

  if (tags.includes("Procon Municipal") || tags.includes("Procon Móvel")) {
    categories.push("Procon Porto Alegre");
  }

  if (
    !(tags.includes("Procon Municipal") || tags.includes("Procon Móvel")) &&
    (tags.includes("Consumidor") || tags.includes("Direitos do Consumidor"))
  ) {
    categories.push("Consumer protection in Porto Alegre");
  }

  if (
    !tags.includes("Companhia Municipal de Dança") &&
    tags.includes("Cultura")
  ) {
    categories.push("Secretaria Municipal da Cultura (Porto Alegre)");
  }

  if (tags.includes("Fazenda") || tags.includes("Finanças Públicas")) {
    categories.push("Secretaria Municipal da Fazenda (Porto Alegre)");
  }

  if (tags.includes("Fiscalização") || tags.includes("Vistoria")) {
    categories.push("Inspections");
  }

  if (
    tags.includes("Fiscalização") ||
    tags.includes("Segurança Pública") ||
    tags.includes("Interdição") ||
    tags.includes("Apreensão") ||
    tags.includes("Vistoria")
  ) {
    categories.push("Law enforcement in Porto Alegre");
  }

  if (!tags.includes("Bloqueio químico") && tags.includes("Aedes aegypti")) {
    categories.push("Aedes aegypti");
  }

  if (
    !tags.includes(
      "Universidade do Vale do Rio dos Sinos (Porto Alegre campus)"
    ) &&
    tags.includes("Educação Superior")
  ) {
    categories.push("Universities and colleges in Porto Alegre");
  }

  if (tags.includes("Leishmaniose")) {
    categories.push("Leishmaniasis");
    categories.push("Diseases and disorders in Brazil");
  }

  if (tags.includes("Esgoto Pluvial") || tags.includes("Esgotos Pluviais")) {
    categories.push("Storm drains in Brazil");
    categories.push("Street furniture in Porto Alegre");
    categories.push("Storms in Rio Grande do Sul");
  }

  if (
    tags.includes("Oficina") ||
    tags.includes("Material Escolar") ||
    tags.includes("Educação no Trânsito") ||
    tags.includes("Educação Básica") ||
    tags.includes("Educação Especial") ||
    tags.includes("Educação Fundamental") ||
    tags.includes("Educação Infantil") ||
    tags.includes("Educação Ambiental") ||
    tags.includes("Educação Educação Técnica")
  ) {
    categories.push("Education in Porto Alegre");
  }

  if (tags.includes("Educação Ambiental")) {
    categories.push("Nature of Porto Alegre");
  }

  if (tags.includes("EMEF") || tags.includes("EMEI") || tags.includes("EMEM")) {
    categories.push("Municipal schools in Porto Alegre");
  }

  if (
    tags.includes("Social") ||
    tags.includes("Diversidade sexual") ||
    tags.includes("Idosos") ||
    tags.includes("Criança") ||
    tags.includes("Acolhimento") ||
    tags.includes("Servidor") ||
    tags.includes("Cidadania") ||
    tags.includes("Inclusão Social") ||
    tags.includes("Mulher") ||
    tags.includes("OP") ||
    tags.includes("Comissão da Pessoa com Deficiência") ||
    tags.includes("Trabalho e Emprego")
  ) {
    categories.push("Society of Porto Alegre");
  }

  if (tags.includes("Drenagem")) {
    categories.push("Drainage in Brazil");
    categories.push("DMAP (Porto Alegre)");
  }

  if (tags.includes("Piscinas Públicas")) {
    categories.push("Public swimming pools");
    categories.push("Swimming pools in Brazil");
    categories.push("Sports venues in Porto Alegre");
  }

  if (tags.includes("Ciclovia")) {
    categories.push("Cycle lanes in Brazil");
    categories.push("Cycling infrastructure in Porto Alegre");
  }

  if (
    tags.includes("Cachorro") ||
    tags.includes("Gato") ||
    tags.includes("Adoção de animais")
  ) {
    categories.push("Animals of Porto Alegre");
  }

  if (tags.includes("Esporte") || tags.includes("Ginástica")) {
    categories.push("Sports in Porto Alegre");
  }

  if (tags.includes("Teledermatologia")) {
    categories.push("Telemedicine");
    categories.push("Dermatology");
  }

  if (tags.includes("Encerramento")) {
    categories.push("Closing ceremonies");
  }

  if (
    !(tags.includes("Inauguração") || tags.includes("Abertura")) &&
    (tags.includes("Encerramento") || tags.includes("Cerimônia"))
  ) {
    categories.push("Ceremonies in Brazil");
  }

  if (tags.includes("Informatização")) {
    categories.push("Information technology in Brazil");
    categories.push("Digital transformation");
    categories.push("Computing in Brazil");
    categories.push("E-Government in Brazil");
  }

  if (tags.includes("Informatização") || tags.includes("Tecnologia")) {
    categories.push("Science in Porto Alegre");
  }

  if (
    tags.includes("Consulta Pública") ||
    tags.includes("Administração") ||
    tags.includes("Governança") ||
    tags.includes("PPA")
  ) {
    categories.push("Public administration in Brazil");
  }

  categories.push(...getMappedCategories(metadata));

  if (
    !(
      categories.includes("DMAP (Porto Alegre)") ||
      categories.includes("DMAE (Porto Alegre)") ||
      categories.includes("DMLU (Porto Alegre)")
    ) &&
    tags.includes("Serviços Urbanos")
  ) {
    categories.push("Secretaria Municipal de Serviços Urbanos (Porto Alegre)");
  }

  if (
    !(
      categories.includes("Linha Turismo") || tags.includes("Caminhos Rurais")
    ) &&
    tags.includes("Turismo")
  ) {
    categories.push("Tourism in Porto Alegre");
  }

  if (
    !categories.includes("Semana de Porto Alegre") &&
    tags.includes("Aniversário")
  ) {
    categories.push("Anniversaries in Brazil");
  }

  if (tags.includes("Previsão do Tempo") || tags.includes("Tempo")) {
    categories.push("Weather and climate of Porto Alegre");
    if (categories.length === 1) {
      categories.push("Porto Alegre");
    }
  }

  if (tags.includes("Asfalto") || tags.includes("Pavimentação")) {
    categories.push("Asphalters");
  }

  if (tags.includes("Asfalto")) {
    categories.push("Roadworks in Rio Grande do Sul");
  }

  if (tags.includes("Casa de Bombas")) {
    categories.push("DMAP (Porto Alegre)");
    categories.push("Pumping stations in Brazil");
  }

  if (tags.includes("Aldeia Indígena")) {
    categories.push("Indigenous peoples in Rio Grande do Sul");
    categories.push("Indigenous territories in Brazil");
  }

  if (
    tags.includes("Carnaval") ||
    tags.includes("Carnaval de Rua") ||
    tags.includes("Carnaval 2017")
  ) {
    categories.push(
      `Carnival of Porto Alegre ${getYear(metadata.humanReadableDate)}`
    );
  }

  if (tags.includes("Dia da Independência")) {
    categories.push(
      `Independence Day ${getYear(metadata.humanReadableDate)} in Porto Alegre`
    );
  }

  if (
    tags.includes("Obras") ||
    tags.includes("Pintura") ||
    tags.includes("Asfalto")
  ) {
    categories.push("Construction in Porto Alegre");
    categories.push(`${getYear(metadata.humanReadableDate)} in construction`);
  }

  if (
    !tags.includes("Fórum da Liberdade") &&
    (tags.includes("Fórum") ||
      tags.includes("Audiência") ||
      tags.includes("Reunião"))
  ) {
    categories.push("Meetings in Brazil");
  }

  if (!tags.includes("Fórum da Liberdade") && tags.includes("Conferência")) {
    categories.push("Conferences in Brazil");
  }

  if (
    !(
      tags.includes("Semana de Porto Alegre") ||
      tags.includes("Fórum da Liberdade")
    ) &&
    (tags.includes("Abertura") ||
      tags.includes("Aniversário") ||
      tags.includes("Apresentação") ||
      tags.includes("Audiência") ||
      tags.includes("Campeonato") ||
      tags.includes("Palestra") ||
      tags.includes("Visita") ||
      tags.includes("Lançamento") ||
      tags.includes("Inauguração") ||
      tags.includes("Fórum") ||
      tags.includes("Coletiva de Imprensa") ||
      tags.includes("Encerramento") ||
      tags.includes("Seminário") ||
      tags.includes("Mutirão") ||
      tags.includes("Reunião") ||
      tags.includes("Cerimônia") ||
      tags.includes("Conferência") ||
      tags.includes("Debate"))
  ) {
    categories.push("Events in Porto Alegre");
    categories.push(`${getYear(metadata.humanReadableDate)} events in Brazil`);
  }

  if (
    !(
      tags.includes("Festival de Inverno") ||
      tags.includes("Semana de Porto Alegre") ||
      tags.includes("Trabalho") ||
      tags.includes("Festejos")
    ) &&
    tags.includes("Festejos")
  ) {
    categories.push("Festivals in Porto Alegre");
  }

  if (
    tags.includes("Festival de Inverno") ||
    tags.includes("Semana de Porto Alegre") ||
    tags.includes("Trabalho") ||
    tags.includes("Festejos")
  ) {
    categories.push(
      `${getYear(metadata.humanReadableDate)} festivals in Brazil`
    );
  }

  if (categories.length === 0) {
    categories.push("Porto Alegre");
  }

  if (
    !(
      categories.includes(
        `Carnival of Porto Alegre ${getYear(metadata.humanReadableDate)}`
      ) || tags.includes("Fórum da Liberdade")
    )
  ) {
    categories.push(`${getYear(metadata.humanReadableDate)} in Porto Alegre`);
  }

  return categories;
};

const keywordToCategoryMap = {
  Prefeito: "Nelson Marchezan Júnior",
  Marchezan: "Nelson Marchezan Júnior",
  "Vice-Prefeito": "Gustavo Paim",
  "Vice-prefeito": "Gustavo Paim",
  Governador: "José Ivo Sartori",
  Hamm: "Afonso Hamm",
  "Jorge Benjor": "Jorge Ben Jor",
  "Roberto Freire": "Roberto Freire (politician)",
};

const sameNameKeywords = [
  "Gustavo Paim",
  "Osmar Terra",
  "Ronaldo Nogueira",
  "Eduardo Leite",
  "Cezar Schirmer",
  "Adão Cândido",
  "Edson Leal Pujol",
  "José Ivo Sartori",
  "Michel Costa",
  "Liziane Bayer",
  "Any Ortiz",
  "Skank",
  "Maria Helena Sartori",
  "João Fischer",
  "Valdir Bonatto",
];

const getPplCategories = metadata => {
  const tags = metadata.tags;
  const categories = [];
  // Use a Set to prevent duplicate categories
  const uniqueCategories = new Set();

  // Add categories from the map
  Object.entries(keywordToCategoryMap).forEach(([keyword, category]) => {
    if (
      tags.includes(keyword) ||
      (metadata.description && metadata.description.includes(keyword))
    ) {
      uniqueCategories.add(category);
    }
  });

  // Add categories where the name is the same
  sameNameKeywords.forEach(keyword => {
    if (
      tags.includes(keyword) ||
      (metadata.description && metadata.description.includes(keyword))
    ) {
      uniqueCategories.add(keyword);
    }
  });

  // Convert Set to an array and merge with existing categories
  categories.push(...Array.from(uniqueCategories));

  return categories;
};

const getMappedCategories = metadata => {
  const tags = metadata.tags;
  const categories = [];

  // List of tags for which the category is the same
  const sameNameTags = [
    "Todos Somos Porto Alegre",
    "Banco de Talentos",
    "Liquida Porto Alegre",
    "TelessaúdeRS",
    "DermatoNet",
    "Colégio Militar de Porto Alegre",
    "Reserva Biológica do Lami José Lutzenberger",
    "Brechocão",
    "Parque Marinha do Brasil",
    "Casa Lar do Idoso",
    "Teatro Renascença",
    "Sala Álvaro Moreyra",
    "Cecoflor",
    "Viaduto Otávio Rocha",
    "Vila Jardim",
    "Vila Minuano",
    "Edifício Intendente José Montaury",
    "Largo Glênio Peres",
    "Pinacoteca Ruben Berta",
    "Unidade de Saúde Alto Embratel",
    "Unidade de Saúde Orfanotrófio",
    "Unidade de Saúde Osmar Freitas",
    "Unidade de Saúde Santo Alfredo",
    "Centro de Saúde IAPI",
    "Procempa",
    "Unipoa",
    "Grêmio Foot-Ball Porto Alegrense",
    "Sport Club Internacional",
    "Casa de Cultura Mario Quintana",
    "Palácio Piratini",
    "Túnel da Conceição",
    "Plaza São Rafael",
    "Residencial São Guilherme",
    "Centro de Cultura Lupicínio Rodrigues",
    "Centro Cultural Usina do Gasômetro",
    "Arroio Dilúvio",
    "Arena do Grêmio",
    "Ação Rua",
    "Trensurb",
    "Companhia Municipal de Dança",
    "Companhia Jovem de Dança",
    "Parque Marechal Mascarenhas de Moraes",
    "Semana de Porto Alegre",
    "Linha Turismo",
    "Anfiteatro Pôr do Sol",
    "Praia de Belas",
    "Pinacoteca Aldo Locatelli",
    "Prometas",
    "Museu de Porto Alegre Joaquim Felizardo",
    "Cinemateca Capitólio",
    "Praça Darcy Azambuja",
    "Fique Sabendo Jovem",
    "Ginásio Tesourinha",
    "Aldeia Kaingang",
    "Parque Natural Municipal Morro do Osso",
    "Fundação Iberê Camargo",
    "Bikepoa",
  ];

  // Check each tag and add it as a category if not already included
  sameNameTags.forEach(tag => {
    if (tags.includes(tag) && !categories.includes(tag)) {
      categories.push(tag);
    }
  });

  // Define a mapping of tags to categories
  const tagToCategoryMap = {
    Segurança: "Secretaria Municipal de Segurança (Porto Alegre)",
    "Desenvolvimento Social":
      "Secretaria Municipal de Desenvolvimento Social (Porto Alegre)",
    "Desenvolvimento Econômico":
      "Secretaria Municipal de Desenvolvimento Econômico (Porto Alegre)",
    "Meio Ambiente":
      "Secretaria Municipal do Meio Ambiente e Sustentabilidade (Porto Alegre)",
    "Meio Ambiente e Sustentabilidade":
      "Secretaria Municipal do Meio Ambiente e Sustentabilidade (Porto Alegre)",
    Smams:
      "Secretaria Municipal do Meio Ambiente e Sustentabilidade (Porto Alegre)",
    "Planejamento e Gestão":
      "Secretaria Municipal de Planejamento e Gestão (Porto Alegre)",
    "Infraestrutura e Mobilidade":
      "Secretaria Municipal de Infraestrutura e Mobilidade (Porto Alegre)",
    "Infraestrutura e Mobilidade Urbana":
      "Secretaria Municipal de Infraestrutura e Mobilidade (Porto Alegre)",
    "Relações Institucionais":
      "Secretaria Municipal de Relações Institucionais (Porto Alegre)",
    Legislativo: "Câmara Municipal de Porto Alegre",
    "Câmara Municipal de Porto Alegre (CMPA)":
      "Câmara Municipal de Porto Alegre",
    DMAP: "DMAP (Porto Alegre)",
    DMLU: "DMLU (Porto Alegre)",
    Dmlu: "DMLU (Porto Alegre)",
    "Limpeza Urbana": "DMLU (Porto Alegre)",
    CGVS: "CGVS (Porto Alegre)",
    DMAE: "DMAE (Porto Alegre)",
    Água: "DMAE (Porto Alegre)",
    "Água e Esgotos": "DMAE (Porto Alegre)",
    Abastecimento: "DMAE (Porto Alegre)",
    EPTC: "EPTC (Porto Alegre)",
    Fasc: "FASC (Porto Alegre)",
    Pisa: "Programa Integrado Socioambiental",
    Procuradoria: "Procuradoria-Geral do Município de Porto Alegre",
    Secretariado: "Municipal secretariats of Porto Alegre",
    "Unidade de Saúde Orfanotrófrio": "Unidade de Saúde Orfanotrófio",
    "Primeira Infância Melhor (PIM)": "Primeira Infância Melhor",
    "Salão Nobre": "Salão Nobre (Paço Municipal de Porto Alegre)",
    "Restaurante Popular": "Restaurantes Populares",
    Capacitação: "Trainings by the Municipality of Porto Alegre",
    Curso: "Courses (education) by the Municipality of Porto Alegre",
    Parcerias: "Secretaria Municipal de Parcerias Estratégicas (Porto Alegre)",
    Visita: "Official visits involving the Municipality of Porto Alegre",
    Convênio: "Partnerships involving the Municipality of Porto Alegre",
    "Rede Municipal de Ensino": "Rede Municipal de Ensino (Porto Alegre)",
    Guaíba: "Rio Guaíba in Porto Alegre",
    Senac: "Serviço Nacional de Aprendizagem Comercial",
    Famurs: "Federação das Associações de Municípios do Rio Grande do Sul",
    Granpal:
      "Associação dos Municípios da Região Metropolitana de Porto Alegre",
    "Parque Farroupilha (Redenção)": "Parque da Redenção",
    "Praça da Alfândega": "Praça da Alfândega (Porto Alegre)",
    "Praça Marechal Deodoro (Matriz)": "Praça da Matriz (Porto Alegre)",
    "Universidade Federal de Ciências da Saúde de Porto Alegre (UFCSPA)":
      "Universidade Federal de Ciências da Saúde de Porto Alegre",
    "Moab Caldas": "Avenida Moab Caldas",
    "Sindicato dos Municipários de Porto Alegre (Simpa)":
      "Sindicato dos Municipários de Porto Alegre",
    "Igreja Nossa Senhora das Dores":
      "Igreja Nossa Senhora das Dores (Porto Alegre)",
    "Assembléia Legislativa": "Legislative Assembly of Rio Grande do Sul",
    "Praça Revolução Farroupilha (Trensurb)": "Praça Revolução Farroupilha",
    "Praça Montevideo": "Praça Montevidéu",
    "Fonte Talavera": "Fonte Talavera de La Reina",
    "Mercado Público Central": "Mercado Público de Porto Alegre",
    HMIPV: "Hospital Materno-Infantil Presidente Vargas",
    "Hospital de Pronto Socorro (HPS)":
      "Hospital de Pronto Socorro (Porto Alegre)",
    "Hospital Materno-Infantil Presidente Vargas (HMIPV)":
      "Hospital Materno-Infantil Presidente Vargas",
    "Tribunal de Contas do Estado do Rio Grande do Sul (TCE-RS)":
      "Tribunal de Contas do Estado do Rio Grande do Sul",
    "Teatro da Santa Casa": "Teatro da Santa Casa (Porto Alegre)",
    "Catedral Metropolitana de Porto Alegre (Matriz)":
      "Catedral Metropolitana de Porto Alegre",
    "Teatro do Sesc": "Teatro do Sesc (Porto Alegre)",
    "Orla Moacyr Scliar": "Parque Moacyr Scliar",
    "Bairro Belém Novo": "Belém Novo",
    "Bairro Bom Fim": "Bom Fim",
    "Bairro Centro Histórico": "Centro (Porto Alegre)",
    "Bairro Ipanema": "Ipanema (Porto Alegre)",
    "Bairro Restinga": "Restinga (Porto Alegre)",
    "Bairro Cidade Baixa": "Cidade Baixa (Porto Alegre)",
    "Bairro Cruzeiro": "Cruzeiro (Porto Alegre)",
    "Bairro Lami": "Lami (Porto Alegre)",
    "Bairro Santa Tereza": "Santa Tereza (Porto Alegre)",
    "Bairro Cristal": "Cristal (Porto Alegre)",
    "Bairro Hípica": "Hípica",
    "Bairro Bela Vista": "Bela Vista (Porto Alegre)",
    "Bairro Jardim Itu-Sabará": "Jardim Itu-Sabará",
    "Bairro Teresópolis": "Teresópolis (Porto Alegre)",
    "Bairro Bom Jesus": "Bom Jesus (Porto Alegre)",
    "Bairro Chapéu do Sol": "Chapéu do Sol",
    "Bairro Camaquã": "Camaquã (Porto Alegre)",
    "Bairro Cavalhada": "Cavalhada (Porto Alegre)",
    "Bairro Tristeza": "Tristeza (Porto Alegre)",
    "Bairro Vila Conceição": "Vila Conceição",
    "Bairro Auxiliadora": "Auxiliadora",
    "Bairro Higienópolis": "Higienópolis (Porto Alegre)",
    "Bairro São João": "São João (Porto Alegre)",
    "Bairro Moinhos de Vento": "Moinhos de Vento",
    "Bairro Petrópolis": "Petrópolis (Porto Alegre)",
    "Bairro Humaitá": "Humaitá (Porto Alegre)",
    "Bairro Navegantes": "Navegantes (Porto Alegre)",
    Petrópolis: "Petrópolis (Porto Alegre)",
    Partenon: "Partenon (Porto Alegre)",
    Navegantes: "Navegantes (Porto Alegre)",
    Nonoai: "Nonoai (Porto Alegre)",
    "4º Distrito": "4º Distrito (Porto Alegre)",
    "Zona Norte": "Zona Norte (Porto Alegre)",
    "Zona Sul": "Zona Sul (Porto Alegre)",
    "Zona Leste": "Zona Leste (Porto Alegre)",
    "Arquipélago (Ilhas)": "Islands of Porto Alegre",
    "Vila Nova": "Vila Nova (Porto Alegre)",
    "Exército Brasileiro": "Army of Brazil",
    "Festival de Inverno": "Festival de Inverno (Porto Alegre)",
    "#eufaçopoa": "EuFaçoPOA",
    "Universidade Federal do Rio Grande do Sul (UFRGS)":
      "Universidade Federal do Rio Grande do Sul",
    Carris: "Companhia Carris Porto-Alegrense",
    PUCRS: "Pontifícia Universidade Católica do Rio Grande do Sul",
    "Brigada Militar": "Brigada Militar do Rio Grande do Sul",
    Trabalho: "Festa de Nossa Senhora do Trabalho",
    Metas: "Prometas",
    Fecomércio: "Fecomércio-RS",
    "Comissão de Combate à Informalidade": "Fecomércio-RS",
    "Biblioteca Pública Josué Guimarães":
      "Biblioteca Pública Municipal Josué Guimarães",
    Unisinos: "Universidade do Vale do Rio dos Sinos (Porto Alegre campus)",
    "Estádio Beira-rio": "Estádio Beira-Rio",
    "Caminhos Rurais": "Caminhos Rurais de Porto Alegre",
    "Unidade de Pronto Atendimento (UPA)": "Unidade de Pronto Atendimento",
    "Parque Moinhos de Vento (Parcão)": "Parque Moinhos de Vento",
    Unesco: "UNESCO",
    "Fórum da Liberdade": "30º Fórum da Liberdade (2017)",
    Fiergs: "Federação das Indústrias do Estado do Rio Grande do Sul",
    "Palácio do Comércio": "Palácio do Comércio (Porto Alegre)",
    "Centro Integrado de Comando":
      "Centro Integrado de Comando da Cidade de Porto Alegre",
    Lazer: "Recreation in Porto Alegre",
    Teatro: "Theatre of Porto Alegre",
    Farmácia: "Farmácias Distritais (Porto Alegre)",
    Árvore: "Trees in Porto Alegre",
    Música: "Music of Porto Alegre",
    Futebol: "Association football in Porto Alegre",
    roubo: "Crime in Porto Alegre",
    veículo: "Automobiles in Porto Alegre",
    Habitação: "Housing in Porto Alegre",
    Ambulância: "Ambulances in Porto Alegre",
    Procissão: "Processions in Porto Alegre",
    Aéreas: "Aerial photographs of Porto Alegre",
    Reciclagem: "Recycling in Porto Alegre",
    Táxi: "Taxis in Porto Alegre",
    Comércio: "Commerce in Porto Alegre",
    Infraestrutura: "Infrastructure in Porto Alegre",
    Dança: "Dance in Porto Alegre",
    Artesanato: "Handicrafts of Porto Alegre",
    exposição: "Exhibitions in Porto Alegre",
    Lixo: "Waste management in Porto Alegre",
    Escultura: "Sculptures in Porto Alegre",
    Alimentação: "Food of Porto Alegre",
    Motocicleta: "Motorcycles in Porto Alegre",
    Bombeiros: "Firefighters of Porto Alegre",
    "Artes Cênicas": "Performing arts in Porto Alegre",
    "Transporte Público": "Public transport in Porto Alegre",
    "Assistência Social": "Social services in Porto Alegre",
    "População de Rua": "Homelessness in Porto Alegre",
    "Ruas e avenidas": "Streets in Porto Alegre",
    "Livro e Literatura": "Literature of Porto Alegre",
    "Artes Visuais": "Art of Porto Alegre",
    "Indústria e Comércio": "Industry in Porto Alegre",
    Vandalismo: "Vandalism in Porto Alegre",
    Cachorro: "Dogs of Rio Grande do Sul",
    Infográfico: "Information graphics of Brazil",
    Dengue: "Dengue in Brazil",
    Vôlei: "Volleyball in Brazil",
    Handebol: "Handball in Brazil",
    Idosos: "Geriatrics in Brazil",
    Campeonato: "Competitions in Brazil",
    Concurso: "Competitions in Brazil",
    Posse: "Oaths of office in Brazil",
    Servidor: "Civil servants of Brazil",
    Espetáculo: "Shows in Rio Grande do Sul",
    Aluno: "Students in Brazil",
    Abertura: "Opening ceremonies in Brazil",
    Inauguração: "Inaugurations in Brazil",
    Licitações: "Auctions in Brazil",
    Abrigos: "Shelters in Brazil",
    Transparência: "Open government in Brazil",
    Acessibilidade: "Accessibility in Brazil",
    Empreendedorismo: "Entrepreneurship in Brazil",
    Adolescente: "Teenagers of Brazil",
    Vacinação: "Vaccinations in Brazil",
    Poda: "Pruning in Brazil",
    Embaixada: "Embassies in Brazil",
    Consulado: "Diplomatic missions to Brazil",
    Juventude: "Youth in Brazil",
    Eclipse: "Solar eclipses in Brazil",
    Gato: "Cats of Brazil",
    Ambulantes: "Street vendors in Brazil",
    Gripe: "Influenza in Brazil",
    Ginástica: "Gymnastics in Brazil",
    Tecnologia: "Technology in Brazil",
    Páscoa: "Easter in Brazil",
    "Direitos dos Animais": "Animal rights in Brazil",
    "Direitos Animais": "Animal rights in Brazil",
    "febre amarela": "Yellow fever in Brazil",
    "Comissão da Pessoa com Deficiência": "Disability in Brazil",
    "Coletiva de Imprensa": "Press conferences in Brazil",
    "Diversidade sexual": "LGBT in Brazil",
    "Bloqueio químico": "Fogging against Aedes aegypti in Brazil",
    "Vigilância de Alimentos": "Food security in Brazil",
    "Direitos Humanos": "Human rights in Brazil",
    "Artes Plásticas": "Visual arts of Brazil",
    "Educação Ambiental": "Environmental education in Brazil",
    "Ação Social": "Social work in Brazil",
    "Plano Diretor": "Urban planning in Brazil",
    "Medicina Veterinária": "Veterinary medicine in Brazil",
    "Iluminação Pública": "Street lights in Brazil",
    "Dia da Mulher": `International Women's Day in ${getYear(
      metadata.humanReadableDate
    )} in Brazil`,
    Criança: `Children of Brazil in ${getYear(metadata.humanReadableDate)}`,
    Palestra: "Presentations",
    Acolhimento: "Child welfare",
    Oficina: "Workshops (meetings)",
    "síndrome de down": "Down syndrome",
    Investigação: "Inquiry",
    Microcefalia: "Microcephaly",
    Consultório: "Medical offices",
    "Educação Infantil": "Educating children",
    "Doenças da Pele": "Dermatitis",
    "Educação no Trânsito": "Road safety education",
    "Educação Fundamental": "Primary education",
    "Educação Básica": "Primary education",
    "Alteração de vias": "Road traffic management",
    "Consulta Pública": "Public consultation",
    "Vigilância em Saúde": "Disease prevention",
    "Vigilância Sanitária": "Disease prevention",
    "Aplicativo (app)": "Mobile apps",
    Seminário: "Seminars",
    Capina: "Weed control",
    Mutirão: "Campaigns",
    Campanha: "Campaigns",
    "Adoção de animais": "Animal adoption",
    "Educação Especial": "Special education",
    "Carnaval de Rua": "Street carnival",
    Cidadania: "Civil society",
    Debate: "Debating",
    Interdição: "Forced business closures",
    "Material Escolar": "School supplies",
    "Inclusão Social": "Social inclusion",
    Urbanismo: "Urbanism",
    Mulher: "Gender equality",
    OP: "Participatory budgeting",
    "Orçamento Participativo": "Participatory budgeting",
    Audiência: "Audiences (meeting)",
    Medicamentos: "Pharmaceutical drugs",
    Sangue: "Blood collection",
    Caminhada: "Walks (event)",
    "Resíduos Sólidos": "Solid waste management",
    "Bloqueio no trânsito": "Closed roads",
    Apreensão: "Confiscation",
    "Ação Integrada": "Community-driven programs",
    "Educação Técnica": "Career and technical education",
    "Saúde Bucal": "Oral health",
    Apresentação: "Presentations",
    Convite: "Invitations",
    Doação: "Donations",
    Lançamento: "Product launches",
    Pavimentação: "Road paving",
    Flashmob: "Flash mobs",
    CMDUA: "Urban development",
    "Trabalho e Emprego": "Employment",
    "Centro de triagem": "Screening centers",
  };

  // Loop through the tags and add the corresponding category if it exists
  tags.forEach(tag => {
    if (tagToCategoryMap[tag] && !categories.includes(tagToCategoryMap[tag])) {
      categories.push(tagToCategoryMap[tag]);
    }
  });

  return categories;
};

const getYear = date => {
  return new Date(formatDateToISO(date, true)).getFullYear();
};