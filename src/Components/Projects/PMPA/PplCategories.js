import { getYear } from "../../../Utils/DateUtils";

const keywordToCategoryMap = {
  Marchezan: "Nelson Marchezan Júnior",
  Hamm: "Afonso Hamm",
  " Lula": "Luiz Inácio Lula da Silva",
  "Denise Ries Russo": "Denise Russo",
  "Jorge Benjor": "Jorge Ben Jor",
  "Roberto Freire": "Roberto Freire (politician)",
  "Prefeito de Porto Alegre, Sebastião Melo": "Sebastião Melo",
  "Ricardo Gomes": "Ricardo Gomes (politician)",
  "Peter Wilson": "Peter Wilson (diplomat)",
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
  "Secretária municipal de Habitação e Regularização Fundiária, Simone Somensi":
    "Simone Somensi",
  "Secretário municipal da Fazenda, Rodrigo Fantinel": "Rodrigo Fantinel",
  "Adriano Naves": "Adriano Naves de Brito",
  "Alexandre Augusto Aragon": "Alexandre Aragon",
  "Almir Junior": "Almir Júnior",
  "André Barbosa": "André Barbosa (politician)",
  "Andrii Melnyk": "Andrii Melnyk (diplomat)",
  "Aparecido Donizete": "Aparecido Donizete de Souza",
  "Diretor-geral do DMAE": "Bruno Vanuzzi",
  "Erno Harzhein": "Erno Harzheim",
  Ibercup: "IberCup 2019",
  "Jorge Gerdau Johannpeter": "Jorge Gerdau",
  "José Paulo Dornelles Cairoli": "José Paulo Cairoli",
  "Juliana Castro": "Juliana Castro (politician)",
  "Luciano Marcantonio": "Luciano Marcantônio",
  "Monica Leal": "Mônica Leal",
  "Nádia Gerhard": "Comandante Nádia",
  "Nádia Gerhrad": "Comandante Nádia",
  "Nádia Rodrigues Silveira Gerhard": "Comandante Nádia",
  "Marcele Malta": "Marcelly Malta",
  "Orestes de Andrade": "Orestes de Andrade Júnior",
  "Porto Verão Alegre": metadata =>
    `Porto Verão Alegre ${getYear(metadata.humanReadableDate) + 1}`,
  "Presidente da Câmara Municipal de Vereadores,  Idenir Cecchim":
    "Idenir Cecchim",
  "Secretário municipal do Meio Ambiente, Urbanismo e Sustentabilidade, Germano Bremm":
    "Germano Bremm",
  "Sessão Solene de outorga de Título de Cidadão de Porto Alegre ao Presidente Estadual da Assembleia de Deus Pastor Adalberto Santos Dutra":
    "Adalberto dos Santos Dutra",
  "Tarcísio Freitas": "Tarcísio de Freitas",
  "Vice-governador Gabriel Souza": "Gabriel Souza",
  "Walter Nagelstein": "Valter Nagelstein",
  "Wambert Gomes Di Lorenzo": "Wambert Di Lorenzo",
  "Záchia Paludo": "Maria de Fátima Záchia Paludo",
};

