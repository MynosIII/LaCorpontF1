export const surveyMeta = {
  title: "2025 Global F1 Fan Survey",
  authors: "Formula 1 + Motorsport Network",
  respondents: "100K+",
  countries: 186,
  fieldNote: "Encuesta opt-in a fans autodefinidos y altamente involucrados; no representa un censo de toda la audiencia de F1."
};

export const tenureAge = {
  page: 10,
  tenures: ["< 1 año", "1–2 años", "3–5 años", "6–10 años", "10+ años"],
  ages: ["Menos de 18", "18–24", "25–34", "35–44", "45–54", "55–64", "65+"],
  values: [
    [25, 24, 15, 10, 1],
    [50, 51, 43, 38, 5],
    [18, 17, 25, 27, 16],
    [4, 5, 10, 13, 25],
    [2, 2, 4, 6, 21],
    [1, 1, 2, 4, 17],
    [0, 0, 1, 2, 14]
  ],
  averageAge: { global: 37.4, women: 30.1, men: 43.2 },
  genZShare: 27,
  genZWomen: 50,
  womenFiveYearsOrLess: 64
};

export const emotionalInvestment = {
  page: 22,
  groups: ["< 1 año", "1–2 años", "3–5 años", "6–10 años", "10+ años*", "Global"],
  series: [
    { label: "Muy involucrados", values: [61, 69, 66, 62, 53, 58] },
    { label: "Algo involucrados", values: [33, 27, 29, 31, 34, 32] },
    { label: "Poco involucrados", values: [5, 3, 4, 6, 10, 8] },
    { label: "Nada involucrados", values: [1, 1, 1, 1, 3, 2] }
  ],
  caveat: "La última banda del gráfico original figura como ‘65+’, aunque la pregunta y el resto del eje corresponden a antigüedad. Se interpreta aquí como la banda de mayor antigüedad (10+ años)."
};

export const motivators = {
  page: 23,
  rows: [
    { cohort: "Fans históricos", detail: "45+, hombres y 6+ años", first: "Fan desde la infancia", second: "Emoción y velocidad", third: "Innovación y tecnología" },
    { cohort: "Mujeres", detail: "Respuestas de mujeres", first: "Emoción y velocidad", second: "Pilotos", third: "Estrategia" },
    { cohort: "Gen Z", detail: "Menores de 25", first: "Emoción y velocidad", second: "Pilotos", third: "Equipos" },
    { cohort: "Fans nuevos", detail: "5 años o menos", first: "Emoción y velocidad", second: "Pilotos", third: "Estrategia" }
  ]
};

export const emotionalAnchors = {
  pages: [24, 26],
  offTrackInspiration: [
    { group: "Global", value: 48 },
    { group: "Mujeres", value: 59 },
    { group: "Gen Z", value: 66 },
    { group: "Fans nuevos", value: 60 },
    { group: "India", value: 75 },
    { group: "Brasil", value: 69 },
    { group: "Japón", value: 55 }
  ],
  femaleDriverMotivation: 49,
  genZDriverMotivation: 41,
  genZTeamMotivation: 25,
  neutralOrMultipleTeams: 61,
  historicNeutrality: [
    { year: 2017, value: 55 },
    { year: 2021, value: 72 },
    { year: 2025, value: 61 }
  ],
  usDriverFans: 40,
  usTeamFans: 21
};

export const newsEngagement = {
  pages: [32, 33],
  groups: ["Menos de 18", "18–24", "25–34", "35–44", "45–54", "55–64", "65+", "Global"],
  series: [
    { label: "Todos los días", values: [74, 71, 60, 59, 58, 54, 51, 61] },
    { label: "Varias veces por semana", values: [23, 26, 35, 37, 37, 39, 41, 34] },
    { label: "Una vez el fin de semana", values: [3, 3, 4, 3, 4, 5, 6, 4] },
    { label: "Rara vez", values: [0, 0, 1, 1, 1, 2, 2, 1] }
  ],
  usAge18to24Daily: 70
};

export const socialImportance = {
  pages: [35, 36],
  groups: ["Menos de 18", "18–24", "25–34", "35–44", "45–54", "55–64", "65+"],
  series: [
    { label: "Muy importante", values: [68, 66, 46, 29, 24, 16, 7] },
    { label: "Algo importante", values: [27, 27, 30, 28, 29, 27, 21] },
    { label: "No importante", values: [5, 7, 24, 43, 47, 57, 72] }
  ],
  globalImportant: 64,
  womenImportant: 92,
  genZImportant: 94,
  newerFansImportant: 93,
  usImportant: 75,
  longTenureImportant: 54,
  older45Important: 42,
  historic: [
    { year: 2015, value: 28 },
    { year: 2017, value: 31 },
    { year: 2021, value: 40 },
    { year: 2025, value: 64 }
  ]
};

