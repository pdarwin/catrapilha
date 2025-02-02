import { getYear } from "../../Utils/DateUtils";

// Define a mapping of tags to categories
export const tagToCategoryMap = {
  Segurança: "Secretaria Municipal de Segurança (Porto Alegre)",
  Seguranç: "Secretaria Municipal de Segurança (Porto Alegre)",
  Smseg: "Secretaria Municipal de Segurança (Porto Alegre)",
  "Secretaria Municipal de Segurança (SMSEG)":
    "Secretaria Municipal de Segurança (Porto Alegre)",
  "SMSEG - Segurança": "Secretaria Municipal de Segurança (Porto Alegre)",
  "Desenvolvimento Social":
    "Secretaria Municipal de Desenvolvimento Social (Porto Alegre)",
  Smdse: "Secretaria Municipal de Desenvolvimento Social (Porto Alegre)",
  Smds: "Secretaria Municipal de Desenvolvimento Social (Porto Alegre)",
  Smdes: "Secretaria Municipal de Desenvolvimento Social (Porto Alegre)",
  "Secretaria Municipal de Desenvolvimento Social (SMDS)":
    "Secretaria Municipal de Desenvolvimento Social (Porto Alegre)",
  "Desenvolvimento Social e Esporte":
    "Secretaria Municipal de Desenvolvimento Social (Porto Alegre)",
  "Desenvolvimento Economico e Esporte":
    "Secretaria Municipal de Desenvolvimento Econômico (Porto Alegre)",
  "Secretaria Municipal de Desenvolvimento Econômico e Turismo (SMDET)":
    "Secretaria Municipal de Desenvolvimento Econômico e Turismo (Porto Alegre)",
  "Meio Ambiente":
    "Secretaria Municipal do Meio Ambiente e Sustentabilidade (Porto Alegre)",
  "Meio Ambiente e Sustentabilidade":
    "Secretaria Municipal do Meio Ambiente e Sustentabilidade (Porto Alegre)",
  Smams:
    "Secretaria Municipal do Meio Ambiente e Sustentabilidade (Porto Alegre)",
  "Secretaria Municipal de Meio Ambiente, Urbanismo e Sustentabilidade (SMAMUS)":
    "Secretaria Municipal de Meio Ambiente, Urbanismo e Sustentabilidade (Porto Alegre)",
  "Meio Ambiente, Urbanismo e Sustentabilidade":
    "Secretaria Municipal de Meio Ambiente, Urbanismo e Sustentabilidade (Porto Alegre)",
  "Planejamento e Gestão":
    "Secretaria Municipal de Planejamento e Gestão (Porto Alegre)",
  "Gestão e Planejamento":
    "Secretaria Municipal de Planejamento e Gestão (Porto Alegre)",
  Smpg: "Secretaria Municipal de Planejamento e Gestão (Porto Alegre)",
  Planejamento: "Secretaria Municipal de Planejamento e Gestão (Porto Alegre)",
  "Secretaria Municipal de Planejamento e Assuntos Estratégicos (SMPAE)":
    "Secretaria Municipal de Planejamento e Assuntos Estratégicos (Porto Alegre)",
  "Planejamento e Assuntos Estratégicos":
    "Secretaria Municipal de Planejamento e Assuntos Estratégicos (Porto Alegre)",
  "Infraestrutura e Mobilidade":
    "Secretaria Municipal de Infraestrutura e Mobilidade (Porto Alegre)",
  "Infraestrutura e Mobilidade Urbana":
    "Secretaria Municipal de Infraestrutura e Mobilidade (Porto Alegre)",
  "Secretaria Municipal de Mobilidade Urbana (SMMU)":
    "Secretaria Municipal de Mobilidade Urbana (Porto Alegre)",
  "Mobilidade Urbana":
    "Secretaria Municipal de Mobilidade Urbana (Porto Alegre)",
  Smim: "Secretaria Municipal de Mobilidade Urbana (Porto Alegre)",
  "Secretaria Municipal de Obras e Infraestrutura (SMOI)":
    "Secretaria Municipal de Obras e Infraestrutura (Porto Alegre)",
  "Obras e Infraestrutura":
    "Secretaria Municipal de Obras e Infraestrutura (Porto Alegre)",
  "Infraestrutura e Urbanismo":
    "Secretaria Municipal de Obras e Infraestrutura (Porto Alegre)",
  "Relações Institucionais":
    "Secretaria Municipal de Relações Institucionais (Porto Alegre)",
  Smri: "Secretaria Municipal de Relações Institucionais (Porto Alegre)",
  "Esportes, Recreação e Lazer":
    "Secretaria Municipal de Esportes, Recreação e Lazer",
  "Esportes e Lazer": "Secretaria Municipal de Esportes, Recreação e Lazer",
  Seda: "Secretaria Municipal dos Direitos Animais (Porto Alegre)",
  "Secretaria Municipal de Cultura e Economia Criativa (SMCEC)":
    "Secretaria Municipal de Cultura e Economia Criativa (Porto Alegre)",
  "Cultura e Economia Criativa":
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
  "Secretaria Municipal de Transparência e Controladoria (SMTC)":
    "Secretaria Municipal de Transparência e Controladoria (Porto Alegre)",
  "Secretaria Municipal de Governança Local e Coordenação Política (SMGOV)":
    "Secretaria Municipal de Governança Local e Coordenação Política (Porto Alegre)",
  "Governança Local e Coordenação Política":
    "Secretaria Municipal de Governança Local e Coordenação Política (Porto Alegre)",
  "Secretaria Municipal de Habitação e Regularização Fundiária (SMHARF)":
    "Secretaria Municipal de Habitação e Regularização Fundiária (Porto Alegre)",
  "Habitação Regularização Fundiária":
    "Secretaria Municipal de Habitação e Regularização Fundiária (Porto Alegre)",
  "Habitação e Regularização Fundiária":
    "Secretaria Municipal de Habitação e Regularização Fundiária (Porto Alegre)",
  Parcerias: "Secretaria Municipal de Parcerias (Porto Alegre)",
  "Parcerias Estratégicas": "Secretaria Municipal de Parcerias (Porto Alegre)",
  "Secretaria Municipal de Parcerias (SMP)":
    "Secretaria Municipal de Parcerias (Porto Alegre)",
  "Secretaria Municipal de Administração e Patrimônio (SMAP)":
    "Secretaria Municipal de Administração e Patrimônio (Porto Alegre)",
  "Administração e Patrimônio":
    "Secretaria Municipal de Administração e Patrimônio (Porto Alegre)",
  "Administração É Patrimônio":
    "Secretaria Municipal de Administração e Patrimônio (Porto Alegre)",
  "Secretário Municipal de Administração e Patrimônio (SMAP)":
    "Secretaria Municipal de Administração e Patrimônio (Porto Alegre)",
  Smic: "Secretaria Municipal da Produção, Indústria e Comércio (Porto Alegre)",
  "Gabinete de Inovação (GI)": "Gabinete da Inovação (Porto Alegre)",
  "Comunicação Social": "Gabinete de Comunicação Social (Porto Alegre)",
  "Gabinete da Causa Animal (GCA)": "Gabinete da Causa Animal (Porto Alegre)",
  "Causa Animal": "Gabinete da Causa Animal (Porto Alegre)",
  Procuradoria: "Procuradoria-Geral do Município de Porto Alegre",
  PGM: "Procuradoria-Geral do Município de Porto Alegre",
  "Procuradoria Geral": "Procuradoria-Geral do Município de Porto Alegre",
  Secretariado: "Municipal secretariats of Porto Alegre",
  "Secretaria Extraordinária do Trabalho e da Qualificação Profissional (SMTQ)":
    "Secretaria Extraordinária do Trabalho e da Qualificação Profissional (Porto Alegre)",
  "Trabalho e Qualificação":
    "Secretaria Extraordinária do Trabalho e da Qualificação Profissional (Porto Alegre)",

  Procempa: "Companhia de Processamento de Dados do Município de Porto Alegre",
  "Companhia de Processamento de Dados do Município (Procempa)":
    "Companhia de Processamento de Dados do Município de Porto Alegre",
  DMLU: "Departamento Municipal de Limpeza Urbana (Porto Alegre)",
  Dmlu: "Departamento Municipal de Limpeza Urbana (Porto Alegre)",
  "Limpeza Urbana": "Departamento Municipal de Limpeza Urbana (Porto Alegre)",
  "Departamento Municipal de Habitação (Demhab)":
    "Departamento Municipal de Habitação (Porto Alegre)",
  "Departamento Municipal de Limpeza Urbana (DMLU)":
    "Departamento Municipal de Limpeza Urbana (Porto Alegre)",
  "Centro Integrado de Comando":
    "Centro Integrado de Comando da Cidade de Porto Alegre",
  "Centro Integrado de Comando da Cidade de Porto Alegre (CEIC)":
    "Centro Integrado de Comando da Cidade de Porto Alegre",
  CEIC: "Centro Integrado de Comando da Cidade de Porto Alegre",
  Ceic: "Centro Integrado de Comando da Cidade de Porto Alegre",
  "Comissão Permanente de Atuação em Emergências (Copae)":
    "Comissão Permanente de Atuação em Emergências",
  "Comissão de Saúde e Segurança no Trabalho":
    "Comissão de Saúde e Segurança no Trabalho (Porto Alegre)",
  "Defesa Civil": "Diretoria-Geral de Defesa Civil de Porto Alegre",
  "Defesa Cívil": "Diretoria-Geral de Defesa Civil de Porto Alegre",
  "Equipe de Manejo Arbóreo (EMA)": "Equipe de Manejo Arbóreo (Porto Alegre)",
  "Equipe de Vigilância em Saúde Ambiental e Águas (EVSAA)":
    "Equipe de Vigilância em Saúde Ambiental e Águas (Porto Alegre)",
  "Equipe de Vigilância de Alimentos da SMS":
    "Equipe de Vigilância de Alimentos (Porto Alegre)",
  "Vigilância de Alimentos": "Equipe de Vigilância de Alimentos (Porto Alegre)",
  DMAP: "DMAP (Porto Alegre)",
  DMAE: "Departamento Municipal de Água e Esgotos (Porto Alegre)",
  Dmae: "Departamento Municipal de Água e Esgotos (Porto Alegre)",
  Água: "Departamento Municipal de Água e Esgotos (Porto Alegre)",
  Esgoto: "Departamento Municipal de Água e Esgotos (Porto Alegre)",
  "Água e Esgotos": "Departamento Municipal de Água e Esgotos (Porto Alegre)",
  "Água e Esgoto": "Departamento Municipal de Água e Esgotos (Porto Alegre)",
  "Departamento Municipal de Água e Esgotos (DMAE)":
    "Departamento Municipal de Água e Esgotos (Porto Alegre)",
  "Rede de abastecimento de água":
    "Departamento Municipal de Água e Esgotos (Porto Alegre)",
  "redes de água": "Departamento Municipal de Água e Esgotos (Porto Alegre)",
  "Sine Municipal": "Sine Municipal (Porto Alegre)",
  EPTC: "Empresa Pública de Transporte e Circulação de Porto Alegre",
  "Empresa Pública de Transporte e Circulação (EPTC)":
    "Empresa Pública de Transporte e Circulação de Porto Alegre",
  "Coordenação de Operações Especiais (COE)":
    "Empresa Pública de Transporte e Circulação de Porto Alegre",
  Fasc: "Fundação de Assistência Social e Cidadania",
  "Fundação de Assistência Social e Cidadania – Fasc":
    "Fundação de Assistência Social e Cidadania",
  Legislativo: "Câmara Municipal de Porto Alegre",
  "Câmara Municipal de Porto Alegre (CMPA)": "Câmara Municipal de Porto Alegre",
  vereador: "City councillors of Porto Alegre",
  Vereadores: "City councillors of Porto Alegre",
  Pisa: "Programa Integrado Socioambiental",
  Socioambiental: "Programa Integrado Socioambiental",
  "Primeira Infância Melhor (PIM)": "Primeira Infância Melhor",
  "Salão Nobre": "Salão Nobre (Paço Municipal de Porto Alegre)",
  "Salão Nobre do Paço Municipal":
    "Salão Nobre (Paço Municipal de Porto Alegre)",
  "Sala dos Embaixadores":
    "Sala dos Embaixadores (Paço Municipal de Porto Alegre)",
  "Restaurante Popular": "Restaurantes Populares",
  Visita: "Official visits involving the Municipality of Porto Alegre",
  "Visita de Cortesia":
    "Official visits involving the Municipality of Porto Alegre",
  "Viagem à Brasília":
    "Official visits involving the Municipality of Porto Alegre",
  "Viagem à Europa":
    "Official visits involving the Municipality of Porto Alegre",
  Convênio: "Partnerships involving the Municipality of Porto Alegre",
  "Coletiva de Imprensa":
    "Press conferences by the Municipality of Porto Alegre",
  "Entrevista Coletiva":
    "Press conferences by the Municipality of Porto Alegre",
  "Rede Municipal de Ensino": "Rede Municipal de Ensino (Porto Alegre)",
  "Núcleo de Imunizações DVS (NI)": "Núcleo de Imunizações DVS (Porto Alegre)",
  "Diretoria de Vigilância em Saúde (DVS)":
    "Diretoria de Vigilância em Saúde de Porto Alegre",
  "Vigilância em Saúde": "Diretoria de Vigilância em Saúde de Porto Alegre",
  "Vigilância Sanitária": "Diretoria de Vigilância em Saúde de Porto Alegre",
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
  "(Emei JP) Cantinho Amigo": "EMEI JP Cantinho Amigo",
  "Emei Ilha da Pintada": "EMEI Ilha da Pintada",
  "Emeb Liberato Salzano Vieira da Cunha":
    "EMEB Liberato Salzano Vieira da Cunha",
  "#eufaçopoa": "EuFaçoPOA",
  "Plano de ação Porto Alegre Forte": "Porto Alegre Forte",
  "Programa de Residência Técnico-Superior (PRTS)":
    "Programa de Residência Técnico-Superior",
  "Lei Orçamentária Anual (LOA)": "Lei Orçamentária Anual",
  "Tapa Buracos": "Operação Tapa-Buracos",
  "Prefeitura Nos Bairros": "Prefeitura nos Bairros",
  ROMU: "Ronda Ostensiva Municipal in Porto Alegre",
  Controladoria: "Controladoria-Geral do Município de Porto Alegre",
  Resiliência: "Plano de Resiliência (Porto Alegre)",
  "Diversidade sexual": "Coordenadoria de Diversidade Sexual",
  "População Negra": "Saúde da População Negra",
  "Povo Negro": "Saúde da População Negra",
  "Op 2017": "Orçamento Participativo 2017",
  "Lei Seca": "Lei Seca (Porto Alegre)",
  CRIPs: "Centros de Relação Institucional Participativa",

  "Conselho Municipal de Saúde": "Conselho Municipal de Saúde (Porto Alegre)",
  "Casa dos Conselhos": "Casa dos Conselhos (Porto Alegre)",
  COMTU: "Conselho Municipal de Transportes Urbanos (Porto Alegre)",
  CMDUA:
    "Conselho Municipal de Desenvolvimento Urbano Ambiental (Porto Alegre)",
  "Auditório da SMPG":
    "Auditório da Secretaria Municipal de Planejamento de Gestão",

  Senac: "Serviço Nacional de Aprendizagem Comercial",
  Famurs: "Federação das Associações de Municípios do Rio Grande do Sul",
  Granpal: "Associação dos Municípios da Região Metropolitana de Porto Alegre",
  "Associação dos Auditores Fiscais da Receita Municipal de Porto Alegre (Aiamu)":
    "Associação dos Auditores Fiscais da Receita Municipal de Porto Alegre",
  "CDL Porto Alegre": "Câmara de Dirigentes Lojistas de Porto Alegre",

  "Universidade Federal de Ciências da Saúde de Porto Alegre (UFCSPA)":
    "Universidade Federal de Ciências da Saúde de Porto Alegre",
  "Universidade Federal do Rio Grande do Sul (UFRGS)":
    "Universidade Federal do Rio Grande do Sul",
  PUCRS: "Pontifícia Universidade Católica do Rio Grande do Sul",
  "Pontifícia Universidade Católica do RS (PUCRS)":
    "Pontifícia Universidade Católica do Rio Grande do Sul",
  "Escola de Gestão Pública (EGP)": "Escola de Gestão Pública (Porto Alegre)",
  Uniritter: "Centro Universitário Ritter dos Reis",
  Estácio: "Faculdade Estácio",
  Ulbra: "Universidade Luterana do Brasil",
  "Emef Migrantes": "EMEF Migrantes",

  "Sindicato dos Municipários de Porto Alegre (Simpa)":
    "Sindicato dos Municipários de Porto Alegre",
  Sindha: "Sindicato de Hospedagem e Alimentação de Porto Alegre e Região",
  "Banda Municipal": "Banda Municipal de Porto Alegre",

  "Igreja Nossa Senhora das Dores":
    "Igreja Nossa Senhora das Dores (Porto Alegre)",
  "Assembléia Legislativa": "Legislative Assembly of Rio Grande do Sul",

  HMIPV: "Hospital Materno-Infantil Presidente Vargas",
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

  "Tribunal de Contas do Estado do Rio Grande do Sul (TCE-RS)":
    "Tribunal de Contas do Estado do Rio Grande do Sul",
  "Sede do Tribunal de Contas do Estado (TCE)":
    "Tribunal de Contas do Estado do Rio Grande do Sul",
  "TJ-RS": "Tribunal de Justiça do Estado do Rio Grande do Sul",
  "Teatro da Santa Casa": "Teatro da Santa Casa (Porto Alegre)",
  "Catedral Metropolitana de Porto Alegre (Matriz)":
    "Catedral Metropolitana de Porto Alegre",
  "Teatro do Sesc": "Teatro do Sesc (Porto Alegre)",
  "Palácio do Comércio": "Palácio do Comércio (Porto Alegre)",
  "Estação Rodoviária de Porto Alegre": "Rodoviária (Trensurb)",
  "Grêmio Sargento Expedicionário Geraldo Santana": "Grêmio Geraldo Santana",
  "Estádio Beira-rio": "Estádio Beira-Rio",
  "Ministério da Saúde": "Ministry of Health of Brazil",
  "Força Nacional do SUS": "Força Nacional do Sistema Único de Saúde",
  "Grupo Hospitalar Conceição (GHC)": "Grupo Hospitalar Conceição",
  "Complexo Cultural Porto Seco": "Complexo Cultural do Porto Seco",
  "comportas do Muro da Mauá": "Mauá Wall floodgates",
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
  "Arquivo Histórico Moysés Vellinho": "Arquivo histórico de Porto Alegre",
  PoaHub: "Poa.Hub",
  "Chalé da Praça XV de Novembro": "Chalé da Praça XV",
  "Theatro São Pedro": "Theatro São Pedro (Porto Alegre)",
  "Sala Aldo Locatelli": "Pinacoteca Aldo Locatelli",
  Laçador: "Estátua do Laçador",

  "Região Metropolitana": "Região Metropolitana de Porto Alegre",
  "4º Distrito": "4º Distrito (Porto Alegre)",
  "Quarto Distrito": "4º Distrito (Porto Alegre)",
  "Zona Norte": "Zona Norte (Porto Alegre)",
  "Zona Sul": "Zona Sul (Porto Alegre)",
  "Zona Leste": "Zona Leste (Porto Alegre)",
  "Arquipélago (Ilhas)": "Islands of Porto Alegre",
  "Ilha dos Marinheiros": "Ilha dos Marinheiros (Porto Alegre)",
  "Bairro Anchieta": "Anchieta (Porto Alegre)",
  "Bairro Auxiliadora": "Auxiliadora",
  "Bairro Azenha": "Azenha",
  "Bairro Bela Vista": "Bela Vista (Porto Alegre)",
  "Bairro Belém Novo": "Belém Novo",
  "Bairro Bom Fim": "Bom Fim",
  "Bairro Bom Jesus": "Bom Jesus (Porto Alegre)",
  "Bairro Camaquã": "Camaquã (Porto Alegre)",
  Camaquã: "Camaquã (Porto Alegre)",
  "Bairro Campo Novo": "Campo Novo (Porto Alegre)",
  "Bairro Cavalhada": "Cavalhada (Porto Alegre)",
  "Bairro Centro Histórico": "Centro (Porto Alegre)",
  "Centro Histórico": "Centro (Porto Alegre)",
  "Bairro Chapéu do Sol": "Chapéu do Sol",
  "Bairro Cidade Baixa": "Cidade Baixa (Porto Alegre)",
  "Bairro Cristal": "Cristal (Porto Alegre)",
  "Bairro Cruzeiro": "Cruzeiro (Porto Alegre)",
  "Bairro Farrapos": "Farrapos (Porto Alegre)",
  "Bairro Floresta": "Floresta (Porto Alegre)",
  "Bairro Glória": "Glória (Porto Alegre)",
  "Bairro Higienópolis": "Higienópolis (Porto Alegre)",
  "Bairro Hípica": "Hípica",
  "Bairro Humaitá": "Humaitá (Porto Alegre)",
  "Bairro Ipanema": "Ipanema (Porto Alegre)",
  "Bairro Jardim Carvalho": "Jardim Carvalho",
  "Bairro Jardim Itu-Sabará": "Jardim Itu-Sabará",
  "Bairro Lami": "Lami (Porto Alegre)",
  "Bairro Lomba do Pinheiro": "Lomba do Pinheiro",
  "Bairro Mário Quintana": "Mário Quintana (Porto Alegre)",
  "Bairro Medianeira": "Medianeira (Porto Alegre)",
  "Bairro Menino Deus": "Menino Deus (Porto Alegre)",
  "Menino Deus": "Menino Deus (Porto Alegre)",
  "Bairro Moinhos de Vento": "Moinhos de Vento",
  "Bairro Navegantes": "Navegantes (Porto Alegre)",
  Navegantes: "Navegantes (Porto Alegre)",
  "Bairro Partenon": "Partenon (Porto Alegre)",
  Partenon: "Partenon (Porto Alegre)",
  "Bairro Petrópolis": "Petrópolis (Porto Alegre)",
  Petrópolis: "Petrópolis (Porto Alegre)",
  "Bairro Ponta Grossa": "Ponta Grossa (Porto Alegre)",
  "Bairro Praia de Belas": "Praia de Belas",
  "bairro Restinga": "Restinga (Porto Alegre)",
  "Bairro Restinga": "Restinga (Porto Alegre)",
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
  Nonoai: "Nonoai (Porto Alegre)",
  "Vila Ipiranga": "Vila Ipiranga (Porto Alegre)",
  "Vila Nova": "Vila Nova (Porto Alegre)",
  "Capital Gaúcha": "Porto Alegre",

  "Orla Moacyr Scliar": "Parque Moacyr Scliar",
  "Parque Urbano da Orla Moacyr Scliar": "Parque Moacyr Scliar",
  "Orla do Guaíba": "Parque da Orla do Guaíba",
  "Pontal do Estaleiro": "Parque Pontal do Estaleiro",
  "Parque Ararigbóia": "Parque Ararigboia",

  "Avenida Ipiranga": "Avenida Ipiranga (Porto Alegre)",
  "Avenida Castello Branco": "Avenida Presidente Castello Branco",
  "Av. Mauá": "Avenida Mauá",
  "Moab Caldas": "Avenida Moab Caldas",
  "Avenida Voluntários da Pátria": "Rua Voluntários da Pátria (Porto Alegre)",
  "Praça Revolução Farroupilha (Trensurb)": "Praça Revolução Farroupilha",
  "Praça Montevideo": "Praça Montevidéu",
  "Praça Marechal Deodoro (Matriz)": "Praça da Matriz (Porto Alegre)",
  "Terminal Parobé": "Praça Pereira Parobé",
  "Viaduto Conceição": "Viaduto da Conceição",
  "Baronesa do Gravataí": "Rua Baronesa do Gravataí",
  "Trincheira da Ceará": "Trincheira da Avenida Ceará",

  "Exército Brasileiro": "Army of Brazil",
  "Forças Armadas": "Army of Brazil",
  "Marinha do Brasil": "Brazilian Navy",
  "Ministerio Público - RS": "Ministério Público do Rio Grande do Sul",
  "Governo Federal": "Federal government of Brazil",
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
  Tradicionalismo: "Sindicatos Rurais",
  IPTU: "Imposto sobre a Propriedade Predial e Territorial Urbana",

  "Festival de Inverno": "Festival de Inverno (Porto Alegre)",
  "Campanha do Agasalho": metadata =>
    `Campanha do Agasalho (${getYear(metadata.humanReadableDate)})`,
  Greve: "General strike in Brazil (2017-06-30)",
  "Poa Em Cena": "Porto Alegre em Cena",
  "Dia do Desafio": "Challenge Day",
  "Feira Ecológica": "Feira Orgânica Rômulo Telles",

  "Brigada Militar": "Brigada Militar do Rio Grande do Sul",
  Trabalho: "Festa de Nossa Senhora do Trabalho",
  Metas: "Prometas",
  Unisinos: "Universidade do Vale do Rio dos Sinos (Porto Alegre campus)",
  "Caminhos Rurais": "Caminhos Rurais de Porto Alegre",
  "Parque Moinhos de Vento (Parcão)": "Parque Moinhos de Vento",
  "Cais do Porto": "Cais Mauá",
  Unesco: "UNESCO",
  "Fórum da Liberdade": "30º Fórum da Liberdade (2017)",
  Fiergs: "Federação das Indústrias do Estado do Rio Grande do Sul",
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
  Santander: "Banco Santander (Brasil)",
  "Cruz Vermelha do Brasil": "Brazilian Red Cross",
  "Grupo Experimental de Dança (GED)":
    "Grupo Experimental de Dança de Porto Alegre",
  "Associação Comercial de Porto Alegre (ACPA)":
    "Associação Comercial de Porto Alegre",
  "Reunião-almoço Tá Na Mesa": "Tá na Mesa",

  Lazer: "Recreation in Porto Alegre",
  Farmácia: "Farmácias Distritais (Porto Alegre)",
  Árvore: "Trees in Porto Alegre",
  Futebol: "Association football in Porto Alegre",
  roubo: "Crime in Porto Alegre",
  Flagrante: "Crime in Porto Alegre",
  Ambulância: "Ambulances in Porto Alegre",
  Procissão: "Processions in Porto Alegre",
  Aéreas: "Aerial photographs of Porto Alegre",
  "Imagem Aérea": "Aerial photographs of Porto Alegre",
  Táxi: "Taxis in Porto Alegre",
  Infraestrutura: "Infrastructure in Porto Alegre",
  Artesanato: "Handicrafts of Porto Alegre",
  exposição: "Exhibitions in Porto Alegre",
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
  Mapa: "Maps of Porto Alegre",
  Quilombos: "Quilombos in Porto Alegre",
  Bicicleta: "Bicycles in Porto Alegre",
  Bocha: "Bocce in Porto Alegre",
  Memória: "History of Porto Alegre",
  Acidente: "Road accidents in Porto Alegre",
  Acidentalidade: "Road accidents in Porto Alegre",
  Varejo: "Retail in Porto Alegre",
  Indústria: "Industry in Porto Alegre",
  Espetáculo: "Shows in Porto Alegre",
  Hipismo: "Equestrian sports in Porto Alegre",
  Fauna: "Animals of Porto Alegre",
  "Indústria e Comércio": "Industry in Porto Alegre",
  "Artes Cênicas": "Performing arts in Porto Alegre",
  "Transporte Público": "Public transport in Porto Alegre",
  "Transporte Coletivo": "Public transport in Porto Alegre",
  "População de Rua": "Homelessness in Porto Alegre",
  "Situação de rua": "Homelessness in Porto Alegre",
  "Ruas e avenidas": "Streets in Porto Alegre",
  "Artes Visuais": "Art of Porto Alegre",
  "Fios Soltos": "Overhead power lines in Porto Alegre",
  "Unidade de Saúde": "Unidades de Saúde in Porto Alegre",
  "foco de lixo": "Waste management in Porto Alegre",
  "Terminais de ônibus": "Bus stations in Porto Alegre",
  "Sinalização de trânsito": "Road signs in Porto Alegre",
  "Arte Urbana": "Street art in Porto Alegre",
  "Obra de arte": "Art of Porto Alegre",
  "Iluminação Pública": "Street lights in Porto Alegre",

  Páscoa: metadata =>
    `Easter ${getYear(metadata.humanReadableDate)} in Porto Alegre`,

  Nuvens: "Clouds in Rio Grande do Sul",

  Infográfico: "Information graphics of Brazil",
  Dengue: "Dengue in Brazil",
  Vôlei: "Volleyball in Brazil",
  Handebol: "Handball in Brazil",
  Campeonato: "Competitions in Brazil",
  Concurso: "Competitions in Brazil",
  Posse: "Oaths of office in Brazil",
  Servidor: "Civil servants of Brazil",
  Aluno: "Students in Brazil",
  Alunos: "Students in Brazil",
  Estudantes: "Students in Brazil",
  Abertura: "Opening ceremonies in Brazil",
  Inauguração: "Inaugurations in Brazil",
  Licitações: "Auctions in Brazil",
  Abrigos: "Shelters in Brazil",
  Albergues: "Shelters in Brazil",
  Acolhimento: "Shelters in Brazil",
  Transparência: "Open government in Brazil",
  Empreendedorismo: "Entrepreneurship in Brazil",
  Adolescente: "Teenagers of Brazil",
  Poda: "Pruning in Brazil",
  Remanejo: "Pruning in Brazil",
  Embaixada: "Embassies in Brazil",
  Consulado: "Diplomatic missions to Brazil",
  "Consul Honorária dos Países Baixos em Porto Alegre":
    "Diplomatic missions to Brazil",
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
  Aids: "AIDS in Brazil",
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
  Palestra: "Presentations in Brazil",
  Apresentação: "Presentations in Brazil",
  Seminário: "Seminars in Brazil",
  Audiência: "Audiences (meeting) in Brazil",
  Hanseníase: "Leprosy in Brazil",
  Retrato: "Portrait photographs of politicians of Brazil",
  Formatura: "Graduation ceremonies in Brazil",
  Casamento: "Collective weddings in Brazil",
  Oficina: "Workshops (meetings) in Brazil",
  Workshop: "Workshops (meetings) in Brazil",
  "febre amarela": "Yellow fever in Brazil",
  "Comissão da Pessoa com Deficiência": "Disability in Brazil",
  "Bloqueio químico": "Fogging against Aedes aegypti in Brazil",
  "Direitos Humanos": "Human rights in Brazil",
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
  "Porão do Paço": "Basements in Brazil",
  "doação de sangue": "Blood donation in Brazil",
  "Ambulatório Odontológico": "Dental clinics in Brazil",
  "Teste do Pezinho": "Neonatal heel pricks in Brazil",
  "Banco de Leite Humano": "Human milk banks in Brazil",
  "Atendimento em Casa": "Home care in Brazil",
  "Outubro Rosa": "Pink October in Brazil",
  "BRT's": "Bus rapid transit in Brazil",
  "Leito Hospitalar": "Hospital beds in Brazil",
  "Economia Solidária": "Social economy in Brazil",
  "Novembro Azul": "Movember in Brazil",

  "Dia da Mulher": metadata =>
    `International Women's Day in ${getYear(
      metadata.humanReadableDate
    )} in Brazil`,
  Criança: metadata =>
    `Children of Brazil in ${getYear(metadata.humanReadableDate)}`,
  "Programação do Reveillon": metadata =>
    `New Year ${getYear(metadata.humanReadableDate)} in Brazil`,
  "Concerto Musical": metadata =>
    `${getYear(metadata.humanReadableDate)} concerts in Brazil`,

  Transexualidade: "Transgender in South America",

  "Aula aberta": "Workshops (meetings)",
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
  "Transtornos no trânsito": "Road traffic management",
  "desvio de trânsito": "Road traffic management",
  "Consulta Pública": "Public consultation",
  Capina: "Weed control",
  Roçada: "String trimmers",
  Mutirão: "Task forces",
  "Força-Tarefa": "Task forces",
  "Adoção de animais": "Animal adoption",
  "Educação Especial": "Special education",
  "Carnaval de Rua": "Street carnival",
  Cidadania: "Civil society",
  Debate: "Debating",
  Interdição: "Forced business closures",
  "Inclusão Social": "Social inclusion",
  Urbanismo: "Urbanism",
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
  "Trabalho e Emprego": "Employment",
  "Vagas de Emprego": "Employment",
  Emprego: "Employment",
  "Centro de triagem": "Screening centers",
  Monitoramento: "Monitoring",
  Premiação: "Prizes",
  "Cidades Inteligentes": "Smart cities",
  "Câncer Bucal": "Oral cancer",
  Nutrição: "Nutrition",
  "Saúde Nutricional e Amamentação": "Breastfeeding",
  Live: "Video streaming",
  "Atenção Primária à Saúde (APS)": "Primary health care",
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
  Revitalização: "Urban renewal",
  Catamarã: "Catamarans",
  "Doença Respiratória": "Diseases and disorders of the respiratory system",
  Leishmaniose: "Leishmaniasis",
  "Coleta Seletiva": "Separate waste collection",
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
  "Comércio Irregular": "Gray market",
  "Reintegração de Posse": "Eviction",
  "Curso de Mecânica": "Mechanics",
  "Maratona de Dança": "Dance marathons",
};