const sameNameKeywords = [
  "Abena Busia",
  "Adão Cândido",
  "Adão de Castro Júnior",
  "André Carús",
  "Adriano Bokerskis",
  "Adriano Naves de Brito",
  "Alexandre Aragon",
  "Ana Amélia Lemos",
  "Ana Pellini",
  "André Coronel",
  "Any Ortiz",
  "Augusto Buchweitz",
  "Betina Worm",
  "Bruno Araújo",
  "Bruno Vanuzzi",
  "Carlo Krieger",
  "Carlos Eduardo Thompson Flores Lenz",
  "Carlos Siegle",
  "Cassiá",
  "Cássio Trogildo",
  "Centro Cultural Multimeios Restinga",
  "Cezar Miola",
  "Cezar Schirmer",
  "Claudia Rocha",
  "Claudio Bier",
  "Comandante Nádia",
  "Daniel Rigon",
  "Débora Garcia",
  "Denise Russo",
  "Dilan Camargo",
  "Dori Goren",
  "Edson Leal Pujol",
  "Eduardo Cidade",
  "Eduardo Cunha da Costa",
  "Eduardo Estima",
  "Eduardo Leite",
  "Emmanuel Lenain",
  "Erno Harzheim",
  "Eunice Nequete",
  "Fabiano Dallazen",
  "Felipe Camozzato",
  "Felipe Hirsch",
  "Fernanda Barth",
  "Fernanda Paula Bridi",
  "Fernando Edison Domingues Soares",
  "Fernando Ritter",
  "Gabriel Souza",
  "Germano Bremm",
  "Gilberto Occhi",
  "Giovane Byl",
  "Gustavo Ferenci",
  "Gustavo Paim",
  "Hamilton Sossmeier",
  "Helder Barbalho",
  "Helen Machado",
  "Hertz Pires do Nascimento",
  "Iara Wortmann",
  "Idenir Cecchim",
  "Inacio Etges",
  "Isatir Antonio Bottin Filho",
  "Ivana Genro",
  "Jaime Spengler",
  "Jason Green",
  "João Fischer",
  "Jorge Brasil",
  "Jorge Gerdau",
  "José Ivo Sartori",
  "José Luiz Stédile",
  "José Paulo Cairoli",
  "Josep Piqué",
  "Júlia Evangelista Tavares",
  "Juliano Passini",
  "Juvir Costella",
  "Kelly Matos",
  "Leonardo Busatto",
  "Leonardo Pascoal",
  "Letícia Batistela",
  "Liliana Cardoso",
  "Liziane Bayer",
  "Luana Dellacorte",
  "Luciano Alabarse",
  "Luciano Marcantônio",
  "Luis Carlos Heinze",
  "Luiz Henrique Viana",
  "Luiza Barbosa",
  "Marcelly Malta",
  "Marcelo Medeiros",
  "Marcelo Soletti",
  "Marcino Fernandes",
  "Marcos Frota",
  "Maria Carpi",
  "Maria Helena Sartori",
  "Maurício Cunha",
  "Maurício Fernandes",
  "Mauro Pinheiro",
  "Michel Costa",
  "Moisés Barboza",
  "Mônica Leal",
  "Nadine Anflor",
  "Nísia Trindade",
  "Orly Portal",
  "Osmar Terra",
  "Pablo Stürmer",
  "Pai Paulinho do Xoroquê",
  "Paixão Côrtes",
  "Pedro Bisch Neto",
  "Pedro Pesce",
  "Professor Tovi",
  "Rafael Silva dos Santos",
  "Ramiro Rosário",
  "Riberto Barbanera",
  "Romildo Bolzan Júnior",
  "Ronaldo Nogueira",
  "Rosani Alves Pereira",
  "Skank",
  "Tarcísio de Freitas",
  "Topázio Neto",
  "Valdir Bonatto",
  "Valéria Leopoldino",
  "Valter Nagelstein",
  "Valtuir Pereira Nunes",
  "Vera Armando",
  "Vera Ponzio",
  "Wambert Di Lorenzo",
  "Yasuhiro Mitsu",
  "Yossi Shelley",
  "Zizi Possi",
];