export const onlineDiscussion = {
  page: 37,
  groups: ["Menos de 18", "18–24", "25–34", "35–44", "45–54", "55–64", "65+", "Global"],
  series: [
    { label: "Regularmente", values: [25, 26, 21, 18, 16, 13, 10, 19] },
    { label: "A veces", values: [30, 27, 23, 21, 20, 20, 18, 23] },
    { label: "Rara vez", values: [26, 25, 23, 23, 23, 24, 24, 24] },
    { label: "Nunca", values: [19, 22, 33, 38, 41, 43, 48, 34] }
  ]
};

export const contentFormats = {
  page: 39,
  rows: [
    { format: "Redes sociales", audience: "Gen Z, mujeres, fans nuevos", purpose: "Descubrimiento, highlights y personalidad" },
    { format: "Blogs y artículos", audience: "45+ y fans históricos", purpose: "Contexto, comentario y análisis" },
    { format: "YouTube y Twitch", audience: "Gen Z y fans nuevos", purpose: "Video inmersivo, watch-alongs y sim racing" },
    { format: "Podcasts", audience: "Brasil, EE. UU. y mujeres", purpose: "Profundización y análisis" },
    { format: "Foros online", audience: "Gen Z y mujeres", purpose: "Comunidad y conversación entre pares" }
  ]
};

export const liveRace = {
  page: 34,
  watch16Plus: 86,
  watch20Plus: 73,
  male16Plus: 86,
  age25to44_16Plus: 87,
  europe16Plus: 87,
  market16Plus: [
    { market: "Países Bajos", value: 92 },
    { market: "Brasil", value: 90 },
    { market: "Italia", value: 89 }
  ],
  us20Plus: 73
};

export const liveEvents = {
  pages: [51, 54],
  raceAttendance: [
    { group: "Brasil", value: 56 },
    { group: "México", value: 49 },
    { group: "Global", value: 48 },
    { group: "Países Bajos", value: 47 },
    { group: "EE. UU.", value: 41 },
    { group: "Gen Z EE. UU.", value: 13 }
  ],
  raceIntent: [
    { group: "Gen Z EE. UU.", value: 87, base: "declara intención" },
    { group: "Fans nuevos", value: 75, base: "planea asistir" },
    { group: "EE. UU.", value: 73, base: "planea una carrera en EE. UU." },
    { group: "India", value: 56, base: "entre quienes no asistieron" },
    { group: "Japón", value: 49, base: "entre quienes no asistieron" }
  ],
  fanExperienceAttendance: [
    { group: "Italia", value: 34 },
    { group: "Países Bajos", value: 33 },
    { group: "Japón", value: 30 },
    { group: "Global", value: 24 }
  ],
  futureFanExperienceGlobal: 41,
  futureFanExperienceIndia: 78,
  futureFanExperienceUS: "casi la mitad"
};

export const culture = {
  pages: [63, 64, 65, 66],
  performanceIdentity: 71,
  innovationIdentity: 62,
  fashionSegments: [
    { group: "Mujeres", value: 58 },
    { group: "Gen Z", value: 58 },
    { group: "Fans nuevos", value: 59 },
    { group: "Asia-Pacífico", value: 56 }
  ],
  age45LowFashionEffect: 80,
  groups: ["< 1 año", "1–2 años", "3–5 años", "6–10 años", "10+ años", "Global"],
  lifestyle: [
    { label: "Muy importante", values: [13, 10, 9, 7, 4, 6] },
    { label: "Algo importante", values: [43, 39, 31, 27, 16, 22] },
    { label: "No importante", values: [34, 40, 44, 45, 45, 44] },
    { label: "No influye", values: [10, 11, 16, 21, 35, 28] }
  ],
  fashion: [
    { label: "Muy importante", values: [27, 24, 17, 13, 6, 10] },
    { label: "Algo importante", values: [45, 42, 34, 27, 15, 22] },
    { label: "No importante", values: [22, 26, 36, 39, 43, 40] },
    { label: "No interesa", values: [7, 8, 13, 21, 35, 28] }
  ]
};
