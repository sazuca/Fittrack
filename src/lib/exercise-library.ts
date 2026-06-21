// Catálogo de exercícios com instruções, músculos, dicas, erros comuns
// e categorias por grupo muscular para o catálogo navegável.

export type ExerciseInfo = {
  name: string;
  muscles: string[];
  instructions: string[];
  tips: string[];
  mistakes: string[];
};

export type MuscleCategory =
  | "Peito"
  | "Costas"
  | "Pernas"
  | "Glúteos"
  | "Ombros"
  | "Bíceps"
  | "Tríceps"
  | "Abdômen"
  | "Panturrilha"
  | "Cardio";

export type CatalogEntry = {
  name: string;
  category: MuscleCategory;
  defaultSets: number;
  defaultReps: string;
  defaultRest: string;
};

function videoSearchUrl(name: string) {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(
    name + " execução correta",
  )}`;
}

// ⚠️ PLACEHOLDERS DE VÍDEO ⚠️
// Substitua os links abaixo por arquivos .mp4 reais dos seus exercícios.
// Recomendado: arquivos curtos (5-15s), sem áudio, em loop — exatamente como
// um GIF de alta qualidade. Use CDN próprio (Supabase Storage, Cloudinary,
// Bunny, etc.) ou bancos gratuitos (Pexels, Pixabay, Coverr, Mixkit).
//
// Para acrescentar/trocar o vídeo de um exercício específico, edite o mapa
// EXERCISE_VIDEO_OVERRIDES abaixo OU passe `videoUrl` direto no exercício
// (o usuário pode editar pelo botão "Editar treino" → campo "Vídeo (.mp4)").

// Pool de placeholders públicos (.mp4) — todos com CORS aberto e estáveis.
// Bucket público do Google usado por demos do <video> em todo lugar.
const PLACEHOLDER_POOL: readonly string[] = [
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4",
];

// 👉 SUBSTITUA AQUI pelos seus próprios vídeos por exercício.
// Chave: nome exato do exercício (como está no catálogo).
// Valor: URL .mp4 pública. Exemplo:
//   "Supino reto": "https://seu-cdn.com/videos/supino-reto.mp4",
const EXERCISE_VIDEO_OVERRIDES: Record<string, string> = {
  // (vazio por padrão — todos caem no pool de placeholders)
};

function normalize(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

// Hash determinístico simples para escolher sempre o mesmo placeholder
// para um mesmo exercício (consistência visual entre sessões).
function pickFromPool(name: string): string {
  const key = normalize(name);
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
  return PLACEHOLDER_POOL[h % PLACEHOLDER_POOL.length];
}

// Retorna a URL .mp4 que será tocada no <video> nativo. Procura primeiro
// nos overrides (com match normalizado) e cai no pool de placeholders.
export function getExerciseVideoSrc(name: string): string {
  if (EXERCISE_VIDEO_OVERRIDES[name]) return EXERCISE_VIDEO_OVERRIDES[name];
  const target = normalize(name);
  for (const [k, v] of Object.entries(EXERCISE_VIDEO_OVERRIDES)) {
    if (normalize(k) === target) return v;
  }
  return pickFromPool(name);
}

const LIB: Record<string, ExerciseInfo> = {
  "Supino reto": {
    name: "Supino reto",
    muscles: ["Peitoral maior", "Tríceps", "Deltoide anterior"],
    instructions: [
      "Deite no banco com pés firmes no chão.",
      "Pegue a barra com pegada um pouco maior que os ombros.",
      "Desça a barra controlada até tocar o peito na linha do mamilo.",
      "Empurre de volta até estender os cotovelos sem travar.",
    ],
    tips: ["Escápulas retraídas", "Punhos alinhados", "Respire na descida"],
    mistakes: ["Quicar a barra no peito", "Levantar o quadril", "Cotovelos abertos 90°"],
  },
  "Supino inclinado halteres": {
    name: "Supino inclinado halteres",
    muscles: ["Peitoral superior", "Deltoide anterior", "Tríceps"],
    instructions: [
      "Banco entre 30° e 45°.",
      "Halteres na altura do peito, palmas para frente.",
      "Empurre em arco leve até quase encostar os halteres no topo.",
    ],
    tips: ["Não trave o cotovelo", "Controle a fase excêntrica"],
    mistakes: ["Inclinação acima de 60° (vira ombro)", "Bater os halteres no topo"],
  },
  "Agachamento livre": {
    name: "Agachamento livre",
    muscles: ["Quadríceps", "Glúteos", "Posterior de coxa", "Core"],
    instructions: [
      "Barra apoiada no trapézio, pés na largura dos ombros.",
      "Desça empurrando o quadril para trás.",
      "Vá até pelo menos a coxa paralela ao chão.",
      "Suba empurrando o chão com os calcanhares.",
    ],
    tips: ["Olhar à frente", "Joelhos alinhados aos pés", "Core contraído"],
    mistakes: ["Joelho caindo para dentro", "Calcanhar saindo do chão", "Lombar arredondada"],
  },
  "Leg press": {
    name: "Leg press",
    muscles: ["Quadríceps", "Glúteos", "Posterior"],
    instructions: [
      "Pés na largura dos ombros no meio da plataforma.",
      "Desça até 90° nos joelhos.",
      "Empurre sem travar os joelhos.",
    ],
    tips: ["Lombar colada no banco", "Movimento controlado"],
    mistakes: ["Tirar quadril do banco", "Hiperextender o joelho"],
  },
  "Puxada frontal": {
    name: "Puxada frontal",
    muscles: ["Latíssimo do dorso", "Bíceps", "Romboides"],
    instructions: [
      "Pegada aberta, palmas para frente.",
      "Puxe a barra até a clavícula contraindo as costas.",
      "Volte controlado estendendo os braços.",
    ],
    tips: ["Peito aberto", "Cotovelos descem ao lado", "Não use impulso"],
    mistakes: ["Puxar atrás da nuca", "Curvar para trás demais"],
  },
  "Remada curvada": {
    name: "Remada curvada",
    muscles: ["Dorsal", "Romboides", "Trapézio médio", "Bíceps"],
    instructions: [
      "Tronco inclinado ~45°, joelhos semi-flexionados.",
      "Puxe a barra em direção ao umbigo.",
      "Aperte as escápulas no topo.",
    ],
    tips: ["Coluna neutra", "Cotovelos colados ao corpo"],
    mistakes: ["Curvar a lombar", "Usar impulso do tronco"],
  },
  "Desenvolvimento militar": {
    name: "Desenvolvimento militar",
    muscles: ["Deltoide", "Tríceps", "Trapézio"],
    instructions: [
      "Barra na altura do peito.",
      "Empurre acima da cabeça estendendo os braços.",
      "Desça controlado.",
    ],
    tips: ["Core ativo", "Sem hiperextensão lombar"],
    mistakes: ["Arquear muito a coluna", "Subir só com impulso de perna"],
  },
  "Elevação lateral": {
    name: "Elevação lateral",
    muscles: ["Deltoide médio"],
    instructions: [
      "Halteres ao lado do corpo.",
      "Eleve até a altura dos ombros, leve flexão de cotovelo.",
      "Desça controlado.",
    ],
    tips: ["Cotovelos guiam o movimento", "Não use impulso"],
    mistakes: ["Subir acima da linha do ombro", "Trapézio dominando"],
  },
  "Rosca direta": {
    name: "Rosca direta",
    muscles: ["Bíceps", "Braquial"],
    instructions: ["Cotovelos fixos ao corpo.", "Suba contraindo o bíceps.", "Desça estendendo total."],
    tips: ["Não balance o tronco", "Foco na contração"],
    mistakes: ["Adiantar os cotovelos", "Usar muito impulso"],
  },
  "Tríceps pulley": {
    name: "Tríceps pulley",
    muscles: ["Tríceps"],
    instructions: ["Cotovelos colados.", "Estenda os braços completamente.", "Volte controlado."],
    tips: ["Tronco firme", "Punhos neutros"],
    mistakes: ["Abrir os cotovelos", "Usar peso e fazer com o corpo"],
  },
  "Abdominal supra": {
    name: "Abdominal supra",
    muscles: ["Reto abdominal (porção superior)"],
    instructions: [
      "Deite com joelhos flexionados, pés no chão.",
      "Eleve o tronco contraindo o abdômen, sem puxar o pescoço.",
      "Desça controlado sem encostar totalmente.",
    ],
    tips: ["Queixo afastado do peito", "Expire ao subir"],
    mistakes: ["Puxar a nuca", "Usar impulso da cabeça"],
  },
  "Abdominal infra": {
    name: "Abdominal infra",
    muscles: ["Reto abdominal (porção inferior)"],
    instructions: [
      "Deite e leve os joelhos em direção ao peito.",
      "Eleve o quadril do chão contraindo o abdômen baixo.",
      "Desça controlado.",
    ],
    tips: ["Movimento curto e controlado", "Foco no quadril, não nas pernas"],
    mistakes: ["Balançar as pernas", "Apoiar mãos para empurrar"],
  },
  "Prancha abdominal": {
    name: "Prancha abdominal",
    muscles: ["Core", "Reto abdominal", "Transverso"],
    instructions: [
      "Apoie antebraços e pontas dos pés no chão.",
      "Mantenha o corpo alinhado, sem cair o quadril.",
      "Segure pelo tempo programado respirando normalmente.",
    ],
    tips: ["Glúteos contraídos", "Olhar para baixo"],
    mistakes: ["Quadril caído ou alto demais", "Prender a respiração"],
  },
  "Cadeira extensora": {
    name: "Cadeira extensora",
    muscles: ["Quadríceps"],
    instructions: [
      "Ajuste o encosto e o apoio dos tornozelos.",
      "Estenda os joelhos até quase travar.",
      "Desça controlado.",
    ],
    tips: ["Quadril fixo no banco", "Movimento contínuo"],
    mistakes: ["Travar joelho com força", "Tirar o quadril do banco"],
  },
  "Mesa flexora": {
    name: "Mesa flexora",
    muscles: ["Posterior de coxa"],
    instructions: [
      "Deite com o rolo logo acima do calcanhar.",
      "Flexione os joelhos trazendo o calcanhar ao glúteo.",
      "Volte controlado.",
    ],
    tips: ["Quadril fixo", "Sem usar impulso"],
    mistakes: ["Elevar o quadril", "Movimento parcial"],
  },
  "Stiff": {
    name: "Stiff",
    muscles: ["Posterior de coxa", "Glúteos", "Lombar"],
    instructions: [
      "Barra em frente ao corpo, joelhos semi-flexionados.",
      "Desça empurrando o quadril para trás, mantendo a barra rente às pernas.",
      "Suba contraindo glúteos e posterior.",
    ],
    tips: ["Coluna neutra", "Sentir alongamento no posterior"],
    mistakes: ["Arredondar a lombar", "Flexionar os joelhos demais"],
  },
  "Elevação pélvica": {
    name: "Elevação pélvica",
    muscles: ["Glúteos", "Posterior"],
    instructions: [
      "Apoie as costas em um banco, pés firmes no chão.",
      "Eleve o quadril contraindo os glúteos no topo.",
      "Desça controlado.",
    ],
    tips: ["Queixo no peito", "Pausa de 1s no topo"],
    mistakes: ["Hiperextender a lombar", "Não chegar à linha do tronco"],
  },
  "Crucifixo halteres": {
    name: "Crucifixo halteres",
    muscles: ["Peitoral", "Deltoide anterior"],
    instructions: [
      "Deite com halteres acima do peito, leve flexão de cotovelos.",
      "Abra os braços em arco até sentir alongamento.",
      "Volte contraindo o peito.",
    ],
    tips: ["Cotovelos sempre flexionados", "Não desça demais"],
    mistakes: ["Estender o cotovelo", "Usar peso alto demais"],
  },
  "Remada baixa": {
    name: "Remada baixa",
    muscles: ["Dorsal", "Trapézio médio", "Bíceps"],
    instructions: [
      "Sente com pés apoiados, coluna neutra.",
      "Puxe o triângulo até o abdômen.",
      "Aperte as escápulas e volte controlado.",
    ],
    tips: ["Peito aberto", "Não usar impulso do tronco"],
    mistakes: ["Curvar a lombar", "Puxar com o braço, não com as costas"],
  },
  "Rosca martelo": {
    name: "Rosca martelo",
    muscles: ["Bíceps", "Braquial", "Braquiorradial"],
    instructions: [
      "Halteres ao lado, palmas viradas para o corpo.",
      "Flexione mantendo a pegada neutra.",
      "Desça controlado.",
    ],
    tips: ["Cotovelos fixos", "Sem balançar o tronco"],
    mistakes: ["Adiantar o cotovelo", "Subir com impulso"],
  },
  "Tríceps francês": {
    name: "Tríceps francês",
    muscles: ["Tríceps"],
    instructions: [
      "Halter acima da cabeça, segurado com as duas mãos.",
      "Desça atrás da cabeça flexionando os cotovelos.",
      "Estenda os braços ao subir.",
    ],
    tips: ["Cotovelos próximos da cabeça", "Movimento só no cotovelo"],
    mistakes: ["Abrir os cotovelos", "Mover os ombros"],
  },
  "Panturrilha em pé": {
    name: "Panturrilha em pé",
    muscles: ["Gastrocnêmio", "Sóleo"],
    instructions: [
      "Pés apoiados na borda da plataforma.",
      "Suba na ponta dos pés contraindo a panturrilha.",
      "Desça até alongar.",
    ],
    tips: ["Amplitude completa", "Pausa no topo"],
    mistakes: ["Movimento parcial", "Usar impulso"],
  },
  "Esteira (corrida leve)": {
    name: "Esteira (corrida leve)",
    muscles: ["Sistema cardiovascular", "Pernas"],
    instructions: [
      "Aqueça por 5 minutos caminhando.",
      "Mantenha um ritmo confortável onde consiga conversar.",
      "Termine reduzindo gradualmente.",
    ],
    tips: ["Postura ereta", "Respiração ritmada"],
    mistakes: ["Pisar com o calcanhar com força", "Segurar na barra o tempo todo"],
  },
};

// Catálogo navegável por grupo muscular.
export const CATALOG_ALL: CatalogEntry[] = [
  // Peito
  { name: "Supino reto", category: "Peito", defaultSets: 4, defaultReps: "8-10", defaultRest: "90s" },
  { name: "Supino inclinado halteres", category: "Peito", defaultSets: 3, defaultReps: "10-12", defaultRest: "75s" },
  { name: "Crucifixo halteres", category: "Peito", defaultSets: 3, defaultReps: "12", defaultRest: "60s" },
  { name: "Crossover polia", category: "Peito", defaultSets: 3, defaultReps: "12-15", defaultRest: "60s" },
  { name: "Flexão de braço", category: "Peito", defaultSets: 3, defaultReps: "AMRAP", defaultRest: "60s" },
  // Costas
  { name: "Puxada frontal", category: "Costas", defaultSets: 4, defaultReps: "10", defaultRest: "75s" },
  { name: "Remada curvada", category: "Costas", defaultSets: 4, defaultReps: "8-10", defaultRest: "90s" },
  { name: "Remada baixa", category: "Costas", defaultSets: 3, defaultReps: "12", defaultRest: "60s" },
  { name: "Pulldown unilateral", category: "Costas", defaultSets: 3, defaultReps: "12", defaultRest: "60s" },
  { name: "Levantamento terra", category: "Costas", defaultSets: 4, defaultReps: "6-8", defaultRest: "120s" },
  // Ombros
  { name: "Desenvolvimento militar", category: "Ombros", defaultSets: 4, defaultReps: "8-10", defaultRest: "90s" },
  { name: "Elevação lateral", category: "Ombros", defaultSets: 4, defaultReps: "12-15", defaultRest: "60s" },
  { name: "Elevação frontal", category: "Ombros", defaultSets: 3, defaultReps: "12", defaultRest: "60s" },
  { name: "Crucifixo inverso", category: "Ombros", defaultSets: 3, defaultReps: "12-15", defaultRest: "60s" },
  // Bíceps
  { name: "Rosca direta", category: "Bíceps", defaultSets: 4, defaultReps: "10-12", defaultRest: "60s" },
  { name: "Rosca martelo", category: "Bíceps", defaultSets: 3, defaultReps: "12", defaultRest: "60s" },
  { name: "Rosca concentrada", category: "Bíceps", defaultSets: 3, defaultReps: "12", defaultRest: "60s" },
  { name: "Rosca scott", category: "Bíceps", defaultSets: 3, defaultReps: "10-12", defaultRest: "60s" },
  // Tríceps
  { name: "Tríceps pulley", category: "Tríceps", defaultSets: 4, defaultReps: "12", defaultRest: "60s" },
  { name: "Tríceps francês", category: "Tríceps", defaultSets: 3, defaultReps: "10-12", defaultRest: "60s" },
  { name: "Tríceps testa", category: "Tríceps", defaultSets: 3, defaultReps: "10", defaultRest: "60s" },
  { name: "Mergulho no banco", category: "Tríceps", defaultSets: 3, defaultReps: "AMRAP", defaultRest: "60s" },
  // Pernas
  { name: "Agachamento livre", category: "Pernas", defaultSets: 4, defaultReps: "6-10", defaultRest: "120s" },
  { name: "Leg press", category: "Pernas", defaultSets: 4, defaultReps: "10-12", defaultRest: "90s" },
  { name: "Cadeira extensora", category: "Pernas", defaultSets: 3, defaultReps: "12-15", defaultRest: "60s" },
  { name: "Mesa flexora", category: "Pernas", defaultSets: 3, defaultReps: "12", defaultRest: "60s" },
  { name: "Stiff", category: "Pernas", defaultSets: 3, defaultReps: "10-12", defaultRest: "90s" },
  { name: "Avanço (afundo)", category: "Pernas", defaultSets: 3, defaultReps: "12 cada", defaultRest: "75s" },
  // Glúteos
  { name: "Elevação pélvica", category: "Glúteos", defaultSets: 4, defaultReps: "10-12", defaultRest: "75s" },
  { name: "Cadeira abdutora", category: "Glúteos", defaultSets: 3, defaultReps: "15", defaultRest: "45s" },
  { name: "Coice na polia", category: "Glúteos", defaultSets: 3, defaultReps: "12 cada", defaultRest: "60s" },
  // Abdômen
  { name: "Abdominal supra", category: "Abdômen", defaultSets: 3, defaultReps: "15-20", defaultRest: "45s" },
  { name: "Abdominal infra", category: "Abdômen", defaultSets: 3, defaultReps: "15", defaultRest: "45s" },
  { name: "Prancha abdominal", category: "Abdômen", defaultSets: 3, defaultReps: "30-60s", defaultRest: "45s" },
  { name: "Abdominal oblíquo", category: "Abdômen", defaultSets: 3, defaultReps: "15 cada", defaultRest: "45s" },
  { name: "Elevação de pernas", category: "Abdômen", defaultSets: 3, defaultReps: "12-15", defaultRest: "45s" },
  // Panturrilha
  { name: "Panturrilha em pé", category: "Panturrilha", defaultSets: 4, defaultReps: "15-20", defaultRest: "45s" },
  { name: "Panturrilha sentado", category: "Panturrilha", defaultSets: 4, defaultReps: "15-20", defaultRest: "45s" },
  // Cardio
  { name: "Esteira (corrida leve)", category: "Cardio", defaultSets: 1, defaultReps: "20-30min", defaultRest: "—" },
  { name: "Bicicleta ergométrica", category: "Cardio", defaultSets: 1, defaultReps: "20-30min", defaultRest: "—" },
  { name: "Elíptico", category: "Cardio", defaultSets: 1, defaultReps: "20min", defaultRest: "—" },
  { name: "Pular corda", category: "Cardio", defaultSets: 5, defaultReps: "1min", defaultRest: "30s" },
];

export const MUSCLE_CATEGORIES: MuscleCategory[] = [
  "Peito",
  "Costas",
  "Pernas",
  "Glúteos",
  "Ombros",
  "Bíceps",
  "Tríceps",
  "Abdômen",
  "Panturrilha",
  "Cardio",
];

export function listExercisesByCategory(cat: MuscleCategory): CatalogEntry[] {
  return CATALOG_ALL.filter((e) => e.category === cat);
}

export function searchExercises(query: string): CatalogEntry[] {
  const q = query.trim().toLowerCase();
  if (!q) return CATALOG_ALL;
  return CATALOG_ALL.filter((e) => e.name.toLowerCase().includes(q));
}

function generic(name: string): ExerciseInfo {
  return {
    name,
    muscles: ["Veja o vídeo para conferir os músculos trabalhados"],
    instructions: [
      "Procure orientação de um profissional para a execução correta.",
      "Faça a fase excêntrica (descida) de forma controlada.",
      "Mantenha core contraído e coluna neutra durante todo o movimento.",
    ],
    tips: ["Respire de forma contínua", "Amplitude completa supera carga alta"],
    mistakes: ["Usar impulso", "Amplitude parcial", "Carga acima do controlado"],
  };
}

export function getExerciseInfo(name: string): ExerciseInfo {
  return LIB[name] ?? generic(name);
}

export function getExerciseVideoUrl(name: string) {
  return videoSearchUrl(name);
}