// Normalize position keys in positionYearMap
const positionYearMap = {
  prefeito: [
    { name: "Nelson Marchezan Júnior", years: { start: 2017, end: 2020 } },
    { name: "Sebastião Melo", years: { start: 2021, end: 2025 } },
  ],
  "vice-prefeito": [
    { name: "Gustavo Paim", years: { start: 2017, end: 2020 } },
    { name: "Ricardo Gomes", years: { start: 2021, end: 2025 } },
  ],
  governador: [
    { name: "José Ivo Sartori", years: { start: 2015, end: 2018 } },
    { name: "Eduardo Leite", years: { start: 2019, end: 2025 } },
  ],
  "diretor-presidente da eptc": [
    { name: "Marcelo Soletti", years: { start: 2018, end: 2018 } },
  ],
  "presidente da camara de vereadores": [
    { name: "Comandante Nádia", years: { start: 2025, end: 2025 } },
  ],
  smde: [
    {
      name: "Secretaria Municipal de Desenvolvimento Econômico (Porto Alegre)",
      years: { start: 2017, end: 2020 },
    },
    {
      name: "Secretaria Municipal de Desenvolvimento Econômico e Turismo (Porto Alegre)",
      years: { start: 2021, end: 2024 },
    },
    {
      name: "Secretaria Municipal de Desenvolvimento Econômico, Turismo e Eventos (Porto Alegre)",
      years: { start: 2025, end: 2026 },
    },
  ],
  "esporte e lazer": [
    {
      name: "Secretaria Municipal de Esportes, Recreação e Lazer",
      years: { start: 2017, end: 2023 },
    },
    {
      name: "Secretaria Municipal de Esporte, Lazer e Juventude (Porto Alegre)",
      years: { start: 2024, end: 2025 },
    },
  ],
  smgov: [
    {
      name: "Secretaria Municipal de Governança Local e Coordenação Política (Porto Alegre)",
      years: { start: 2017, end: 2024 },
    },
    {
      name: "Secretaria Municipal de Governança Cidadã e Desenvolvimento Rural (Porto Alegre)",
      years: { start: 2025, end: 2025 },
    },
  ],
  "feira do livro": [
    {
      name: "63ª Feira do Livro de Porto Alegre (2017)",
      years: { start: 2017, end: 2017 },
    },
    {
      name: "64ª Feira do Livro de Porto Alegre (2018)",
      years: { start: 2018, end: 2018 },
    },
    {
      name: "65ª Feira do Livro de Porto Alegre (2019)",
      years: { start: 2019, end: 2019 },
    },
    {
      name: "66ª Feira do Livro de Porto Alegre (2020)",
      years: { start: 2020, end: 2020 },
    },
    {
      name: "67ª Feira do Livro de Porto Alegre (2021)",
      years: { start: 2021, end: 2021 },
    },
    {
      name: "68ª Feira do Livro de Porto Alegre (2022)",
      years: { start: 2022, end: 2022 },
    },
    {
      name: "69ª Feira do Livro de Porto Alegre (2023)",
      years: { start: 2023, end: 2023 },
    },
    {
      name: "70ª Feira do Livro de Porto Alegre (2024)",
      years: { start: 2024, end: 2024 },
    },
  ],
  "material escolar": [
    {
      name: "27ª Feira do Material Escolar (2017)",
      years: { start: 2017, end: 2017 },
    },
    {
      name: "28ª Feira do Material Escolar (2018)",
      years: { start: 2018, end: 2018 },
    },
    {
      name: "29ª Feira do Material Escolar (2019)",
      years: { start: 2019, end: 2019 },
    },
    {
      name: "30ª Feira do Material Escolar (2020)",
      years: { start: 2020, end: 2020 },
    },
    {
      name: "31ª Feira do Material Escolar (2021)",
      years: { start: 2021, end: 2021 },
    },
    {
      name: "32ª Feira do Material Escolar (2022)",
      years: { start: 2022, end: 2022 },
    },
  ],
  "salao internacional de desenho para imprensa (sidi)": [
    {
      name: "25º Salão Internacional de Desenho para Imprensa (2017)",
      years: { start: 2017, end: 2017 },
    },
    {
      name: "26º Salão Internacional de Desenho para Imprensa (2018)",
      years: { start: 2018, end: 2018 },
    },
    {
      name: "27º Salão Internacional de Desenho para Imprensa (2019)",
      years: { start: 2019, end: 2019 },
    },
    {
      name: "28º Salão Internacional de Desenho para Imprensa (2020)",
      years: { start: 2020, end: 2020 },
    },
    {
      name: "29º Salão Internacional de Desenho para Imprensa (2021)",
      years: { start: 2021, end: 2021 },
    },
    {
      name: "30º Salão Internacional de Desenho para Imprensa (2022)",
      years: { start: 2022, end: 2022 },
    },
  ],
  "poa em cena": [
    {
      name: "25º Porto Alegre em Cena (2018)",
      years: { start: 2018, end: 2018 },
    },
    {
      name: "26º Porto Alegre em Cena (2019)",
      years: { start: 2019, end: 2019 },
    },
  ],
  "inclusao em cena": [
    {
      name: "3º Inclusão em Cena (2018)",
      years: { start: 2018, end: 2018 },
    },
    {
      name: "4º Inclusão em Cena (2019)",
      years: { start: 2019, end: 2019 },
    },
  ],
};

// Helper function to normalize strings (remove accents and convert to lowercase)
const normalizeString = str =>
  str
    .normalize("NFD") // Normalize to decomposed form (e.g., "é" -> "e´")
    .replace(/[\u0300-\u036f]/g, "") // Remove diacritics (accents)
    .toLowerCase(); // Convert to lowercase

function getPersonByPositionAndYear(position, year) {
  const normalizedPosition = normalizeString(position);
  const mapping = positionYearMap[normalizedPosition];
  if (!mapping) return null; // Return null if position doesn't exist

  const person = mapping.find(
    ({ years }) => year >= years.start && year <= years.end // Check if year falls within the range
  );

  return person ? person.name : null; // Return the person's name or null if not found
}

export const getPplCategories = (metadata, tags) => {
  tags = tags.map(tag => normalizeString(tag)); // Normalize tags
  const description = metadata.description
    ? normalizeString(metadata.description)
    : "";
  const categories = [];
  const uniqueCategories = new Set();

  // Add categories from the map
  Object.entries(keywordToCategoryMap).forEach(([keyword, category]) => {
    const normalizedKeyword = normalizeString(keyword);
    if (
      tags.includes(normalizedKeyword) ||
      description.includes(normalizedKeyword)
    ) {
      const value =
        typeof category === "function" ? category(metadata) : category;
      uniqueCategories.add(value);
    }
  });

  sameNameKeywords.forEach(keyword => {
    const normalizedKeyword = normalizeString(keyword);

    const shouldExclude =
      keyword === "Eduardo Leite" &&
      tags.some(tag =>
        normalizeString(tag).includes("posse do governador eduardo leite")
      );

    if (
      !shouldExclude &&
      (tags.includes(normalizedKeyword) ||
        description.includes(normalizedKeyword))
    ) {
      uniqueCategories.add(keyword);
    }
  });

  // Add categories based on position and year
  tags.forEach(tag => {
    const personName = getPersonByPositionAndYear(
      tag,
      new Date(metadata.publicationDate).getFullYear()
    );
    if (personName) {
      uniqueCategories.add(personName); // Add the person's name as a category
    }
  });

  // Convert Set to an array and merge with existing categories
  categories.push(...Array.from(uniqueCategories));

  return categories;
};
