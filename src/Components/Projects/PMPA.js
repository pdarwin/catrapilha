import { actionsD } from "../../Reducers/DataReducer";
import { fetchPMPA1Page } from "../../Services/PMPAApis";
import {
  formatDateToISO,
  formatFriendlyDate,
  getYear,
} from "../../Utils/DateUtils";
import { getProject } from "../../Utils/ProjectUtils";
import { getPplCategories } from "./PplCategories";
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
              metadata.description1
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
    description = description
      .replace("A Foto: ", "")
      .split(/\.?\s?Fotos?:/)[0]
      .trim();
  }

  if (description.match(/\.?\s?Local:/)) {
    description = description.split(/\.?\s?Local:/)[0].trim();
  }

  if (description.match(/\.?\s?Arte:/)) {
    description = description.split(/\.?\s?Arte:/)[0].trim();
  }

  if (description.includes(".<br/>")) {
    description = description.split(".<br/>")[0].trim();
  }

  description = description
    .replace(
      /Porto\s\s?Alegre(, RS)?,?\.?(\s*?Brasil)? -?\s?\d{1,2}\/\d{1,2}\/\d{4}:?\.?\s?-?\s?/,
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
    tags.includes("Grupos de Trabalho") ||
    tags.includes("PPA")
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

  if (!tags.includes("Diversidade sexual") && tags.includes("Coordenações")) {
    categories.push("Municipal coordinators of Porto Alegre");
  }

  if (
    !(
      tags.includes("Conselho Municipal de Saúde") ||
      tags.includes("CMDUA") ||
      tags.includes("COMTU")
    ) &&
    tags.includes("Conselhos Municipais")
  ) {
    categories.push("Municipal councils of Porto Alegre");
  }

  if (
    !(tags.includes("Salão Nobre") || tags.includes("Sala dos Embaixadores")) &&
    (tags.includes("Paço dos Açorianos") ||
      tags.includes("Porão do Paço") ||
      tags.includes("Prefeitura de Porto Alegre") ||
      tags.includes("Paço Municipal de Porto Alegre"))
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
    tags.includes("sanção de Projeto de Lei") ||
    tags.includes("Lei") ||
    tags.includes("Alvará") ||
    tags.includes("Lei Orçamentária Anual (LOA)")
  ) {
    categories.push("Law of Porto Alegre");
  }

  if (
    !(
      tags.includes("EPTC") ||
      tags.includes("Empresa Pública de Transporte e Circulação (EPTC)")
    ) &&
    (tags.includes("trânsito") ||
      tags.includes("Transporte") ||
      tags.includes("Transporte e Circulação") ||
      tags.includes("Trânsito e Circulação") ||
      tags.includes("Circulação") ||
      tags.includes("Circulação e Transporte") ||
      tags.includes("Agentes de Trânsito") ||
      tags.includes("Educação no Trânsito") ||
      tags.includes("Mobilidade"))
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
    ) ||
    tags.includes("Secretário Municipal da Educação (SMED)") ||
    tags.includes("Secretário Municipal de Administração e Patrimônio (SMAP)")
  ) {
    categories.push("Municipality secretaries of Porto Alegre");
  }

  if (
    tags.includes("Economia") ||
    tags.includes("Arrecadação Fiscal") ||
    tags.includes("Tarifa") ||
    tags.includes("Sustentabilidade") ||
    tags.includes("Tributação") ||
    tags.includes("Lei Orçamentária Anual (LOA)")
  ) {
    categories.push("Economy of Porto Alegre");
  }

  if (
    tags.includes("Arrecadação Fiscal") ||
    tags.includes("Tarifa") ||
    tags.includes("Tributação") ||
    tags.includes("Imposto")
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
      tags.includes("Farmácia") ||
      tags.includes("Conselho Municipal de Saúde")
    ) &&
    (tags.includes("Saúde") ||
      tags.includes("Sms") ||
      tags.includes("Secretaria Municipal de Saúde (SMS)"))
  ) {
    categories.push("Secretaria Municipal de Saúde (Porto Alegre)");
  }

  if (tags.includes("Álcool  e Outras Drogas")) {
    categories.push("Alcoholism in Brazil");
    categories.push("Substance dependence in Brazil");
  }

  if (!tags.includes("Vigilância de Alimentos") && tags.includes("CGVS")) {
    categories.push("CGVS (Porto Alegre)");
  }

  if (
    !(
      tags.includes("Capacitação") ||
      tags.includes("Primeira Infância Melhor (PIM)")
    ) &&
    (tags.includes("Secretaria Municipal de Educação (SMED)") ||
      tags.includes("Secretária municipal da Educação (SMED)") ||
      tags.includes("SMED") ||
      tags.includes("Secretário Municipal da Educação (SMED)"))
  ) {
    categories.push("Secretaria Municipal de Educação (Porto Alegre)");
  }

  if (!tags.includes("Curso") && tags.includes("Capacitação")) {
    categories.push("Trainings by the Municipality of Porto Alegre");
  }

  if (!tags.includes("Capacitação") && tags.includes("Curso")) {
    categories.push("Courses by the Municipality of Porto Alegre");
  }

  if (
    (tags.includes("Capacitação") && tags.includes("Curso")) ||
    tags.includes("Curso de Formação")
  ) {
    categories.push("Training courses by the Municipality of Porto Alegre");
  }

  if (
    !(
      tags.includes("EMEF João Carlos D`Ávila Paixão Côrtes (Laçador)") ||
      tags.includes("EMEF Vereador Antônio Giúdice") ||
      tags.includes("EMEI Miguel Granato Velasquez") ||
      tags.includes("EMEI JP Patinho Feio") ||
      tags.includes("EMEI Tio Barnabé") ||
      tags.includes("EMEI JP Passarinho Dourado")
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
    tags.includes("Aula aberta") ||
    tags.includes("Oficina") ||
    tags.includes("Material Escolar") ||
    tags.includes("Educação no Trânsito") ||
    tags.includes("Educação Básica") ||
    tags.includes("Educação Especial") ||
    tags.includes("Educação Fundamental") ||
    tags.includes("Educação Infantil") ||
    tags.includes("Educação Ambiental") ||
    tags.includes("Educação Educação Técnica") ||
    tags.includes("Educação Permanente") ||
    tags.includes("Ensino") ||
    tags.includes("Cidades Educadoras")
  ) {
    categories.push("Education in Porto Alegre");
  }

  if (tags.includes("Educação Ambiental")) {
    categories.push("Nature of Porto Alegre");
  }

  if (
    tags.includes("Procon Municipal") ||
    tags.includes("Procon Móvel") ||
    tags.includes("Procon Móvel")
  ) {
    categories.push("Procon Porto Alegre");
  }

  if (
    !(
      tags.includes("Procon Municipal") ||
      tags.includes("Procon Móvel") ||
      tags.includes("Procon")
    ) &&
    (tags.includes("Consumidor") ||
      tags.includes("Direitos do Consumidor") ||
      tags.includes("Direito do Consumidor"))
  ) {
    categories.push("Consumer protection in Porto Alegre");
  }

  if (
    !tags.includes("Brique da Redenção") &&
    tags.includes("Parque Farroupilha (Redenção)")
  ) {
    categories.push("Parque da Redenção");
  }

  if (!tags.includes("OdontoSesc") && tags.includes("Sesc")) {
    categories.push("Serviço Social do Comércio");
  }

  if (
    !(
      tags.includes("Companhia Municipal de Dança") ||
      tags.includes(
        "Secretaria Municipal de Cultura e Economia Criativa (SMCEC)"
      )
    ) &&
    tags.includes("Cultura")
  ) {
    categories.push("Secretaria Municipal da Cultura (Porto Alegre)");
  }

  if (
    tags.includes("Fazenda") ||
    tags.includes("Finanças") ||
    tags.includes("Finanças Públicas") ||
    tags.includes("Secretário Municipal da Fazenda (SMF)")
  ) {
    categories.push("Secretaria Municipal da Fazenda (Porto Alegre)");
  }

  if (
    tags.includes("Fiscalização") ||
    tags.includes("Vistoria") ||
    tags.includes("Agentes de Fiscalização")
  ) {
    categories.push("Inspections");
  }

  if (
    tags.includes("Ação Integrada") ||
    tags.includes("Blitz") ||
    tags.includes("Fiscalização") ||
    tags.includes("Segurança Publica") ||
    tags.includes("Segurança Pública") ||
    tags.includes("Interdição") ||
    tags.includes("Apreensão") ||
    tags.includes("Vistoria") ||
    tags.includes("Flagrante") ||
    tags.includes("Agentes de Fiscalização")
  ) {
    categories.push("Law enforcement in Porto Alegre");
  }

  if (!tags.includes("Bloqueio químico") && tags.includes("Aedes aegypti")) {
    categories.push("Aedes aegypti");
  }

  if (tags.includes("Leishmaniose") || tags.includes("Doença Respiratória")) {
    categories.push("Diseases and disorders in Brazil");
  }

  if (tags.includes("Esgoto Pluvial") || tags.includes("Esgotos Pluviais")) {
    categories.push("Storm drains in Brazil");
    categories.push("Street furniture in Porto Alegre");
  }

  if (
    tags.includes("Esgoto Pluvial") ||
    tags.includes("Esgotos Pluviais") | tags.includes("Temporal")
  ) {
    categories.push("Storms in Porto Alegre");
  }

  if (
    tags.includes("Carro") ||
    tags.includes("veículo") ||
    tags.includes("Veículos") ||
    tags.includes("Viaturas") ||
    tags.includes("Inspeção veicular")
  ) {
    categories.push("Automobiles in Porto Alegre");
  }

  if (
    tags.includes("Social") ||
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

  if (tags.includes("LGBT") || tags.includes("Transexualidade")) {
    categories.push("LGBT in Rio Grande do Sul");
  }

  if (tags.includes("remoção de lixo") || tags.includes("Coleta Seletiva")) {
    categories.push("Waste collection in Porto Alegre");
  }

  if (tags.includes("Reciclagem") || tags.includes("Compostagem")) {
    categories.push("Recycling in Porto Alegre");
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

  if (
    tags.includes("Guaíba") ||
    tags.includes("Lago Guaíba") ||
    tags.includes("Nivel do Guaíba")
  ) {
    categories.push("Rio Guaíba in Porto Alegre");
  }

  if (
    !tags.includes("Arquivo Histórico Moysés Vellinho") &&
    tags.includes("Arquivo")
  ) {
    categories.push("Archives in Porto Alegre");
  }

  if (tags.includes("Futebol Feminino")) {
    categories.push("Association football in Porto Alegre");
    categories.push("Women's association football in Brazil");
  }

  if (
    tags.includes("Esporte") ||
    tags.includes("Ginástica") ||
    tags.includes("Atletismo") ||
    tags.includes("Vôlei")
  ) {
    categories.push("Sports in Porto Alegre");
  }

  if (
    !(tags.includes("Inauguração") || tags.includes("Abertura")) &&
    (tags.includes("Encerramento") ||
      tags.includes("Cerimônia") ||
      tags.includes("Assinatura"))
  ) {
    categories.push("Ceremonies in Brazil");
  }

  if (tags.includes("Informatização") || tags.includes("Computador")) {
    categories.push("Information technology in Brazil");
    categories.push("Digital transformation");
    categories.push("Computing in Brazil");
    categories.push("E-Government in Brazil");
    categories.push("Digital infrastructure");
  }

  if (
    tags.includes("Informatização") ||
    tags.includes("Tecnologia") ||
    tags.includes("Cidades Inteligentes") ||
    tags.includes("Computador") ||
    tags.includes("Internet")
  ) {
    categories.push("Technology in Porto Alegre");
  }

  if (tags.includes("Atendimento Improvisado")) {
    categories.push("Emergency services in Porto Alegre");
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

  if (!tags.includes("Campanha do Agasalho") && tags.includes("Campanha")) {
    categories.push("Campaigns");
  }

  if (
    !(tags.includes("Dia D de Vacinação") || tags.includes("Gripe")) &&
    (tags.includes("Vacinação") ||
      tags.includes("Vacina") ||
      tags.includes("multivacinação"))
  ) {
    categories.push("Vaccinations in Brazil");
  }

  if (tags.includes("Saúde do Idoso") || tags.includes("Idosos")) {
    categories.push("Geriatrics in Brazil");
  }

  if (
    tags.includes("Nutrição") ||
    tags.includes("Saúde Mental") ||
    tags.includes("Saúde Nutricional e Amamentação") ||
    tags.includes("doação de sangue") ||
    tags.includes("Saúde do Trabalhador") ||
    tags.includes("Doença Respiratória")
  ) {
    categories.push("Health in Porto Alegre");
  }

  if (
    tags.includes("Medicina") ||
    tags.includes("Exame médico") ||
    tags.includes("Atenção Primária à Saúde (APS)") ||
    tags.includes("Assistência Hospitalar") ||
    tags.includes("Clínica da Família") ||
    tags.includes("Saúde do Idoso") ||
    tags.includes("Ambulatório Odontológico") ||
    tags.includes("doação e transplante de órgãos") ||
    tags.includes("Centro de Atenção Psicossocial Álcool e Drogas (CAPS AD)")
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
    !(tags.includes("#eufaçopoa") || tags.includes("Capester")) &&
    tags.includes("Aplicativo (app)")
  ) {
    categories.push("Mobile apps of the Municipality of Porto Alegre");
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
    !tags.includes("Semana de Porto Alegre") &&
    tags.includes("Aniversário")
  ) {
    categories.push("Anniversaries in Brazil");
  }

  if (!tags.includes("ROMU") && tags.includes("Guarda Municipal")) {
    categories.push("Guarda Municipal (Porto Alegre)");
  }

  if (!tags.includes("Maratona") && tags.includes("Corrida")) {
    categories.push("Running in Brazil");
  }

  if (!categories.includes("Running in Brazil") && tags.includes("Atletismo")) {
    categories.push("Athletics in Brazil");
  }

  if (tags.includes("Previsão do Tempo") || tags.includes("Tempo")) {
    categories.push("Weather and climate of Porto Alegre");
    if (categories.length === 1) {
      categories.push("Porto Alegre");
    }
  }

  if (tags.some(tag => ["Asfalto", "Pavimentação"].includes(tag))) {
    categories.push("Asphalters", "Roadworks in Porto Alegre");
  }

  if (tags.includes("Manutenção")) {
    if (
      tags.some(tag =>
        [
          "Empresa Pública de Transporte e Circulação (EPTC)",
          "EPTC",
          "Eptc",
        ].includes(tag)
      )
    ) {
      if (!categories.includes("Roadworks in Porto Alegre")) {
        categories.push("Roadworks in Porto Alegre");
      }
      categories.push("Road maintenance");
    } else {
      categories.push("Maintenance");
    }
  }

  if (tags.includes("Aldeia Indígena")) {
    categories.push("Indigenous peoples in Porto Alegre");
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

  if (tags.includes("Música") || tags.includes("Concerto Musical")) {
    categories.push("Music of Porto Alegre");
  }

  if (tags.includes("doações de cestas básicas")) {
    categories.push("Food relief in Brazil");
    categories.push("Charity in Brazil");
    categories.push("Humanitarian aid for the 2024 Rio Grande do Sul floods");
  }

  if (
    tags.includes("Assistência Social") ||
    tags.includes("Serviço Social") ||
    tags.includes("Previdência")
  ) {
    categories.push("Social services in Porto Alegre");
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

  if (tags.includes("Semana de Porto Alegre")) {
    categories.push(
      `Semana de Porto Alegre ${getYear(metadata.humanReadableDate)}`
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
    tags.includes("Retirada de Passarela")
  ) {
    categories.push("Construction in Porto Alegre");
  }

  if (
    tags.includes("Asfalto") ||
    tags.includes("Manutenção") ||
    tags.includes("Pavimentação") ||
    tags.includes("Obras") ||
    tags.includes("Pintura") ||
    tags.includes("Retirada de Passarela")
  ) {
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
      tags.includes("Assinatura") ||
      tags.includes("Audiência") ||
      tags.includes("Aula aberta") ||
      tags.includes("Caminhada") ||
      tags.includes("Campeonato") ||
      tags.includes("Capacitação") ||
      tags.includes("Cerimônia") ||
      tags.includes("Coletiva de Imprensa") ||
      tags.includes("Concerto Musical") ||
      tags.includes("Conferência") ||
      tags.includes("Curso") ||
      tags.includes("Debate") ||
      tags.includes("Encerramento") ||
      tags.includes("Fórum") ||
      tags.includes("Inauguração") ||
      tags.includes("Lançamento") ||
      tags.includes("Mutirão") ||
      tags.includes("Oficina") ||
      tags.includes("Palestra") ||
      tags.includes("Procissão") ||
      tags.includes("Visita") ||
      tags.includes("Seminário") ||
      tags.includes("Reunião") ||
      tags.includes("Programação do Reveillon") ||
      tags.includes("Homenagem"))
  ) {
    categories.push(
      `${getYear(metadata.humanReadableDate)} events in Porto Alegre`
    );
  }

  if (
    tags.includes("Maratona") ||
    tags.includes("Corrida") ||
    tags.includes("Campeonato") ||
    tags.includes("Jogos Abertos")
  ) {
    categories.push("Sports events in Porto Alegre");
    categories.push(
      `${getYear(
        metadata.humanReadableDate
      )} sports events in Rio Grande do Sul`
    );
  }

  if (
    !(
      tags.includes("Festival de Inverno") ||
      tags.includes("Semana de Porto Alegre") ||
      tags.includes("Trabalho")
    ) &&
    (tags.includes("Festejos") ||
      tags.includes("Festival") ||
      tags.includes("Semana Farroupilha"))
  ) {
    categories.push(
      `${getYear(metadata.humanReadableDate)} festivals in Porto Alegre`
    );
  }

  if (categories.length === 0) {
    categories.push("Porto Alegre");
  }

  if (
    !(
      categories.includes(
        `${getYear(metadata.humanReadableDate)} events in Porto Alegre`
      ) ||
      categories.includes(
        `${getYear(metadata.humanReadableDate)} festivals in Porto Alegre`
      ) ||
      categories.includes(
        `Carnival of Porto Alegre ${getYear(metadata.humanReadableDate)}`
      ) ||
      tags.includes("Fórum da Liberdade") ||
      categories.includes("2024 Porto Alegre floods") ||
      tags.includes("Semana de Porto Alegre")
    )
  ) {
    categories.push(`${getYear(metadata.humanReadableDate)} in Porto Alegre`);
  }

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
