import { actionsD } from "../../../Reducers/DataReducer";
import { fetchPMPA1Page } from "../../../Services/PMPAApis";
import {
  formatDateToISO,
  formatFriendlyDate,
  getYear,
} from "../../../Utils/DateUtils";
import { getProject } from "../../../Utils/ProjectUtils";
import { getPplCategories } from "./PplCategories";
import { sameNameTags } from "./SameNameTags";
import { tagReplacements } from "./TagReplacements";
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

const processImageMetadata = htmlResponse => {
  const $ = cheerio.load(htmlResponse);

  // Metadata extraction
  const imagePath = $('meta[property="og:image"]').attr("content") || null;
  const authorship =
    $(".views-field-field-fotografo .field-content").text().trim() ||
    "Unknown Author";
  const description1 =
    $(".views-field-field-legenda .field-content")
      .text()
      .trim()
      .replace(/"( *)/, '"') || "No description available";
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
  const description = (
    naFoto ? `${description1}<br/>(Na foto: ${naFoto})` : description1
  ).replace("|", "{{!}}");

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

  // Remove anything after specific keywords and trim the string
  const keywords = [
    /\.?\s?(Na\s)?[Ff]otos?:/,
    /\.?\s?Local:/,
    /\.?\s?Arte:/,
    /\.?\s?Endereço:/,
    /\.<br\/>/,
  ];
  for (const keyword of keywords) {
    if (description.match(keyword)) {
      description = description.split(keyword)[0].trim();
    }
  }

  // Remove specific patterns and unwanted characters
  description = description
    .replace(/\n/g, " ")
    .replace(
      /P[oO][rR][tT][oO]\s\s?A[lL][eE][gG][rR][eE](,?\s?\/?RS)?,?\.?(\s*?Brasil)? -?\s?\d{1,2}°?[/.]\d{1,2}[/.]\d{4}:?\.?\s?-?\s?/,
      ""
    )
    .replace(/[/:]/g, "-")
    .replace(/[#?]/g, "");

  // Truncate at the end of the 6th word with more than 3 characters
  const words = description.split(" ");
  let count = 0;
  const truncatedDescription = words.filter(word => {
    if (word.length > 3) count++;
    return count <= 6; // Keep only the first 6 words with more than 3 characters
  });

  // Join the words and remove trailing "." if it exists
  let result = truncatedDescription.join(" ").trim() || "No Description";
  if (result.endsWith(".")) {
    result = result.slice(0, -1); // Remove the last character (the ".")
  }

  return result;
};

const getCategoriesFromTags = metadata => {
  const categories = [];
  const orTags = metadata.tags;
  const tags = orTags.map(tag => tagReplacements[tag] || tag);

  if (
    orTags.includes(
      "Montagem das Estruturas da 64ª Feira do Livro de Porto Alegre"
    )
  ) {
    categories.push(
      "Executive office of the Porto Alegre municipal government"
    );
  }

  if (
    tags.some(tag =>
      [
        "Cerimônia de posse gestão 2025/2028",
        "Executivo",
        "Gabinete",
        "Gabinete do Prefeito",
        "Gabinete Prefeito",
        "Gp",
      ].includes(tag)
    ) ||
    tags.includes("Gvp") ||
    tags.includes("Grupos de Trabalho") ||
    tags.includes("PPA")
  ) {
    categories.push(
      "Executive office of the Porto Alegre municipal government"
    );
  }

  if (
    tags.includes("Gabinete do Prefeito") ||
    tags.includes("Gabinete Prefeito") ||
    tags.includes("Gp")
  ) {
    categories.push("Interior of Paço Municipal de Porto Alegre");
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
    !tags.some(tag =>
      ["Conselho Municipal de Saúde", "CMDUA", "COMTU", "Comui"].includes(tag)
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

  if (
    !tags.some(tag =>
      [
        "Mostra Acústicos e Elétricos",
        "Porão do Paço",
        "Sala da Fonte",
      ].includes(tag)
    ) &&
    tags.includes("Pinacoteca Aldo Locatelli")
  ) {
    categories.push("Pinacoteca Aldo Locatelli");
  }

  if (
    tags.includes("Prédio público") ||
    tags.includes("Prédios e Edificações") ||
    tags.includes("Patrimônio")
  ) {
    categories.push("Municipal buildings in Porto Alegre");
  }

  if (
    tags.some(tag =>
      [
        "Alvará",
        "Lei",
        "Lei Orçamentária Anual (LOA)",
        "Lei de Diretrizes Orçamentárias (LDO)",
        "Licenciamento Ambiental",
        "Licenciamento Urbano",
        "Projeto de Lei",
        "sanção de Projeto de Lei",
        "Termos de Permissão uso bares da Orla do Guaíba",
      ].includes(tag)
    )
  ) {
    categories.push("Law of Porto Alegre");
  }

  if (
    !tags.some(tag =>
      ["EPTC", "Empresa Pública de Transporte e Circulação (EPTC)"].includes(
        tag
      )
    ) &&
    tags.some(tag =>
      [
        "Transporte",
        "Agentes de Trânsito",
        "Educação no Trânsito",
        "Estação de Transbordo",
        "DIA SEM CARRO",
      ].includes(tag)
    )
  ) {
    categories.push("Road transport in Porto Alegre");
  }

  if (
    tags.some(tag =>
      ["1ª Faixa Reversível semafórica de Porto Alegre", "Semáforos"].includes(
        tag
      )
    )
  ) {
    categories.push("Traffic lights in Porto Alegre");
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
    tags.some(
      tag =>
        [
          "Secretário Municipal da Fazenda (SMF)",
          "Secretário Municipal da Saúde (SMS)",
          "Secretário Municipal de Governança Local e Coordenação Política (SMGOV)",
          "Secretário Municipal da Educação (SMED)",
          "Secretário Municipal de Administração e Patrimônio (SMAP)",
        ].includes(tag) || orTags.includes("Posse Novos Secretários Municipais")
    )
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
    !tags.some(tag =>
      [
        "CGVS",
        "Farmácia",
        "Conselho Municipal de Saúde",
        "Saúde da População Negra",
      ].includes(tag)
    ) &&
    tags.some(tag =>
      ["Saúde", "Sms", "Secretaria Municipal de Saúde (SMS)"].includes(tag)
    )
  ) {
    categories.push("Secretaria Municipal de Saúde (Porto Alegre)");
  }

  if (
    !tags.some(tag => ["Reunião Plenária do COMUI", "Comui"].includes(tag)) &&
    tags.some(tag => ["Smdse"].includes(tag))
  ) {
    categories.push(
      "Secretaria Municipal de Desenvolvimento Social e Esporte (Porto Alegre)"
    );
  }

  if (tags.includes("Álcool  e Outras Drogas")) {
    categories.push("Alcoholism in Brazil");
  }

  if (tags.includes("Álcool  e Outras Drogas") || tags.includes("Tabagismo")) {
    categories.push("Substance dependence in Brazil");
  }

  if (!tags.includes("Vigilância de Alimentos") && tags.includes("CGVS")) {
    categories.push("CGVS (Porto Alegre)");
  }

  if (
    !tags.some(tag =>
      [
        "Capacitação",
        "Primeira Infância Melhor (PIM)",
        "Oficina ‘Rabiscando Ideias: Da cabeça para o papel’",
      ].includes(tag)
    ) &&
    tags.some(tag =>
      [
        "Secretária municipal da Educação (SMED)",
        "SMED",
        "Secretário Municipal da Educação (SMED)",
      ].includes(tag)
    )
  ) {
    categories.push("Secretaria Municipal de Educação (Porto Alegre)");
  }

  if (
    !tags.includes(
      "Primeira Infância Melhor no Contexto Prisional (Pim Prisional)"
    ) &&
    tags.includes("Primeira Infância Melhor (PIM)")
  ) {
    categories.push("Primeira Infância Melhor");
  }

  if (
    !tags.includes("Curso") &&
    (tags.includes("Capacitação") || tags.includes("Formação"))
  ) {
    categories.push("Trainings by the Municipality of Porto Alegre");
  }

  if (
    !tags.includes("Capacitação") &&
    (tags.includes("Curso") || tags.includes("Curso de Mecânica"))
  ) {
    categories.push("Courses by the Municipality of Porto Alegre");
  }

  if (
    ((tags.includes("Capacitação") || tags.includes("Formação")) &&
      tags.includes("Curso")) ||
    tags.includes("Curso de Formação")
  ) {
    categories.push("Training courses by the Municipality of Porto Alegre");
  }

  if (
    !(
      tags.includes("EMEF João Carlos D`Ávila Paixão Côrtes (Laçador)") ||
      tags.includes("EMEF Vereador Antônio Giúdice") ||
      tags.includes("EMEF Migrantes") ||
      tags.includes("EMEF Deputado Marcírio Goulart Loureiro") ||
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

  if (tags.includes("Educação Técnica") || tags.includes("Curso de Mecânica")) {
    categories.push("Career and technical education");
  }

  if (
    (!tags.includes("Programa de Trabalho Educativo (PTE)") &&
      tags.some(tag =>
        [
          "Ação Educativa",
          "Aula aberta",
          "Cidades Educadoras",
          "Educação",
          "Educação no Trânsito",
          "Educação Ambiental",
          "Educação Básica",
          "Educação Especial",
          "Educação Fundamental",
          "Educação Infantil",
          "Educação Técnica",
          "Prêmio MPT na Escola",
        ].includes(tag)
      )) ||
    tags.includes() ||
    tags.includes("Educação Permanente") ||
    tags.includes("Ensino") ||
    tags.includes("Formatura") ||
    tags.includes("Oficina") ||
    tags.includes("Oficina de Dança") ||
    tags.includes("Volta às aulas")
  ) {
    categories.push("Education in Porto Alegre");
  }

  if (tags.includes("Educação Ambiental")) {
    categories.push("Nature of Porto Alegre");
  }

  if (
    tags.includes("Procon Municipal") ||
    tags.includes("Procon Móvel") ||
    tags.includes("Procon") ||
    tags.includes("#proconpoaresponde")
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
    !tags.some(tag =>
      [
        "Clássicos na Pinacoteca",
        "Companhia Municipal de Dança",
        "Feira do Livro",
        "Grupo Experimental de Dança (GED)",
        "Inclusão Em Cena",
        "Mostra Acústicos e Elétricos",
        "Poa Em Cena",
        "Secretaria Municipal de Cultura e Economia Criativa (SMCEC)",
        "SMC - 1ª Invernada Farroupilha Paixão Cortes 2018 Mostra de Dança",
        "Viva o Centro a Pé",
      ].includes(tag)
    ) &&
    tags.some(tag => ["Cultura", "Smc"].includes(tag))
  ) {
    categories.push("Secretaria Municipal da Cultura (Porto Alegre)");
  }

  if (
    !(
      tags.includes("Companhia Municipal de Dança") ||
      tags.includes("Grupo Experimental de Dança (GED)")
    ) &&
    (tags.includes("Dança") ||
      tags.includes("Maratona de Dança") ||
      tags.includes("Oficina de Dança"))
  ) {
    categories.push("Dance in Porto Alegre");
  }

  if (tags.includes("Comércio") || tags.includes("Comércio Irregular")) {
    categories.push("Commerce in Porto Alegre");
  }

  if (
    tags.some(tag =>
      [
        "Agentes de Fiscalização",
        "Fiscalização",
        "Vistoria",
        "Vistoria Obras Restaurante Panorâmico",
      ].includes(tag)
    ) ||
    tags.includes() ||
    tags.includes()
  ) {
    categories.push("Inspections in Brazil");
  }

  if (
    tags.some(tag =>
      [
        "Ação Integrada",
        "Agentes de Fiscalização",
        "Apreensão",
        "Blitz",
        "Fiscalização",
        "Flagrante",
        "Interdição",
        "Segurança Publica",
        "Segurança Pública",
        "Vistoria",
        "Vistoria Obras Restaurante Panorâmico",
      ].includes(tag)
    )
  ) {
    categories.push("Law enforcement in Porto Alegre");
  }

  if (
    !tags.includes("Bloqueio químico") &&
    (tags.includes("Aedes aegypti") || tags.includes("Mosquito Aedes Aegypti"))
  ) {
    categories.push("Aedes aegypti");
  }

  if (
    tags.includes("Leishmaniose") ||
    tags.includes("Doença Respiratória") ||
    tags.includes("síndrome de down")
  ) {
    categories.push("Diseases and disorders in Brazil");
  }

  if (!tags.includes("Hanseníase") && tags.includes("Doenças Transmissíveis")) {
    categories.push("Infectious diseases in Brazil");
  }

  if (tags.includes("Esgoto Pluvial") || tags.includes("Esgotos Pluviais")) {
    categories.push("Storm drains in Brazil");
  }

  if (
    tags.includes("Esgoto Pluvial") ||
    tags.includes("Esgotos Pluviais") ||
    tags.includes("Mobiliário Urbano")
  ) {
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
    (!tags.includes("Comui") && tags.includes("Idosos")) ||
    tags.includes("Criança") ||
    tags.includes("Servidor") ||
    tags.includes("Cidadania") ||
    tags.includes("Inclusão Social") ||
    tags.includes("Mulher") ||
    tags.includes("Comissão da Pessoa com Deficiência") ||
    tags.includes("Pessoa com Deficiência") ||
    tags.includes("Trabalho e Emprego") ||
    tags.includes("evento social")
  ) {
    categories.push("Society of Porto Alegre");
  }

  if (tags.some(tag => ["LGBT", "Transexualidade"].includes(tag))) {
    categories.push("LGBT in Rio Grande do Sul");
  }

  if (
    !tags.some(tag => ["Inclusão Em Cena", "Poa Em Cena"].includes(tag)) &&
    tags.includes("Teatro")
  ) {
    categories.push("Theatre of Porto Alegre");
  }

  if (
    tags.some(tag =>
      [
        "remoção de lixo",
        "Coleta Seletiva",
        "Novo Layout Caminhões Coleta Seletiva",
      ].includes(tag)
    )
  ) {
    categories.push("Waste collection in Porto Alegre");
  }

  if (
    tags.some(tag =>
      ["Coleta Seletiva", "Novo Layout Caminhões Coleta Seletiva"].includes(tag)
    )
  ) {
    categories.push("Separate waste collection in Brazil");
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
    tags.includes("Adoção de animais") ||
    tags.includes("Escorpião Amarelo") ||
    tags.includes("macacos-prego")
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

  if (tags.includes("Vento") || tags.includes("Downburst")) {
    categories.push("Wind in Porto Alegre");
  }

  if (
    !tags.includes("Arquivo Histórico Moysés Vellinho") &&
    tags.includes("Arquivo")
  ) {
    categories.push("Archives in Porto Alegre");
  }

  if (
    !(tags.includes("Gre-nal de Todos") || tags.includes("Gre-Nal")) &&
    (tags.includes("Futebol") || tags.includes("Futebol de Várzea"))
  ) {
    categories.push("Association football in Porto Alegre");
  }

  if (tags.includes("Futebol Feminino")) {
    categories.push("Association football in Porto Alegre");
    categories.push("Women's association football in Brazil");
  }

  if (
    !(
      tags.includes("Futebol de Várzea") ||
      tags.includes("Jogos dos Estudantes Surdos") ||
      tags.includes("Mexatchê")
    ) &&
    (tags.includes("Esporte") ||
      tags.includes("Futsal") ||
      tags.includes("Ginástica") ||
      tags.includes("Atletismo") ||
      tags.includes("Vôlei") ||
      tags.includes("Basquete") ||
      tags.includes("Desenvolvimento Economico e Esporte"))
  ) {
    categories.push("Sports in Porto Alegre");
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
    tags.includes("Internet") ||
    tags.includes("Robótica")
  ) {
    categories.push("Technology in Porto Alegre");
  }

  if (tags.includes("Encerramento")) {
    categories.push("Closing ceremonies");
  }

  if (!tags.includes("Campanha do Agasalho") && tags.includes("Campanha")) {
    categories.push("Campaigns in Brazil");
  }

  if (
    tags.includes("Mutirão") ||
    tags.includes("Força-Tarefa") ||
    tags.includes("Mutirão de cirurgias")
  ) {
    categories.push("Task forces in Brazil");
  }

  if (
    !tags.includes("Instituto Penal Feminino de Porto Alegre") &&
    tags.includes("Saúde Prisional")
  ) {
    categories.push("Prisons in Porto Alegre");
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

  if (
    tags.includes("Primeiros Socorros") ||
    tags.includes("Hospital de campanha") ||
    tags.includes("Atendimento de Urgência") ||
    tags.includes("Atenção Ambulatorial, Hospitalar e Urgências")
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
    !(tags.includes("Dia D de Vacinação") || tags.includes("Gripe")) &&
    (tags.includes("Vacinação") ||
      tags.includes("Vacina") ||
      tags.includes("multivacinação"))
  ) {
    categories.push("Vaccinations in Brazil");
  }

  if (
    !tags.includes("UPA Moacyr Scliar") &&
    tags.includes("Unidade de Pronto Atendimento (UPA)")
  ) {
    categories.push("Unidade de Pronto Atendimento");
  }

  if (
    !tags.includes("Unidade de Saúde Ponta Grossa") &&
    tags.includes("Unidade de Saúde")
  ) {
    categories.push("Unidades de Saúde in Porto Alegre");
  }

  if (
    !tags.includes("Comui") &&
    tags.some(tag => ["Saúde do Idoso", "Idosos"].includes(tag))
  ) {
    categories.push("Geriatrics in Brazil");
  }

  if (
    tags.includes("Acessibilidade") ||
    tags.includes("Pessoa com mobilidade reduzida")
  ) {
    categories.push("Accessibility in Brazil");
  }

  if (
    tags.some(tag =>
      [
        "doação de sangue",
        "Doença Respiratória",
        "Doenças Transmissíveis",
        "Hanseníase",
        "hipertenso",
        "Nutrição",
        "Outubro Rosa",
        "Saúde do Trabalhador",
        "Saúde Mental",
        "Saúde Nutricional e Amamentação",
      ].includes(tag)
    )
  ) {
    categories.push("Health in Porto Alegre");
  }

  if (
    tags.some(tag =>
      [
        "Assistência Hospitalar",
        "Atenção Ambulatorial, Hospitalar e Urgências",
        "Atenção Básica",
        "Atenção Primária à Saúde (APS)",
        "Atendimento em Casa",
        "Equipamentos Hospitalares",
        "Exame médico",
        "Medicina",
        "Visita domiciliar",
      ].includes(tag)
    ) ||
    tags.includes("Clínica da Família") ||
    tags.includes("Saúde do Idoso") ||
    tags.includes("Saúde Prisional") ||
    tags.includes("Ambulatório Odontológico") ||
    tags.includes("doação e transplante de órgãos") ||
    tags.includes("Centro de Atenção Psicossocial Álcool e Drogas (CAPS AD)") ||
    tags.includes("Mutirão de cirurgias")
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

  categories.push(...getMappedCategories(metadata, tags));

  if (
    !(
      categories.includes("DMAP (Porto Alegre)") ||
      tags.some(tag =>
        ["DMAE", "DMLU", "Departamento de Iluminação Pública (DIP)"].includes(
          tag
        )
      )
    ) &&
    tags.includes("SMSURB")
  ) {
    categories.push("Secretaria Municipal de Serviços Urbanos (Porto Alegre)");
  }

  if (
    !tags.includes("Plantio Sustentável do DMLU") &&
    tags.some(tag =>
      ["DMLU", "Novo Layout Caminhões Coleta Seletiva"].includes(tag)
    )
  ) {
    categories.push("Departamento Municipal de Limpeza Urbana (Porto Alegre)");
  }

  if (!tags.includes("Operação Jaguar") && tags.includes("Smseg")) {
    categories.push("Secretaria Municipal de Segurança (Porto Alegre)");
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

  if (
    !tags.includes("Campanha do Brinquedo Solidário") &&
    tags.includes("Brinquedo")
  ) {
    categories.push("Toys in Brazil");
  }

  if (tags.includes("Novo Layout Caminhões Coleta Seletiva")) {
    categories.push("Municipal vehicles of Porto Alegre");
    categories.push("Sorted waste collection trucks");
  }

  if (!tags.includes("Feira do Livro") && tags.includes("Livro e Literatura")) {
    categories.push("Literature of Porto Alegre");
  }

  if (
    !tags.some(tag => ["ROMU", "Operação Jaguar"].includes(tag)) &&
    tags.includes("Guarda Municipal")
  ) {
    categories.push("Guarda Municipal (Porto Alegre)");
  }

  if (
    !tags.includes("Albergue Felipe Diehl") &&
    tags.some(tag =>
      ["Abrigos", "Albergues", "Albergue Municipal", "Acolhimento"].includes(
        tag
      )
    )
  ) {
    categories.push("Shelters in Brazil");
  }

  if (tags.includes("Abrigos Residenciais - AR 7 e 8")) {
    categories.push("Abrigo Residencial AR 7", "Abrigo Residencial AR 8");
  }

  if (tags.includes("Obra de arte") || tags.includes("Arte Cemiterial")) {
    categories.push("Art of Porto Alegre");
  }

  if (
    !tags.includes("Material Escolar") &&
    tags.includes("Praça da Alfândega")
  ) {
    categories.push("Praça da Alfândega (Porto Alegre)");
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
    categories.push("Asphalters");
  }

  if (
    tags.some(tag =>
      ["Asfalto", "Pavimentação", "rolo compressor"].includes(tag)
    )
  ) {
    categories.push("Roadworks in Porto Alegre");
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
    tags.includes("Licenciamento Urbano") ||
    tags.includes("Regularização Fundiária") ||
    tags.includes("Regularização") ||
    tags.includes("Loteamento")
  ) {
    categories.push("Urban planning in Brazil");
  }

  if (tags.includes("Convênio") || tags.includes("Parceria Público-Privada")) {
    categories.push("Partnerships involving the Municipality of Porto Alegre");
  }

  if (
    !(
      tags.includes("Orçamento Participativo 2018") || tags.includes("Op 2017")
    ) &&
    (tags.includes("Orçamento Participativo") ||
      tags.includes("OP") ||
      tags.includes("Conselho do OP"))
  ) {
    categories.push(
      "Participatory budgeting in the Municipality of Porto Alegre"
    );
  }

  if (!tags.includes("ETA São João") && tags.includes("ETA")) {
    categories.push("Water treatment plants in Porto Alegre");
  }

  if (!tags.includes("Outubro Rosa") && tags.includes("Câncer de Mama")) {
    categories.push("Breast cancer awareness in Brazil");
  }

  if (
    !tags.includes("Acampamento Farroupilha") &&
    tags.includes("Parque Maurício Sirotsky Sobrinho (Harmonia)")
  ) {
    categories.push("Parque Maurício Sirotski Sobrinho");
  }

  if (
    !(
      tags.includes("Orla Moacyr Scliar") ||
      tags.includes("Parque Urbano da Orla Moacyr Scliar")
    ) &&
    (tags.includes("Orla do Guaíba") ||
      tags.includes("Termos de Permissão uso bares da Orla do Guaíba"))
  ) {
    categories.push("Parque da Orla do Guaíba");
  }

  if (
    tags.includes("Doação") ||
    tags.includes("doações de cestas básicas") ||
    tags.includes("Entrega de Doações")
  ) {
    categories.push("Donations in Brazil");
  }

  if (
    tags.includes("Acidente") ||
    tags.includes("Acidentalidade") ||
    tags.includes("Mortes no trânsito")
  ) {
    categories.push("Road accidents in Porto Alegre");
  }

  if (tags.includes("Mortes no trânsito")) {
    categories.push("Death in Porto Alegre");
    categories.push("Road accidents with fatalities");
  }

  if (tags.includes("Adutora")) {
    categories.push("Water pipelines in Brazil");
    categories.push("Water supply infrastructure in Porto Alegre");
  }

  if (
    !tags.includes("Clássicos na Pinacoteca") &&
    (tags.includes("Música") || tags.includes("Concerto Musical"))
  ) {
    categories.push("Music of Porto Alegre");
  }

  if (!tags.includes("Top de Marketing ADVB/RS") && tags.includes("Casa NTX")) {
    categories.push("Casa NTX");
  }

  if (tags.includes("Ônibus") || tags.includes("BRT's")) {
    categories.push("Buses in Porto Alegre");
  }

  if (
    !tags.includes("Viva o Centro a Pé") &&
    tags.includes("Centro Histórico")
  ) {
    categories.push("Centro Histórico (Porto Alegre)");
  }

  if (
    !tags.includes("Praça Mafalda Veríssimo") &&
    tags.includes("Petrópolis")
  ) {
    categories.push("Petrópolis (Porto Alegre)");
  }

  if (
    !tags.includes("Emef Vereador Carlos Pessoa de Brum") &&
    tags.includes("Bairro Restinga")
  ) {
    categories.push("Restinga (Porto Alegre)");
  }

  if (tags.includes("doações de cestas básicas")) {
    categories.push("Food relief in Brazil");
    categories.push("Humanitarian aid for the 2024 Rio Grande do Sul floods");
  }

  if (
    tags.includes("Assistência Social") ||
    tags.includes("Serviço Social") ||
    tags.includes("Previdência") ||
    tags.includes("Bolsa Família")
  ) {
    categories.push("Social services in Porto Alegre");
  }

  if (tags.includes("Habitação" || tags.includes("Loteamento"))) {
    categories.push("Housing in Porto Alegre");
  }

  if (
    tags.includes("Terreno") ||
    tags.includes("Loteamento") ||
    tags.includes("Reintegração de Posse")
  ) {
    categories.push("Real estate in Brazil");
  }

  if (tags.includes("Retirada de Passarela")) {
    categories.push("Overpass bridges in Brazil");
    categories.push("Footbridges in Brazil");
    categories.push("Demolitions in Brazil");
  }

  if (
    tags.some(tag =>
      [
        "Obras",
        "Pintura",
        "Retirada de Passarela",
        "Vistoria Obras Restaurante Panorâmico",
      ].includes(tag)
    ) ||
    orTags.includes(
      "Montagem das Estruturas da 64ª Feira do Livro de Porto Alegre"
    )
  ) {
    categories.push("Construction in Porto Alegre");
  }

  if (tags.includes("Transmissão de Cargo")) {
    categories.push("Politics of Porto Alegre");
  }

  if (tags.some(tag => ["operários", "porteiros"].includes(tag))) {
    categories.push("Workers in Brazil");
  }

  categories.push(...getPplCategories(metadata, tags));

  if (
    tags.includes(
      "SMC - 1ª Invernada Farroupilha Paixão Cortes 2018 Mostra de Dança"
    )
  ) {
    ["Paixão Côrtes", "Auditório Araújo Vianna"].forEach(unwanted => {
      const index = categories.indexOf(unwanted);
      if (index !== -1) {
        categories.splice(index, 1);
      }
    });
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

  if (tags.includes("Início da Primavera 2018")) {
    categories.push("Spring in Porto Alegre");
    categories.push("Spring 2018 in Brazil");
  }

  if (
    tags.some(tag =>
      ["Transporte fluvial de passageiros", "Catamarã"].includes(tag)
    )
  ) {
    categories.push(
      `${getYear(metadata.humanReadableDate)} in water transport`
    );
  }

  if (tags.includes("Catamarã")) {
    categories.push("Catamarans", "Watercraft in Porto Alegre");
  }

  if (
    tags.some(tag =>
      [
        "Asfalto",
        "Manutenção",
        "Pavimentação",
        "Obras",
        "Pintura",
        "Retirada de Passarela",
        "Vistoria Obras Restaurante Panorâmico",
      ].includes(tag)
    ) ||
    orTags.includes(
      "Montagem das Estruturas da 64ª Feira do Livro de Porto Alegre"
    )
  ) {
    categories.push(`${getYear(metadata.humanReadableDate)} in construction`);
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

  if (
    !(
      tags.includes("Acampamento Farroupilha") ||
      tags.includes(
        "SMC - 1ª Invernada Farroupilha Paixão Cortes 2018 Mostra de Dança"
      )
    ) &&
    tags.includes("Semana Farroupilha")
  ) {
    categories.push("Semana Farroupilha in Porto Alegre");
  }

  if (
    !tags.includes("Fórum da Liberdade") &&
    tags.some(tag =>
      [
        "Fórum",
        "Reunião",
        "Reunião Plenária do COMUI",
        "Reunião-almoço Tá Na Mesa",
        "Videoconferência",
      ].includes(tag)
    )
  ) {
    categories.push("Meetings in Porto Alegre");
  }

  if (tags.includes("Manifestação")) {
    categories.push("Demonstrations and protests in Porto Alegre");
    categories.push(
      `Demonstrations and protests in Brazil in ${getYear(
        metadata.humanReadableDate
      )}`
    );
  }

  if (!tags.includes("Fórum da Liberdade") && tags.includes("Conferência")) {
    categories.push("Conferences in Brazil");
  }

  if (
    !tags.includes("Clássicos na Pinacoteca") &&
    tags.includes("Pinacoteca Ruben Berta")
  ) {
    categories.push("Pinacoteca Ruben Berta");
  }

  if (
    tags.includes("Concerto Musical") ||
    tags.includes("Clássicos na Pinacoteca")
  ) {
    categories.push(
      `${getYear(metadata.humanReadableDate)} concerts in Brazil`
    );
  }

  if (
    !(tags.includes("Inauguração") || tags.includes("Abertura")) &&
    (tags.includes("Assinatura") ||
      tags.includes("Cerimônia") ||
      tags.includes("Encerramento") ||
      tags.includes("Transmissão de Cargo") ||
      tags.includes("Serviço Funerário"))
  ) {
    categories.push("Ceremonies in Brazil");
  }

  if (
    !tags.some(tag =>
      [
        "Acampamento Farroupilha",
        "Feira do Livro",
        "Festa de Nossa Senhora dos Navegantes",
        "Festival do Japão",
        "Fórum da Liberdade",
        "Material Escolar",
        "Missão Xangai 2018",
        "Salão Internacional de Desenho para Imprensa (Sidi)",
        "Semana de Porto Alegre",
        "Top de Marketing ADVB/RS",
      ].includes(tag)
    ) &&
    (tags.includes("Abertura") ||
      tags.includes("Ação Rua") ||
      tags.includes("Aniversário") ||
      tags.includes("Apresentação") ||
      tags.includes("Asfalto") ||
      tags.includes("Audiência") ||
      tags.includes("Aula aberta") ||
      tags.includes("Aula Inaugural") ||
      tags.includes("Caminhada") ||
      tags.includes("Campanha do Agasalho") ||
      tags.includes("Campanha do Brinquedo Solidário") ||
      tags.includes("Capacitação") ||
      tags.includes("Casamento") ||
      tags.some(tag =>
        [
          "Ação de Pulverização de Inseticida",
          "Ação Educativa",
          "Apreensão",
          "Clássicos na Pinacoteca",
          "Coletiva de Imprensa",
          "Concerto Musical",
          "Convite",
          "Curso",
          "Dança",
          "Debate",
          "Dia da Criança",
          "Dia do Desafio",
          "Dia Mundial da Alimentação",
          "DIA SEM CARRO",
          "Encerramento",
          "Espetáculo",
          "evento social",
          "Executivo",
          "exposição",
          "Feira de Oportunidades",
          "Fiscalização",
          "Formação",
          "Formatura",
          "Gvp",
          "Homenagem",
          "Inauguração",
          "Lançamento",
          "Manifestação",
          "Meetings involving the Municipality of Porto Alegre",
          "Mutirão",
          "Oficina",
          "Oficina de Dança",
          "Outubro Rosa",
          "Palestra",
          "Passeio",
          "Posse",
          "Prefeitura nos Bairros",
          "Prefeitura Nos Bairros",
          "Procissão",
          "Programação Cultural",
          "Programação do Reveillon",
          "Projeto Mais Comunidade",
          "Semana Cidade Limpa",
          "Semana da Água",
          "Seminário",
          "Simpósio",
          "Tapa Buracos",
          "Vacinação",
          "Visita",
          "Vistoria",
          "Vistoria Obras Restaurante Panorâmico",
          "Viva o Centro a Pé",
          "Volta às aulas",
          "Workshop",
        ].includes(tag)
      ) ||
      orTags.includes("Entrega da Lei Orçamentária Anual (LOA) 2019") ||
      categories.includes("Ceremonies in Brazil") ||
      categories.includes("Conferences in Brazil") ||
      categories.includes("Meetings in Porto Alegre"))
  ) {
    categories.push(
      `${getYear(metadata.humanReadableDate)} events in Porto Alegre`
    );
  }

  if (
    tags.includes("Maratona") ||
    tags.includes("Corrida") ||
    tags.includes("Campeonato") ||
    tags.includes("Jogos Abertos") ||
    tags.includes("Gre-nal de Todos") ||
    tags.includes("Gre-Nal") ||
    tags.includes("Mexatchê")
  ) {
    categories.push(
      `${getYear(metadata.humanReadableDate)} sports events in Porto Alegre`
    );
  }

  if (
    !(
      tags.includes("Festival de Inverno") ||
      tags.includes("Semana de Porto Alegre") ||
      tags.includes("Acampamento Farroupilha") ||
      tags.includes("Trabalho") ||
      tags.includes("Poa Em Cena") ||
      tags.includes("Festival do Japão") ||
      tags.includes(
        "SMC - 1ª Invernada Farroupilha Paixão Cortes 2018 Mostra de Dança"
      )
    ) &&
    (tags.includes("Festejos") ||
      tags.includes("Festival") ||
      tags.includes("Semana Farroupilha") ||
      tags.includes("Feira Temática") ||
      tags.includes("Semana do Japão"))
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
        `${getYear(metadata.humanReadableDate)} sports events in Porto Alegre`
      ) ||
      categories.includes(
        `Carnival of Porto Alegre ${getYear(metadata.humanReadableDate)}`
      ) ||
      categories.includes("2024 Porto Alegre floods") ||
      tags.some(tag =>
        [
          "1º Festival de Arte e Cultura Senegalesa",
          "14ª Gincana Ambiental",
          "17ª Edição dos Jogos Municipais da Terceira Idade",
          "30 Anos da Defesa Civil",
          "32º Festival de Arte da Cidade de Porto Alegre",
          "48º Troféu Seival e 29ª Regata Farroupilha",
          "8ª Semana Municipal da Água",
          "Acampamento Farroupilha",
          "Feira do Livro",
          "Festa de Nossa Senhora dos Navegantes",
          "Fórum da Liberdade",
          "Inclusão Em Cena",
          "Jogos dos Estudantes Surdos",
          "Missão Xangai 2018",
          "Mostra Acústicos e Elétricos",
          "Operação Jaguar",
          "Natal",
          "Páscoa",
          "Poa Em Cena",
          "Semana de Porto Alegre",
          "Seminário Nacional de Trânsito - Mobilidade Sustentável, Educação, e Segurança",
          "SMC - 1ª Invernada Farroupilha Paixão Cortes 2018 Mostra de Dança",
          "Top de Marketing ADVB/RS",
          "Oficina ‘Rabiscando Ideias: Da cabeça para o papel’",
        ].includes(tag)
      )
    )
  ) {
    categories.push(`${getYear(metadata.humanReadableDate)} in Porto Alegre`);
  }

  return categories;
};

const getMappedCategories = (metadata, tags) => {
  const categories = [];
  const unmatchedTags = [];

  // Check each tag against sameNameTags and add it directly if there's a match
  tags.forEach(tag => {
    if (sameNameTags.includes(tag) && !categories.includes(tag)) {
      categories.push(tag);
    }
  });

  // Loop through the tags and add the corresponding category if it exists
  tags.forEach(tag => {
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
