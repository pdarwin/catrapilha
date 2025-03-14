import { getYear } from "../../../Utils/DateUtils";

// Define a mapping of tags to categories
export const tagToCategoryMap = {
  Smds: "Secretaria Municipal de Desenvolvimento Social (Porto Alegre)",
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
  Smim: "Secretaria Municipal de Infraestrutura e Mobilidade (Porto Alegre)",
  "Secretaria Municipal de Obras e Infraestrutura (SMOI)":
    "Secretaria Municipal de Obras e Infraestrutura (Porto Alegre)",
  "Obras e Infraestrutura":
    "Secretaria Municipal de Obras e Infraestrutura (Porto Alegre)",
  "Infraestrutura e Urbanismo":
    "Secretaria Municipal de Obras e Infraestrutura (Porto Alegre)",
  "Esportes, Recreação e Lazer":
    "Secretaria Municipal de Esportes, Recreação e Lazer",
  "Esportes e Lazer": "Secretaria Municipal de Esportes, Recreação e Lazer",
  Seda: "Secretaria Municipal dos Direitos Animais (Porto Alegre)",
  "Cultura Economia Criativa":
    "Secretaria Municipal de Cultura e Economia Criativa (Porto Alegre)",
  "Direitos dos Animais":
    "Secretaria Municipal dos Direitos Animais (Porto Alegre)",
  "Direitos Animais":
    "Secretaria Municipal dos Direitos Animais (Porto Alegre)",
  "Secretaria Municipal de Esporte, Lazer e Juventude (SMELJ)":
    "Secretaria Municipal de Esporte, Lazer e Juventude (Porto Alegre)",
  "Esporte, Lazer e Juventude":
    "Secretaria Municipal de Esporte, Lazer e Juventude (Porto Alegre)",
  "Esporte Lazer e Juventude":
    "Secretaria Municipal de Esporte, Lazer e Juventude (Porto Alegre)",
  Smtc: "Secretaria Municipal de Transparência e Controladoria (Porto Alegre)",
  "Governança Local e Coordenação Política":
    "Secretaria Municipal de Governança Local e Coordenação Política (Porto Alegre)",
  "Secretaria Municipal de Habitação e Regularização Fundiária (SMHARF)":
    "Secretaria Municipal de Habitação e Regularização Fundiária (Porto Alegre)",
  "Habitação Regularização Fundiária":
    "Secretaria Municipal de Habitação e Regularização Fundiária (Porto Alegre)",
  "Habitação e Regularização Fundiária":
    "Secretaria Municipal de Habitação e Regularização Fundiária (Porto Alegre)",
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
  Inovação: "Gabinete da Inovação (Porto Alegre)",
  "Comunicação Social": "Gabinete de Comunicação Social (Porto Alegre)",
  "Gabinete da Causa Animal (GCA)": "Gabinete da Causa Animal (Porto Alegre)",
  "Causa Animal": "Gabinete da Causa Animal (Porto Alegre)",
  Secretariado: "Municipal secretariats of Porto Alegre",
  "Secretaria Extraordinária do Trabalho e da Qualificação Profissional (SMTQ)":
    "Secretaria Extraordinária do Trabalho e da Qualificação Profissional (Porto Alegre)",
  "Trabalho e Qualificação":
    "Secretaria Extraordinária do Trabalho e da Qualificação Profissional (Porto Alegre)",

  Procempa: "Companhia de Processamento de Dados do Município de Porto Alegre",
  "Companhia de Processamento de Dados do Município (Procempa)":
    "Companhia de Processamento de Dados do Município de Porto Alegre",
  Demhab: "Departamento Municipal de Habitação (Porto Alegre)",
  CEIC: "Centro Integrado de Coordenação e Serviços da Cidade de Porto Alegre",
  "Comissão Permanente de Atuação em Emergências (Copae)":
    "Comissão Permanente de Atuação em Emergências",
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
  Pisa: "Programa Integrado Socioambiental",
  Socioambiental: "Programa Integrado Socioambiental",
  "Primeira Infância Melhor no Contexto Prisional (Pim Prisional)":
    "Primeira Infância Melhor no Contexto Prisional",
  "Salão Nobre": "Salão Nobre (Paço Municipal de Porto Alegre)",
  "Salão Nobre do Paço Municipal":
    "Salão Nobre (Paço Municipal de Porto Alegre)",
  "Sala dos Embaixadores":
    "Sala dos Embaixadores (Paço Municipal de Porto Alegre)",
  Visita: "Official visits involving the Municipality of Porto Alegre",
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
  Carris: "Companhia Carris Porto-Alegrense",
  "Companhia Carris Porto Alegrense": "Companhia Carris Porto-Alegrense",
  "Assistência Farmacêutica": "Assistência Farmacêutica (Porto Alegre)",
  "Centro Humanístico Vida": "Vida Centro Humanístico",
  "Coordenação Municipal de Urgências (CMU)":
    "Coordenação Municipal de Urgências (Porto Alegre)",
  "#eufaçopoa": "EuFaçoPOA",
  "Plano de ação Porto Alegre Forte": "Porto Alegre Forte",
  "Programa de Residência Técnico-Superior (PRTS)":
    "Programa de Residência Técnico-Superior",
  "Lei Orçamentária Anual (LOA)": "Lei Orçamentária Anual",
  "Proposta orçamentária 2019": "Proposta orçamentária 2019 (Porto Alegre)",
  "Tapa Buracos": "Operação Tapa-Buracos",
  "Prefeitura Nos Bairros": "Prefeitura nos Bairros",
  ROMU: "Ronda Ostensiva Municipal in Porto Alegre",
  Controladoria: "Controladoria-Geral do Município de Porto Alegre",
  Resiliência: "Plano de Resiliência (Porto Alegre)",
  "Diversidade sexual": "Coordenadoria de Diversidade Sexual",
  "Op 2017": "Orçamento Participativo 2017",
  "Lei Seca": "Lei Seca (Porto Alegre)",
  "Programa de Trabalho Educativo (PTE)": "Programa de Trabalho Educativo",
  "Projeto Mais Comunidade": "Mais Comunidade",
  "Núcleo Municipal de Segurança do Paciente":
    "Núcleo Municipal de Segurança do Paciente de Porto Alegre",
  "Segurança do Paciente":
    "Núcleo Municipal de Segurança do Paciente de Porto Alegre",
  "Comitê do Projeto Vida no Trânsito": "Projeto Vida no Trânsito",
  "Campanha do Brinquedo Solidário":
    "Campanha do Brinquedo Solidário (Porto Alegre)",
  "Oficina ‘Rabiscando Ideias: Da cabeça para o papel’":
    "Rabiscando Ideias - Da cabeça para o papel",
  "Espetáculo O Rei da Vela": "O Rei da Vela",
  "Projeto Kilombinho de Verão": "Kilombinho de Verão",
  "Pacto Pela Inovação": "Pacto Alegre",
  "Lançamento do Pacto Pela Inovação - Pacto Alegre": "Pacto Alegre",
  "Reurbanização da Vila Tronco": "Vila Tronco Urban Renewal",
  "Grupo POA Solidárias": "POA Solidária",
  "Moradores do Alameda Partenon": "Alameda Partenon",
  "Núcleo de Ações Preventivas (NAP)": "Núcleo de Ações Preventivas",
  "Incluir + POA": "Incluir+POA",
  "Termo de Adoção de Verde Complementar": "Adoção de Verde Complementar",
  "Cerimônia de Apresentação de PLs de Concessão e Adoção":
    "Adoção de Verde Complementar",
  "Portal da Transparência": "Portal da Transparência EPTC",
  "Programa Teste e Trate": "Teste e Trate",
  cachorródromo: "Cachorródromo",
  "Plano de Mobilidade de Porto Alegre (MobiliPOA)": "MobiliPOA",
  "Encontro com as Associação das Empresas dos Bairros Humaitá e Navegantes":
    "Associação das Empresas dos Bairros Humaitá e Navegantes",

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

  "Comissão de Saúde e Meio Ambiente da CMPA (Cosmam)":
    "Comissão de Saúde e Meio Ambiente da CMPA",
  PGM: "Procuradoria-Geral do Município de Porto Alegre",
  Corregedoria: "Corregedoria-Geral do Município de Porto Alegre",

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
  "Reunião com  a ASCONTEC":
    "Associação dos Auditores e Técnicos de Controle Interno da Prefeitura de Porto Alegre",

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
  PUCRS: "Pontifícia Universidade Católica do Rio Grande do Sul",
  "Café Coworking do Parque Científico e Tecnológico da PUCRS (TecnoPuc)":
    "Café Coworking do TecnoPuc",
  "Escola de Gestão Pública (EGP)": "Escola de Gestão Pública (Porto Alegre)",
  Uniritter: "Centro Universitário Ritter dos Reis",
  Estácio: "Faculdade Estácio",
  Ulbra: "Universidade Luterana do Brasil",
  "Escola Superior de Direito Municipal - ESDM":
    "Escola Superior de Direito Municipal",

  //Escolas
  "(Emei JP) Cantinho Amigo": "EMEI JP Cantinho Amigo",
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

  "Sindicato dos Municipários de Porto Alegre (Simpa)":
    "Sindicato dos Municipários de Porto Alegre",
  Sindha: "Sindicato de Hospedagem e Alimentação de Porto Alegre e Região",
  "Associação dos Transportadores de Caçamba Estacionárias (ATCE)":
    "Associação dos Transportadores de Caçambas Estacionárias",
  "Banda Municipal": "Banda Municipal de Porto Alegre",

  "Igreja Nossa Senhora das Dores":
    "Igreja Nossa Senhora das Dores (Porto Alegre)",
  "Assembléia Legislativa": "Legislative Assembly of Rio Grande do Sul",
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
  "Centro de Atenção Psicossocial Álcool e Drogas (CAPS AD)":
    "Centros de Atenção Psicossocial Álcool e Drogas",
  "Unidade de Saúde Orfanotrófrio": "Unidade de Saúde Orfanotrófio",
  "Unidade de Saúde Animal Victória (Usav)": "Unidade de Saúde Animal Victória",
  "Hospital de Clínicas de Porto Alegre (HCPA)":
    "Hospital de Clínicas de Porto Alegre",
  "Grupo Hospitalar Conceição (GHC)": "Grupo Hospitalar Conceição",
  "Hospital da Restinga Extremo Sul (HRES)": "Hospital Restinga e Extremo-Sul",
  "Pronto Atendimento de Traumatologia e Ortopedia no Hospital Restinga Extremo Sul":
    "Emergency Trauma and Orthopedic Care at Hospital Restinga e Extremo-Sul",

  "Tribunal de Contas do Estado do Rio Grande do Sul (TCE-RS)":
    "Tribunal de Contas do Estado do Rio Grande do Sul",
  "Sede do Tribunal de Contas do Estado (TCE)":
    "Tribunal de Contas do Estado do Rio Grande do Sul",
  "TJ-RS": "Tribunal de Justiça do Estado do Rio Grande do Sul",

  "Teatro da Santa Casa": "Teatro da Santa Casa (Porto Alegre)",
  "Teatro do Sesc": "Teatro do Sesc (Porto Alegre)",
  "Teatro do Sesi": "Teatro do Sesi (Porto Alegre)",

  "Auditório da SMPG":
    "Auditório da Secretaria Municipal de Planejamento de Gestão",
  "Auditório da SMED": "Auditório da Secretaria Municipal de Educação",
  "Auditório do Ministério Público":
    "Auditório do Ministério Público (Porto Alegre)",
  "Auditório da Puc": "Auditório Prédio 11",
  "Auditório do Departamento Municipal de Habitação (Demhab)":
    "Auditório do Departamento Municipal de Habitação",

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
  "Fonte Talavera": "Fonte Talavera de La Reina",
  "Mercado Público Central": "Mercado Público de Porto Alegre",
  "Mercado Público": "Mercado Público de Porto Alegre",
  Brechó: "Brechocão",
  "Arquivo Histórico Moysés Vellinho":
    "Arquivo Histórico de Porto Alegre Moysés Vellinho",
  PoaHub: "Poa.Hub",
  "Chalé da Praça XV de Novembro": "Chalé da Praça XV",
  "Theatro São Pedro": "Theatro São Pedro (Porto Alegre)",
  "Sala Aldo Locatelli": "Pinacoteca Aldo Locatelli",
  Laçador: "Estátua do Laçador",
  "Cemitério da Santa Casa de Misericórdia":
    "Cemitério da Santa Casa de Misericórdia (Porto Alegre)",
  BarraShoppingSul: "Barra Shopping Sul",
  "Monumento ao Expedicionário": "Monumento ao Expedicionário (Porto Alegre)",
  "Centro de Eventos da Amrigs": "Centro de Eventos da AMRIGS",
  "Centro Social Marista - CESMAR": "Centro Social Marista",
  "Sede do Detran -RS": "DetranRS",
  "Departamento Estadual de Trânsito (Detran)": "DetranRS",
  "Monumento à Elis Regina": "Monumento a Elis Regina",
  "Centro da Comunidade Parque Madepinho (Cecopam)":
    "Centro da Comunidade Parque Madepinho",
  "Conserto Didático da Banda Municipal de Porto Alegre":
    "Banda Municipal de Porto Alegre",
  "Centro de Artes e Esporte da Restinga (CEU)":
    "Centro de Artes e Esporte da Restinga",
  "Observatório de Porto Alegre": "ObservaPOA",
  "Hotel Deville": "Hotel Deville Prime Porto Alegre",

  "Região Metropolitana": "Região Metropolitana de Porto Alegre",
  "4º Distrito": "4º Distrito (Porto Alegre)",
  "Quarto Distrito": "4º Distrito (Porto Alegre)",
  "Zona Norte": "Zona Norte (Porto Alegre)",
  "Zona Sul": "Zona Sul (Porto Alegre)",
  "Entrega de Matrículas de Regularização para Moradores da Zona Sul":
    "Zona Sul (Porto Alegre)",
  "Zona Leste": "Zona Leste (Porto Alegre)",
  "Arquipélago (Ilhas)": "Islands of Porto Alegre",
  "Ilha dos Marinheiros": "Ilha dos Marinheiros (Porto Alegre)",
  "Bairro Anchieta": "Anchieta (Porto Alegre)",
  "Bairro Auxiliadora": "Auxiliadora",
  "Bairro Azenha": "Azenha",
  "Bairro Bela Vista": "Bela Vista (Porto Alegre)",
  "Bairro Belém Novo": "Belém Novo",
  "Bairro Belém Velho": "Belém Velho",
  "Bairro Boa Vista": "Boa Vista (Porto Alegre)",
  "Bairro Bom Fim": "Bom Fim",
  "Bairro Bom Jesus": "Bom Jesus (Porto Alegre)",
  "Bairro Camaquã": "Camaquã (Porto Alegre)",
  Camaquã: "Camaquã (Porto Alegre)",
  "Bairro Campo Novo": "Campo Novo (Porto Alegre)",
  "Bairro Cavalhada": "Cavalhada (Porto Alegre)",
  "Bairro Chapéu do Sol": "Chapéu do Sol",
  "Bairro Cidade Baixa": "Cidade Baixa (Porto Alegre)",
  "Bairro Coronel Aparício Borges": "Coronel Aparício Borges",
  "Bairro Cruzeiro": "Cruzeiro (Porto Alegre)",
  "Bairro Farrapos": "Farrapos (Porto Alegre)",
  "Bairro Glória": "Glória (Porto Alegre)",
  "Bairro Guarujá": "Guarujá (Porto Alegre)",
  "Bairro Higienópolis": "Higienópolis (Porto Alegre)",
  "Bairro Hípica": "Hípica",
  "Bairro Humaitá": "Humaitá (Porto Alegre)",
  "Bairro IAPI": "Vila do IAPI",
  "Bairro Ipanema": "Ipanema (Porto Alegre)",
  "Bairro Jardim Carvalho": "Jardim Carvalho",
  "Bairro Jardim Itu-Sabará": "Jardim Itu-Sabará",
  "Bairro Jardim Planalto": "Jardim Planalto (Porto Alegre)",
  "Bairro Lami": "Lami (Porto Alegre)",
  "Bairro Lomba do Pinheiro": "Lomba do Pinheiro",
  "Bairro Mário Quintana": "Mário Quintana (Porto Alegre)",
  "Bairro Medianeira": "Medianeira (Porto Alegre)",
  "Bairro Menino Deus": "Menino Deus (Porto Alegre)",
  "Menino Deus": "Menino Deus (Porto Alegre)",
  "Bairro Moinhos de Vento": "Moinhos de Vento",
  "Bairro Navegantes": "Navegantes (Porto Alegre)",
  Navegantes: "Navegantes (Porto Alegre)",
  "Bairro Nonoai": "Nonoai (Porto Alegre)",
  Nonoai: "Nonoai (Porto Alegre)",
  "Bairro Partenon": "Partenon (Porto Alegre)",
  Partenon: "Partenon (Porto Alegre)",
  "Bairro Ponta Grossa": "Ponta Grossa (Porto Alegre)",
  "Bairro Praia de Belas": "Praia de Belas",
  "Bairro Rubem Berta": "Rubem Berta (Porto Alegre)",
  "Bairro São Geraldo": "São Geraldo (Porto Alegre)",
  "Santa Cecília": "Santa Cecília (Porto Alegre)",
  "Bairro Santa Tereza": "Santa Tereza (Porto Alegre)",
  "Bairro Santo Antônio": "Santo Antônio (Porto Alegre)",
  "Bairro São João": "São João (Porto Alegre)",
  "Bairro São José": "São José (Porto Alegre)",
  "Bairro Sarandi": "Sarandi (Porto Alegre)",
  "Bairro Teresópolis": "Teresópolis (Porto Alegre)",
  "Bairro Tristeza": "Tristeza",
  "Bairro Vila Conceição": "Vila Conceição",
  "Bairro Vila Farrapos": "Vila Farrapos",
  "Morro Santana": "Morro Santana (Porto Alegre)",
  "Santa Maria Goretti": "Santa Maria Goretti (Porto Alegre)",
  "Vila Ipiranga": "Vila Ipiranga (Porto Alegre)",
  "Vila Nova": "Vila Nova (Porto Alegre)",
  "Capital Gaúcha": "Porto Alegre",
  "Aldeia do Morro do Osso": "Ymã Tupen Pãn",

  "Florianópolis-SC": "Florianópolis",

  "Orla Moacyr Scliar": "Parque Moacyr Scliar",
  "Pontal do Estaleiro": "Parque Pontal do Estaleiro",
  "Parque Ararigbóia": "Parque Ararigboia",

  "Avenida Ipiranga": "Avenida Ipiranga (Porto Alegre)",
  "Avenida João Pessoa": "Avenida João Pessoa (Porto Alegre)",
  "Avenida Castello Branco": "Avenida Presidente Castello Branco",
  "Entrada da cidade": "Avenida Presidente Castello Branco",
  "Av. Mauá": "Avenida Mauá",
  "Av. Tronco": "Avenida Moab Caldas",
  "Moab Caldas": "Avenida Moab Caldas",
  "Avenida Voluntários da Pátria": "Rua Voluntários da Pátria (Porto Alegre)",
  "Av. Wenceslau Escobar": "Avenida Wenceslau Escobar",
  "Praça Revolução Farroupilha (Trensurb)": "Praça Revolução Farroupilha",
  "Praça Montevideo": "Praça Montevidéu",
  "Praça da Matriz": "Praça da Matriz (Porto Alegre)",
  "Praça Parobé": "Praça Pereira Parobé",
  "Viaduto Conceição": "Viaduto da Conceição",
  "Baronesa do Gravataí": "Rua Baronesa do Gravataí",
  "Trincheira da Ceará": "Trincheira da Avenida Ceará",
  "Rua Olavo Bilac": "Rua Olavo Bilac (Porto Alegre)",
  "calçadão de Ipanema": "Calçadão de Ipanema (Porto Alegre)",

  "Exército Brasileiro": "Army of Brazil",
  "Forças Armadas": "Army of Brazil",
  "Marinha do Brasil": "Brazilian Navy",
  "Ministerio Público - RS": "Ministério Público do Rio Grande do Sul",
  "Governo Federal": "Federal government of Brazil",
  "Lei de Diretrizes Orçamentárias (LDO)": "Lei de Diretrizes Orçamentárias",
  SESI: "Serviço Social da Indústria",
  Fecomércio: "Fecomércio-RS",
  "Comissão de Combate à Informalidade": "Fecomércio-RS",
  MEC: "Ministério da Educação (Brazil)",
  Justiça: "Ministry of Justice (Brazil)",
  Conaf: "Conselho Nacional de Controle Interno",
  ABRH: "Associação Brasileira de Recursos Humanos",
  Sebrae: "SEBRAE Rio Grande do Sul",
  "OAB-RS": "Ordem dos Advogados do Brasil - Rio Grande do Sul",
  "Fundação O Pão dos Pobres": "Fundação Pão dos Pobres",
  "Obras da Copa de 2014": "2014 FIFA World Cup Construction Projects",
  Apae: "Associação de Pais e Amigos dos Excepcionais",
  IPTU: "Imposto sobre a Propriedade Predial e Territorial Urbana",
  "Centro de Informações Estratégicas em Vigilância em Saúde (Cievs)":
    "Centro de Informações Estratégicas em Vigilância em Saúde",
  Ideb: "Índice de Desenvolvimento da Educação Básica",
  "Departamento Nacional de Infraestrutura de Transportes (Dnit)":
    "Departamento Nacional de Infraestrutura de Transportes",
  "Centro de Integração Empresa Escola do Rio Grande do Sul (CIEE-RS)":
    "Centro de Integração Empresa-Escola do Rio Grande do Sul",
  "Fórum de Justiça e Segurança do Centro":
    "Fórum de Justiça e Segurança (Porto Alegre)",
  "Professora Finalista do Prêmio RBS de Educação 2018":
    "Prêmio RBS de Educação 2018",
  "Romaria de Santa Maria": "Romaria da Medianeira",
  "Associação Internacional de Parques Científicos e Áreas de Inovação (IASP)":
    "International Association of Science Parks and Areas of Innovation",
  "Olimpíada Brasileira de Matemática - OBMEP":
    "Olimpíada Brasileira de Matemática das Escolas Públicas",

  "Programa Família Acolhedora": "Família Acolhedora",
  "Programa Melhor em Casa": "Melhor em Casa",
  "Programa Saúde na Escola (PSE)": "Programa Saúde na Escola",
  'programa "Lean nas Emergências"': "Lean nas Emergências",
  "Programa Nacional de Gestão de Custos (PNGC)":
    "Programa Nacional de Gestão de Custos",
  "Programa Jovem Aprendiz": "Jovem Aprendiz",

  "Cônsul do Japão em Porto Alegre": "Relations of Brazil and Japan",
  "Cônsul da Ucrânia no Brasil": "Relations of Brazil and Ukraine",

  "Festival de Inverno": "Festival de Inverno (Porto Alegre)",
  //Greve: "General strike in Brazil (2017-06-30)",
  "Dia do Desafio": "Challenge Day",
  "Semana do Japão": "Semana do Japão (Porto Alegre)",
  "48º Troféu Seival e 29ª Regata Farroupilha":
    "48º Troféu Seival e 29ª Regata Farroupilha (2018)",
  "SMC - 1ª Invernada Farroupilha Paixão Cortes 2018 Mostra de Dança":
    "1ª Invernada Farroupilha Paixão Cortes 2018 Mostra de Dança",
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

  "Brigada Militar": "Brigada Militar do Rio Grande do Sul",
  Trabalho: "Festa de Nossa Senhora do Trabalho",
  Metas: "Prometas",
  Unisinos: "Universidade do Vale do Rio dos Sinos (Porto Alegre campus)",
  "Caminhos Rurais": "Caminhos Rurais de Porto Alegre",
  Parcão: "Parque Moinhos de Vento",
  "Aniversário do Parque Moinhos de Vento": "Parque Moinhos de Vento",
  "Cais do Porto": "Cais Mauá",
  Unesco: "UNESCO",
  "Fórum da Liberdade": "30º Fórum da Liberdade (2017)",
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
  "Associação Comercial de Porto Alegre (ACPA)":
    "Associação Comercial de Porto Alegre",
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

  Santander: "Banco Santander (Brasil)",
  "Banco Nacional de Desenvolvimento Econômico e Social (BNDES)":
    "Banco Nacional de Desenvolvimento Econômico e Social",
  "Banco de Desarrollo de América Latina (CAF )":
    "Banco de Desarrollo de América Latina",

  Lazer: "Recreation in Porto Alegre",
  Farmácia: "Farmácias Distritais (Porto Alegre)",
  roubo: "Crime in Porto Alegre",
  Flagrante: "Crime in Porto Alegre",
  Ambulância: "Ambulances in Porto Alegre",
  Procissão: "Processions in Porto Alegre",
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
  Espetáculo: "Shows in Porto Alegre",
  Hipismo: "Equestrian sports in Porto Alegre",
  Comunicação: "Communication in Porto Alegre",
  Flora: "Flora of Porto Alegre",
  Tradição: "Traditions of Porto Alegre",
  Emprego: "Labour in Porto Alegre",
  Renda: "Labour in Porto Alegre",
  pessoas: "People of Porto Alegre",
  Seminário: "Seminars in Porto Alegre",
  Palestra: "Presentations in Porto Alegre",
  Apresentação: "Presentations in Porto Alegre",
  "Trabalho e Emprego": "Labour in Porto Alegre",
  "Vagas de Emprego": "Labour in Porto Alegre",
  "Indústria e Comércio": "Industry in Porto Alegre",
  "Artes Cênicas": "Performing arts in Porto Alegre",
  "Transporte Público": "Public transport in Porto Alegre",
  "Transporte Coletivo": "Public transport in Porto Alegre",
  "Ruas e avenidas": "Streets in Porto Alegre",
  "Artes Visuais": "Art of Porto Alegre",
  "Fios Soltos": "Overhead power lines in Porto Alegre",
  "foco de lixo": "Waste management in Porto Alegre",
  "Terminais de ônibus": "Bus stations in Porto Alegre",
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
  "Patrimônio Histórico e Cultural do município":
    "Cultural heritage monuments in Porto Alegre",
  "1ª Faixa Reversível semafórica de Porto Alegre":
    "Road transport infrastructure in Porto Alegre",
  "Radar de Trânsito": "Speed cameras in Porto Alegre",
  "Cabines Telefônicas": "Telephone booths in Porto Alegre",
  "foto noturna": "Night in Porto Alegre",
  "Aldeia Kaingang": "Kaingang villages in Porto Alegre",
  "Zona Rural": "Countryside in Porto Alegre",

  Páscoa: metadata =>
    `Easter ${getYear(metadata.humanReadableDate)} in Porto Alegre`,
  Natal: metadata =>
    `Christmas ${getYear(metadata.humanReadableDate)} in Porto Alegre`,
  "Dia da Independência": metadata =>
    `Independence Day ${getYear(metadata.humanReadableDate)} in Porto Alegre`,

  Nuvens: "Clouds in Rio Grande do Sul",
  Futsal: "Futsal in Rio Grande do Sul",
  "Indumentária Gaúcha": "Costumes in Rio Grande do Sul",

  Infográfico: "Information graphics of Brazil",
  Vôlei: "Volleyball in Brazil",
  Handebol: "Handball in Brazil",
  Campeonato: "Competitions in Brazil",
  Concurso: "Competitions in Brazil",
  Posse: "Oaths of office in Brazil",
  Servidor: "Civil servants of Brazil",
  Aluno: "Students in Brazil",
  Alunos: "Students in Brazil",
  Estudantes: "Students in Brazil",
  Licitações: "Auctions in Brazil",
  Transparência: "Open government in Brazil",
  Empreendedorismo: "Entrepreneurship in Brazil",
  Adolescente: "Teenagers of Brazil",
  Poda: "Pruning in Brazil",
  Remanejo: "Pruning in Brazil",
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
  Previdência: "Social insurance in Brazil",
  Câncer: "Cancer in Brazil",
  Amamentação: "Breastfeeding in Brazil",
  "Aleitamento materno": "Breastfeeding in Brazil",
  Imigrantes: "Immigration in Brazil",
  Basquete: "Basketball in Brazil",
  Simpósio: "Symposia in Brazil",
  Audiência: "Audiences (meeting) in Brazil",
  Hanseníase: "Leprosy in Brazil",
  Retrato: "Portrait photographs of politicians of Brazil",
  Formatura: "Graduation ceremonies in Brazil",
  Casamento: "Collective weddings in Brazil",
  Oficina: "Workshops (meetings) in Brazil",
  Workshop: "Workshops (meetings) in Brazil",
  "Aula aberta": "Workshops (meetings) in Brazil",
  "Workshop Gestão da Inovação na Administração Pública":
    "Workshops (meetings) in Brazil",
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
  Debate: "Political debates in Brazil",
  Painel: "Political debates in Brazil",
  óculos: "Glasses in Brazil",
  oftalmologista: "Ophthalmologists from Brazil",
  Verão: "Summer in Brazil",
  Talude: "Embankments in Brazil",
  votação: "Voting in Brazil",
  "Bloqueio químico": "Fogging against Aedes aegypti in Brazil",
  "febre amarela": "Yellow fever in Brazil",
  "Comissão da Pessoa com Deficiência": "Disability in Brazil",
  "Pessoa com Deficiência": "Disability in Brazil",
  "Artes Plásticas": "Visual arts of Brazil",
  "Educação Ambiental": "Environmental education in Brazil",
  "Ação Social": "Social work in Brazil",
  "Plano Diretor": "Urban planning in Brazil",
  "Medicina Veterinária": "Veterinary medicine in Brazil",
  "vacina contra a Dengue": "Dengue vaccine in Brazil",
  "troféu Prefeito Inovador": "Awards of Brazil",
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
  "Educação no Trânsito": "Road safety education in Brazil",
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

  "Dia da Mulher": metadata =>
    `International Women's Day in ${getYear(
      metadata.humanReadableDate
    )} in Brazil`,
  Criança: metadata =>
    `Children of Brazil in ${getYear(metadata.humanReadableDate)}`,
  "Programação do Reveillon": metadata =>
    `New Year ${getYear(metadata.humanReadableDate)} in Brazil`,

  Transexualidade: "Transgender in South America",

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
  "Carnaval de Rua": "Street carnival",
  Cidadania: "Civil society",
  Interdição: "Forced business closures",
  "Inclusão Social": "Social inclusion",
  Mulher: "Gender equality",
  Medicamentos: "Pharmaceutical drugs",
  Sangue: "Blood collection",
  Caminhada: "Walks (event)",
  "Resíduos Sólidos": "Solid waste management",
  "Bloqueio no trânsito": "Closed roads",
  Apreensão: "Confiscation",
  "Ação Integrada": "Community-driven programs",
  "Saúde Bucal": "Oral health",
  Convite: "Invitations",
  Lançamento: "Product launches",
  Pavimentação: "Road paving",
  Flashmob: "Flash mobs",
  "Centro de triagem": "Screening centers",
  Monitoramento: "Monitoring",
  Premiação: "Prizes",
  "Cidades Inteligentes": "Smart cities",
  "Câncer Bucal": "Oral cancer",
  Nutrição: "Nutrition",
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
  Assinatura: "Signing ceremonies",
  Certificado: "School certificates",
  Homenagem: "Homages to people",
  "doação e transplante de órgãos": "Organ donation",
  "Inspeção veicular": "Vehicle inspection",
  "Educação Permanente": "Professional development and training",
  "Agentes de Fiscalização": "Inspectors",
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
};
