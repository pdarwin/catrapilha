import { actionsD } from "../../Reducers/DataReducer";
import { fetchPMPA1Page } from "../../Services/PMPAApis";
import {
  formatDateToISO,
  formatFriendlyDate,
  getYear,
} from "../../Utils/DateUtils";
import { getProject } from "../../Utils/ProjectUtils";
import { sameNameTags } from "./SameNameTags";
import { tagToCategoryMap } from "./TagToCategoryMap";
import { validTags } from "./ValidTags";
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
            readyToUpload: setReadyToUploadFlag(metadata),
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

// export const findNaFotos = async dataState => {
//   try {
//     // Filter items in dataState.data with status = "Y"
//     const itemsToProcess = dataState.data.filter(item => item.status === "Y");

//     // Iterate over all filtered items
//     for (const item of itemsToProcess) {
//       if (item.id < 468) continue;
//       // Fetch the page for the current item
//       const res = await fetchPMPA1Page(item.id);

//       if (res && res.data) {
//         const metadata = processImageMetadata(res.data);

//         // Check if metadata contains naFoto and log the description
//         if (metadata.naFoto) {
//           console.log(
//             item.id + " updated description: " + metadata.description
//           );
//         }
//       }

//       console.log("Done item: " + item.id);
//     }
//   } catch (error) {
//     console.error("Error in findNaFotos:", error);
//   }
// };

const processImageMetadata = htmlResponse => {
  const $ = cheerio.load(htmlResponse);

  // Metadata extraction
  const imagePath = $('meta[property="og:image"]').attr("content") || null;
  const authorship =
    $(".views-field-field-fotografo .field-content").text().trim() ||
    "Unknown Author";
  const description1 =
    $(".views-field-field-legenda .field-content").text().trim() ||
    "No description available";
  const publicationDate =
    $(".views-field-field-data-de-publicacao time").attr("datetime") || null;
  const humanReadableDate =
    $(".views-field-field-data-de-publicacao time").text().trim() ||
    "Unknown Date";

  const naFoto =
    $("[class*='na-foto']")
      .text()
      .replace(/^\s*Na foto:\s*/, "")
      .trim() || null;
  // Combine "naFoto" with description if it exists
  const description = naFoto
    ? `${description1}<br/>(Na foto: ${naFoto})`
    : description1;

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
    description1,
    description,
    naFoto,
    publicationDate,
    humanReadableDate,
    tags,
    downloadLinks,
  };
};

