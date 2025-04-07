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
      /P[oO][rR][tT][oO]\s\s?A[lL][eE][gG][rR][eE](,?\s?\/?RS)?,?\.?(\s*?B[Rr][Aa][Ss][iI][Ll])?,? -?\s*?\d{1,2}[°º]?[/.-]?\d{1,2}[/.-]?\d{4}\s?(Brasil)?:?\.?\s?-?\s?/,
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
  const tags = orTags.flatMap(tag => tagReplacements[tag] || [tag]);

  const anyTagIncludes = list => tags.some(tag => list.includes(tag));
  const noTagIncludes = list => !tags.some(tag => list.includes(tag));

  // Paço check
  const paçoExclude = [
    "5ª Edição da Cerimônia de Lavagem das Escadarias do Paço",
    "Exposição de Gravuras Portuguesas",
    "Pinacoteca Aldo Locatelli",
    "Salão Nobre",
    "Sala dos Embaixadores",
  ];

  const paçoInclude = [
    "Laboratório de Informática do Prédio da Prefeitura de Porto Alegre",
    "Paço dos Açorianos",
    "Porão do Paço",
    "Prefeitura de Porto Alegre",
    "Prefeitura Municipal de Porto Alegre",
    "Paço Municipal de Porto Alegre",
  ];

  const atSalaoNobre = ["Salão Nobre", "Salão Nobre do Paço Municipal"];

  const atPaco = noTagIncludes(paçoExclude) && anyTagIncludes(paçoInclude);

  // Tag groups
  const meetingTags = [
    "Fórum",
    "Reunião",
    "MenuPOA",
    "Reunião-almoço Tá Na Mesa",
    "Videoconferência",
  ];

  const specificMeetingTags = [
    "Encontro com as Associação das Empresas dos Bairros Humaitá e Navegantes",
    "Escritório de Parcerias Público-Privadas do Distrito de Columbia (OP3)",
    "Fórum de Justiça e Segurança do Centro",
    "Reunião com  a ASCONTEC",
    "Reunião com a Associação Dos Procuradores Do Município De Porto Alegre (APMPA)",
    "Reunião com a BM Par",
    "Reunião com a CRIP Leste",
    "Reunião com a EPTC e Sindicatos",
    "Reunião com o Conselho do Orçamento Participativo",
    "Reunião com o Diretor regional da Caixa Econômica Federal",
    "Reunião com o Presidente da Câmara de Vereadores de Porto Alegre",
    "Reunião com representantes das entidades e das associações de praças e parques",
    "Reunião com Representantes do Banco Mundial",
    "Reunião com Supervisores das EMEFS",
    "Reunião do Comitê Executivo",
    "Reunião do UNOPS e secretaria de parcerias estratégicas",
    "Reunião no BID",
    "Reunião no International Finance Corporation (IFC)",
    "Reunião Plenária do COMUI",
    "Reunião sobre a IBERCUP",
    "Reunião sobre acolhida  ao grupo de venezuelanos",
    "Reunião Sobre Sistemas Informatizados",
  ];

  const executiveTags = [
    "Cerimônia de posse gestão 2025/2028",
    "Executivo",
    "Gabinete",
    "Gabinete do Prefeito",
    "Gabinete do Vice-Prefeito",
    "Gabinete Prefeito",
    "Gestão 2025 - 2028",
    "Grupos de Trabalho",
    "Gp",
    "Gvp",
    "PPA",
    "prefeito em exercício",
  ];

  const internalMeetingTags = [
    "Comitê Municipal de Transmissão Vertical do HIV e Sífilis Congênita",
    "Comunicação",
    "Cultura",
    "Demhab",
    "DMLU",
    "Saúde",
    "Secretaria Municipal de Cultura (SMC)",
    "SMAMS",
    "Smdse",
    "Smpg",
    "Smri",
    "Smseg",
  ];

  if (
    tags.some(tag =>
      [
        "Abertura",
        "Lançamento do Lance de Craque 2018",
        "Temporada das Piscinas Comunitárias de Porto Alegre",
      ].includes(tag)
    ) ||
    orTags.some(tag =>
      [
        "Lançamento do Pacto Pela Inovação - Pacto Alegre",
        "Lançamento Oficial da 64ª edição da Feira do Livro de Porto Alegre",
        "Lançamento oficial da Expodireto Cotrijal 2025",
      ].includes(tag)
    )
  ) {
    categories.push("Opening ceremonies in Brazil");
  }

  if (
    orTags.some(tag =>
      ["Encerramento da Missão Técnica do BNDES"].includes(tag)
    ) ||
    tags.some(tag =>
      ["Encerramento", "Encerramento do Programa Compartilhar"].includes(tag)
    )
  ) {
    categories.push("Closing ceremonies in Brazil");
  }

  const ceremonyTags = [
    "Ato de Lançamento do Edital do PMI do Parque Mauricio Sirotsky Sobrinho - Parque Harmonia",
    "Posse",
    "Posse da Delegada Andine Anflor como chefe da Polícia Civil do RS",
    "Posse Deputados Estaduais",
    "Assinatura",
    "Cerimônia",
    "Cerimônia de Apresentação de PLs de Concessão e Adoção",
    "Cerimônia de Passagem de Comando na Capitania Fluvial de Porto Alegre",
    "Lançamento",
    "Sessão Solene de outorga de Título de Cidadão de Porto Alegre ao Presidente Estadual da Assembleia de Deus Pastor Adalberto Santos Dutra",
    "Sessão Solene de Posse da OAB/RS Triênio 2019/2021",
    "Solenidade de transmissão do Cargo do Procurador-Geral do Estado",
    "Transmissão de Cargo",
    "Serviço Funerário",
  ];

  const isCeremony =
    anyTagIncludes(ceremonyTags) ||
    categories.some(cat =>
      [
        "Opening ceremonies in Brazil",
        "Closing ceremonies in Brazil",
        "Inaugurations in Brazil",
      ].includes(cat)
    );

  const isMeetingTag =
    !tags.includes("Fórum da Liberdade") && anyTagIncludes(meetingTags);
  const isSpecificMeetingTag = anyTagIncludes(specificMeetingTags);
  const isExecutiveTag =
    !tags.includes(
      "5ª Edição da Cerimônia de Lavagem das Escadarias do Paço"
    ) && anyTagIncludes(executiveTags);
  const isInternalMeeting = anyTagIncludes(internalMeetingTags);
  const isVisit = tags.includes("Visita");
  const isAudience = tags.includes("Audiência");
  const atSalaoNobreMatch = anyTagIncludes(atSalaoNobre);

  // --- Category logic ---
  if (atSalaoNobreMatch) {
    if (isAudience) {
      categories.push(
        "Audiences at Salão Nobre do Paço Municipal de Porto Alegre"
      );
    } else if (isMeetingTag || isSpecificMeetingTag) {
      categories.push(
        "Meetings at Salão Nobre do Paço Municipal de Porto Alegre"
      );
    } else if (isCeremony) {
      categories.push(
        "Ceremonies at Salão Nobre do Paço Municipal de Porto Alegre"
      );
    } else if (!isVisit) {
      categories.push(
        "Events at Salão Nobre do Paço Municipal de Porto Alegre"
      );
    } else {
      categories.push("Salão Nobre (Paço Municipal de Porto Alegre)");
    }
  } else if (isAudience) {
    if (atPaco) {
      categories.push("Audiences at Paço Municipal de Porto Alegre");
    } else if (isExecutiveTag) {
      categories.push("Audiences involving the Municipality of Porto Alegre");
    } else {
      categories.push("Audiences (meeting) in Brazil");
    }
  } else if (isCeremony) {
    if (atSalaoNobreMatch) {
      categories.push(
        "Ceremonies at Salão Nobre do Paço Municipal de Porto Alegre"
      );
    } else if (atPaco) {
      categories.push("Ceremonies at Paço Municipal de Porto Alegre");
    } else if (isExecutiveTag) {
      categories.push("Ceremonies involving the Municipality of Porto Alegre");
    } else {
      categories.push("Ceremonies in Porto Alegre");
    }
  } else if (isExecutiveTag || isSpecificMeetingTag) {
    if (isMeetingTag || isSpecificMeetingTag) {
      categories.push(
        atPaco
          ? "Meetings at Paço Municipal de Porto Alegre"
          : "Meetings involving the Municipality of Porto Alegre"
      );
    } else if (!isVisit) {
      categories.push(
        atPaco
          ? "Events at Paço Municipal de Porto Alegre"
          : "Events involving the Municipality of Porto Alegre"
      );
    }
  } else if (isMeetingTag) {
    if (isInternalMeeting) {
      categories.push(
        atPaco
          ? "Meetings at Paço Municipal de Porto Alegre"
          : "Meetings involving the Municipality of Porto Alegre"
      );
    } else {
      categories.push("Meetings in Porto Alegre");
    }
  } else if (atPaco) {
    categories.push("Paço Municipal de Porto Alegre");
  }

  if (
    tags.some(tag =>
      [
        "Atendimento",
        "Arrecadação Fiscal",
        "Agentes de Trânsito",
        "Coordenação de Operações Especiais (COE)",
        "Prestação de serviços",
      ].includes(tag)
    )
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
    orTags.some(tag =>
      ["Benchmarking do Governo do Rio Grande do Norte"].includes(tag)
    )
  ) {
    categories.push("Government of Rio Grande do Norte");
  }

  if (
    !tags.some(tag =>
      [
        "Exposição de Gravuras Portuguesas",
        "Exposição Maresia",
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
    !tags.some(tag => ["Plenário 20 de Setembro"].includes(tag)) &&
    tags.includes("Assembleia Legislativa")
  ) {
    categories.push("Legislative Assembly of Rio Grande do Sul");
  }

  if (
    !tags.some(tag =>
      ["Salão Alberto Pasqualini", "Salão Negrinho do Pastoreio"].includes(tag)
    ) &&
    tags.includes("Palácio Piratini")
  ) {
    categories.push("Palácio Piratini");
  }

  if (
    tags.some(tag =>
      [
        "Solenidade de transmissão do Cargo do Procurador-Geral do Estado",
      ].includes(tag)
    )
  ) {
    categories.push("Events at Palácio Piratini");
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
        "Decreto que Regulamenta a Lei Anticorrupção",
        "Cerimônia de Apresentação de PLs de Concessão e Adoção",
        "Contrato de concessão da Rodovia Integração Sul (RIS)",
        "Lançamento do Projeto de Lei para PPP de Iluminação Pública",
        "Lei",
        "Lei Orçamentária Anual (LOA)",
        "Lei de Diretrizes Orçamentárias (LDO)",
        "Licenciamento Ambiental",
        "Licenciamento Urbano",
        "Negociação de Precatórios",
        "Projeto de Lei",
        "Sanção da Lei das Antenas",
        "sanção de Projeto de Lei",
        "Sessão de julgamento da 1ª Câmara do TART",
        "Termos de Permissão uso bares da Orla do Guaíba",
      ].includes(tag)
    )
  ) {
    categories.push("Law of Porto Alegre");
  }

  if (tags.includes("Sessão de julgamento da 1ª Câmara do TART")) {
    categories.push(
      "Tribunal Administrativo de Recursos Tributários",
      "Legal procedure"
    );
  }

  if (
    orTags.some(tag =>
      ["Apresentação Calendário Pagamento IPTU 2019"].includes(tag)
    ) ||
    tags.some(tag => ["Apresentação", "Palestra"].includes(tag))
  ) {
    categories.push("Presentations in Porto Alegre");
  }

  if (tags.includes("Decreto que Regulamenta a Lei Anticorrupção")) {
    categories.push("Corruption in Brazil", "Anti-corruption measures");
  }

  if (
    !tags.some(tag => ["EPTC"].includes(tag)) &&
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

  const isCarrisBus =
    !tags.some(tag => ["Ônibus de Natal da Carris 2018"].includes(tag)) &&
    tags.some(tag =>
      [
        "Carris",
        'Ônibus da Carris adesivado para  campanha "Aluguel Solidário"',
        "Papai e Mamãe Noel da Carris",
      ].includes(tag)
    );

  const isGeneralBus = tags.some(tag =>
    [
      "BRT's",
      "micro-ônibus",
      "Ônibus",
      'Ônibus da Carris adesivado para  campanha "Aluguel Solidário"',
      "ônibus elétrico",
    ].includes(tag)
  );

  // Apply logic
  if (isCarrisBus && isGeneralBus) {
    categories.push("Carris buses (Porto Alegre)");
  } else {
    if (isCarrisBus) {
      categories.push("Companhia Carris Porto-Alegrense");
    }
    if (isGeneralBus) {
      categories.push("Buses in Porto Alegre");
    }
  }

  if (
    tags.some(tag =>
      [
        'Ônibus da Carris adesivado para  campanha "Aluguel Solidário"',
        "Propaganda Irregular",
      ].includes(tag)
    )
  ) {
    categories.push("Advertising in Brazil");
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
          "Galeria dos Secretários",
          "Secretária de Planejamento e Gestão",
          "Secretário Municipal da Fazenda (SMF)",
          "Secretário Municipal da Saúde (SMS)",
          "Secretário Municipal de Governança Local e Coordenação Política (SMGOV)",
          "Secretário Municipal da Educação (SMED)",
          "Secretário Municipal de Administração e Patrimônio (SMAP)",
          "Secretário-adjunto de Planejamento e Gestão",
        ].includes(tag) ||
        orTags.some(tag =>
          [
            "Posse Novos Secretários Municipais",
            "Secretário Municipal de Serviços Urbanos (SMSUrb)",
          ].includes(tag)
        )
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
    !tags.some(tag => ["IPTU"].includes(tag)) &&
    tags.some(tag =>
      ["Arrecadação Fiscal", "Tarifa", "Tributação", "Imposto"].includes(tag)
    )
  ) {
    categories.push("Taxation in Brazil");
  }

  if (
    !tags.some(tag =>
      ["Parcão", "Parque Marechal Mascarenhas de Moraes"].includes(tag)
    ) &&
    tags.includes("Praças e Parques")
  ) {
    categories.push("Parks in Porto Alegre");
  }

  if (
    tags.some(tag =>
      [
        "Parque Marechal Mascarenhas de Moraes",
        "Termo de Adoção do Parque Marechal Mascarenhas de Moraes",
      ].includes(tag)
    )
  ) {
    categories.push("Parque Marechal Mascarenhas de Moraes");
  }

  if (
    tags.some(tag =>
      [
        "Arroio Dilúvio",
        "Dragagem do Segundo Trecho do Arroio Dilúvio",
      ].includes(tag)
    )
  ) {
    categories.push("Arroio Dilúvio");
  }

  if (
    !tags.includes("Equipe de Vigilância de Antropozoonoses (Evantropo)") &&
    tags.includes("Unidade de Vigilância Ambiental (UVA)")
  ) {
    categories.push("Unidade de Vigilância Ambiental (Porto Alegre)");
  }

  if (!tags.includes("Kelly Matos") && tags.includes("jornalista")) {
    categories.push("Journalists from Porto Alegre");
  }

  if (
    !tags.some(tag =>
      [
        "Bloco cirúrgico do Posto do IAPI",
        "CGVS",
        "Conselho Municipal de Saúde",
        "Equipe de Vigilância de Antropozoonoses (Evantropo)",
        "Farmácia",
        "Mostra Porto-alegrense da Atenção Primária à Saúde",
        "Plano de Superação da Situação de Rua",
        "Programa Teste e Trate",
        "Saúde da População Negra",
        "Seminário do Comitê de Aleitamento Materno e Alimentação Complementar Saudável de Porto Alegre",
        "Sétimo encontro de Medicina Tradicional Kaingang",
      ].includes(tag)
    ) &&
    tags.some(tag =>
      [
        "Anúncio de Recursos para a Saúde de Porto Alegre",
        "Comitê Municipal de Transmissão Vertical do HIV e Sífilis Congênita",
        "Saúde",
        "SMS",
      ].includes(tag)
    )
  ) {
    categories.push("Secretaria Municipal de Saúde (Porto Alegre)");
  }

  if (
    !tags.some(tag =>
      ["Comissão de Saúde e Segurança no Trabalho"].includes(tag)
    ) &&
    tags.some(tag =>
      [
        "Smri",
        "Posse da Comissão de Saúde e Segurança do Trabalho da SMRI",
      ].includes(tag)
    )
  ) {
    categories.push(
      "Secretaria Municipal de Relações Institucionais (Porto Alegre)"
    );
  }

  if (
    !tags.some(tag => ["Ônibus de Natal da Carris 2018"].includes(tag)) &&
    tags.some(tag => ["Smim"].includes(tag))
  ) {
    categories.push(
      "Secretaria Municipal de Infraestrutura e Mobilidade (Porto Alegre)"
    );
  }

  if (
    !tags.some(tag => ["Carta de Serviços"].includes(tag)) &&
    tags.some(tag => ["Smtc"].includes(tag))
  ) {
    categories.push(
      "Secretaria Municipal de Transparência e Controladoria (Porto Alegre)"
    );
  }

  if (
    !tags.some(tag =>
      [
        "14ª edição do Campeonato Porto Alegre de Handebol 2018",
        "Campanha do Cabide Solidário",
        "Festa dos Idosos da Fasc",
        "Reunião Plenária do COMUI",
        "Comui",
      ].includes(tag)
    ) &&
    tags.some(tag => ["Smdse"].includes(tag))
  ) {
    categories.push(
      "Secretaria Municipal de Desenvolvimento Social e Esporte (Porto Alegre)"
    );
  }

  if (
    !tags.some(tag =>
      [
        "Conferência Municipal do Meio Ambiente",
        "Viveiro municipal de Porto Alegre",
      ].includes(tag)
    ) &&
    tags.some(tag => ["Smamus"].includes(tag))
  ) {
    categories.push(
      "Secretaria Municipal de Meio Ambiente, Urbanismo e Sustentabilidade (Porto Alegre)"
    );
  }

  if (
    !tags.some(tag =>
      ["Conferência Municipal do Meio Ambiente"].includes(tag)
    ) &&
    tags.some(tag => ["Meio Ambiente"].includes(tag))
  ) {
    categories.push("Environment of Porto Alegre");
  }

  if (
    !tags.some(tag =>
      [
        "Ação Rua Calábria",
        "Cerimônia de inaguração do Centro de Referência de Assistência Social (CRAS - ILHAS)",
        "Festa dos Idosos da Fasc",
        "Seminário da Rede de Acolhimento Municipal – Criança e Adolescente",
        "Show de Talentos da FASC",
        "XXVIII Colônia de Férias para Idosos",
      ].includes(tag)
    ) &&
    tags.some(tag => ["Doação de Automóvel para a FASC", "Fasc"].includes(tag))
  ) {
    categories.push("Fundação de Assistência Social e Cidadania");
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
        "Festa Jovem do Programa de Trabalho Educativo (PTE)",
        "Oficina ‘Rabiscando Ideias: Da cabeça para o papel’",
        "Primeira Infância Melhor (PIM)",
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
    !tags.some(tag => ["Curso", "Curso de Formação"].includes(tag)) &&
    tags.some(tag =>
      [
        "Capacitação",
        "Formação",
        "Treinamento",
        "Treinamento da Cruz Vermelha",
      ].includes(tag)
    )
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
    tags.some(
      tag =>
        ["Direitos Humanos"].includes(tag) ||
        orTags.includes(
          'Formação "O trabalho em Direitos Humanos na Educação Infantil"'
        )
    )
  ) {
    categories.push("Human rights in Brazil");
  }

  if (
    tags.some(
      tag =>
        ["Educação Infantil"].includes(tag) ||
        orTags.includes(
          'Formação "O trabalho em Direitos Humanos na Educação Infantil"'
        )
    )
  ) {
    categories.push("Educating children");
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
    !tags.some(tag =>
      [
        "Universidade do Vale do Rio dos Sinos (Porto Alegre campus)",
        "PUCRS",
      ].includes(tag)
    ) &&
    tags.includes("Educação Superior")
  ) {
    categories.push("Universities and colleges in Porto Alegre");
  }

  if (orTags.includes("Visita dos Alunos do IFRS da Restinga ao Poa.Hub")) {
    categories.push("Instituto Federal do Rio Grande do Sul - Campus Restinga");
  }

  if (
    tags.some(tag => ["Educação Técnica", "Curso de Mecânica"].includes(tag))
  ) {
    categories.push("Career and technical education");
  }

  if (
    !tags.some(tag =>
      [
        "Capacitação",
        "Curso de Formação",
        "Educação Superior",
        "Programa de Trabalho Educativo (PTE)",
        "Festa Jovem do Programa de Trabalho Educativo (PTE)",
      ].includes(tag)
    ) &&
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
        "Educação Permanente",
        "Educação Técnica",
        "Ensino",
        "Formatura",
        "Oficina",
        "Oficina de Dança",
        "Prêmio MPT na Escola",
        "Volta às aulas",
      ].includes(tag)
    )
  ) {
    categories.push("Education in Porto Alegre");
  }

  if (tags.includes("Educação Ambiental")) {
    categories.push("Nature of Porto Alegre");
  }

  if (
    tags.some(tag =>
      [
        "Árvore",
        "Plantio de Árvores",
        "Podas de Árvores",
        "Remoção de árvore",
      ].includes(tag)
    )
  ) {
    categories.push("Trees in Porto Alegre");
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
    !tags.includes("Brique da Redenção", "Recanto Europeu") &&
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
        "15ª Chegada do Papai Noel - Abertura oficial do Natal de Porto Alegre",
        "Clássicos na Pinacoteca",
        "Companhia Municipal de Dança",
        "Exposição Maresia",
        "Feira do Livro",
        "Grupo Experimental de Dança (GED)",
        "Inclusão Em Cena",
        "Mostra Acústicos e Elétricos",
        "Poa Em Cena",
        "Cultura Economia Criativa",
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
    )
  ) {
    categories.push("Inspections in Rio Grande do Sul");
  }

  if (
    tags.some(tag =>
      [
        "Aula aberta",
        "Oficina",
        "Oficinas Regionais sobre o Plano de Mobilidade Urbana (PMU)",
        "Workshop",
        "Workshop Gestão da Inovação na Administração Pública",
      ].includes(tag)
    )
  ) {
    categories.push("Workshops (meetings) in Brazil");
  }

  if (
    tags.some(tag =>
      [
        "Ação Integrada",
        "Agentes de Fiscalização",
        "Apreensão",
        "Autuação",
        "Blitz",
        "Fiscalização",
        "Flagrante",
        "Homologação",
        "Interdição",
        "Operação de Segurança",
        "Propaganda Irregular",
        "Segurança Publica",
        "Segurança Pública",
        "Videomonitoramento",
        "Vistoria",
        "Vistoria Obras Restaurante Panorâmico",
      ].includes(tag)
    )
  ) {
    categories.push("Law enforcement in Porto Alegre");
  }

  if (
    !tags.includes("Bloqueio químico") &&
    tags.some(tag =>
      [
        "Aedes aegypti",
        "Mosquito Aedes Aegypti",
        "Sala de monitoramento do Aedes da SES/RS",
      ].includes(tag)
    )
  ) {
    categories.push("Aedes aegypti");
  }

  if (!tags.includes("Bloqueio químico") && tags.includes("Combate a Dengue")) {
    categories.push("Dengue prevention in Brazil");
  }

  if (
    !tags.some(tag => ["Bloqueio químico", "Combate a Dengue"].includes(tag)) &&
    tags.includes("Dengue")
  ) {
    categories.push("Dengue in Brazil");
  }

  if (
    tags.includes("Leishmaniose") ||
    tags.includes("Doença Respiratória") ||
    tags.includes("síndrome de down")
  ) {
    categories.push("Diseases and disorders in Brazil");
  }

  if (
    !tags.some(tag => ["Hanseníase"].includes(tag)) &&
    tags.some(tag => ["Doenças Transmissíveis", "Sarampo"].includes(tag))
  ) {
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
    tags.some(tag =>
      [
        "Abandono de Veículos",
        "Carro",
        "Doação de Automóvel para a FASC",
        "Inspeção veicular",
        "Novas Viaturas para a Guarda Municipal",
        "veículo",
        "Veículo Roubado",
        "Veículos",
        "Viaturas",
      ].includes(tag)
    )
  ) {
    categories.push("Automobiles in Porto Alegre");
  }

  if (
    !tags.some(tag =>
      ["Dia Internacional da Pessoa com Deficiência"].includes(tag)
    ) &&
    ((!tags.includes("Comui") && tags.includes("Idosos")) ||
      tags.some(tag =>
        [
          "Cidadania",
          "evento social",
          "horta",
          "Inclusão Social",
          "LGBT",
          "Social",
          "Trabalho e Emprego",
          "Transexualidade",
        ].includes(tag)
      ))
  ) {
    categories.push("Society of Porto Alegre");
  }

  if (
    !tags.includes("Dia da Visibilidade Trans") &&
    tags.some(tag => ["Transexualidade"].includes(tag))
  ) {
    categories.push("Transgender in South America");
  }

  if (tags.some(tag => ["LGBT", "Transexualidade"].includes(tag))) {
    categories.push("LGBT in Porto Alegre");
  }

  if (
    !tags.includes("Dia Internacional da Pessoa com Deficiência") &&
    ((!tags.includes("Comui") && tags.includes("Idosos")) ||
      tags.some(tag =>
        [
          "Comissão da Pessoa com Deficiência",
          "Mulher",
          "Pessoa com Deficiência",
          "Servidor",
        ].includes(tag)
      ))
  ) {
    categories.push("People of Porto Alegre");
  }

  if (tags.some(tag => ["Criança"].includes(tag))) {
    categories.push("People of Porto Alegre", "Children of Rio Grande do Sul");
  }

  if (
    !tags.includes("Dia Internacional da Pessoa com Deficiência") &&
    (orTags.includes(
      "Fórum Social Mundial –População Idosa, Pessoas com Deficiência e Diversidades"
    ) ||
      tags.some(tag =>
        [
          "Comissão da Pessoa com Deficiência",
          "Pessoa com Deficiência",
        ].includes(tag)
      ))
  ) {
    categories.push("Disability in Brazil");
  }

  if (
    !tags.some(tag =>
      ["Inclusão Em Cena", "Poa Em Cena", "teatro de rua"].includes(tag)
    ) &&
    tags.includes("Teatro")
  ) {
    categories.push("Theatre of Porto Alegre");
  }

  if (
    !tags.some(tag =>
      [
        "Seminário do Comitê de Aleitamento Materno e Alimentação Complementar Saudável de Porto Alegre",
      ].includes(tag)
    ) &&
    tags.includes("Teatro Moacyr Scliar")
  ) {
    categories.push("Teatro Moacyr Scliar");
  }

  if (
    tags.some(tag =>
      [
        "Coleta Domiciliar (orgânicos e rejeito)",
        "Coleta Seletiva",
        "Mutirão de Limpeza",
        "Novo Layout Caminhões Coleta Seletiva",
        "remoção de lixo",
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

  if (
    !tags.includes("Seletiva no Contêiner") &&
    tags.includes("Recolhimento de Resíduos")
  ) {
    categories.push("Waste containers in Porto Alegre");
  }

  if (tags.some(tag => ["Reciclagem", "Compostagem"].includes(tag))) {
    categories.push("Recycling in Porto Alegre");
  }

  if (tags.includes("Drenagem")) {
    categories.push("Drainage in Brazil", "DMAP (Porto Alegre)");
  }

  if (
    tags.some(tag =>
      [
        "Piscinas Públicas",
        "Temporada das Piscinas Comunitárias de Porto Alegre",
      ].includes(tag)
    )
  ) {
    categories.push(
      "Public swimming pools in Brazil",
      "Swimming pools in Rio Grande do Sul"
    );
  }

  if (
    tags.some(tag =>
      ["Novo Espaço de Recreação Infantil da Praça Carlos Simão Arnt"].includes(
        tag
      )
    )
  ) {
    categories.push("Playgrounds in Porto Alegre", "Praça Carlos Simão Arnt");
  }

  if (tags.includes("Ciclovia")) {
    categories.push(
      "Cycle lanes in Brazil",
      "Cycling infrastructure in Porto Alegre"
    );
  }

  if (tags.some(tag => ["Posse", "Posse Deputados Estaduais"].includes(tag))) {
    categories.push("Oaths of office in Brazil");
  }

  if (
    tags.includes(
      "Posse da Delegada Andine Anflor como chefe da Polícia Civil do RS"
    )
  ) {
    categories.push(
      "Oaths of office in Brazil",
      "Polícia Civil do Estado do Rio Grande do Sul"
    );
  }

  if (
    !tags.includes("Quero- Quero") &&
    tags.some(tag =>
      [
        "Adoção de animais",
        "Cachorro",
        "Escorpião Amarelo",
        "Fauna",
        "Gato",
        "macacos-prego",
        "Proteção Animal",
        "serpentes",
      ].includes(tag)
    )
  ) {
    categories.push("Animals of Porto Alegre");
  }

  if (tags.some(tag => ["Ave", "Quero- Quero"].includes(tag))) {
    categories.push("Birds of Porto Alegre");
  }

  if (tags.some(tag => ["Morcego"].includes(tag))) {
    categories.push("Mammals of Porto Alegre", "Chiroptera of Brazil");
  }

  if (
    tags.some(tag => ["Guaíba", "Lago Guaíba", "Nivel do Guaíba"].includes(tag))
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
    tags.some(tag =>
      ["Estúdios da Rádio Guaíba", "Estúdio de Rádio"].includes(tag)
    )
  ) {
    categories.push("Radio studios in Brazil");
  }

  if (
    !tags.some(tag =>
      [
        "Seminário Boas Práticas na Gestão de Trânsito dos Municípios",
        "Seminário da Rede de Acolhimento Municipal – Criança e Adolescente",
      ].includes(tag)
    ) &&
    tags.includes("Auditório da FAMURS")
  ) {
    categories.push("Auditório Alceu Collares");
  }

  if (
    !tags.some(tag =>
      ["Fórum Desenvolvimento Sustentável no Sul"].includes(tag)
    ) &&
    tags.includes("Auditório do Ministério Público")
  ) {
    categories.push("Auditório do Ministério Público (Porto Alegre)");
  }

  if (
    !tags.includes("Festa Jovem do Programa de Trabalho Educativo (PTE)") &&
    tags.includes("Bar Opinião")
  ) {
    categories.push("Opinião (bar)");
  }

  if (
    !tags.some(tag =>
      [
        "Circuito Urbano EPTC",
        "Seminário Boas Práticas na Gestão de Trânsito dos Municípios",
        "UM DIA DE AGENTE DA EPTC",
        "Operação Viagem Segura",
      ].includes(tag)
    ) &&
    tags.includes("EPTC")
  ) {
    categories.push(
      "Empresa Pública de Transporte e Circulação de Porto Alegre"
    );
  }

  if (
    !tags.includes("Assembleia de Verão da Famurs 2025") &&
    tags.includes("Famurs")
  ) {
    categories.push(
      "Federação das Associações de Municípios do Rio Grande do Sul"
    );
  }

  if (!tags.includes("STU Pro-Tur 2025") && tags.includes("Skate")) {
    categories.push("Skateboarding in Porto Alegre");
  }

  if (!tags.includes("STU Pro-Tur 2025") && tags.includes("Orla Skate Park")) {
    categories.push("Orla Skate Park");
  }

  if (
    !tags.includes("Orla Skate Park") &&
    tags.some(tag =>
      [
        "Projeto do Trecho 3 da Orla do Guaíba",
        "Trecho 3 da Orla do Guaíba",
      ].includes(tag)
    )
  ) {
    categories.push("Trecho 3 da Orla do Guaíba");
  }

  if (
    !tags.some(tag =>
      ["Gre-nal de Todos", "Gre-Nal", "IberCup"].includes(tag)
    ) &&
    tags.some(tag => ["Futebol", "Futebol de Várzea"].includes(tag))
  ) {
    categories.push("Association football in Porto Alegre");
  }

  if (tags.includes("Futebol Feminino")) {
    categories.push(
      "Association football in Porto Alegre",
      "Women's association football in Brazil"
    );
  }

  if (
    !tags.some(tag => ["IberCup"].includes(tag)) &&
    tags.some(tag => ["Campeonato", "Concurso"].includes(tag))
  ) {
    categories.push("Competitions in Brazil");
  }

  if (
    !tags.some(tag =>
      [
        "Futebol de Várzea",
        "Jogos dos Estudantes Surdos",
        "Mexatchê",
        "STU Pro-Tur 2025",
      ].includes(tag)
    ) &&
    tags.some(tag =>
      [
        "Atletismo",
        "Basquete",
        "Desenvolvimento Economico e Esporte",
        "Esporte",
        "Futsal",
        "Ginástica",
        "Vôlei",
      ].includes(tag)
    )
  ) {
    categories.push("Sports in Porto Alegre");
  }

  if (
    tags.some(tag =>
      ["Computador", "Formulário", "Informatização"].includes(tag)
    )
  ) {
    categories.push(
      "Information technology in Brazil",
      "Digital transformation",
      "Computing in Brazil",
      "E-Government in Brazil",
      "Digital infrastructure"
    );
  }

  if (
    tags.some(tag =>
      [
        "Cidades Inteligentes",
        "Computador",
        "Formulário",
        "Informatização",
        "Internet",
        "Reunião Sobre Sistemas Informatizados",
        "Robótica",
        "Tecnologia",
      ].includes(tag)
    )
  ) {
    categories.push("Technology in Porto Alegre");
  }

  if (!tags.includes("Campanha do Agasalho") && tags.includes("Campanha")) {
    categories.push("Campaigns in Brazil");
  }

  if (
    tags.some(tag =>
      [
        "Força-Tarefa",
        "Mutirão",
        "Mutirão de cirurgias",
        "Mutirão de Limpeza",
      ].includes(tag)
    )
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

  if (tags.includes("Comitiva de Suzhou")) {
    categories.push("Relations of Brazil and China", "Suzhou");
  }

  if (tags.includes("Teledermatologia")) {
    categories.push("Dermatology");
  }

  if (
    !tags.includes("Educa+Saúde") &&
    tags.some(tag => ["Telemedicina, Teledermatologia"].includes(tag))
  ) {
    categories.push("Telemedicine");
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
    tags.some(tag =>
      ["multivacinação", "Vacinação", "vacina em animais", "Vacina"].includes(
        tag
      )
    )
  ) {
    categories.push("Vaccinations in Brazil");
  }

  if (tags.includes("raiva") && tags.includes("vacina em animais")) {
    categories.push("Rabies vaccination");
  } else if (tags.includes("raiva")) {
    categories.push("Rabies");
  } else if (tags.includes("vacina em animais")) {
    categories.push("Veterinary vaccinations");
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
    tags.some(tag =>
      [
        "Saúde do Idoso",
        "Idosos",
        "Relatório das pré-Conferências Municipais dos direitos da Pessoa Idosa",
      ].includes(tag)
    )
  ) {
    categories.push("Geriatrics in Rio Grande do Sul");
  }

  if (
    tags.includes("Acessibilidade") ||
    tags.includes("Pessoa com mobilidade reduzida")
  ) {
    categories.push("Accessibility in Brazil");
  }

  if (tags.includes("teste rápido sífilis, hiv e hepatite C")) {
    categories.push("HIV tests", "Medical tests");
  }

  if (
    tags.some(tag =>
      [
        "Aids",
        "Autoteste para HIV",
        "Comitê Municipal de Transmissão Vertical do HIV e Sífilis Congênita",
        "IST Aids e Hepatites Virais",
        "teste rápido sífilis, hiv e hepatite C",
      ].includes(tag)
    )
  ) {
    categories.push("AIDS in Brazil");
  }

  if (
    tags.some(tag =>
      [
        "Sífilis",
        "Comitê Municipal de Transmissão Vertical do HIV e Sífilis Congênita",
        "teste rápido sífilis, hiv e hepatite C",
      ].includes(tag)
    )
  ) {
    categories.push("Syphilis in Brazil");
  }

  if (
    tags.some(tag =>
      [
        "Hepatite",
        "Comitê Municipal de Transmissão Vertical do HIV e Sífilis Congênita",
        "IST Aids e Hepatites Virais",
        "teste rápido sífilis, hiv e hepatite C",
      ].includes(tag)
    )
  ) {
    categories.push("Hepatitis C");
  }

  if (tags.some(tag => ["cadeiras anfíbias"].includes(tag))) {
    categories.push("Beach wheelchairs", "People in wheelchairs in Brazil");
  }

  if (tags.some(tag => ["Campanha de Prevenção as DSTs"].includes(tag))) {
    categories.push(
      "HIV/AIDS education and prevention in Brazil",
      "Sexually transmitted disease prevention"
    );
  }

  if (
    tags.some(tag =>
      [
        "atividade física",
        "Autoteste para HIV",
        "Campanha de Prevenção as DSTs",
        "Comitê Municipal de Transmissão Vertical do HIV e Sífilis Congênita",
        "doação de sangue",
        "Doença Respiratória",
        "Doenças Transmissíveis",
        "Epidemiologia",
        "Hanseníase",
        "hipertenso",
        "Nutrição",
        "Outubro Rosa",
        "Saúde da Criança e Adolescente",
        "Saúde do Trabalhador",
        "Saúde LGBTQIAP+",
        "Saúde Mental",
        "Saúde Nutricional e Amamentação",
      ].includes(tag)
    )
  ) {
    categories.push("Health in Porto Alegre");
  }

  if (
    !tags.some(tag => ["Bloco cirúrgico do Posto do IAPI"].includes(tag)) &&
    tags.some(tag =>
      [
        "Ambulatório Odontológico",
        "Assistência Hospitalar",
        "Atenção Ambulatorial, Hospitalar e Urgências",
        "Atenção Básica",
        "Atenção Especializada à Saúde",
        "Atenção Primária à Saúde (APS)",
        "Atendimento em Casa",
        "Child health in Brazil",
        "Atendimento Médico",
        "Centro de Atenção Psicossocial Álcool e Drogas (CAPS AD)",
        "Clínica da Família",
        "doação e transplante de órgãos",
        "Equipamentos Hospitalares",
        "Exame médico",
        "Medicina",
        "Mutirão de cirurgias",
        "Saúde do Idoso",
        "Saúde Prisional",
        "Serviços Ortopédicos",
        "Visita domiciliar",
      ].includes(tag)
    )
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
    !tags.includes("Plano de Superação da Situação de Rua") &&
    tags.includes("Situação de rua")
  ) {
    categories.push("Homelessness in Porto Alegre");
  }

  if (
    orTags.includes(
      "Capacitação e Gerenciamento de Projetos Prioritários de Governo"
    ) ||
    tags.some(tag =>
      [
        "Administração",
        "Benchmarking do Governo do Rio Grande do Norte",
        "Consulta Pública",
        "Governança",
        "PPA",
        "Workshop Gestão da Inovação na Administração Pública",
      ].includes(tag)
    )
  ) {
    categories.push("Public administration in Porto Alegre");
  }

  categories.push(...getMappedCategories(metadata, tags));

  if (
    !(
      categories.includes("DMAP (Porto Alegre)") ||
      tags.some(tag =>
        [
          "Departamento de Iluminação Pública (DIP)",
          "DMAE",
          "DMLU",
          "Divisão de Conservação de Vias Urbanas (DCVU)",
        ].includes(tag)
      )
    ) &&
    tags.includes("SMSURB")
  ) {
    categories.push("Secretaria Municipal de Serviços Urbanos (Porto Alegre)");
  }

  if (
    !tags.includes("Galeria de Arte do Dmae") &&
    tags.some(tag => ["DMAE"].includes(tag))
  ) {
    categories.push("Departamento Municipal de Água e Esgotos (Porto Alegre)");
  }

  if (
    !tags.includes("20 Anos da Mostra dos Servidores do DMAE") &&
    tags.some(tag => ["Galeria de Arte do Dmae"].includes(tag))
  ) {
    categories.push("Galeria de Arte do DMAE");
  }

  if (
    !tags.some(tag =>
      [
        "Espaço Memórias",
        "Estação Integrada de Compostagem do DMLU",
        "Plantio Sustentável do DMLU",
        "Seletiva no Contêiner",
      ].includes(tag)
    ) &&
    tags.some(tag =>
      ["DMLU", "Novo Layout Caminhões Coleta Seletiva"].includes(tag)
    )
  ) {
    categories.push("Departamento Municipal de Limpeza Urbana (Porto Alegre)");
  }

  if (
    !tags.some(tag =>
      [
        "Operação Ferro-Velho",
        "Operação Jaguar",
        "Fórum de Justiça e Segurança do Centro",
      ].includes(tag)
    ) &&
    tags.includes("Smseg")
  ) {
    categories.push("Secretaria Municipal de Segurança (Porto Alegre)");
  }

  if (
    !tags.some(tag => ["Linha Turismo", "Caminhos Rurais"].includes(tag)) &&
    tags.some(tag =>
      ["evento turístico internacional", "Turismo"].includes(tag)
    )
  ) {
    categories.push("Tourism in Porto Alegre");
  }

  if (
    !tags.includes("Semana de Porto Alegre") &&
    tags.some(tag =>
      ["Aniversário", "Aniversário do Parque Moinhos de Vento"].includes(tag)
    )
  ) {
    categories.push("Anniversaries in Porto Alegre");
  }

  if (
    !tags.includes("Campanha do Brinquedo Solidário") &&
    tags.some(
      tag =>
        ["Brinquedo"].includes(tag) ||
        orTags.includes(
          "Entrega de kits de brinquedos doados pela Fundação Abrinq"
        )
    )
  ) {
    categories.push("Toys in Brazil");
  }

  if (tags.includes("Novo Layout Caminhões Coleta Seletiva")) {
    categories.push("Sorted waste collection trucks");
  }

  if (
    tags.some(tag =>
      ["Caminhão", "Novo Layout Caminhões Coleta Seletiva"].includes(tag)
    )
  ) {
    categories.push("Municipal vehicles of Porto Alegre");
  }

  if (!tags.includes("Feira do Livro") && tags.includes("Literatura")) {
    categories.push("Literature of Porto Alegre");
  }

  if (
    !tags.some(tag => ["ROMU", "Operação Jaguar"].includes(tag)) &&
    tags.some(tag =>
      ["Guarda Municipal", "Novas Viaturas para a Guarda Municipal"].includes(
        tag
      )
    )
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

  if (
    !tags.some(tag => ["Exposição Maresia"].includes(tag)) &&
    tags.some(tag => ["Obra de arte", "Arte Cemiterial"].includes(tag))
  ) {
    categories.push("Art of Porto Alegre");
  }

  if (
    !tags.some(tag =>
      ["1ª Feira da Agricultura Familiar - Agrifam"].includes(tag)
    ) &&
    tags.includes("Largo Glênio Peres")
  ) {
    categories.push("Largo Glênio Peres");
  }

  if (
    !tags.some(tag => ["Feira do Livro", "Material Escolar"].includes(tag)) &&
    tags.includes("Praça da Alfândega")
  ) {
    categories.push("Praça da Alfândega (Porto Alegre)");
  }

  if (
    !tags.some(tag =>
      [
        "Comissão de Economia, Finanças, Orçamento e do Mercosul (Cefor)",
        "Plenário Ana Terra - CMPA",
        "Plenário Otávio Rocha",
      ].includes(tag)
    ) &&
    tags.includes("Legislativo")
  ) {
    categories.push("Câmara Municipal de Porto Alegre");
  }

  if (!tags.includes("Maratona") && tags.includes("Corrida")) {
    categories.push("Running in Brazil");
  }

  if (!categories.includes("Running in Brazil") && tags.includes("Atletismo")) {
    categories.push("Athletics in Brazil");
  }

  if (tags.some(tag => ["Pavimentação"].includes(tag))) {
    categories.push("Asphalters");
  }

  if (tags.some(tag => ["Serviços de Roçada e Capina"].includes(tag))) {
    categories.push("Weed control", "String trimmers");
  }

  if (
    tags.some(tag =>
      [
        "Obra na Alça de Acesso da Cristóvão Colombo",
        "Pavimentação",
        "Retomada das Obras da Rua Ernesto Neugebauer",
        "rolo compressor",
      ].includes(tag)
    )
  ) {
    categories.push("Roadworks in Porto Alegre");
  }

  if (
    tags.some(tag =>
      [
        "Escritório de Reconstrução",
        "Manutenção",
        "Licitação para Manutenção Elevadores e Escadas Rolantes",
      ].includes(tag)
    )
  ) {
    if (
      tags.some(tag => ["EPTC", "Escritório de Reconstrução"].includes(tag))
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
    categories.push("Beach tennis", "Tennis courts in Brazil");
  }

  if (
    tags.some(tag =>
      [
        "academias ao ar livre",
        "Piscinas Públicas",
        "Quadras de Beach Tennis",
      ].includes(tag)
    )
  ) {
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

  if (
    tags.some(tag =>
      [
        "Contrato com a Caixa Econômica Federal (CEF)",
        "Convênio",
        "Missão Técnica com representantes do BNDES",
        "Parceria Público-Privada",
        "Representantes da CEF",
        "Reunião com o Diretor regional da Caixa Econômica Federal",
        "Termo de Cooperação Técnica",
      ].includes(tag)
    )
  ) {
    categories.push("Partnerships involving the Municipality of Porto Alegre");
  }

  if (
    !tags.some(tag => ["Orçamento Participativo 2018"].includes(tag)) &&
    tags.some(tag =>
      [
        "Conselho do OP",
        "Orçamento Participativo",
        "OP",
        "Reunião com o Conselho do Orçamento Participativo",
      ].includes(tag)
    )
  ) {
    categories.push(
      "Participatory budgeting in the Municipality of Porto Alegre"
    );
  }

  if (!tags.includes("ETA São João") && tags.includes("ETA")) {
    categories.push("Water treatment plants in Porto Alegre");
  }

  if (
    tags.some(tag =>
      ["Câncer", "Desafio do City Cancer Challenge"].includes(tag)
    )
  ) {
    categories.push("Cancer in Brazil");
  }

  if (!tags.includes("Outubro Rosa") && tags.includes("Câncer de Mama")) {
    categories.push("Breast cancer awareness in Brazil");
  }

  if (
    !tags.includes("Acampamento Farroupilha") &&
    tags.includes(
      "Ato de Lançamento do Edital do PMI do Parque Mauricio Sirotsky Sobrinho - Parque Harmonia",
      "Parque Maurício Sirotsky Sobrinho (Harmonia)"
    )
  ) {
    categories.push("Parque Maurício Sirotski Sobrinho");
  }

  if (
    !tags.includes("Orla Moacyr Scliar") &&
    (tags.includes("Orla do Guaíba") ||
      tags.includes("Termos de Permissão uso bares da Orla do Guaíba"))
  ) {
    categories.push("Parque da Orla do Guaíba");
  }

  if (
    tags.some(tag =>
      [
        "Doação",
        "Doação de Automóvel para a FASC",
        "Doação de Guarda-Sóis",
        "doações de cestas básicas",
        "Recital para Doação de um Piano para o Centro Cultural Multimeios Restinga",
      ].includes(tag)
    )
  ) {
    categories.push("Donations in Rio Grande do Sul");
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
    categories.push(
      "Water pipelines in Brazil",
      "Water supply infrastructure in Porto Alegre"
    );
  }

  if (
    !tags.some(tag =>
      ["Clássicos na Pinacoteca", "Ópera-rock Revolução Farroupilha"].includes(
        tag
      )
    ) &&
    tags.some(tag =>
      [
        "Música",
        "Cantata de Natal",
        "Concerto Musical",
        "Conserto Didático da Banda Municipal de Porto Alegre",
        "Recital para Doação de um Piano para o Centro Cultural Multimeios Restinga",
      ].includes(tag)
    )
  ) {
    categories.push("Music of Porto Alegre");
  }

  if (!tags.includes("Top de Marketing ADVB/RS") && tags.includes("Casa NTX")) {
    categories.push("Casa NTX");
  }

  if (
    !tags.some(tag =>
      [
        "Associação Comercial de Porto Alegre (ACPA)",
        "Auditório do Instituto Cultural",
        "Centro de Integração Empresa-Escola – CIEE",
        "Mercado Público",
        "Orla Moacyr Scliar",
        "Praça da Alfândega",
        "Quadrilátero Central",
        "Viva o Centro a Pé",
      ].includes(tag)
    ) &&
    tags.some(tag =>
      ["Centro Histórico", "Fórum de Justiça e Segurança do Centro"].includes(
        tag
      )
    )
  ) {
    categories.push("Centro Histórico (Porto Alegre)");
  }

  if (
    !tags.includes("Campus do Vale - UFRGS") &&
    tags.some(tag => ["Bairro Agronomia"].includes(tag))
  ) {
    categories.push("Agronomia (Porto Alegre)");
  }

  if (
    !tags.includes("Avenida Plínio Brasil Milano") &&
    tags.some(tag => ["Bairro Boa Vista"].includes(tag))
  ) {
    categories.push("Boa Vista (Porto Alegre)");
  }

  if (
    !tags.includes("34ª Feira de Natal do Bom Fim") &&
    tags.some(tag => ["Bairro Bom Fim"].includes(tag))
  ) {
    categories.push("Bom Fim");
  }

  if (
    !tags.includes("Bar Opinião") &&
    tags.some(tag => ["Bairro Cidade Baixa"].includes(tag))
  ) {
    categories.push("Cidade Baixa (Porto Alegre)");
  }

  if (
    !tags.includes("EMEF Deputado Marcírio Goulart Loureiro") &&
    tags.includes("Bairro Cel. Aparício Borges")
  ) {
    categories.push("Coronel Aparício Borges");
  }

  if (
    !tags.includes("25ª Corrida pela Vida") &&
    tags.includes("Bairro Cristal")
  ) {
    categories.push("Cristal (Porto Alegre)");
  }

  if (
    !tags.includes(
      "15ª Chegada do Papai Noel - Abertura oficial do Natal de Porto Alegre"
    ) &&
    tags.includes("Bairro Floresta")
  ) {
    categories.push("Floresta (Porto Alegre)");
  }

  if (
    !tags.includes("Parque Ararigbóia") &&
    tags.includes("Bairro Jardim Botânico")
  ) {
    categories.push("Jardim Botânico (Porto Alegre neighborhood)");
  }

  if (
    !tags.includes("ECEI Eni Medeiros") &&
    tags.includes("Bairro Jardim Carvalho")
  ) {
    categories.push("Jardim Carvalho");
  }

  if (
    !tags.includes(
      "Cerimônia de inaguração do Centro de Referência de Assistência Social (CRAS - ILHAS)"
    ) &&
    tags.includes("Ilha da Pintada")
  ) {
    categories.push("Ilha da Pintada");
  }

  if (
    !tags.some(tag =>
      [
        "Casa de Festas Brincalhão",
        "Largo David Coimbra",
        "Praça Garibaldi",
      ].includes(tag)
    ) &&
    tags.some(tag => ["Bairro Menino Deus", "Menino Deus"].includes(tag))
  ) {
    categories.push("Menino Deus (Porto Alegre)");
  }

  if (
    !tags.some(tag => ["Auditório do Telessaúde-RS"].includes(tag)) &&
    tags.some(tag => ["Bairro Moinhos de Vento"].includes(tag))
  ) {
    categories.push("Moinhos de Vento");
  }

  if (
    !tags.some(tag => ["Centro Esportivo da Vila Ingá (Cevi)"].includes(tag)) &&
    tags.includes("Bairro Passo das Pedras")
  ) {
    categories.push("Passo das Pedras");
  }

  if (
    !tags.some(tag =>
      ["Praça Mafalda Veríssimo", "Casa da Estrela"].includes(tag)
    ) &&
    tags.includes("Petrópolis")
  ) {
    categories.push("Petrópolis (Porto Alegre)");
  }

  if (
    !tags.some(tag => ["Estátua do Laçador"].includes(tag)) &&
    tags.includes("Bairro São João")
  ) {
    categories.push("São João (Porto Alegre)");
  }

  if (
    !tags.includes("Bará do Mercado Público") &&
    tags.includes("Mercado Público")
  ) {
    categories.push("Mercado Público de Porto Alegre");
  }

  if (
    !tags.includes("Laboratório do HMIPV") &&
    tags.includes("Laboratórios Municipais")
  ) {
    categories.push("Laboratórios Municipais (Porto Alegre)");
  }

  if (!tags.includes("Prêmio Açorianos") && tags.includes("Premiação")) {
    categories.push("Prizes");
  }

  if (
    !tags.some(tag => ["Casa da Estrela", "Confeitaria Rocco"].includes(tag)) &&
    tags.some(tag =>
      [
        "Adoção de Monumentos",
        "Patrimônio Histórico e Cultural do município",
        "Prédios Históricos",
      ].includes(tag)
    )
  ) {
    categories.push("Cultural heritage monuments in Porto Alegre");
  }

  if (
    !tags.some(tag => ["Orestes de Andrade", "Telefonia"].includes(tag)) &&
    tags.includes("Comunicação")
  ) {
    categories.push("Communication in Porto Alegre");
  }

  if (
    !tags.some(tag =>
      [
        "Centro Cultural Multimeios Restinga",
        "Emef Vereador Carlos Pessoa de Brum",
      ].includes(tag)
    ) &&
    tags.some(tag => ["Bairro Restinga", "Obras Restinga 2018"].includes(tag))
  ) {
    categories.push("Restinga (Porto Alegre)");
  }

  if (
    tags.some(tag =>
      [
        "Consulado",
        "Cônsul da Ucrânia no Brasil",
        "Cônsul do Japão em Porto Alegre",
      ].includes(tag)
    )
  ) {
    categories.push("Consulates in Porto Alegre");
  }

  if (
    tags.some(tag =>
      ["Comissão de Saúde e Segurança no Trabalho"].includes(tag)
    ) ||
    orTags.some(tag =>
      [
        "Posse da Comissão de Saúde e Segurança do Trabalho da SMRI",
        "Cerimônia de posse da Comissão de Saúde e Segurança do Trabalho da PGM",
      ].includes(tag)
    )
  ) {
    categories.push(
      "Comissões de Saúde e Segurança no Trabalho (Porto Alegre)"
    );
  }

  if (tags.includes("doações de cestas básicas")) {
    categories.push("Food relief in Brazil");
    categories.push("Humanitarian aid for the 2024 Rio Grande do Sul floods");
  }

  if (
    !tags.includes(
      "Cerimônia de inaguração do Centro de Referência de Assistência Social (CRAS - ILHAS)",
      "Conselho Municipal de Assistência Social (CMAS)"
    ) &&
    tags.some(tag =>
      ["Serviço Social", "Previdência", "Bolsa Família"].includes(tag)
    )
  ) {
    categories.push("Social services in Porto Alegre");
  }

  if (
    !tags.includes("Conselho Municipal de Assistência Social (CMAS)") &&
    tags.some(tag =>
      ["Secretaria Municipal de Assistência Social (SMAS)"].includes(tag)
    )
  ) {
    categories.push(
      "Secretaria Municipal de Assistência Social (Porto Alegre)"
    );
  }

  if (!tags.includes("Demhab") && tags.some(tag => ["SMHARF"].includes(tag))) {
    categories.push(
      "Secretaria Municipal de Habitação e Regularização Fundiária (Porto Alegre)"
    );
  }

  if (
    tags.some(tag =>
      [
        "Entrega de matrículas",
        "Entrega de Matrículas de Imóveis da Vila Canadá",
        "Entrega de Matrículas de Regularização para Moradores da Zona Sul",
        "Habitação",
        "Loteamento",
        "moradias temporárias",
      ].includes(tag)
    )
  ) {
    categories.push("Housing in Porto Alegre");
  }

  if (tags.some(tag => ["horta"].includes(tag))) {
    categories.push(
      "Community gardens in Brazil",
      "Agriculture in Porto Alegre"
    );
  }

  if (
    tags.some(tag => ["Resíduos Sólidos"].includes(tag)) ||
    orTags.some(tag =>
      ["Fiscalização do Transporte Resíduos da Construção Civil"].includes(tag)
    )
  ) {
    categories.push("Solid waste management");
  }

  if (
    tags.some(tag =>
      ["Terreno", "Loteamento", "Reintegração de Posse"].includes(tag)
    )
  ) {
    categories.push("Real estate in Brazil");
  }

  if (tags.includes("Retirada de Passarela")) {
    categories.push(
      "Overpass bridges in Brazil",
      "Footbridges in Brazil",
      "Demolitions in Brazil"
    );
  }

  if (
    tags.some(tag =>
      [
        "Entrega de Obras",
        "Obras",
        "Obras Restinga 2018",
        "Montagem de estruturas",
        "Pintura",
        "Retirada de Passarela",
        "Talude",
        "Vistoria Obras Restaurante Panorâmico",
      ].includes(tag)
    ) ||
    orTags.some(tag =>
      [
        "Fiscalização do Transporte Resíduos da Construção Civil",
        "Montagem das Estruturas da 64ª Feira do Livro de Porto Alegre",
      ].includes(tag)
    )
  ) {
    categories.push("Construction in Porto Alegre");
  }

  if (
    tags.some(tag =>
      [
        "Solenidade de transmissão do Cargo do Procurador-Geral do Estado",
        "Transmissão de Cargo",
      ].includes(tag)
    )
  ) {
    categories.push("Politics of Porto Alegre");
  }

  if (tags.some(tag => ["operários", "porteiros"].includes(tag))) {
    categories.push("Workers in Brazil");
  }

  if (tags.some(tag => ["exposição", "Exposição Fotográfica"].includes(tag))) {
    categories.push("Exhibitions in Porto Alegre");
  }

  categories.push(...getPplCategories(metadata, tags));

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

  if (tags.some(tag => ["Dia de Finados"].includes(tag))) {
    categories.push(
      "Day of the Dead in Brazil",
      `Day of the Dead ${getYear(metadata.humanReadableDate)}`
    );
  }

  if (tags.includes("Catamarã")) {
    categories.push("Catamarans", "Watercraft in Porto Alegre");
  }

  if (tags.includes("Decoração de Natal Sustentável")) {
    categories.push("Christmas decorations in Brazil", "Sustainable design");
  }

  if (tags.includes("Papai e Mamãe Noel da Carris")) {
    categories.push("Santa Claus in Brazil", "Mrs. Claus");
  }

  if (tags.some(tag => ["Espetáculo", "Show de Talentos"].includes(tag))) {
    categories.push("Shows in Porto Alegre");
  }

  if (
    tags.some(tag =>
      [
        "Entrega de Obras",
        "Licitação para Manutenção Elevadores e Escadas Rolantes",
        "Manutenção",
        "Montagem de estruturas",
        "Obras",
        "Obras Restinga 2018",
        "Pintura",
        "Retirada de Passarela",
        "Talude",
        "Vistoria Obras Restaurante Panorâmico",
      ].includes(tag)
    ) ||
    orTags.some(tag =>
      [
        "Fiscalização do Transporte Resíduos da Construção Civil",
        "Montagem das Estruturas da 64ª Feira do Livro de Porto Alegre",
      ].includes(tag)
    ) ||
    categories.some(tag => ["Roadworks in Porto Alegre"].includes(tag))
  ) {
    categories.push(`${getYear(metadata.humanReadableDate)} in construction`);
  }

  if (
    !tags.includes("Acampamento Farroupilha") &&
    tags.includes("Semana Farroupilha")
  ) {
    categories.push("Semana Farroupilha in Porto Alegre");
  }

  if (tags.some(tag => ["Mapa", "mapa de serviço de trânsito"].includes(tag))) {
    categories.push("Maps of Porto Alegre");
  }

  if (
    tags.some(tag =>
      ["Calor", "clima", "Estiagem", "Previsão do Tempo", "Tempo"].includes(tag)
    )
  ) {
    categories.push("Weather and climate of Porto Alegre");
  }

  if (tags.some(tag => ["Estiagem"].includes(tag))) {
    categories.push(
      "Drought in Brazil",
      `${getYear(metadata.humanReadableDate)} droughts`
    );
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
    categories.push("Conferences in Porto Alegre");
  }

  if (
    orTags.includes("Inauguração do Hospital Santa Ana") ||
    tags.some(tag =>
      [
        "Cerimônia de inaguração do Centro de Referência de Assistência Social (CRAS - ILHAS)",
        "Inauguração",
        "Inauguração Restaurante 360 POA GASTROBAR",
      ].includes(tag)
    )
  ) {
    categories.push("Inaugurations in Brazil");
  }

  if (
    tags.some(tag =>
      ["votação", "Votação do programa Família Acolhedora"].includes(tag)
    )
  ) {
    categories.push("Voting in Brazil");
  }

  if (
    tags.some(tag =>
      [
        "CRIPs",
        "Entrega dos Certificados aos Gestores dos CRIP's",
        "Seminário de Capacitação dos gestores dos CRIPS para o 156",
      ].includes(tag)
    )
  ) {
    categories.push("Centros de Relação Institucional Participativa");
  }

  if (
    !tags.includes("Clássicos na Pinacoteca") &&
    tags.includes("Pinacoteca Ruben Berta")
  ) {
    categories.push("Pinacoteca Ruben Berta");
  }

  if (
    !tags.includes("Festa de Nossa Senhora dos Navegantes") &&
    tags.includes("Procissão")
  ) {
    categories.push("Processions in Porto Alegre");
  }

  if (
    tags.some(tag =>
      [
        "Cantata de Natal",
        "Concerto Musical",
        "Clássicos na Pinacoteca",
        "Conserto Didático da Banda Municipal de Porto Alegre",
        //"Orquestra Sinfônica de Porto Alegre (OSPA)",
        "Orquestra Vila Lobos",
        "Recital para Doação de um Piano para o Centro Cultural Multimeios Restinga",
      ].includes(tag)
    )
  ) {
    categories.push(
      `${getYear(metadata.humanReadableDate)} concerts in Brazil`
    );
  }

  if (tags.some(tag => ["Cantata de Natal"].includes(tag))) {
    categories.push(
      "Christmas concerts in Brazil",
      `${getYear(metadata.humanReadableDate)} Christmas concerts `
    );
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

  if (tags.some(tag => ["Saint Patrick's Day"].includes(tag))) {
    categories.push(
      "Saint Patrick's Day in Brazil",
      `Saint Patrick's Day ${getYear(metadata.humanReadableDate)}`
    );
  }

  if (
    tags.some(tag =>
      ["Carnaval", "Carnaval de Rua", "Descida da Borges"].includes(tag)
    )
  ) {
    categories.push(
      `Carnival of Porto Alegre ${getYear(metadata.humanReadableDate)}`
    );
  }

  if (
    tags.some(tag =>
      [
        "Ação de Natal US Santa Anita",
        "Árvore de Natal",
        "Cantata de Natal",
        "Decoração de Natal Sustentável",
        "Festa de Natal",
        "Festa de Natal dos Acolhidos de Porto Alegre",
        "Natal",
        "Papai e Mamãe Noel da Carris",
        "Primeira edição do Natal Tri Demais",
        "Primeira Edição do Projeto Porto dos Natais",
      ].includes(tag)
    )
  ) {
    categories.push(
      `Christmas ${getYear(metadata.humanReadableDate)} in Porto Alegre`
    );
  }

  if (tags.some(tag => ["Ano Novo"].includes(tag))) {
    categories.push(
      `New Year ${getYear(metadata.humanReadableDate) + 1} in Brazil`
    );
  }

  if (
    !(
      tags.includes("Festival de Inverno") ||
      tags.includes("Semana de Porto Alegre") ||
      tags.includes("Acampamento Farroupilha") ||
      tags.includes("Trabalho") ||
      tags.includes("Poa Em Cena") ||
      tags.includes("Festival do Japão")
    ) &&
    tags.some(tag =>
      [
        "Côrte da Festa da Uva e da Ameixa de Porto Alegre",
        "Feira Temática",
        "Festa da Uva e da Ameixa",
        "Festa de Oxum",
        "Festejos",
        "Festival",
        "Semana Acadêmica da Escola de Engenharia",
        "Semana Farroupilha",
        "Semana do Japão",
      ].includes(tag)
    )
  ) {
    categories.push(
      `${getYear(metadata.humanReadableDate)} festivals in Porto Alegre`
    );
  }

  if (
    !categories.some(
      tag =>
        [
          `${getYear(metadata.humanReadableDate)} festivals in Porto Alegre`,
          `Carnival of Porto Alegre ${getYear(metadata.humanReadableDate)}`,
          `Christmas ${getYear(metadata.humanReadableDate)} in Porto Alegre`,
          `New Year ${getYear(metadata.humanReadableDate)} in Brazil`,
        ].includes(tag) ||
        tags.some(tag =>
          [
            "1ª Feira da Agricultura Familiar - Agrifam",
            "126 Anos da Guarda Municipal de Porto Alegre",
            "2° Fórum de Logística Sustentável",
            "2º Seminário de Comunicação da Prefeitura de Porto Alegre",
            "3ª Edição da Mostra Cultural Eixo Baltazar",
            "34ª edição da entrega da Láurea Engenheiro do ano da Sociedade de Engenharia do Rio Grande do Sul",
            "34ª Feira de Natal do Bom Fim",
            "5ª Edição da Cerimônia de Lavagem das Escadarias do Paço",
            "86 anos do Viaduto Otávio Rocha",
            "Acampamento Farroupilha",
            "Assembleia de Verão da Famurs 2025",
            "Expo Favela RS 2024",
            "Exposição de Gravuras Portuguesas",
            "Feira do Livro",
            "Festa de Nossa Senhora dos Navegantes",
            "Festival do Japão",
            "Fórum da Liberdade",
            "Fórum Desenvolvimento Sustentável no Sul",
            "IberCup",
            "Material Escolar",
            "Missão Xangai 2018",
            "Nós na Praça",
            "Pokémon GO",
            "Porto Verão Alegre",
            "Posse do Governador Eduardo Leite",
            "Prêmio Açorianos",
            "Salão Internacional de Desenho para Imprensa (Sidi)",
            "Semana de Porto Alegre",
            "Seminário da Rede de Acolhimento Municipal – Criança e Adolescente",
            "Seminário POA 2020",
            "Top de Marketing ADVB/RS",
            "Troféu “Atitudes que dão show”",
            "Viagem à Holanda",
            "XI Prêmio EPTC de Educação para o Trânsito",
            "XXVIII Colônia de Férias para Idosos",
          ].includes(tag)
        )
    ) &&
    (isExecutiveTag ||
      isMeetingTag ||
      isSpecificMeetingTag ||
      tags.some(tag =>
        [
          "A Flauta Mágica",
          "Ação Educativa",
          "Ação Rua",
          "Acolhimento aos Imigrantes Venezuelanos",
          "Ano Novo",
          "Anúncio de Recursos para a Saúde de Porto Alegre",
          "Apreensão",
          "Apresentação",
          "Ato de Entrega da Obras de Melhoria da Praça Argentina, e da Assinatura do Termo de Adoção da praça pela Santa Casa de Misericórdia de Porto Alegre",
          "Audiência",
          "Auditório da FAMURS",
          "Auditório da SMED",
          "Aula Inaugural",
          "Blitz",
          "Bloqueio químico",
          "Bolsa Atleta Municipal",
          "Bônus-Moradia",
          "cadastramento",
          "Cadastro Único",
          "Caminhada",
          "Campanha do Brinquedo Solidário",
          "Campanha do Cabide Solidário",
          "Capacitação",
          "Casa de Festas Brincalhão",
          "Casamento",
          "Ciclo de Debates Barbara Starfield",
          "Coletiva de Imprensa",
          "Comitiva de Suzhou",
          "Compra Assistida",
          "Conferência Municipal do Meio Ambiente",
          "Convite",
          "Curso",
          "Dança",
          "Debate",
          "Desafio do City Cancer Challenge",
          "Dia da Criança",
          "Dia da Visibilidade Trans",
          "Dia de Finados",
          "Dia de Passe Livre",
          "Dia do Desafio",
          "Dia do Livro",
          "Dia internacional da Mulher",
          "Dia Internacional da Pessoa com Deficiência",
          "Dia Mundial da Alimentação",
          "DIA SEM CARRO",
          "Diplomação",
          "Educação no Trânsito",
          "Encerramento",
          "Encerramento do Programa Compartilhar",
          "Entrega de matrículas",
          "Entrega de Matrículas de Imóveis da Vila Canadá",
          "Entrega de Matrículas de Regularização para Moradores da Zona Sul",
          "Entrega de Obras",
          "Entrega dos Certificados aos Gestores dos CRIP's",
          "entrevista",
          "Entrevista ao Programa Timeline",
          "Entrevista Coletiva",
          "Espetáculo O Rei da Vela",
          "evento social",
          "evento turístico internacional",
          "Eventos Climáticos",
          "exposição",
          "Exposição Fotográfica",
          "Fasc",
          "Feira de Oportunidades",
          "Felicity/GIZ",
          "Fiscalização",
          "Formação de Multiplicadores",
          "Formatura",
          "Fórum Social Mundial da População Idosa",
          "Frente Parlamentar de Segurança",
          "Galera Curtição",
          "Homenagem",
          "Início das Atividades do Regula+Brasil na Capital Gaúcha",
          "Janeiro Branco",
          "Jogos Escolares da Cidade de Porto Alegre (Jespoa)",
          "Lançamento",
          "Legislativo",
          "Manifestação",
          "Montagem de estruturas",
          "Negociação de Precatórios",
          "Noite dos Museus",
          "Oficina de Dança",
          "oficinas artísticas",
          "Olimpíada Brasileira de Matemática - OBMEP",
          "Operação de Segurança",
          "Operação Ferro-Velho",
          "Outubro Rosa",
          "Painel",
          "Palestra",
          "Parcerias",
          "Passeio",
          "Pavimentação",
          "Plantio",
          "Plataforma Google for Education",
          "Posse",
          "Prefeitura nos Bairros",
          "Prefeitura Nos Bairros",
          "Prêmio Inovação",
          "Procissão",
          "Passeio cliclistico De Bike para o Trabalho",
          "Programa de escuta da comunidade",
          "Programa Esfera Pública",
          "Programa Saúde na Escola (PSE)",
          "Programa Teste e Trate",
          "Programação Cultural",
          "Projeto Kilombinho de Verão",
          "Projeto Mais Comunidade",
          "Projeto Salseando e Bachateando",
          "Proposta orçamentária 2019",
          "Saint Patrick's Day",
          "Sanção da Lei das Antenas",
          "Sarau Café com Letras",
          "Semana Cidade Limpa",
          "Semana da Água",
          "Semana da Consciência Negra",
          "Seminário",
          "Sessão de julgamento da 1ª Câmara do TART",
          "Show de Talentos da FASC",
          "Simpósio",
          "Smidh",
          "Tapa Buracos",
          "Teatro do CIEE",
          "Testagem",
          "teste rápido sífilis, hiv e hepatite C",
          "Todos Somos Porto Alegre",
          "UM DIA DE AGENTE DA EPTC",
          "vacina em animais",
          "Vacinação",
          "Operação Viagem Segura",
          "Visita",
          "Vistoria",
          "Vistoria Obras Restaurante Panorâmico",
          "Viva o Centro a Pé",
          "Viva Porto Alegre a Pé",
          "Volta às aulas",
        ].includes(tag)
      ) ||
      orTags.includes("Entrega da Lei Orçamentária Anual (LOA) 2019") ||
      categories.some(tag =>
        [
          `${getYear(metadata.humanReadableDate)} concerts in Brazil`,
          "Anniversaries in Porto Alegre",
          "Auctions in Brazil",
          "Campaigns in Brazil",
          "Ceremonies in Porto Alegre",
          "Conferences in Porto Alegre",
          "Inaugurations in Brazil",
          "Opening ceremonies in Brazil",
          "Shows in Porto Alegre",
          "Task forces in Brazil",
          "Training courses by the Municipality of Porto Alegre",
          "Trainings by the Municipality of Porto Alegre",
          "Voting in Brazil",
          "Workshops (meetings) in Brazil",
        ].includes(tag)
      ))
  ) {
    categories.push(
      `${getYear(metadata.humanReadableDate)} events in Porto Alegre`
    );
  }

  if (
    !tags.some(tag => ["IberCup"].includes(tag)) &&
    tags.some(tag =>
      [
        "Campeonato",
        "Corrida",
        "Gre-Nal",
        "Gre-nal de Todos",
        "Jogos Abertos",
        "Maratona",
        "Mexatchê",
        "Vôlei",
      ].includes(tag)
    )
  ) {
    categories.push(
      `${getYear(metadata.humanReadableDate)} sports events in Porto Alegre`
    );
  }

  if (categories.length === 0) {
    categories.push("Porto Alegre");
  }

  if (
    !categories.some(
      tag =>
        [
          `${getYear(metadata.humanReadableDate)} events in Porto Alegre`,
          `${getYear(metadata.humanReadableDate)} festivals in Porto Alegre`,
          `${getYear(
            metadata.humanReadableDate
          )} sports events in Porto Alegre`,
          `Carnival of Porto Alegre ${getYear(metadata.humanReadableDate)}`,
          `Christmas ${getYear(metadata.humanReadableDate)} in Porto Alegre`,
          `New Year ${getYear(metadata.humanReadableDate)} in Brazil`,
          "2024 Porto Alegre floods",
        ].includes(tag) ||
        tags.some(tag =>
          [
            "1ª Feira da Agricultura Familiar - Agrifam",
            "1º Festival de Arte e Cultura Senegalesa",
            "11ª Conferência Municipal dos Direitos da Criança e do Adolescente",
            "126 Anos da Guarda Municipal de Porto Alegre",
            "14ª edição do Campeonato Porto Alegre de Handebol 2018",
            "14ª Gincana Ambiental",
            "15ª Chegada do Papai Noel - Abertura oficial do Natal de Porto Alegre",
            "17ª Edição dos Jogos Municipais da Terceira Idade",
            "2° Fórum de Logística Sustentável",
            "2º Seminário de Comunicação da Prefeitura de Porto Alegre",
            "20 Anos da Mostra dos Servidores do DMAE",
            "25 Anos do  FUMPROARTE",
            "25ª Corrida pela Vida",
            "30 Anos da Defesa Civil",
            "32º Festival de Arte da Cidade de Porto Alegre",
            "34ª edição da entrega da Láurea Engenheiro do ano da Sociedade de Engenharia do Rio Grande do Sul",
            "34ª Feira de Natal do Bom Fim",
            "34ª Festa do Pêssego Municipal",
            "48º Troféu Seival e 29ª Regata Farroupilha",
            "5ª Edição da Cerimônia de Lavagem das Escadarias do Paço",
            "8ª Edição do Curso de Multiplicadores de Educação para o Trânsito sobre o Pedestre Idoso",
            "8ª Semana Municipal da Água",
            "86 anos do Viaduto Otávio Rocha",
            "Acampamento Farroupilha",
            "Aniversário de 6 Anos do CEIC",
            "Assembleia de Verão da Famurs 2025",
            "Circuito Urbano EPTC",
            "Expo Favela RS 2024",
            "Exposição de Gravuras Portuguesas",
            "Exposição Maresia",
            "Feira do Livro",
            "Festa de Nossa Senhora dos Navegantes",
            "Festa Jovem do Programa de Trabalho Educativo (PTE)",
            "Festuris 2018",
            "Fórum da Liberdade",
            "Fórum Desenvolvimento Sustentável no Sul",
            "Heineken F1 Experience",
            "IberCup",
            "Inclusão Em Cena",
            "Jogos dos Estudantes Surdos",
            "Missão Xangai 2018",
            "Mostra Acústicos e Elétricos",
            "Nós na Praça",
            "Oficina ‘Rabiscando Ideias: Da cabeça para o papel’",
            "Ônibus de Natal da Carris 2018",
            "Ópera-rock Revolução Farroupilha",
            "Operação Jaguar",
            "Operação Natal da Retomada",
            "Mostra Porto-alegrense da Atenção Primária à Saúde",
            "Páscoa",
            "Poa Em Cena",
            "Pokémon GO",
            "Porto Verão Alegre",
            "Posse do Governador Eduardo Leite",
            "Prêmio Açorianos",
            "Semana de Porto Alegre",
            "Seminário Boas Práticas na Gestão de Trânsito dos Municípios",
            "Seminário Compliance",
            "Seminário da Rede de Acolhimento Municipal – Criança e Adolescente",
            "Seminário do Comitê de Aleitamento Materno e Alimentação Complementar Saudável de Porto Alegre",
            "Seminário Nacional de Trânsito - Mobilidade Sustentável, Educação, e Segurança",
            "Seminário pela Visibilidade Trans",
            "Seminário POA 2020",
            "Seminário Povos Indígenas e Saúde: Um Corpo São",
            "Sétimo encontro de Medicina Tradicional Kaingang",
            "STU Pro-Tur 2025",
            "Top de Marketing ADVB/RS",
            "Troféu “Atitudes que dão show”",
            "V Conferência Municipal dos Direitos da Pessoa Idosa",
            "Viagem à Holanda",
            "VIII Seminário de Saúde e Segurança no Trabalho",
            "XI Prêmio EPTC de Educação para o Trânsito",
            "XXVIII Colônia de Férias para Idosos",
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
