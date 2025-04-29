import { getYear } from "../../../Utils/DateUtils";

// Define a mapping of tags to categories
export const tagToCategoryMap = {
  Smds: "Secretaria Municipal de Desenvolvimento Social (Porto Alegre)",
  Smdete:
    "Secretaria Municipal de Desenvolvimento Econômico, Turismo e Eventos (Porto Alegre)",
  SMF: "Secretaria Municipal da Fazenda (Porto Alegre)",
  "Secretaria Municipal de Desenvolvimento Econômico e Turismo (SMDET)":
    "Secretaria Municipal de Desenvolvimento Econômico e Turismo (Porto Alegre)",
  SMAMS:
    "Secretaria Municipal do Meio Ambiente e Sustentabilidade (Porto Alegre)",
  "Secretário-adjunto de Planejamento e Gestão":
    "Secretaria Municipal de Planejamento e Gestão (Porto Alegre)",
  "Secretária de Planejamento e Gestão":
    "Secretaria Municipal de Planejamento e Gestão (Porto Alegre)",
  Smpg: "Secretaria Municipal de Planejamento e Gestão (Porto Alegre)",
  "Secretaria Municipal de Planejamento e Assuntos Estratégicos (SMPAE)":
    "Secretaria Municipal de Planejamento e Assuntos Estratégicos (Porto Alegre)",
  "Planejamento e Assuntos Estratégicos":
    "Secretaria Municipal de Planejamento e Assuntos Estratégicos (Porto Alegre)",
  Smidh:
    "Secretaria Municipal de Inclusão e Desenvolvimento Humano (Porto Alegre)",
  Smoi: "Secretaria Municipal de Obras e Infraestrutura (Porto Alegre)",
  Seda: "Secretaria Municipal dos Direitos Animais (Porto Alegre)",
  "Cultura Economia Criativa":
    "Secretaria Municipal de Cultura e Economia Criativa (Porto Alegre)",
  "Direitos dos Animais":
    "Secretaria Municipal dos Direitos Animais (Porto Alegre)",
  "Direitos Animais":
    "Secretaria Municipal dos Direitos Animais (Porto Alegre)",
  "Governança Local e Coordenação Política":
    "Secretaria Municipal de Governança Local e Coordenação Política (Porto Alegre)",
  Parcerias: "Secretaria Municipal de Parcerias (Porto Alegre)",
  "Secretaria Municipal de Parcerias (SMP)":
    "Secretaria Municipal de Parcerias (Porto Alegre)",
  Smpe: "Secretaria Municipal de Parcerias Estratégicas (Porto Alegre)",
  "Secretaria Municipal de Administração e Patrimônio (SMAP)":
    "Secretaria Municipal de Administração e Patrimônio (Porto Alegre)",
  "Administração e Patrimônio":
    "Secretaria Municipal de Administração e Patrimônio (Porto Alegre)",
  "Administração É Patrimônio":
    "Secretaria Municipal de Administração e Patrimônio (Porto Alegre)",
  "Secretário Municipal de Administração e Patrimônio (SMAP)":
    "Secretaria Municipal de Administração e Patrimônio (Porto Alegre)",
  Smic: "Secretaria Municipal da Produção, Indústria e Comércio (Porto Alegre)",
  Secretariado: "Municipal secretariats of Porto Alegre",
  "Secretaria Extraordinária do Trabalho e da Qualificação Profissional (SMTQ)":
    "Secretaria Extraordinária do Trabalho e da Qualificação Profissional (Porto Alegre)",
  "Trabalho e Qualificação":
    "Secretaria Extraordinária do Trabalho e da Qualificação Profissional (Porto Alegre)",

  Inovação: "Gabinete da Inovação (Porto Alegre)",
  "Comunicação Social": "Gabinete de Comunicação Social (Porto Alegre)",
  "Gabinete de Comunicação": "Gabinete de Comunicação Social (Porto Alegre)",
  "Causa Animal": "Gabinete da Causa Animal (Porto Alegre)",
  "Gabinete de Gestão Integrada Municipal (GGIM)":
    "Gabinete de Gestão Integrada Municipal (Porto Alegre)",

  Procempa: "Companhia de Processamento de Dados do Município de Porto Alegre",
  Demhab: "Departamento Municipal de Habitação (Porto Alegre)",
  CEIC: "Centro Integrado de Coordenação e Serviços da Cidade de Porto Alegre",
  "Defesa Civil": "Diretoria-Geral de Defesa Civil de Porto Alegre",

  "Equipe de Manejo Arbóreo (EMA)": "Equipe de Manejo Arbóreo (Porto Alegre)",
  "Equipe de Vigilância em Saúde Ambiental e Águas (EVSAA)":
    "Equipe de Vigilância em Saúde Ambiental e Águas (Porto Alegre)",
  "Equipe de Vigilância de Alimentos da SMS":
    "Equipe de Vigilância de Alimentos (Porto Alegre)",
  "Equipe de Vigilância Eventos Vitais (EVEV)":
    "Equipe de Vigilância Eventos Vitais (Porto Alegre)",
  "Vigilância de Alimentos": "Equipe de Vigilância de Alimentos (Porto Alegre)",
  "Equipe de Veículos de Tração Animal (VTA)":
    "Equipe de Veículos de Tração Animal (Porto Alegre)",
  "Equipe de Vigilância de Antropozoonoses (Evantropo)":
    "Equipe de Vigilância de Antropozoonoses (Porto Alegre)",

  DMAP: "DMAP (Porto Alegre)",
  "Departamento de Arrecação e Cobrança (DAC)":
    "Departamento de Arrecadação e Cobrança (Porto Alegre)",
  "Departamento de Iluminação Pública (DIP)":
    "Departamento de Iluminação Pública (Porto Alegre)",
  "Rede de abastecimento de água":
    "Departamento Municipal de Água e Esgotos (Porto Alegre)",
  "redes de água": "Departamento Municipal de Água e Esgotos (Porto Alegre)",
  Adutora: "Departamento Municipal de Água e Esgotos (Porto Alegre)",
  "Sine Municipal": "Sine Municipal (Porto Alegre)",
  "Reunião com a EPTC e Sindicatos":
    "Empresa Pública de Transporte e Circulação de Porto Alegre",
  "Sede da EPTC":
    "Sede da Empresa Pública de Transporte e Circulação de Porto Alegre",

  Previmpa:
    "Departamento Municipal de Previdência dos Servidores Públicos do Município de Porto Alegre",
  "Sala dos Embaixadores":
    "Sala dos Embaixadores (Paço Municipal de Porto Alegre)",
  Visita: "Official visits involving the Municipality of Porto Alegre",
  "Missão Internacional":
    "International missions of the Municipality of Porto Alegre",
  "Coletiva de Imprensa":
    "Press conferences by the Municipality of Porto Alegre",
  "Entrevista Coletiva":
    "Press conferences by the Municipality of Porto Alegre",
  "Rede Municipal de Ensino": "Rede Municipal de Ensino (Porto Alegre)",
  "Rede Pública de Ensino": "Rede Municipal de Ensino (Porto Alegre)",
  "Núcleo de Imunizações DVS (NI)": "Núcleo de Imunizações DVS (Porto Alegre)",
  "Diretoria de Vigilância em Saúde (DVS)":
    "Diretoria de Vigilância em Saúde de Porto Alegre",
  "Vigilância em Saúde": "Diretoria de Vigilância em Saúde de Porto Alegre",
  "Vigilância Em Saúde": "Diretoria de Vigilância em Saúde de Porto Alegre",
  "Vigilância Sanitária": "Diretoria de Vigilância em Saúde de Porto Alegre",
  "Diretoria de Esporte, Recreação e Lazer (Diresp)":
    "Diretoria de Esporte, Recreação e Lazer (Porto Alegre)",
  "Serviço de Atendimento Móvel de Urgência (SAMU)":
    "Serviço de Atendimento Móvel de Urgência",
  "Estação de Bombeamento de Águas Pluviais (Ebap)":
    "Estações de Bombeamento de Águas Pluviais",
  "Casa de Bombas": "Estações de Bombeamento de Águas Pluviais",
  "Estações de Bombeamento de Águas Pluviais (Ebaps)":
    "Estações de Bombeamento de Águas Pluviais",
  "(EBAB) Moinhos de Vento": "EBAB Moinhos de Vento",
  "Assistência Farmacêutica": "Assistência Farmacêutica (Porto Alegre)",
  "Centro Humanístico Vida": "Vida Centro Humanístico",
  "Coordenação Municipal de Urgências (CMU)":
    "Coordenação Municipal de Urgências (Porto Alegre)",
  "Plano de ação Porto Alegre Forte": "Porto Alegre Forte",
  "Lei Orçamentária Anual (LOA)": "Lei Orçamentária Anual",
  "Proposta orçamentária 2019": "Proposta orçamentária 2019 (Porto Alegre)",
  ROMU: "Ronda Ostensiva Municipal in Porto Alegre",
  Controladoria: "Controladoria-Geral do Município de Porto Alegre",
  Resiliência: "Plano de Resiliência (Porto Alegre)",
  "Diversidade sexual": "Coordenadoria de Diversidade Sexual",
  "Lei Seca": "Lei Seca (Porto Alegre)",
  "Núcleo Municipal de Segurança do Paciente":
    "Núcleo Municipal de Segurança do Paciente de Porto Alegre",
  "Segurança do Paciente":
    "Núcleo Municipal de Segurança do Paciente de Porto Alegre",
  "Oficina ‘Rabiscando Ideias: Da cabeça para o papel’":
    "Rabiscando Ideias - Da cabeça para o papel",
  "Espetáculo O Rei da Vela": "O Rei da Vela",
  "Reurbanização da Vila Tronco": "Vila Tronco Urban Renewal",
  "Contrato para Obras de Reassentamento da Vila Tronco":
    "Vila Tronco Urban Renewal",
  "Moradores do Alameda Partenon": "Alameda Partenon",
  "Núcleo de Ações Preventivas (NAP)": "Núcleo de Ações Preventivas",
  "Incluir + POA": "Incluir+POA",
  "Termo de Adoção de Verde Complementar": "Adoção de Verde Complementar",
  "Termo de Adoção do Parque Marechal Mascarenhas de Moraes":
    "Adoção de Verde Complementar",
  "Cerimônia de Apresentação de PLs de Concessão e Adoção":
    "Adoção de Verde Complementar",
  "Portal da Transparência": "Portal da Transparência EPTC",
  cachorródromo: "Cachorródromo",
  "Plano de Mobilidade de Porto Alegre (MobiliPOA)": "MobiliPOA",
  "Oficinas Regionais sobre o Plano de Mobilidade Urbana (PMU)": "MobiliPOA",
  "Festa Jovem do Programa de Trabalho Educativo (PTE)":
    "Festa Jovem do Programa de Trabalho Educativo",
  "Divisão de Conservação de Vias Urbanas (DCVU)":
    "Divisão de Conservação de Vias Urbanas",
  "Centro de Atenção Psicossocial Álcool e Drogas 3 – Pernambuco":
    "CAPS AD III - Pernambuco",
  "Centro de Atenção Psicossocial Álcool e Drogas 4 – Céu Aberto":
    "CAPS AD IV - Centro Céu Aberto (Farroupilha)",
  "Viveiro municipal de Porto Alegre": "Viveiro Municipal de Porto Alegre",
  "UM DIA DE AGENTE DA EPTC": "Um Dia de Agente da EPTC",
  "Centro Dia do Idoso (CDI) Nascer do Sol":
    "Centro Dia do Idoso Nascer do Sol",
  "Centro Dia do Idoso Zona Norte - Nascer do Sol":
    "Centro Dia do Idoso Nascer do Sol",
  "Cerimônia de inaguração do Centro de Referência de Assistência Social (CRAS - ILHAS)":
    "CRAS Ilhas",
  "Coordenação-Geral dos Direitos Animais (CGDA)":
    "Coordenação-Geral dos Direitos Animais",

  "Tapa Buracos": "Operação Tapa-Buracos",

  "Prefeitura Nos Bairros": "Prefeitura nos Bairros",
  "Projeto Sistema de Gestão de Parcerias com as Entidades Sociais":
    "Sistema de Gestão de Parcerias",
  "Projeto Mais Comunidade": "Mais Comunidade",
  "Primeira Edição do Projeto Porto dos Natais": "Porto dos Natais",
  "Projeto Kilombinho de Verão": "Kilombinho de Verão",
  "Comitê do Projeto Vida no Trânsito": "Projeto Vida no Trânsito",
  "projeto Cidade Cardioprotegida": "Cidade Cardio-Protegida",
  "Projeto Idoso no Trânsito": "Idoso no Trânsito",
  "Passeio cliclistico De Bike para o Trabalho": "De Bike para o Trabalho",
  "Projeto Salseando e Bachateando": "Salseando e Bachateando",

  "Campanha do Brinquedo Solidário":
    "Campanha do Brinquedo Solidário (Porto Alegre)",
  "Campanha Troco Amigo": "Troco Amigo",
  'Campanha " Aluguel Solidário - A Vida de Casa Nova"':
    "Aluguel Solidário - A Vida de Casa Nova",

  Pisa: "Programa Integrado Socioambiental",
  "Programa Família Acolhedora": "Família Acolhedora",
  "Votação do programa Família Acolhedora": "Família Acolhedora",
  "Programa Melhor em Casa": "Melhor em Casa",
  "Programa Saúde na Escola (PSE)": "Programa Saúde na Escola",
  'programa "Lean nas Emergências"': "Lean nas Emergências",
  "Programa Nacional de Gestão de Custos (PNGC)":
    "Programa Nacional de Gestão de Custos",
  "Programa Jovem Aprendiz": "Jovem Aprendiz",
  "Programa Teste e Trate": "Teste e Trate",
  "Programa de Trabalho Educativo (PTE)": "Programa de Trabalho Educativo",
  "Programa Poa + Social": "Poa+Social",
  "#eufaçopoa": "EuFaçoPOA",
  "Programa de Residência Técnico-Superior (PRTS)":
    "Programa de Residência Técnico-Superior",
  Socioambiental: "Programa Integrado Socioambiental",
  "Primeira Infância Melhor no Contexto Prisional (Pim Prisional)":
    "Primeira Infância Melhor no Contexto Prisional",
  "Programa Start.edu": "Start.edu",

  PGM: "Procuradoria-Geral do Município de Porto Alegre",
  Corregedoria: "Corregedoria-Geral do Município de Porto Alegre",

  "Plenário Ana Terra - CMPA": "Plenário Ana Terra",
  vereador: "City councillors of Porto Alegre",
  Vereadores: "City councillors of Porto Alegre",
  "Conselho Municipal de Assistência Social (CMAS)":
    "Conselho Municipal de Assistência Social (Porto Alegre)",
  "Conselho Municipal de Saúde": "Conselho Municipal de Saúde (Porto Alegre)",
  "Casa dos Conselhos": "Casa dos Conselhos (Porto Alegre)",
  COMTU: "Conselho Municipal de Transportes Urbanos (Porto Alegre)",
  CMDUA:
    "Conselho Municipal de Desenvolvimento Urbano Ambiental (Porto Alegre)",
  Comui: "Conselho Municipal do Idoso (Porto Alegre)",
  Comcet: "Conselho Municipal de Ciência e Tecnologia",
  "Reunião Plenária do COMUI": "Conselho Municipal do Idoso (Porto Alegre)",
  "Conselho Municipal dos Direitos das Pessoas com Deficiência ( Comdepa)":
    "Conselho Municipal dos Direitos das Pessoas com Deficiência (Porto Alegre)",
  "Comissão Permanente de Atuação em Emergências (Copae)":
    "Comissão Permanente de Atuação em Emergências",
  "Comissão de Saúde e Meio Ambiente da CMPA (Cosmam)":
    "Comissão de Saúde e Meio Ambiente da CMPA",
  "Comissão de Economia, Finanças, Orçamento e do Mercosul (Cefor)":
    "Comissão de Economia, Finanças, Orçamento e do Mercosul da CMPA",
  "Fórum dos Conselhos": "Fórum Municipal dos Conselhos da Cidade",

  Senac: "Serviço Nacional de Aprendizagem Comercial",
  "Federação de Entidades Empresariais do Rio Grande do Sul ( Federasul )":
    "Federação de Entidades Empresariais do Rio Grande do Sul",
  Fiergs: "Federação das Indústrias do Estado do Rio Grande do Sul",

  Granpal: "Associação dos Municípios da Região Metropolitana de Porto Alegre",
  "Associação dos Auditores Fiscais da Receita Municipal de Porto Alegre (Aiamu)":
    "Associação dos Auditores Fiscais da Receita Municipal de Porto Alegre",
  "Associação do Corpo Consular RS": "Associação do Corpo Consular do RS",
  "CDL Porto Alegre": "Câmara de Dirigentes Lojistas de Porto Alegre",
  "Reunião com a Associação Dos Procuradores Do Município De Porto Alegre (APMPA)":
    "Associação dos Procuradores do Município de Porto Alegre",
  ASCONTEC:
    "Associação dos Auditores e Técnicos de Controle Interno da Prefeitura de Porto Alegre",
  "Encontro com as Associação das Empresas dos Bairros Humaitá e Navegantes":
    "Associação das Empresas dos Bairros Humaitá e Navegantes",
  "ASSAC - Associação Amigos do Cristal": "Associação Amigos do Cristal",
  "Associação Brasileira de Shopping Centers (ABRASCE)":
    "Associação Brasileira de Shopping Centers",
  "Associação de Dirigentes Cristãos de Empresa de Porto Alegre (ADCE)":
    "Associação de Dirigentes Cristãos de Empresa de Porto Alegre",
  "Presidente eleita da Associação do Ministério Público do RS":
    "Associação do Ministério Público do RS",
  ABRH: "Associação Brasileira de Recursos Humanos",
  Apae: "Associação de Pais e Amigos dos Excepcionais",
  "Associação Comercial de Porto Alegre (ACPA)":
    "Associação Comercial de Porto Alegre",
  "Associação Internacional de Parques Científicos e Áreas de Inovação (IASP)":
    "International Association of Science Parks and Areas of Innovation",
  "Associação Riograndense de Propaganda (ARP)":
    "Associação Riograndense de Propaganda",
  "Associação Brasileira das Empresas de Sistemas Eletrônicos de Segurança (ABESE)":
    "Associação Brasileira das Empresas de Sistemas Eletrônicos de Segurança",

  "Restaurante Popular": "Restaurantes Populares",
  "Restaurante Baumbach": "Ratskeller Baumbach",
  "Restaurante Orla 360": "360 POA",
  "Vistoria Obras Restaurante Panorâmico": "360 POA",
  "Inauguração Restaurante 360 POA GASTROBAR": "360 POA",

  //Universidades
  "Universidade Federal de Ciências da Saúde de Porto Alegre (UFCSPA)":
    "Universidade Federal de Ciências da Saúde de Porto Alegre",
  "Universidade Federal do Rio Grande do Sul (UFRGS)":
    "Universidade Federal do Rio Grande do Sul",
  "Salão de Atos da UFRGS": "Salão de Atos (UFRGS)",
  "Centro Cultural da Universidade Federal do Rio Grande do Sul (UFRGS)":
    "Centro Cultural da Universidade Federal do Rio Grande do Sul",
  "Semana Acadêmica da Escola de Engenharia":
    "Semana Acadêmica da Escola de Engenharia da UFRGS",
  "Campus do Vale - UFRGS": "Campus do Vale",
  "Curso de arquitetura da UFRGS": "Faculdade de Arquitetura (UFRGS)",
  PUCRS: "Pontifícia Universidade Católica do Rio Grande do Sul",
  "Café Coworking do Parque Científico e Tecnológico da PUCRS (TecnoPuc)":
    "Café Coworking do TecnoPuc",
  "Reitoria da Pontifícia Universidade Católica do Rio Grande do Sul (PUCRS)":
    "Reitoria da Pontifícia Universidade Católica do Rio Grande do Sul",
  "Centro de Eventos da PUC": "Centro de Eventos da PUCRS",
  "Escola de Gestão Pública (EGP)": "Escola de Gestão Pública (Porto Alegre)",
  Uniritter: "Centro Universitário Ritter dos Reis",
  Estácio: "Faculdade Estácio",
  Ulbra: "Universidade Luterana do Brasil",
  "Escola Superior de Direito Municipal - ESDM":
    "Escola Superior de Direito Municipal",
  Unisinos: "Universidade do Vale do Rio dos Sinos (Porto Alegre campus)",

  //Escolas
  EMEI: "Municipal kindergarten in Porto Alegre",
  "(Emei JP) Cantinho Amigo": "EMEI JP Cantinho Amigo",
  "(Emei JP) Meu Amiguinho": "EMEI JP Meu Amiguinho",
  "(Emei) Florência Vurlod Socias": "EMEI Florência Vurlod Socias",
  "Emei Protásio Alves": "EMEI Protásio Alves",
  "Emei Santo Expedito": "EMEI Santo Expedito",
  "Emef Anísio Teixeira": "EMEF Anísio Teixeira",
  "Emef Ildo Meneguetti": "EMEF Ildo Meneguetti",
  "Emef Leocádia Felizardo Prestes": "EMEF Leocádia Felizardo Prestes",
  "Emef Pepita de Leão": "EMEF Pepita de Leão",
  "Emef Presidente Vargas": "EMEF Presidente Vargas",
  "Escola Mariano Beck": "EMEF José Mariano Beck",
  "Emeb Liberato Salzano Vieira da Cunha":
    "EMEB Liberato Salzano Vieira da Cunha",
  "Emeef Elyseu Paglioli": "EMEEF Elyseu Paglioli",
  "Emei Ilha da Pintada": "EMEI Ilha da Pintada",
  "Emef Vereador Carlos Pessoa de Brum": "EMEF Vereador Carlos Pessoa de Brum",
  "Escola Comunitária de Educação Infantil (Ecei) Madre Teresa":
    "ECEI Madre Teresa",
  "Escola Comunitária de Educação Infantil (Ecei) Tia Mariazinha":
    "ECEI Tia Mariazinha",
  "Escola Estadual de Ensino Fundamental Duque de Caxias":
    "EEEF Duque de Caxias",
  "Escola de Ensino Médio Raul Pilla": "EEEM Raul Pilla",
  "Escola Municipal de Ensino Fundamental José Loureiro da Silva":
    "EMEF José Loureiro da Silva",
  "Escola Municipal de Ensino Fundamental Nossa Senhora de Fátima":
    "EMEF Nossa Senhora de Fátima",
  "Instituto São Francisco": "Instituto de Educação São Francisco",
  "Colégio São Judas Tadeu": "Colégio São Judas Tadeu (Porto Alegre)",
  "E.E.E.F. Uruguai": "EEEF Uruguai",
  "Emef Nossa Senhora do Carmo": "EMEF Nossa Senhora do Carmo",
  "Biblioteca da Escola de Educação Infantil Paulo Freire":
    "Biblioteca da EMEI Paulo Freire",
  "Escola Municipal de Ensino Fundamental Deputado Victor Issler":
    "EMEF Deputado Victor Issler",
  "Emef Saint Hilaire": "EMEF Saint Hilaire",
  "Escola Estadual Piauí": "EEEF Piauí",
  "Reunião com Supervisores das EMEFS":
    "Municipal elementary schools in Porto Alegre",
  "Escolas Preparatórias de Dança (EPDs)": "Escolas Preparatórias de Dança",

  "Sindicato dos Municipários de Porto Alegre (Simpa)":
    "Sindicato dos Municipários de Porto Alegre",
  Sindha: "Sindicato de Hospedagem e Alimentação de Porto Alegre e Região",
  "Associação dos Transportadores de Caçamba Estacionárias (ATCE)":
    "Associação dos Transportadores de Caçambas Estacionárias",
  "Sindicato Médico do Rio Grande do Sul (Simers)":
    "Sindicato Médico do Rio Grande do Sul",

  "Banda Municipal": "Banda Municipal de Porto Alegre",
  "Orquestra Vila Lobos": "Orquestra Villa-Lobos",
  "Orquestra Sinfônica de Porto Alegre (OSPA)":
    "Orquestra Sinfônica de Porto Alegre",

  "Igreja Nossa Senhora das Dores":
    "Igreja Nossa Senhora das Dores (Porto Alegre)",
  "Santuário de Nossa Senhora do Rosário":
    "Igreja Nossa Senhora do Rosário (Porto Alegre)",

  "Ministério da Saúde": "Ministry of Health of Brazil",
  "Força Nacional do SUS": "Força Nacional do Sistema Único de Saúde",
  HMIPV: "Hospital Materno-Infantil Presidente Vargas",
  "Laboratório do HMIPV":
    "Laboratório Municipal do Hospital Materno Infantil Presidente Vargas",
  "Hospital de Pronto Socorro (HPS)":
    "Hospital de Pronto Socorro (Porto Alegre)",
  "Unidade de Coleta e Transfusão (UCT) do HPS":
    "Hospital de Pronto Socorro (Porto Alegre)",
  "Hospital Materno-Infantil Presidente Vargas (HMIPV)":
    "Hospital Materno-Infantil Presidente Vargas",
  "Unidade de Saúde Modelo": "Centro de Saúde Modelo",
  "Unidade de Saúde Santa Marta": "Centro de Saúde Santa Marta",
  "Projeto Unidade de Saúde Morro dos Sargentos":
    "Unidade de Saúde Morro dos Sargentos",
  "Centro de Atenção Psicossocial Álcool e Drogas (CAPS AD)":
    "Centros de Atenção Psicossocial Álcool e Drogas",
  "Unidade de Saúde Orfanotrófrio": "Unidade de Saúde Orfanotrófio",
  "Ação de Natal US Santa Anita": "Unidade de Saúde Santa Anita",
  "Unidade de Saúde Animal Victória (Usav)": "Unidade de Saúde Animal Victória",
  "Hospital de Clínicas de Porto Alegre (HCPA)":
    "Hospital de Clínicas de Porto Alegre",
  "Grupo Hospitalar Conceição (GHC)": "Grupo Hospitalar Conceição",
  "Hospital da Restinga Extremo Sul (HRES)": "Hospital Restinga e Extremo-Sul",
  "Pronto Atendimento de Traumatologia e Ortopedia no Hospital Restinga Extremo Sul":
    "Emergency Trauma and Orthopedic Care at Hospital Restinga e Extremo-Sul",
  "Hospital São Lucas PUCRS": "Hospital São Lucas da PUCRS",

  "Tribunal de Contas do Estado do Rio Grande do Sul (TCE-RS)":
    "Tribunal de Contas do Estado do Rio Grande do Sul",
  "Sede do Tribunal de Contas do Estado (TCE)":
    "Tribunal de Contas do Estado do Rio Grande do Sul",
  "Presidente do Tribunal de Contas do Estado (TCE)":
    "Tribunal de Contas do Estado do Rio Grande do Sul",
  "TJ-RS": "Tribunal de Justiça do Estado do Rio Grande do Sul",
  "Tribunal Regional Eleitoral (TRE)": "Tribunal Regional Eleitoral RS",
  TART: "Tribunal Administrativo de Recursos Tributários",

  "Teatro da Santa Casa": "Teatro da Santa Casa (Porto Alegre)",
  "Teatro do Sesc": "Teatro do Sesc (Porto Alegre)",
  "Teatro do Sesi": "Teatro do Sesi (Porto Alegre)",
  "Auditório Dante Barone da Assembleia Legislativa": "Teatro Dante Barone",
  "Teatro Dante Barone da Assembleia Legislativa": "Teatro Dante Barone",

  "Auditório da SMPG":
    "Auditório da Secretaria Municipal de Planejamento de Gestão",
  "Auditório da SMED": "Auditório da Secretaria Municipal de Educação",
  "Auditório da Puc": "Auditório Prédio 11",
  "Auditório do Departamento Municipal de Habitação (Demhab)":
    "Auditório do Departamento Municipal de Habitação",
  "Auditório da Caixa Econômica Federal":
    "Auditório da Caixa Econômica Federal (Porto Alegre)",
  "Auditório do Tribunal Regional Eleitoral (TRE)":
    "Auditório do Tribunal Regional Eleitoral",
  "Auditório do Conselho Regional de Medicina do Rio Grande do Sul (Cremers)":
    "Auditório do Conselho Regional de Medicina do Rio Grande do Sul",

  "Catedral Metropolitana de Porto Alegre (Matriz)":
    "Catedral Metropolitana de Porto Alegre",
  "Palácio do Comércio": "Palácio do Comércio (Porto Alegre)",
  "Estação Rodoviária de Porto Alegre": "Rodoviária (Trensurb)",
  "Grêmio Sargento Expedicionário Geraldo Santana": "Grêmio Geraldo Santana",
  "Estádio Beira-rio": "Estádio Beira-Rio",
  "Complexo Cultural Porto Seco": "Complexo Cultural do Porto Seco",
  "comportas do Muro da Mauá": "Mauá Wall floodgates",
  "Muro da Mauá": "Mauá Wall",
  "Aeroporto Internacional Salgado Filho":
    "Salgado Filho International Airport",
  "Aeroporto Salgado Filho": "Salgado Filho International Airport",
  "Centro Popular de Compras (CPC)": "Centro Popular de Compras (Porto Alegre)",
  "Biblioteca Pública Josué Guimarães":
    "Biblioteca Pública Municipal Josué Guimarães",
  "CEEE Equatorial": "CEEE Grupo Equatorial",
  Brechó: "Brechocão",
  "Arquivo Histórico Moysés Vellinho":
    "Arquivo Histórico de Porto Alegre Moysés Vellinho",
  PoaHub: "Poa.Hub",
  "Chalé da Praça XV de Novembro": "Chalé da Praça XV",
  "Theatro São Pedro": "Theatro São Pedro (Porto Alegre)",
  "Sala Aldo Locatelli": "Pinacoteca Aldo Locatelli",
  "Cemitério da Santa Casa de Misericórdia":
    "Cemitério da Santa Casa de Misericórdia (Porto Alegre)",
  "Centro Social Marista - CESMAR": "Centro Social Marista",
  "Sede do Detran -RS": "DetranRS",
  "Departamento Estadual de Trânsito (Detran)": "DetranRS",
  "Centro da Comunidade Parque Madepinho (Cecopam)":
    "Centro da Comunidade Parque Madepinho",
  "Temporada das Piscinas Comunitárias de Porto Alegre":
    "Centro da Comunidade Parque Madepinho",
  "Conserto Didático da Banda Municipal de Porto Alegre":
    "Banda Municipal de Porto Alegre",
  "Observatório de Porto Alegre": "ObservaPOA",
  "Hotel Deville": "Hotel Deville Prime Porto Alegre",
  "Instituto Cultural Floresta (ICF)": "Instituto Cultural Floresta",
  "Museu de Arte do Paço (MAPA)": "Museu de Arte do Paço",
  "Patrulha da Mulher (PATAM)": "Patrulha da Mulher",
  "Festa de Oxum": "Festa de Oxum (Porto Alegre)",
  "Quartel do Comando-Geral do Corpo de Bombeiros Militar (CBMRS)":
    "Quartel do Comando-Geral do Corpo de Bombeiros Militar do Rio Grande do Sul",
  "Sítio do Mato": "Sítio do Mato (Porto Alegre)",
  "Concessionária GAM3 Parks": "GAM3 Parks",
  "LIDE RIO GRANDE DO SUL": "LIDE Rio Grande do Sul",
  "Cerimônia de Passagem de Comando na Capitania Fluvial de Porto Alegre":
    "Capitania Fluvial de Porto Alegre",
  "Casa Menino Jesus de Praga": "Casa de Saúde Menino Jesus de Praga",
  "Salão Nobre da Associação Comercial de Porto Alegre":
    "Salão Nobre (Palácio do Comércio, Porto Alegre)",
  "Crialab do Tecnopuc": "Tecnopuc Crialab",
  "Representantes do Movimento de Mulheres da Ocupação Mirabal":
    "Ocupação Mulheres Mirabal",

  "Fonte Talavera": "Fonte Talavera de La Reina",
  "Chafariz Imperial": "Fonte Francesa",

  BarraShoppingSul: "Barra Shopping Sul",
  "Centro de Eventos do Barrashoppingsul":
    "Centro de Eventos do Barra Shopping Sul",
  "Centro de Eventos da Amrigs": "Centro de Eventos AMRIGS",
  "Centro de Eventos": "Centro de Eventos de Porto Alegre",

  "Estúdios da Rádio Guaíba": "Rádio Guaíba",
  "Programa Esfera Pública": "Esfera Pública",
  "Programa Jornal do Almoço": "Jornal do Almoço",
  "Jornal Correio do Povo": "Correio do Povo",
  "Programa Gaúcha Atualidade": "Gaúcha Atualidade",

  "Monumento ao Expedicionário": "Monumento ao Expedicionário (Porto Alegre)",
  "monumento em homenagem aos voluntários da enchente": "Heróis Voluntários",
  "Monumento à Elis Regina": "Monumento a Elis Regina",

  "Bloco da Sustentabilidade (DMLU)": "Bloco da Sustentabilidade",
  "Grêmio Recreativo Escola de Samba Filhos de Maria": "GRES Filhos de Maria",
  "Sociedade Beneficente Cultural e Filantrópica Protegidos da Princesa Isabel":
    "SBCF Protegidos da Princesa Isabel",
  "Sociedade Beneficente Cultural Realeza": "SBC Realeza",
  "Sociedade Beneficente Cultural e Recreativa Fidalgos e Aristocratas":
    "SBCR Fidalgos e Aristocratas",
  "Sociedade Cultural e Beneficiente Acadêmicos de Gravataí":
    "SCB Acadêmicos de Gravataí",
  "S.B.C.R. Associação Comunitária Copacabana":
    "SBCR Associação Comunitária Copacabana",
  "Sociedade Beneficente Recreativa Imperadores do Samba":
    "SBR Imperadores do Samba",
  "Escola de Samba Imperadores do Samba": "SBR Imperadores do Samba",
  "Associação Recreativa Cultural União da Vila do Iapi":
    "União da Vila do Iapi",
  "A.R.C. União da Vila do IAPI": "União da Vila do Iapi",
  "Sociedade Recreativa Beneficente Tribo Carnavalesca Os Comanches":
    "SRBTC Os Comanches",
  "Academia de Samba Praiana": "SRBC Academia de Samba Praiana",
  "Sociedade Beneficente Recreativa e Cultural Academia de Samba Unidos da Vila Mapa":
    "Unidos da Vila Mapa",
  "Escola de Samba Império da Zona Norte": "Império da Zona Norte",
  "Sociedade Recreativa Beneficente Carnavalesca Academia de Samba União da Tinga":
    "União da Tinga",
  "Sociedade Recreativa Cultural e Carnavalesca Academia de Samba Unidos de Vila Isabel":
    "Unidos de Vila Isabel",
  "Sociedade Recreativa e Beneficente Estado Maior da Restinga":
    "Estado Maior da Restinga",
  "Escola de Samba Estado Maior da Restinga": "Estado Maior da Restinga",
  "Sociedade Beneficente Cultural Bambas da Orgia": "Bambas da Orgia",
  "Sociedade Beneficente Cultural e Recreativa Imperatriz Dona Leopoldina":
    "SBCR Imperatriz Dona Leopoldina",
  "Sociedade Cultural Beneficente e Carnavalesca Império do Sol":
    "Império do Sol",

  // Bairros
  "Região Metropolitana": "Região Metropolitana de Porto Alegre",
  "região oeste": "Região Oeste (Porto Alegre)",
  "4º Distrito": "4º Distrito (Porto Alegre)",
  "Zona Sul": "Zona Sul (Porto Alegre)",
  "Entrega de Matrículas de Regularização para Moradores da Zona Sul":
    "Zona Sul (Porto Alegre)",
  "Zona Leste": "Zona Leste (Porto Alegre)",
  "Arquipélago (Ilhas)": "Islands of Porto Alegre",
  "Ilha dos Marinheiros": "Ilha dos Marinheiros (Porto Alegre)",
  "Bairro Anchieta": "Anchieta (Porto Alegre)",
  "Bairro Auxiliadora": "Auxiliadora",
  "Bairro Bela Vista": "Bela Vista (Porto Alegre)",
  "Bairro Belém Novo": "Belém Novo",
  "Bairro Belém Velho": "Belém Velho",
  "Bairro Bom Jesus": "Bom Jesus (Porto Alegre)",
  "Bairro Camaquã": "Camaquã (Porto Alegre)",
  Camaquã: "Camaquã (Porto Alegre)",
  "Bairro Campo Novo": "Campo Novo (Porto Alegre)",
  "Bairro Cavalhada": "Cavalhada (Porto Alegre)",
  "Bairro Chapéu do Sol": "Chapéu do Sol",
  "Bairro Cruzeiro": "Cruzeiro (Porto Alegre)",
  "Bairro Farrapos": "Farrapos (Porto Alegre)",
  "Bairro Glória": "Glória (Porto Alegre)",
  "Bairro Guarujá": "Guarujá (Porto Alegre)",
  "Bairro Higienópolis": "Higienópolis (Porto Alegre)",
  "Bairro Hípica": "Hípica",
  "Bairro Humaitá": "Humaitá (Porto Alegre)",
  "Bairro IAPI": "Vila do IAPI",
  "Bairro Ipanema": "Ipanema (Porto Alegre)",
  "Bairro Jardim Planalto": "Jardim Planalto (Porto Alegre)",
  "Bairro Lami": "Lami (Porto Alegre)",
  "Bairro Lomba do Pinheiro": "Lomba do Pinheiro",
  "Bairro Mário Quintana": "Mário Quintana (Porto Alegre)",
  "Bairro Medianeira": "Medianeira (Porto Alegre)",
  "Bairro Navegantes": "Navegantes (Porto Alegre)",
  Navegantes: "Navegantes (Porto Alegre)",
  "Bairro Nonoai": "Nonoai (Porto Alegre)",
  Nonoai: "Nonoai (Porto Alegre)",
  "Bairro Partenon": "Partenon (Porto Alegre)",
  Partenon: "Partenon (Porto Alegre)",
  "Bairro Passo D'Areia": "Passo d'Areia",
  "Bairro Ponta Grossa": "Ponta Grossa (Porto Alegre)",
  "Bairro Praia de Belas": "Praia de Belas",
  "Bairro São Geraldo": "São Geraldo (Porto Alegre)",
  "Santa Cecília": "Santa Cecília (Porto Alegre)",
  "Bairro Santa Tereza": "Santa Tereza (Porto Alegre)",
  "Bairro Santo Antônio": "Santo Antônio (Porto Alegre)",
  "Bairro São José": "São José (Porto Alegre)",
  "Bairro Sarandi": "Sarandi (Porto Alegre)",
  "Bairro Teresópolis": "Teresópolis (Porto Alegre)",
  "Bairro Tristeza": "Tristeza",
  "Bairro Vila Conceição": "Vila Conceição",
  "Bairro Vila Farrapos": "Vila Farrapos",
  "Morro da Cruz": "Morro da Cruz (Porto Alegre)",
  "Morro Santana": "Morro Santana (Porto Alegre)",
  "Santa Maria Goretti": "Santa Maria Goretti (Porto Alegre)",
  "Vila Ipiranga": "Vila Ipiranga (Porto Alegre)",
  "Capital Gaúcha": "Porto Alegre",
  "Aldeia do Morro do Osso": "Ymã Tupen Pãn",
  "Entrega de Matrículas de Imóveis da Vila Canadá": "Vila Canadá",
  "Aldeia Infantil SOS": "Aldeias Infantis SOS Brasil",
  "Quilombo Família Silva": "Quilombo Silva",

  "Florianópolis-SC": "Florianópolis",
  "Diretoria de Governança e Gestão da Prefeitura de Esteio": "Esteio",

  // Esporte
  "Centro de Artes e Esporte da Restinga (CEU)":
    "Centro de Artes e Esporte da Restinga",
  "Centro Esportivo da Vila Ingá (Cevi)": "Centro Esportivo da Vila Ingá",
  "Sociedade Esportiva, Recreativa, Cultural e Comunitária Ervino de Assis - SER ASSIS":
    "Sociedade Esportiva, Recreativa, Cultural e Comunitária Ervino de Assis",

  "Orla Moacyr Scliar": "Parque Moacyr Scliar",
  "Pontal do Estaleiro": "Parque Pontal do Estaleiro",
  "Parque Ararigbóia": "Parque Ararigboia",
  "Parque Knijnik": "Parque Gabriel Knijnik",

  "Avenida Ipiranga": "Avenida Ipiranga (Porto Alegre)",
  "Avenida João Pessoa": "Avenida João Pessoa (Porto Alegre)",
  "Avenida Castello Branco": "Avenida Presidente Castello Branco",
  "Entrada da cidade": "Avenida Presidente Castello Branco",
  "Av. Mauá": "Avenida Mauá",
  "Av. Tronco": "Avenida Moab Caldas",
  "Moab Caldas": "Avenida Moab Caldas",
  "Avenida Voluntários da Pátria": "Rua Voluntários da Pátria (Porto Alegre)",
  "Av. Wenceslau Escobar": "Avenida Wenceslau Escobar",
  "Av. Soledade": "Avenida Soledade",
  "Avenida Cel Aparício Borges": "Avenida Coronel Aparício Borges",
  "Avenida Anita Garibaldi": "Avenida Anita Garibaldi (Porto Alegre)",
  "Obra na Alça de Acesso da Cristóvão Colombo":
    "Avenida Cristóvão Colombo (Porto Alegre)",
  "Obra na Av. Delmar Rocha": "Avenida Delmar Rocha Barbosa",
  "Retomada das Obras da Rua Ernesto Neugebauer": "Rua Ernesto Neugebauer",
  "Contrato de concessão da Rodovia Integração Sul (RIS)":
    "Rodovia de Integração do Sul",

  "Praça Garibaldi": "Praça Garibaldi (Porto Alegre)",
  "Praça Laurentino Zotis": "Praça Laurentino Zottis",
  "Praça Montevideo": "Praça Montevidéu",
  "Praça da Matriz": "Praça da Matriz (Porto Alegre)",
  "Praça Parobé": "Praça Pereira Parobé",
  "Praça Revolução Farroupilha (Trensurb)": "Praça Revolução Farroupilha",
  "Praça XV de Novembro": "Praça XV de Novembro (Porto Alegre)",

  "Viaduto Conceição": "Viaduto da Conceição",
  "Viaduto Utzig": "Viaduto José Eduardo Utzig",
  "Baronesa do Gravataí": "Rua Baronesa do Gravataí",
  "Trincheira da Av. Cristóvão Colombo":
    "Trincheira da Avenida Cristóvão Colombo",
  "Trincheira da Ceará": "Trincheira da Avenida Ceará",
  "Rua Olavo Bilac": "Rua Olavo Bilac (Porto Alegre)",
  "calçadão de Ipanema": "Calçadão de Ipanema (Porto Alegre)",
  "Rua dos Andradas": "Rua dos Andradas (Porto Alegre)",

  "Exército Brasileiro": "Army of Brazil",
  "Forças Armadas": "Army of Brazil",
  "Marinha do Brasil": "Brazilian Navy",
  "Ministerio Público - RS": "Ministério Público do Rio Grande do Sul",
  "Governo Federal": "Federal government of Brazil",
  "Lei de Diretrizes Orçamentárias (LDO)": "Lei de Diretrizes Orçamentárias",
  SESI: "Serviço Social da Indústria",
  Fecomércio: "Fecomércio-RS",
  "Sistema Fecomércio RS": "Fecomércio-RS",
  "Comissão de Combate à Informalidade": "Fecomércio-RS",
  MEC: "Ministério da Educação (Brazil)",
  Justiça: "Ministry of Justice (Brazil)",
  Conaf: "Conselho Nacional de Controle Interno",
  Sebrae: "SEBRAE Rio Grande do Sul",
  "OAB-RS": "Ordem dos Advogados do Brasil - Rio Grande do Sul",
  "Sessão Solene de Posse da OAB/RS Triênio 2019/2021":
    "Ordem dos Advogados do Brasil - Rio Grande do Sul",
  "Fundação O Pão dos Pobres": "Fundação Pão dos Pobres",
  IPTU: "Imposto sobre a Propriedade Predial e Territorial Urbana",
  "Centro de Informações Estratégicas em Vigilância em Saúde (Cievs)":
    "Centro de Informações Estratégicas em Vigilância em Saúde",
  Ideb: "Índice de Desenvolvimento da Educação Básica",
  "Departamento Nacional de Infraestrutura de Transportes (Dnit)":
    "Departamento Nacional de Infraestrutura de Transportes",
  "Centro de Integração Empresa-Escola – CIEE":
    "Centro de Integração Empresa-Escola do Rio Grande do Sul",
  "Fórum de Justiça e Segurança do Centro":
    "Fórum de Justiça e Segurança (Porto Alegre)",
  "Romaria de Santa Maria": "Romaria da Medianeira",
  "Olimpíada Brasileira de Matemática - OBMEP":
    "Olimpíada Brasileira de Matemática das Escolas Públicas",
  "Felicity/GIZ": "FELICITY",
  "Comitê Paralímpico Brasileiro (CPB)": "Comitê Paralímpico Brasileiro",
  "Companhia de Saneamento Básico do Estado de São Paulo (Sabesp)": "Sabesp",
  "Instituições de Longa Permanência para Idosos (ILPI)":
    "Instituições de Longa Permanência para Idosos",
  "Central Única das Favelas (CUFA)": "Central Única das Favelas",
  "Associação dos Amigos da Praia de Torres – SAPT":
    "Associação dos Amigos da Praia de Torres",

  "Professora Finalista do Prêmio RBS de Educação 2018":
    "Prêmio RBS de Educação 2018",
  "Prêmio Inovação": "Prêmio Inovação Porto Alegre",

  "Cônsul do Japão em Porto Alegre": "Relations of Brazil and Japan",
  "Cônsul da Ucrânia no Brasil": "Relations of Brazil and Ukraine",
  "Comitiva portuguesa": "Relations of Brazil and Portugal",
  Irlanda: "Relations of Brazil and the Republic of Ireland",

  "Festival de Inverno": "Festival de Inverno (Porto Alegre)",
  "Dia do Desafio": "Challenge Day",
  "Semana do Japão": "Semana do Japão (Porto Alegre)",
  "48º Troféu Seival e 29ª Regata Farroupilha":
    "48º Troféu Seival e 29ª Regata Farroupilha (2018)",
  "32º Festival de Arte da Cidade de Porto Alegre":
    "32º Festival de Arte da Cidade de Porto Alegre (2018)",
  "17ª Edição dos Jogos Municipais da Terceira Idade":
    "17ª Edição dos Jogos Municipais da Terceira Idade (2018)",
  "149 anos do Mercado Público": "149 anos do Mercado Público (2018)",
  "8ª Semana Municipal da Água": "8ª Semana Municipal da Água (2018)",
  "14ª Gincana Ambiental": "14ª Gincana Ambiental (2018)",
  "1º Festival de Arte e Cultura Senegalesa":
    "1º Festival de Arte e Cultura Senegalesa (2018)",
  "Dia da Criança": "Children's Day in Brazil",
  "Dia da Visibilidade Trans": "Dia Nacional da Visibilidade Trans",
  "30 Anos da Defesa Civil": "30 Anos da Defesa Civil (2018)",
  "30 Anos da Kinder": "30 Anos da Kinder (2018)",
  "Dia Mundial da Alimentação": "World Food Day",
  "1º Fórum das Cidades Inteligentes, Humanizadas e Inovadoras - Smart Cities":
    "1º Fórum das Cidades Inteligentes, Humanizadas e Inovadoras - Smart Cities (2018)",
  "3ª Edição da Mostra Cultural Eixo Baltazar":
    "3ª Mostra Cultural Eixo Baltazar (2018)",
  "8ª Edição do Curso de Multiplicadores de Educação para o Trânsito sobre o Pedestre Idoso":
    "8º Curso de Multiplicadores de Educação para o Trânsito sobre o Pedestre Idoso (2018)",
  "Aniversário de 6 Anos do CEIC": "6th Anniversary of CEIC (2018)",
  "25 Anos do  FUMPROARTE": "25 Anos do FUMPROARTE (2018)",
  "Dia do Livro": "Dia Nacional do Livro",
  "Lançamento do Lance de Craque 2018": "Lance de Craque 2018",
  "59º Festival Hípico Noturno em Porto Alegre":
    "59º Festival Hípico Noturno de Porto Alegre (2018)",
  "20 Anos da Mostra dos Servidores do DMAE":
    "20 Anos da Mostra dos Servidores do DMAE (2018)",
  "126 Anos da Guarda Municipal de Porto Alegre":
    "126 Anos da Guarda Municipal de Porto Alegre (2018)",
  "Sétimo encontro de Medicina Tradicional Kaingang":
    "7º Encontro de Medicina Tradicional Kaingang (2018)",
  "XI Prêmio EPTC de Educação para o Trânsito":
    "XI Prêmio EPTC de Educação para o Trânsito (2018)",
  "VIII Seminário de Saúde e Segurança no Trabalho":
    "VIII Seminário de Saúde e Segurança no Trabalho (2018)",
  "34ª Festa do Pêssego Municipal":
    "34ª Festa do Pêssego de Porto Alegre (2018)",
  "Lançamento oficial da Expodireto Cotrijal 2025": "Expodireto Cotrijal 2025",
  "14ª edição do Campeonato Porto Alegre de Handebol 2018":
    "14º Campeonato Porto Alegre de Handebol (2018)",
  "15ª Chegada do Papai Noel - Abertura oficial do Natal de Porto Alegre":
    "15ª Chegada do Papai Noel - Abertura oficial do Natal de Porto Alegre (2017)",
  "25ª Corrida pela Vida": "25ª Corrida pela Vida (2018)",
  "11ª Conferência Municipal dos Direitos da Criança e do Adolescente":
    "11ª Conferência Municipal dos Direitos da Criança e do Adolescente (2018)",
  "XXVIII Colônia de Férias para Idosos":
    "XXVIII Colônia de Férias para Idosos (2018)",
  "245ª Feira do Peixe de Porto Alegre":
    "245ª Feira do Peixe de Porto Alegre (2025)",
  "Mostra Porto-alegrense da Atenção Primária à Saúde":
    "3ª Mostra Porto-Alegrense da Atenção Primária à Saúde (2024)",
  "86 anos do Viaduto Otávio Rocha": "86 anos do Viaduto Otávio Rocha (2018)",
  "2° Fórum de Logística Sustentável":
    "2° Fórum de Logística Sustentável (2024)",
  "Conferência das Nações Unidas sobre as Mudanças Climáticas (COP29)":
    "2024 United Nations Climate Change Conference",
  "V Conferência Municipal dos Direitos da Pessoa Idosa":
    "V Conferência Municipal dos Direitos da Pessoa Idosa (2018)",
  "34ª edição da entrega da Láurea Engenheiro do ano da Sociedade de Engenharia do Rio Grande do Sul":
    "34ª Entrega da Láurea Engenheiro do Ano da SERGS (2018)",
  "1ª Feira da Agricultura Familiar - Agrifam":
    "1ª Feira da Agricultura Familiar (2018)",
  "IV Mostra de Atividades do Projovem Adolescente":
    "IV Mostra de Atividades do Projovem Adolescente (2018)",
  "Jogos Escolares da Cidade de Porto Alegre (Jespoa)":
    "Jogos Escolares da Cidade de Porto Alegre",
  "Fórum da Liberdade": "30º Fórum da Liberdade (2017)",
  "2º Seminário de Comunicação da Prefeitura de Porto Alegre":
    "2º Seminário de Comunicação da Prefeitura de Porto Alegre (2018)",
  "Troféu “Atitudes que dão show”": "Troféu Atitudes que dão show",
  "Primeira edição do Natal Tri Demais": "Natal Tri Demais",
  "34ª Feira de Natal do Bom Fim": "34ª Feira de Natal do Bom Fim (2018)",
  "Posse do Governador Eduardo Leite":
    "Posse do Governador Eduardo Leite (2019)",
  "Festa da Uva e da Ameixa": "Festa da Uva e da Ameixa de Porto Alegre",
  IberCup: "IberCup 2019",
  "Pokémon GO": "Pokémon GO Safari Zone 2019 in Porto Alegre",
  "Copa América de Futebol 2019": "Copa América 2019",
  "Assembleia de Verão 2019 da Famurs": "Assembleia de Verão da Famurs 2019",
  "11ª edição Praia Acessível para Todos":
    "11ª Praia Acessível para Todos (2019)",
  "Exposição Deus Momo Vem Aí": "Deus Momo Vem Aí",
  "Evento Mulheres em Ação": "Mulheres em Ação",
  "Lançamento da Edição 2019 do projeto Banco do Tênis":
    "Projeto Banco do Tênis 2019",
  "Desafio do Tênis POA": "Projeto Banco do Tênis 2019",
  "18ª Edição do Torneio Aberto Internacional de Xadrez":
    "18º Torneio Aberto Internacional de Xadrez (2019)",
  "XXV Copa Cidade de Porto Alegre de Vela Oceano":
    "XXV Copa Cidade de Porto Alegre de Vela Oceano (2019)",

  "Campanha do Agasalho": metadata =>
    `Campanha do Agasalho (${getYear(metadata.humanReadableDate)})`,
  Expointer: metadata => `Expointer (${getYear(metadata.humanReadableDate)})`,
  "Jogos dos Estudantes Surdos": metadata =>
    `Jogos dos Estudantes Surdos (${getYear(metadata.humanReadableDate)})`,
  "Festival do Japão": metadata =>
    `Festival do Japão RS ${getYear(metadata.humanReadableDate)}`,
  "Semana de Porto Alegre": metadata =>
    `Semana de Porto Alegre ${getYear(metadata.humanReadableDate)}`,
  "Acampamento Farroupilha": metadata =>
    `Acampamento Farroupilha (Porto Alegre, ${getYear(
      metadata.humanReadableDate
    )})`,
  "Desfile Farroupilha 2018": metadata =>
    `Desfile Farroupilha (Porto Alegre, ${getYear(
      metadata.humanReadableDate
    )})`,
  "Top de Marketing ADVB/RS": metadata =>
    `Top de Marketing ADVB/RS ${getYear(metadata.humanReadableDate)}`,
  "Prêmio Açorianos": metadata =>
    `Prêmio Açorianos ${getYear(metadata.humanReadableDate)}`,
  "Dia Internacional da Pessoa com Deficiência": metadata =>
    `UNIDPD in Brazil ${getYear(metadata.humanReadableDate)}`,
  "Projeto Esporte Verão": metadata =>
    `POA Esporte Verão ${getYear(metadata.humanReadableDate)}`,
  "Festa de Nossa Senhora dos Navegantes": metadata =>
    `Festa de Nossa Senhora dos Navegantes (Porto Alegre, ${getYear(
      metadata.humanReadableDate
    )})`,
  "5ª Edição da Cerimônia de Lavagem das Escadarias do Paço": metadata =>
    `Lavagem das escadarias do Paço Municipal do Porto Alegre (${getYear(
      metadata.humanReadableDate
    )})`,

  "Viagem à Holanda": metadata =>
    `Missão Países Baixos ${getYear(metadata.humanReadableDate)}`,
  Amsterdam: metadata => `${getYear(metadata.humanReadableDate)} in Amsterdam`,
  Haia: metadata => `${getYear(metadata.humanReadableDate)} in The Hague`,

  "Brigada Militar": "Brigada Militar do Rio Grande do Sul",
  "Sede do Comando Geral da Brigada Militar":
    "Sede do Comando Geral da Brigada Militar do Rio Grande do Sul",
  "Secretaria Estadual de Saúde do RS (SES RS)":
    "Secretaria Estadual de Saúde do Rio Grande do Sul",

  Trabalho: "Festa de Nossa Senhora do Trabalho",
  Metas: "Prometas",
  "Caminhos Rurais": "Caminhos Rurais de Porto Alegre",
  Parcão: "Parque Moinhos de Vento",
  "Aniversário do Parque Moinhos de Vento": "Parque Moinhos de Vento",
  "Cais do Porto": "Cais Mauá",
  Unesco: "UNESCO",
  "Jogos Abertos": "Jogos Abertos de Porto Alegre",
  "Jockey Club": "Jockey Club do Rio Grande do Sul",
  "Nivel do Guaíba": "Water level recorders",
  "Paróquia de São Jorge": "Procissão de São Jorge (Porto Alegre)",
  "Programa Nacional de Apoio à Gestão Administrativa e Fiscal dos Municípios Brasileiros (PNAFM).":
    "Programa Nacional de Apoio à Gestão Administrativa e Fiscal dos Municípios Brasileiros",
  "CETE - Centro Estadual de Treinamento Esportivo":
    "Centro Estadual de Treinamento Esportivo",
  "Cidades Educadoras": "Educating Cities",
  "Junta de Serviço Militar": "Juntas de Serviço Militar",
  "Polícia Rodoviária Federal (PRF)": "Polícia Rodoviária Federal",
  "Polícia Rodoviária Federal - PRF": "Polícia Rodoviária Federal",
  "Comando do Policiamento da Capital (CPC)":
    "Comando de Policiamento da Capital (RS)",
  "Enchente Porto Alegre Maio de 2024": "2024 Porto Alegre floods",
  "Enchente Porto Alegre": "2024 Porto Alegre floods",
  "Corredor Humanitário":
    "Humanitarian aid for the 2024 Rio Grande do Sul floods",
  "Cadastro Único": "Cadastro Único para Programas Sociais",
  "Campanha Nacional de Vacinação contra Gripe (influenza)":
    "Campanha Nacional de Vacinação contra Gripe (Brazil)",
  "Agente de Combate às Endemias (ACE)": "Agentes de Combate às Endemias",
  "Centro de Referência em Saúde do Trabalhador (Cerest)":
    "Centro de Referência em Saúde do Trabalhador",
  "Cruz Vermelha do Brasil": "Brazilian Red Cross",
  "Treinamento da Cruz Vermelha": "Brazilian Red Cross",
  "Grupo Experimental de Dança (GED)":
    "Grupo Experimental de Dança de Porto Alegre",
  "Reunião-almoço Tá Na Mesa": "Tá na Mesa",
  "Gre-nal de Todos": "Grenal",
  "Gre-Nal": "Grenal",
  "SMTC - Marco Regulatório das Organizações da Sociedade Civil":
    "Marco Regulatório das Organizações da Sociedade Civil",
  "Fraport Brasil S.A.": "Fraport Brasil",
  "Jornada Científica do HPS":
    "Jornada Científica do Hospital de Pronto Socorro",
  "Contrato com a Caixa Econômica Federal (CEF)": "Caixa Econômica Federal",
  "Reunião com o Diretor regional da Caixa Econômica Federal":
    "Caixa Econômica Federal",
  "Representantes da CEF": "Caixa Econômica Federal",
  "Fundação de Atendimento Socioeducativo do Rio Grande do Sul (Fase)":
    "Fundação de Atendimento Socioeducativo do Rio Grande do Sul",
  "Agência Estadual de Regulação dos Serviços Públicos Delegados do Rio Grande do Sul (AGERGS)":
    "Agência Estadual de Regulação dos Serviços Públicos Delegados do Rio Grande do Sul",
  FNP: "Frente Nacional de Prefeitas e Prefeitos",
  "Sala de monitoramento do Aedes da SES/RS": "Government of Rio Grande do Sul",
  "Plataforma Google for Education": "Google for Education",
  "Escritório de Parcerias Público-Privadas do Distrito de Columbia (OP3)":
    "Office of Public-Private Partnerships",
  "Agencia Alemã Deutsche Gesellschaft Internationale Zusammenarbeit - GIZ":
    "Deutsche Gesellschaft für Internationale Zusammenarbeit",
  "Escritório da Rede 100 Cidades Resilientes - 100RC": "100 Resilient Cities",
  "Minha Casa Minha Vida": "Minha Casa, Minha Vida",
  Farsul: "Federação da Agricultura do Estado do Rio Grande do Sul",
  PPCIs: "Planos de Prevenção e Proteção Contra Incêndios",
  "Conselheiros Tutelares": "Conselho Tutelar",
  "Escritório das Nações Unidas (UNOPS)":
    "United Nations Office for Project Services",
  "Desafio do City Cancer Challenge": "City Cancer Challenge",
  "Sociedade de Engenharia do Rio Grande do Sul (Sergs)":
    "Sociedade de Engenharia do Rio Grande do Sul",
  "Início das Atividades do Regula+Brasil na Capital Gaúcha": "Regula+Brasil",
  "7ª edição do Festival Brasileiro da Cerveja":
    "Festival Brasileiro da Cerveja",
  "Dia do Consumidor": "World Consumer Rights Day",
  "Serviço de Convivência e Fortalecimento de Vínculos – SCFV":
    "Serviço de Convivência e Fortalecimento de Vínculos",
  "Projeto Manobra Solidária": "Manobra Solidária",

  Santander: "Banco Santander (Brasil)",
  "Banco Nacional de Desenvolvimento Econômico e Social (BNDES)":
    "Banco Nacional de Desenvolvimento Econômico e Social",
  "Missão Técnica com representantes do BNDES":
    "Banco Nacional de Desenvolvimento Econômico e Social",
  "Banco de Desarrollo de América Latina (CAF )":
    "Banco de Desarrollo de América Latina",
  "Reunião no BID": "Inter-American Development Bank",
  "Banco Interamericano de Desenvolvimento (BID)":
    "Inter-American Development Bank",
  "Reunião no International Finance Corporation (IFC)":
    "International Finance Corporation",

  Lazer: "Recreation in Porto Alegre",
  Farmácia: "Farmácias Distritais (Porto Alegre)",
  roubo: "Crime in Porto Alegre",
  "Roubos de fios": "Crime in Porto Alegre",
  "Veículo Roubado": "Crime in Porto Alegre",
  Flagrante: "Crime in Porto Alegre",
  Ambulância: "Ambulances in Porto Alegre",
  Aéreas: "Aerial photographs of Porto Alegre",
  Táxi: "Taxis in Porto Alegre",
  Infraestrutura: "Infrastructure in Porto Alegre",
  Artesanato: "Handicrafts of Porto Alegre",
  Lixo: "Waste management in Porto Alegre",
  Escultura: "Sculptures in Porto Alegre",
  Alimentação: "Food of Porto Alegre",
  Alimento: "Food of Porto Alegre",
  Motocicleta: "Motorcycles in Porto Alegre",
  Bombeiros: "Firefighters of Porto Alegre",
  Cinema: "Cinema of Porto Alegre",
  Vandalismo: "Vandalism in Porto Alegre",
  Cavalo: "Horses of Porto Alegre",
  Chuva: "Rain in Porto Alegre",
  Desastres: "Disasters and accidents in Porto Alegre",
  "Área de risco": "Disasters and accidents in Porto Alegre",
  eleições: "Elections in Porto Alegre",
  Incêndio: "Fires in Porto Alegre",
  Subprefeituras: "Subprefeituras of Porto Alegre",
  Dique: "Dams in Porto Alegre",
  Cachorro: "Dogs of Porto Alegre",
  CÃES: "Dogs of Porto Alegre",
  Coronavírus: "COVID-19 pandemic in Porto Alegre",
  "Covid-19": "COVID-19 pandemic in Porto Alegre",
  Quilombos: "Quilombos in Porto Alegre",
  Bicicleta: "Bicycles in Porto Alegre",
  Bocha: "Bocce in Porto Alegre",
  Memória: "History of Porto Alegre",
  "Fotos Antigas": "History of Porto Alegre",
  Varejo: "Retail in Porto Alegre",
  Indústria: "Industry in Porto Alegre",
  Hipismo: "Equestrian sports in Porto Alegre",
  Flora: "Flora of Porto Alegre",
  Tradição: "Traditions of Porto Alegre",
  Emprego: "Labour in Porto Alegre",
  Renda: "Labour in Porto Alegre",
  pessoas: "People of Porto Alegre",
  Seminário: "Seminars in Porto Alegre",
  Telefonia: "Telecommunications in Porto Alegre",
  Professor: "Educators from Porto Alegre",
  "Contratação emergencial de professores": "Educators from Porto Alegre",
  Barcos: "Boats in Porto Alegre",
  Gasolina: "Gas stations in Porto Alegre",
  "Posto de Gasolina": "Gas stations in Porto Alegre",
  Calçada: "Sidewalks in Porto Alegre",
  "Trabalho e Emprego": "Labour in Porto Alegre",
  "Vagas de Emprego": "Labour in Porto Alegre",
  "Indústria e Comércio": "Industry in Porto Alegre",
  "Artes Cênicas": "Performing arts in Porto Alegre",
  "Ruas e avenidas": "Streets in Porto Alegre",
  "Artes Visuais": "Art of Porto Alegre",
  "Fios Soltos": "Overhead power lines in Porto Alegre",
  "foco de lixo": "Waste management in Porto Alegre",
  "Terminais de ônibus": "Bus stations in Porto Alegre",
  "parada de ônibus": "Bus stops in Porto Alegre",
  "Sinalização viária": "Road signs in Porto Alegre",
  "Arte Urbana": "Street art in Porto Alegre",
  "Iluminação Pública": "Street lights in Porto Alegre",
  "Lançamento do Projeto de Lei para PPP de Iluminação Pública":
    "Street lights in Porto Alegre",
  "Cercamento Eletrônico": "Traffic cameras in Porto Alegre",
  "Totem iluminado": "Illuminated totems in Porto Alegre",
  "Feira Ecológica": "Ecological farmers' markets in Porto Alegre",
  "Termos de Permissão uso bares da Orla do Guaíba": "Bars in Porto Alegre",
  "Programação Cultural": "Culture of Porto Alegre",
  "Fim de tarde": "Sunsets of Porto Alegre",
  "Bolsa Família": "Poverty in Porto Alegre",
  "Transporte fluvial de passageiros": "Water transport in Porto Alegre",
  "Plantio Sustentável do DMLU": "DMLU’s Sustainable Planting",
  "Estação Integrada de Compostagem":
    "Estação Integrada de Compostagem do DMLU",
  "1ª Faixa Reversível semafórica de Porto Alegre":
    "Road transport infrastructure in Porto Alegre",
  "Radar de Trânsito": "Speed cameras in Porto Alegre",
  "Cabines Telefônicas": "Telephone booths in Porto Alegre",
  "foto noturna": "Night in Porto Alegre",
  "Aldeia Kaingang": "Kaingang villages in Porto Alegre",
  "Aldeia Mbyá-Guarani": "Mbya Guarani villages in Porto Alegre",
  "Zona Rural": "Countryside in Porto Alegre",
  "entidades carnavalescas": "Samba schools of Porto Alegre",
  "corredor de ônibus": "Bus lanes in Porto Alegre",
  "Faixa Preferencial Deslocamento de Ônibus": "Bus lanes in Porto Alegre",
  "Dia de Passe Livre": "Free fare days in Porto Alegre",
  "Programa de escuta da comunidade": "Municipal projects in Porto Alegre",
  "Sanção da Lei das Antenas": "Antenna towers and masts in Porto Alegre",
  "pôr-do-sol": "Sunsets of Porto Alegre",
  "Obras da Copa de 2014":
    "2014 FIFA World Cup Construction Projects in Porto Alegre",
  "Patinetes Elétricas": "Electric kick scooters in Porto Alegre",
  "Educação no Trânsito": "Road safety education in Porto Alegre",
  "Gráfico Década de Ação pela Segurança no Trânsito da ONU":
    "Road safety education in Porto Alegre",

  Páscoa: metadata =>
    `Easter ${getYear(metadata.humanReadableDate)} in Porto Alegre`,
  "Dia da Independência": metadata =>
    `Independence Day ${getYear(metadata.humanReadableDate)} in Porto Alegre`,

  Nuvens: "Clouds in Rio Grande do Sul",
  Futsal: "Futsal in Rio Grande do Sul",
  Alouatta: "Primates of Rio Grande do Sul",
  "Indumentária Gaúcha": "Costumes in Rio Grande do Sul",
  "Circuito Urbano": "Racing circuits in Rio Grande do Sul",
  "Posse Deputados Estaduais": "State deputies of Rio Grande do Sul",

  Infográfico: "Information graphics of Brazil",
  Vôlei: "Volleyball in Brazil",
  Handebol: "Handball in Brazil",
  Servidor: "Civil servants of Brazil",
  Aluno: "Students in Brazil",
  Alunos: "Students in Brazil",
  Estudantes: "Students in Brazil",
  Licitações: "Auctions in Brazil",
  "Leilão de Inservíveis": "Auctions in Brazil",
  Transparência: "Open government in Brazil",
  Empreendedorismo: "Entrepreneurship in Brazil",
  Adolescente: "Teenagers of Brazil",
  Poda: "Pruning in Brazil",
  Remanejo: "Pruning in Brazil",
  "Podas de Árvores": "Pruning in Brazil",
  Embaixada: "Embassies in Brazil",
  Juventude: "Youth in Brazil",
  Eclipse: "Solar eclipses in Brazil",
  Gato: "Cats of Brazil",
  Ambulantes: "Street vendors in Brazil",
  Gripe: "Influenza vaccination in Brazil",
  Ginástica: "Gymnastics in Brazil",
  Pedestre: "Pedestrians in Brazil",
  Resgate: "Search and rescue in Brazil",
  Trilha: "Trails in Brazil",
  Medicina: "Medicine in Brazil",
  Voluntariado: "Volunteering in Brazil",
  Drone: "Unmanned aerial vehicles in Brazil",
  gari: "Street sweepers from Brazil",
  Abastecimento: "Logistics in Brazil",
  Limpeza: "Cleaning in Brazil",
  Escolta: "Police escorts in Brazil",
  Tenda: "Tents in Brazil",
  Solidariedade: "Solidarity in Brazil",
  Restauração: "Restoration of buildings in Brazil",
  Maratona: "Marathons in Brazil",
  Deslizamento: "Landslides in Brazil",
  Internet: "Internet in Brazil",
  Fotografia: "Photography in Brazil",
  Dragagem: "Dredging in Brazil",
  "Dragagem do Segundo Trecho do Arroio Dilúvio": "Dredging in Brazil",
  Previdência: "Social insurance in Brazil",
  Amamentação: "Breastfeeding in Brazil",
  "Aleitamento materno": "Breastfeeding in Brazil",
  Imigrantes: "Immigration in Brazil",
  Basquete: "Basketball in Brazil",
  Simpósio: "Symposia in Brazil",
  Hanseníase: "Leprosy in Brazil",
  Retrato: "Portrait photographs of politicians of Brazil",
  Formatura: "Graduation ceremonies in Brazil",
  Casamento: "Collective weddings in Brazil",
  Robótica: "Robotics in Brazil",
  Urbanização: "Urbanization in Brazil",
  Urbanismo: "Urbanism in Brazil",
  Parklet: "Parklets in Brazi",
  Fachada: "Facades in Brazil",
  Revitalização: "Urban renewal in Brazil",
  "Escritório de Reconstrução": "Urban renewal in Brazil",
  parquímetro: "Parking meters in Brazil",
  Chimarrão: "Mate (beverage) in Brazil",
  Venezuelanos: "Venezuelan diaspora in Brazil",
  "Acolhimento aos Imigrantes Venezuelanos": "Venezuelan diaspora in Brazil",
  Debate: "Political debates in Brazil",
  Painel: "Political debates in Brazil",
  óculos: "Glasses in Brazil",
  oftalmologista: "Ophthalmologists from Brazil",
  Verão: "Summer in Brazil",
  Talude: "Embankments in Brazil",
  churrasqueiras: "Outdoor barbecues in Brazil",
  Gestante: "Pregnant women in Brazil",
  entrevista: "Interviews in Brazil",
  "Entrevista ao Programa Timeline": "Interviews in Brazil",
  Refugiados: "Refugees in Brazil",
  Assinatura: "Signing ceremonies in Brazil",
  Colheita: "Harvest in Brazil",
  Caminhão: "Waste collection trucks in Brazil",
  cozinheiras: "Cooks from Brazil",
  Nutrição: "Nutrition in Brazil",
  "Coordenação de Nutrição": "Nutrition in Brazil",
  Uniformes: "Uniforms of Brazil",
  serpentes: "Snakes of Brazil",
  enfermagem: "Nursing in Brazil",
  edital: "Official documents of Brazil",
  "Bloqueio químico": "Fogging against Aedes aegypti in Brazil",
  "febre amarela": "Yellow fever in Brazil",
  "Artes Plásticas": "Visual arts of Brazil",
  "Educação Ambiental": "Environmental education in Brazil",
  "Ação Social": "Social work in Brazil",
  "Plano Diretor": "Urban planning in Brazil",
  "Medicina Veterinária": "Veterinary medicine in Brazil",
  "vacina contra a Dengue": "Dengue vaccine in Brazil",
  "troféu Prefeito Inovador": "Awards of Brazil",
  "apuração do Carnaval": "Awards of Brazil",
  "Profissionais de Saúde": "People of Brazil in health professions",
  "Saúde Mental": "Mental health in Brazil",
  "Placa de veículos": "License plates of Brazil",
  "Tratamento de água": "Water treatment in Brazil",
  "lavagem de vias e pontos": "Street cleaning in Brazil",
  "caminhões-pipa": "Tank trucks in Brazil",
  "doação de sangue": "Blood donation in Brazil",
  "Ambulatório Odontológico": "Dental clinics in Brazil",
  "Teste do Pezinho": "Neonatal heel pricks in Brazil",
  "Banco de Leite Humano": "Human milk banks in Brazil",
  "Atendimento em Casa": "Home care in Brazil",
  "Visita domiciliar": "Home care in Brazil",
  "Outubro Rosa": "Pink October in Brazil",
  "BRT's": "Bus rapid transit in Brazil",
  "Leito Hospitalar": "Hospital beds in Brazil",
  "Economia Solidária": "Social economy in Brazil",
  "Novembro Azul": "Movember in Brazil",
  "Food truck": "Food trucks in Brazil",
  "Feira Temática": "Medieval markets in Brazil",
  "Atenção Primária à Saúde (APS)": "Primary health care in Brazil",
  "Atenção Básica": "Primary health care in Brazil",
  "Propaganda Eleitoral": "Political advertising in Brazil",
  "Serviço Funerário": "Funerals in Brazil",
  "Horário estendido": "Timetables in Brazil",
  "Comércio Irregular": "Gray market in Brazil",
  "Futebol de Várzea": "Amateur association football in Brazil",
  "Fake News": "Fake news in Brazil",
  "rolo compressor": "Road rollers in Brazil",
  "Zona Urbana": "Urban areas in Brazil",
  "evento social": "Social events in Brazil",
  "DIA SEM CARRO": "World Car Free Day in Brazil",
  "Sala de aula": "Classrooms in Brazil",
  "Eleições 2018": "2018 Brazilian election (second round)",
  "Mastectomia em animais": "Animal health in Brazil",
  "Equipamentos Hospitalares": "Medical equipment in Brazil",
  "mapa de serviço de trânsito": "Road maps of Brazil",
  "Saúde da Criança e Adolescente": "Child health in Brazil",
  "academias ao ar livre": "Outdoor gyms in Brazil",
  "moradias temporárias": "Temporary housing in Brazil",
  "Plantio de Árvores": "Tree planting in Brazil",
  "Eventos Climáticos": "Weather phenomena in Brazil",
  "ônibus elétrico": "Electrically-powered buses in Brazil",
  "Escada rolante": "Escalators in Brazil",
  "Licitação para Manutenção Elevadores e Escadas Rolantes":
    "Escalators in Brazil",
  "Exposição Fotográfica": "Photography exhibitions in Brazil",
  "Abandono de Veículos": "Abandoned vehicles in Brazil",
  "Estação Radio Base (ERBs)": "Mobile phone base stations in Brazil",
  "teatro de rua": "Street theatre in Brazil",
  "Qualidade do Ar": "Air quality monitoring in Brazil",
  "Noite dos Museus": "Night of Museums in Brazil",
  "Banheiros Públicos": "Public toilets in Brazil",
  "Espaços Públicos": "Public places in Brazil",
  "oficinas artísticas": "Art workshops in Brazil",
  "Árvore de Natal": "Christmas trees in Brazil",
  "Regularização de Escolas Comunitárias": "Community schools in Brazil",
  "Laboratório de Informática do Prédio da Prefeitura de Porto Alegre":
    "Computer labs in Brazil",
  "micro-ônibus": "Microbuses in Brazil",
  "Proteção Animal": "Animal rights in Brazil",
  "Festa de Natal": "Christmas parties in Brazil",
  "fogos de artifício": "Fireworks in Brazil",
  "Carnaval de Rua": "Street carnival in Brazil",
  "Atendimento Infanto-Juvenil": "Child health in Brazil",
  "Doação de Guarda-Sóis": "Parasols in Brazil",
  "Serviço de Terraplanagem": "Earthworks in Brazil",
  "lixo eletrônico": "Electronic waste in Brazil",

  "Dia internacional da Mulher": metadata =>
    `International Women's Day in ${getYear(
      metadata.humanReadableDate
    )} in Brazil`,
  Criança: metadata =>
    `Children of Brazil in ${getYear(metadata.humanReadableDate)}`,

  "síndrome de down": "Down syndrome",
  Investigação: "Inquiry",
  Microcefalia: "Microcephaly",
  Consultório: "Medical offices",
  "Doenças da Pele": "Dermatitis",
  "Educação Fundamental": "Primary education",
  "Educação Básica": "Primary education",
  "Alteração de vias": "Road traffic management",
  "Transtornos no trânsito": "Road traffic management",
  "desvio de trânsito": "Road traffic management",
  "Consulta Pública": "Public consultation",
  Capina: "Weed control",
  Roçada: "String trimmers",
  "Adoção de animais": "Animal adoption",
  "Educação Especial": "Special education",
  Cidadania: "Civil society",
  Interdição: "Forced business closures",
  "Inclusão Social": "Social inclusion",
  Mulher: "Gender equality",
  Medicamentos: "Pharmaceutical drugs",
  Sangue: "Blood collection",
  Caminhada: "Walks (event)",
  "Bloqueio no trânsito": "Closed roads",
  Apreensão: "Confiscation",
  "Ação Integrada": "Community-driven programs",
  "Saúde Bucal": "Oral health",
  Convite: "Invitations",
  Pavimentação: "Road paving",
  Flashmob: "Flash mobs",
  "Centro de triagem": "Screening centers",
  Monitoramento: "Monitoring",
  "Sistema de Monitoramento de Tráfego Eletrônico":
    "Traffic monitoring systems",
  "Cidades Inteligentes": "Smart cities",
  "Câncer Bucal": "Oral cancer",
  "Saúde Nutricional e Amamentação": "Breastfeeding",
  Live: "Video streaming",
  Mãe: "Maternal health",
  Desabrigados: "Displaced persons",
  "Primeiros Socorros": "First aid",
  "Clínica da Família": "Family medicine",
  "Agentes Comunitários de Saúde (ACS)": "Community health agents",
  "Saúde do Idoso": "Elderlycare",
  "Banco de Sangue": "Blood banks",
  "Declaração de Edimburgo": "Collective agreements",
  "Novo Marco Global": "Biodiversity",
  Certificado: "School certificates",
  Homenagem: "Homages to people",
  "doação e transplante de órgãos": "Organ donation",
  "Inspeção veicular": "Vehicle inspection",
  "Educação Permanente": "Professional development and training",
  "Agentes de Fiscalização": "Inspectors at work",
  Conscientização: "Awareness activism",
  Computador: "Computers",
  "Saúde do Trabalhador": "Occupational safety and health",
  "Infecções Sexualmente Transmissíveis (IST)":
    "Sexually transmitted diseases and disorders",
  Vítimas: "Victims",
  "Exame médico": "Physical examinations",
  Aeronáutica: "Aeronautics",
  "Doença Respiratória": "Diseases and disorders of the respiratory system",
  Leishmaniose: "Leishmaniasis",
  Compostagem: "Composting",
  Prevenção: "Prevention",
  Ecobarreira: "Waste collection booms",
  "Regularização Fundiária": "Land tenure",
  Regularização: "Land tenure",
  Estreia: "Premieres",
  "Aula Inaugural": "Classes",
  Desenvolvimento: "Urban development",
  Tabagismo: "Nicotine dependence",
  Mascote: "Animal mascots",
  Plantio: "Planting",
  "Pessoa com mobilidade reduzida": "People with mobility impairment",
  Testagem: "Medical tests",
  Downburst: "Downbursts",
  Passeio: "Walking tours",
  "Volta às aulas": "Back to school",
  "Reintegração de Posse": "Eviction",
  "Curso de Mecânica": "Mechanics",
  "Maratona de Dança": "Dance marathons",
  "Mutirão de cirurgias": "Surgery",
  "Parceria Público-Privada": "Public-private partnership projects",
  Frio: "Cold",
  "Arte Cemiterial": "Funerary art",
  Videoconferência: "Videoconferencing",
  "Vírus T-linfotrópico humano (HTLV)": "Human T-lymphotropic virus",
  "Estação de Transbordo": "Transport hubs",
  bullying: "Bullying",
  "Saúde Prisional": "Prison healthcare",
  "Escorpião Amarelo": "Tityus serrulatus",
  "#proconpoaresponde": "Hashtags",
  "Oficina de Dança": "Dance lessons",
  "macacos-prego": "Sapajus",
  "Relatório de Gestão": "Reports",
  porteiros: "Doorkeepers",
  "Licenciamento Ambiental": "Environmental law",
  hipertenso: "Hypertension",
  Formulário: "Webforms",
  "Quero- Quero": "Vanellus chilensis",
  "atividade física": "Physical activity",
  Sarampo: "Measles vaccination",
  "Reunião com Representantes do Banco Mundial": "World Bank",
  Calor: "Heat",
  "Trade Commissioner": "Trade commissioners",
  "Serviços Ortopédicos": "Orthopedic treatments",
  Alerta: "Warning systems",
  Epidemiologia: "Epidemiology",
  "Recital para Doação de um Piano para o Centro Cultural Multimeios Restinga":
    "Essenfelder pianos",
  "banho assistido": "Assisted bathing",
  cadastramento: "Registration",
  Financiamento: "Funding bodies",
  Autuação: "Fine (penalty)",
  Diplomação: "Certification",
  "Entrega dos Certificados aos Gestores dos CRIP's": "Certification",
  "Bônus-Moradia": "Affordable housing",
  Patrulhamento: "Patrolling",
  "Iluminação Cênica": "Architectural lighting",
  "Show de Talentos": "Talent shows",
  "Acervo de fotos": "Photograph collections",
  "Saúde LGBTQIAP+": "LGBT health",
  "Autoteste para HIV": "Autotest HIV",
  "Remoção de árvore": "Felling",
  "Transporte Irregular de Produtos Perigosos":
    "Transportation of hazardous materials",
  Videomonitoramento: "Video surveillance",
  abordagem: "Outreach",
  "Adoção de Monumentos": "Adoption",
  "Sine Lúdico e Sinoteca": "Toy and game libraries",
  pneu: "Tire reuse",
  "Lançamento da Pedra Fundamental": "Foundation stone laying ceremonies",
};