const processDescription = description => {
  if (!description) return "No Description";

  // Remove anything after "Foto:" and trim the string
  if (description.match(/\.?\s?Fotos?:/)) {
    description = description.split(/\.?\s?Fotos?:/)[0].trim();
  }

  if (description.includes("Local:")) {
    description = description.split("Local:")[0].trim();
  }

  if (description.includes(".<br/>")) {
    description = description.split(".<br/>")[0].trim();
  }

  description = description
    .replace(
      /Porto Alegre(, RS)?,?\.?(\s*?Brasil)? -?\s?\d{1,2}\/\d{1,2}\/\d{4}:?\.?\s?-?\s?/,
      ""
    )
    .replace(/[/:]/g, "-")
    .replace(/[#?]/g, "");

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
    tags.includes("Gabinete do Prefeito") ||
    tags.includes("Gabinete Prefeito") ||
    tags.includes("Gp") ||
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
    tags.includes("Agentes de Trânsito") ||
    tags.includes("Coordenação de Operações Especiais (COE)")
  ) {
    categories.push("Municipal services in Porto Alegre");
  }

  if (
    !tags.includes("Salão Nobre") &&
    (tags.includes("Paço dos Açorianos") ||
      tags.includes("Porão do Paço") ||
      tags.includes("Prefeitura de Porto Alegre"))
  ) {
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
    (!(
      tags.includes("EPTC") ||
      tags.includes("Empresa Pública de Transporte e Circulação (EPTC)")
    ) &&
      (tags.includes("trânsito") ||
        tags.includes("Transporte") ||
        tags.includes("Transporte e Circulação") ||
        tags.includes("Trânsito e Circulação") ||
        tags.includes("Circulação"))) ||
    tags.includes("Agentes de Trânsito") ||
    tags.includes("Educação no Trânsito") ||
    tags.includes("Mobilidade")
  ) {
    categories.push("Transport in Porto Alegre");
  }

  if (
    tags.includes("Agentes de Trânsito") ||
    tags.includes("Coordenação de Operações Especiais (COE)")
  ) {
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
    tags.includes("Secretário Municipal da Fazenda (SMF)") ||
    tags.includes("Secretário Municipal da Saúde (SMS)") ||
    tags.includes(
      "Secretário Municipal de Governança Local e Coordenação Política (SMGOV)"
    )
  ) {
    categories.push("Municipality secretaries of Porto Alegre");
  }

  if (
    tags.includes("Economia") ||
    tags.includes("Arrecadação Fiscal") ||
    tags.includes("Tarifa") ||
    tags.includes("Sustentabilidade") ||
    tags.includes("Tributação")
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
    (tags.includes("Saúde") ||
      tags.includes("Sms") ||
      tags.includes("Secretaria Municipal de Saúde (SMS)"))
  ) {
    categories.push("Secretaria Municipal de Saúde (Porto Alegre)");
  }

  if (
    !(
      tags.includes("Capacitação") ||
      tags.includes("Primeira Infância Melhor (PIM)")
    ) &&
    (tags.includes("Secretaria Municipal de Educação (SMED)") ||
      tags.includes("Secretária municipal da Educação (SMED)") ||
      tags.includes("SMED"))
  ) {
    categories.push("Secretaria Municipal de Educação (Porto Alegre)");
  }

  if (
    !(
      tags.includes("EMEF João Carlos D`Ávila Paixão Côrtes (Laçador)") ||
      tags.includes("EMEF Vereador Antônio Giúdice") ||
      tags.includes("EMEI Miguel Granato Velasquez")
    ) &&
    (tags.includes("Escola") ||
      tags.includes("EMEF") ||
      tags.includes("Escolas Municipais de Educação Infantil") ||
      tags.includes("EMEI") ||
      tags.includes("EMEM"))
  ) {
    categories.push("Municipal schools in Porto Alegre");
  }

  if (
    !tags.includes(
      "Universidade do Vale do Rio dos Sinos (Porto Alegre campus)"
    ) &&
    tags.includes("Educação Superior")
  ) {
    categories.push("Universities and colleges in Porto Alegre");
  }

  if (
    tags.includes("Educação") ||
    tags.includes("Oficina") ||
    tags.includes("Material Escolar") ||
    tags.includes("Educação no Trânsito") ||
    tags.includes("Educação Básica") ||
    tags.includes("Educação Especial") ||
    tags.includes("Educação Fundamental") ||
    tags.includes("Educação Infantil") ||
    tags.includes("Educação Ambiental") ||
    tags.includes("Educação Educação Técnica") ||
    tags.includes("Ensino") ||
    tags.includes("Cidades Educadoras")
  ) {
    categories.push("Education in Porto Alegre");
  }

  if (tags.includes("Educação Ambiental")) {
    categories.push("Nature of Porto Alegre");
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

  if (
    tags.includes("Fazenda") ||
    tags.includes("Finanças Públicas") ||
    tags.includes("Secretário Municipal da Fazenda (SMF)")
  ) {
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
    tags.includes("Social") ||
    tags.includes("Diversidade sexual") ||
    tags.includes("LGBT") ||
    tags.includes("Transexualidade") ||
    tags.includes("Idosos") ||
    tags.includes("Criança") ||
    tags.includes("Servidor") ||
    tags.includes("Cidadania") ||
    tags.includes("Inclusão Social") ||
    tags.includes("Mulher") ||
    tags.includes("Comissão da Pessoa com Deficiência") ||
    tags.includes("Trabalho e Emprego")
  ) {
    categories.push("Society of Porto Alegre");
  }

  if (
    tags.includes("Diversidade sexual") ||
    tags.includes("LGBT") ||
    tags.includes("Transexualidade")
  ) {
    categories.push("LGBT in Brazil");
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

  if (tags.includes("Hospital de campanha")) {
    categories.push("Field hospitals in Brazil");
    categories.push("Hospitals in Porto Alegre");
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

  if (
    tags.includes("Informatização") ||
    tags.includes("Tecnologia") ||
    tags.includes("Cidades Inteligentes")
  ) {
    categories.push("Science in Porto Alegre");
  }

  if (tags.includes("Atendimento Improvisado")) {
    categories.push("Emergency services in Porto Alegre");
  }

  if (
    tags.includes("Primeiros Socorros") ||
    tags.includes("Hospital de campanha")
  ) {
    categories.push("Emergency medical services in Porto Alegre");
  }

  if (
    !tags.includes("Força Nacional do SUS") &&
    tags.includes("Sistema Único de Saúde (SUS)")
  ) {
    categories.push("Sistema Único de Saúde");
  }

  if (
    !tags.includes("UPA Moacyr Scliar") &&
    tags.includes("Unidade de Pronto Atendimento (UPA)")
  ) {
    categories.push("Unidade de Pronto Atendimento");
  }

  if (tags.includes("Saúde do Idoso") || tags.includes("Idosos")) {
    categories.push("Geriatrics in Brazil");
  }

  if (
    tags.includes("Nutrição") ||
    tags.includes("Saúde Mental") ||
    tags.includes("Saúde Nutricional e Amamentação")
  ) {
    categories.push("Health in Porto Alegre");
  }

  if (
    tags.includes("Medicina") ||
    tags.includes("Atenção Primária à Saúde (APS)") ||
    tags.includes("Assistência Hospitalar") ||
    tags.includes("Clínica da Família") ||
    tags.includes("Saúde do Idoso")
  ) {
    categories.push("Healthcare in Porto Alegre");
  }

  if (
    !tags.includes(
      "Centro Administrativo Municipal Guilherme Socias Villela"
    ) &&
    tags.includes("Centro Administrativo Municipal (CAM)")
  ) {
    categories.push("Centros Administrativos Municipais (Porto Alegre)");
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
    (tags.includes("Serviços Urbanos") ||
      tags.includes("Secretaria Municipal de Serviços Urbanos (SMSURB)"))
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

  if (tags.includes("Aldeia Indígena")) {
    categories.push("Indigenous peoples in Rio Grande do Sul");
    categories.push("Indigenous territories in Brazil");
  }

  if (tags.includes("Quadras de Beach Tennis")) {
    categories.push("Beach tennis");
    categories.push("Tennis courts in Brazil");
    categories.push("Sports venues in Porto Alegre");
  }

  if (
    tags.includes("Orçamento Participativo") ||
    tags.includes("OP") ||
    tags.includes("Conselho do OP")
  ) {
    categories.push(
      "Participatory budgeting in the Municipality of Porto Alegre"
    );
  }

  if (
    !(
      tags.includes("Enchente Porto Alegre Maio de 2024") ||
      tags.includes("Enchente Porto Alegre")
    ) &&
    (tags.includes("Enchente") || tags.includes("Alagamento"))
  ) {
    if (getYear(metadata.humanReadableDate) === 2024) {
      categories.push("2024 Porto Alegre floods");
    } else {
      categories.push("Floods in Porto Alegre");
    }
  }

  if (!tags.includes("ETA São João") && tags.includes("ETA")) {
    categories.push("Water treatment plants in Porto Alegre");
  }

  if (
    tags.includes("Doação") ||
    tags.includes("doações de cestas básicas") ||
    tags.includes("Entrega de Doações")
  ) {
    categories.push("Donations");
  }

  if (tags.includes("doações de cestas básicas")) {
    categories.push("Food relief in Brazil");
    categories.push("Charity in Brazil");
    categories.push("Social services in Porto Alegre");
    categories.push("Humanitarian aid for the 2024 Rio Grande do Sul floods");
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

  if (tags.includes("Retirada de Passarela")) {
    categories.push("Overpass bridges in Brazil");
    categories.push("Footbridges in Brazil");
    categories.push("Demolitions in Brazil");
  }

  if (
    tags.includes("Obras") ||
    tags.includes("Pintura") ||
    tags.includes("Asfalto") ||
    tags.includes("Retirada de Passarela")
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
    (tags.includes("Festejos") || tags.includes("Festival"))
  ) {
    categories.push("Festivals in Porto Alegre");
  }

  if (
    tags.includes("Festival de Inverno") ||
    tags.includes("Semana de Porto Alegre") ||
    tags.includes("Trabalho") ||
    tags.includes("Festejos") ||
    tags.includes("Festival")
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
      ) ||
      tags.includes("Fórum da Liberdade") ||
      categories.includes("2024 Porto Alegre floods")
    )
  ) {
    categories.push(`${getYear(metadata.humanReadableDate)} in Porto Alegre`);
  }

  return categories;
};

const keywordToCategoryMap = {
  Marchezan: "Nelson Marchezan Júnior",
  Hamm: "Afonso Hamm",
  Lula: "Luiz Inácio Lula da Silva",
  "Jorge Benjor": "Jorge Ben Jor",
  "Roberto Freire": "Roberto Freire (politician)",
  "Prefeito de Porto Alegre, Sebastião Melo": "Sebastião Melo",
  "Ricardo Gomes": "Ricardo Gomes (politician)",
  "vice-prefeito Ricardo Gomes": "Ricardo Gomes (politician)",
  "Vice-prefeito de Porto Alegre, Ricardo Gomes": "Ricardo Gomes (politician)",
  "Secretário municipal de Mobilidade Urbana, Adão de Castro Júnior":
    "Adão de Castro Júnior",
  "Secretário Municipal da Saúde (SMS), Fernando Ritter": "Fernando Ritter",
  "Presidente da Companhia de Processamentos de Dados do Município de Porto Alegre, Leticia Batistela":
    "Letícia Batistela",
  "Secretário municipal do Gabinete de Inovação, Luiz Carlos Pinto da Silva Filho":
    "Luiz Carlos Pinto da Silva Filho",
  "presidente da Fundação de Assistência Social e Cidadania (FASC), Cristiano Roratto":
    "Cristiano Roratto",
  "Cel. Evaldo Rodrigues Oliveira": "Evaldo Rodrigues de Oliveira Júnior",
  "Procurador geral do município de Porto Alegre, Roberto Silva da Rocha":
    "Roberto Silva da Rocha",
  "Secretário municipal de Desenvolvimento Social, Leo Voigt": "Leo Voigt",
  "Governador Eduardo Leite": "Eduardo Leite",
  "Presidente da República Luiz Inácio Lula da Silva":
    "Luiz Inácio Lula da Silva",
  "diretor-presidente do DMAE, Maurício Loss": "Maurício Loss",
  "Secretário municipal de Obras e Infraestrutura, André Flores":
    "André Flores",
  "Comandante da Guarda Municipal, Marcelo Nascimento": "Marcelo Nascimento",
  "Cel QOEM Mário Yukio Ikeda": "Mário Yukio Ikeda",
  "Vice-governador Gabriel Souza": "Gabriel Souza",
  "Secretária municipal de Habitação e Regularização Fundiária, Simone Somensi":
    "Simone Somensi",
  "Secretário municipal da Fazenda, Rodrigo Fantinel": "Rodrigo Fantinel",
};

const sameNameKeywords = [
  "Adão Cândido",
  "Cezar Schirmer",
  "Eduardo Leite",
  "Gabriel Souza",
  "Gustavo Paim",
  "Letícia Batistela",
  "Osmar Terra",
  "Ronaldo Nogueira",
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

const positionYearMap = {
  Prefeito: [
    { name: "Nelson Marchezan Júnior", years: [2017, 2020] },
    { name: "Sebastião Melo", years: [2021, 2024] },
  ],
  "Vice-Prefeito": [
    { name: "Gustavo Paim", years: [2017, 2020] },
    { name: "Ricardo Gomes", years: [2021, 2024] },
  ],
  Governador: [
    { name: "José Ivo Sartori", years: [2015, 2018] },
    { name: "Eduardo Leite", years: [2019, 2024] },
  ],
};

function getPersonByPositionAndYear(position, year) {
  const mapping = positionYearMap[position];
  if (!mapping) return null; // Return null if position doesn't exist

  const person = mapping.find(
    ({ years }) =>
      Array.isArray(years)
        ? years.includes(year) // Check if the year falls within the range
        : year === years // For specific years
  );

  return person ? person.name : null; // Return the person's name or null if not found
}

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

  // Add categories based on position and year
  const positionKeywords = ["Prefeito", "Vice-Prefeito", "Governador"];
  positionKeywords.forEach(position => {
    const year = new Date(metadata.humanReadableDate).getFullYear(); // Extract the year
    const personName = getPersonByPositionAndYear(position, year); // Get the person by position and year

    if (personName) {
      uniqueCategories.add(personName); // Add the person's name as a category
    }
  });

  // Convert Set to an array and merge with existing categories
  categories.push(...Array.from(uniqueCategories));

  return categories;
};

const getMappedCategories = metadata => {
  if (!Array.isArray(metadata?.tags)) {
    throw new Error("Invalid input: metadata.tags must be an array.");
  }

  const categories = [];
  const unmatchedTags = [];

  // Check each tag against sameNameTags and add it directly if there's a match
  metadata.tags.forEach(tag => {
    if (sameNameTags.includes(tag) && !categories.includes(tag)) {
      categories.push(tag);
    }
  });

  // Loop through the tags and add the corresponding category if it exists
  metadata.tags.forEach(tag => {
    const category = tagToCategoryMap[tag];

    if (category) {
      if (typeof category === "function") {
        // If the category is a function, call it with metadata
        categories.push(category(metadata));
      } else if (!categories.includes(category)) {
        // Otherwise, add the category as a string
        categories.push(category);
      }
    } else {
      unmatchedTags.push(tag); // Collect unmatched tags
    }
  });

  return categories;
};

const setReadyToUploadFlag = metadata => {
  if (!Array.isArray(metadata?.tags) || !Array.isArray(validTags)) {
    throw new Error(
      "Invalid input: metadata.tags and validTags must be arrays."
    );
  }

  // Find the invalid tags
  const invalidTags = metadata.tags.filter(tag => !validTags.includes(tag));

  // Log the invalid tags if any
  if (invalidTags.length > 0) {
    console.log("Invalid tags:", invalidTags);
  }

  // Check if all tags in metadata.tags are valid
  const allTagsValid = invalidTags.length === 0;

  // Set the readyToUpload flag based on the validity check
  return allTagsValid;
};
