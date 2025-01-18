const keywordToCategoryMap = {
  Marchezan: "Nelson Marchezan Júnior",
  Hamm: "Afonso Hamm",
  Lula: "Luiz Inácio Lula da Silva",
  "Jorge Benjor": "Jorge Ben Jor",
  "Roberto Freire": "Roberto Freire (politician)",
  "Prefeito de Porto Alegre, Sebastião Melo": "Sebastião Melo",
  "Ricardo Gomes": "Ricardo Gomes (politician)",
  "Peter Wilson": "Peter Wilson (diplomat)",
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
  "Secretário municipal de Planejamento e Assuntos Estratégicos, Cezar Schirmer":
    "Cezar Schirmer",
  "Presidente da Câmara Municipal de Vereadores,  Idenir Cecchim":
    "Idenir Cecchim",
  "Secretário municipal do Meio Ambiente, Urbanismo e Sustentabilidade, Germano Bremm":
    "Germano Bremm",
  "Secretário municipal de Administração e Patrimônio, André Barbosa":
    "André Barbosa (politician)",
  "André Barbosa": "André Barbosa (politician)",
};

const sameNameKeywords = [
  "Adão Cândido",
  "Any Ortiz",
  "Cezar Schirmer",
  "Edson Leal Pujol",
  "Eduardo Leite",
  "Erno Harzheim",
  "Fabiano Dallazen",
  "Fernando Ritter",
  "Gabriel Souza",
  "Germano Bremm",
  "Gustavo Paim",
  "Hamilton Sossmeier",
  "Helder Barbalho",
  "Idenir Cecchim",
  "João Fischer",
  "José Ivo Sartori",
  "Letícia Batistela",
  "Liziane Bayer",
  "Maria Helena Sartori",
  "Mauro Pinheiro",
  "Michel Costa",
  "Nísia Trindade",
  "Osmar Terra",
  "Ramiro Rosário",
  "Ronaldo Nogueira",
  "Skank",
  "Valdir Bonatto",
];

const positionYearMap = {
  Prefeito: [
    { name: "Nelson Marchezan Júnior", years: { start: 2017, end: 2020 } },
    { name: "Sebastião Melo", years: { start: 2021, end: 2024 } },
  ],
  "Vice-Prefeito": [
    { name: "Gustavo Paim", years: { start: 2017, end: 2020 } },
    { name: "Ricardo Gomes", years: { start: 2021, end: 2024 } },
  ],
  "Vice-prefeito": [
    { name: "Gustavo Paim", years: { start: 2017, end: 2020 } },
    { name: "Ricardo Gomes", years: { start: 2021, end: 2024 } },
  ],
  Governador: [
    { name: "José Ivo Sartori", years: { start: 2015, end: 2018 } },
    { name: "Eduardo Leite", years: { start: 2019, end: 2024 } },
  ],
  "Desenvolvimento Econômico": [
    {
      name: "Secretaria Municipal de Desenvolvimento Econômico (Porto Alegre)",
      years: { start: 2017, end: 2020 },
    },
    {
      name: "Secretaria Municipal de Desenvolvimento Econômico e Turismo (Porto Alegre)",
      years: { start: 2021, end: 2025 },
    },
  ],
};

function getPersonByPositionAndYear(position, year) {
  const mapping = positionYearMap[position];
  if (!mapping) return null; // Return null if position doesn't exist

  const person = mapping.find(
    ({ years }) => year >= years.start && year <= years.end // Check if year falls within the range
  );

  return person ? person.name : null; // Return the person's name or null if not found
}

export const getPplCategories = metadata => {
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
  const positionKeywords = [
    "Prefeito",
    "Vice-prefeito",
    "Vice-Prefeito",
    "Governador",
    "Desenvolvimento Econômico",
  ];
  positionKeywords.forEach(position => {
    if (tags.includes(position)) {
      const year = new Date(metadata.publicationDate).getFullYear(); // Extract the year
      const personName = getPersonByPositionAndYear(position, year); // Get the person by position and year

      if (personName) {
        uniqueCategories.add(personName); // Add the person's name as a category
      }
    }
  });

  // Convert Set to an array and merge with existing categories
  categories.push(...Array.from(uniqueCategories));

  return categories;
};
