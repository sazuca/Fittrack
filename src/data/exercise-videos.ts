import type { MuscleCategory } from "@/lib/exercise-library";

export interface ExerciseVideo {
  id: string;
  name: string;
  category: MuscleCategory;
  /** ID do vídeo do YouTube. Substitua pelo seu próprio ID de vídeo. */
  youtubeVideoId?: string;
  /** Query de busca usada quando não há ID específico. */
  youtubeSearchQuery: string;
  description: string;
  tip: string;
  muscles: string[];
}

// =============================================================================
// MOCK DATA — Vídeos de Exercícios
// =============================================================================
// Para substituir por seus próprios vídeos:
// 1. Obtenha o ID do vídeo do YouTube (ex: dQw4w9WgXcQ)
// 2. Cole no campo `youtubeVideoId`
// 3. Remova o `youtubeSearchQuery` ou deixe como fallback
// =============================================================================

export const EXERCISE_VIDEOS: ExerciseVideo[] = [
  // ═══════ PEITO ═══════
  {
    id: "supino-reto",
    name: "Supino Reto",
    category: "Peito",
    youtubeVideoId: "EZMYCLKuGow",
    youtubeSearchQuery: "supino reto execução correta",
    description: "Exercício fundamental para desenvolvimento do peitoral. Mantenha os cotovelos em um ângulo de aproximadamente 45°.",
    tip: "Não arqueie excessivamente a lombar. Escápulas retraídas e apoiadas no banco.",
    muscles: ["Peitoral Maior", "Tríceps Braquial", "Deltoide Anterior"],
  },
  {
    id: "supino-inclinado",
    name: "Supino Inclinado",
    category: "Peito",
    youtubeVideoId: "WP1VLAt8hbM",
    youtubeSearchQuery: "supino inclinado execução correta",
    description: "Enfatiza a porção superior do peitoral. Ângulo do banco entre 30° e 45°.",
    tip: "Não utilize ângulo superior a 60° — isso transfere a carga para os ombros.",
    muscles: ["Peitoral Superior", "Deltoide Anterior", "Tríceps"],
  },
  {
    id: "crucifixo",
    name: "Crucifixo",
    category: "Peito",
    youtubeVideoId: "uDMmccuPVPQ",
    youtubeSearchQuery: "crucifixo halteres execução correta",
    description: "Isolamento do peitoral com halteres. Braços abertos em arco, cotovelo levemente flexionado.",
    tip: "Mantenha os cotovelos sempre com leve flexão para proteger as articulações.",
    muscles: ["Peitoral Maior", "Deltoide Anterior"],
  },
  {
    id: "crossover-polia",
    name: "Crossover Polia",
    category: "Peito",
    youtubeVideoId: "jqTlJt3JXzQ",
    youtubeSearchQuery: "crossover polia peito execução",
    description: "Exercício de isolamento que foca no peitoral como um todo. Cruze as mãos à frente do corpo.",
    tip: "Incline o tronco levemente à frente e contraia o peitoral no ponto de cruze.",
    muscles: ["Peitoral Maior", "Peitoral Menor", "Deltoide Anterior"],
  },
  {
    id: "flexao-braco",
    name: "Flexão de Braço",
    category: "Peito",
    youtubeVideoId: "dHgoYiCraCw",
    youtubeSearchQuery: "flexao de braco execução correta",
    description: "Exercício clássico com peso corporal. Corpo reto, desça até o peito quase tocar o chão.",
    tip: "Mantenha o core contraído e o corpo em linha reta durante todo o movimento.",
    muscles: ["Peitoral Maior", "Tríceps", "Deltoide Anterior", "Core"],
  },

  // ═══════ COSTAS ═══════
  {
    id: "puxada-frontal",
    name: "Puxada Frontal",
    category: "Costas",
    youtubeVideoId: "TfxJMertfsw",
    youtubeSearchQuery: "puxada frontal execução correta",
    description: "Excelente para largura das costas. Puxe a barra até a parte superior do peito.",
    tip: "Evite usar impulso do tronco. O movimento deve ser controlado em todas as fases.",
    muscles: ["Latíssimo do Dorso", "Bíceps Braquial", "Romboides", "Trapézio"],
  },
  {
    id: "remada-curvada",
    name: "Remada Curvada",
    category: "Costas",
    youtubeVideoId: "QyvIEdEHzHc",
    youtubeSearchQuery: "remada curvada barra execução",
    description: "Trabalha a espessura das costas. Tronco inclinado ~45°, puxe a barra ao abdômen.",
    tip: "Mantenha a coluna neutra e aperte as escápulas no topo do movimento.",
    muscles: ["Latíssimo do Dorso", "Romboides", "Trapézio Médio", "Bíceps"],
  },
  {
    id: "remada-baixa",
    name: "Remada Baixa",
    category: "Costas",
    youtubeVideoId: "HpWWreyaBN0",
    youtubeSearchQuery: "remada baixa pulley execução correta",
    description: "Trabalha a espessura das costas. Puxe o triângulo em direção ao abdômen.",
    tip: "Mantenha o tronco ereto e evite usar o impulso do corpo.",
    muscles: ["Latíssimo do Dorso", "Romboides", "Trapézio Médio", "Bíceps"],
  },
  {
    id: "pulldown-unilateral",
    name: "Pulldown Unilateral",
    category: "Costas",
    youtubeVideoId: "Vk6c7CjtM14",
    youtubeSearchQuery: "pulldown unilateral costas execução",
    description: "Trabalha cada lado das costas individualmente para corrigir assimetrias.",
    tip: "Foco na contração do latíssimo. Desça o cotovelo em direção ao quadril.",
    muscles: ["Latíssimo do Dorso", "Romboides", "Bíceps"],
  },
  {
    id: "levantamento-terra",
    name: "Levantamento Terra",
    category: "Costas",
    youtubeVideoId: "50AkPBZwACQ",
    youtubeSearchQuery: "levantamento terra execução correta",
    description: "O exercício mais completo para força total. Ergue a barra do chão até a posição em pé.",
    tip: "Mantenha a barra sempre rente ao corpo e a coluna neutra durante todo o movimento.",
    muscles: ["Cadeia Posterior", "Glúteos", "Quadríceps", "Eretor da Espinha", "Trapézio"],
  },

  // ═══════ OMBROS ═══════
  {
    id: "desenvolvimento-militar",
    name: "Desenvolvimento Militar",
    category: "Ombros",
    youtubeVideoId: "EuQAfhXBEvs",
    youtubeSearchQuery: "desenvolvimento militar ombros execução",
    description: "Exercício composto para ombros. Pode ser realizado com barra ou halteres.",
    tip: "Não hiperextenda a lombar. Core sempre ativado para proteger a coluna.",
    muscles: ["Deltoide", "Tríceps Braquial", "Trapézio Superior"],
  },
  {
    id: "elevacao-lateral",
    name: "Elevação Lateral",
    category: "Ombros",
    youtubeVideoId: "IwWvZ0rlNXs",
    youtubeSearchQuery: "elevação lateral halteres execução",
    description: "Isolamento do deltoide médio. Eleve os halteres até a altura dos ombros.",
    tip: "Não eleve acima da linha do ombro. Controle a descida para manter a tensão.",
    muscles: ["Deltoide Médio", "Trapézio Superior"],
  },
  {
    id: "elevacao-frontal",
    name: "Elevação Frontal",
    category: "Ombros",
    youtubeVideoId: "sKPJdvVvHuI",
    youtubeSearchQuery: "elevação frontal halteres ombros",
    description: "Isolamento do deltoide anterior. Eleve os halteres à frente do corpo até a altura dos ombros.",
    tip: "Evite balançar o tronco. Mantenha os braços estendidos mas não travados.",
    muscles: ["Deltoide Anterior", "Peitoral Superior (clavicular)"],
  },
  {
    id: "crucifixo-inverso",
    name: "Crucifixo Inverso",
    category: "Ombros",
    youtubeVideoId: "_ZQhDiONpZA",
    youtubeSearchQuery: "crucifixo inverso ombros execução",
    description: "Foco no deltoide posterior e trapézio médio. Abra os braços para trás como um voo.",
    tip: "Incline o tronco à frente e foque em contrair a parte de trás dos ombros.",
    muscles: ["Deltoide Posterior", "Romboides", "Trapézio Médio"],
  },

  // ═══════ BÍCEPS ═══════
  {
    id: "rosca-direta",
    name: "Rosca Direta",
    category: "Bíceps",
    youtubeVideoId: "NxSuojHZa8k",
    youtubeSearchQuery: "rosca direta barra execução correta",
    description: "O clássico para bíceps. Mantenha os cotovelos fixos ao lado do corpo.",
    tip: "Evite balançar o tronco. Use uma carga que permita amplitude completa.",
    muscles: ["Bíceps Braquial", "Braquial", "Braquirradial"],
  },
  {
    id: "rosca-martelo",
    name: "Rosca Martelo",
    category: "Bíceps",
    youtubeVideoId: "S7B5LwWrLA0",
    youtubeSearchQuery: "rosca martelo halteres execução",
    description: "Variação que recruta mais o braquial e o braquirradial. Palmas viradas para o corpo.",
    tip: "Mantenha os cotovelos fixos e não balance o corpo para ajudar no movimento.",
    muscles: ["Braquial", "Braquirradial", "Bíceps Braquial"],
  },
  {
    id: "rosca-concentrada",
    name: "Rosca Concentrada",
    category: "Bíceps",
    youtubeSearchQuery: "rosca concentrada bíceps execução",
    description: "Isolamento máximo do bíceps. Braço apoiado na coxa, halter em direção ao ombro.",
    tip: "Contraia o bíceps no topo por 1 segundo. Descida lenta e controlada.",
    muscles: ["Bíceps Braquial", "Braquial"],
  },
  {
    id: "rosca-scott",
    name: "Rosca Scott",
    category: "Bíceps",
    youtubeVideoId: "5HDkxzxe400",
    youtubeSearchQuery: "rosca scott banco bíceps execução",
    description: "Rosca no banco Scott. Isola completamente o bíceps eliminando o impulso do corpo.",
    tip: "Ajuste o banco para que os cotovelos fiquem confortáveis. Não estenda totalmente na descida.",
    muscles: ["Bíceps Braquial", "Braquial"],
  },

  // ═══════ TRÍCEPS ═══════
  {
    id: "triceps-pulley",
    name: "Tríceps Pulley",
    category: "Tríceps",
    youtubeVideoId: "m4h4jT9patY",
    youtubeSearchQuery: "tríceps pulley corda execução correta",
    description: "Excelente para definição e massa do tríceps. Separe as pontas da corda no final.",
    tip: "Mantenha os cotovelos colados ao corpo. Só o antebraço deve se mover.",
    muscles: ["Tríceps Braquial", "Cabos Longo, Lateral e Medial"],
  },
  {
    id: "triceps-frances",
    name: "Tríceps Francês",
    category: "Tríceps",
    youtubeVideoId: "v6-QIOY0nW0",
    youtubeSearchQuery: "tríceps francês halter execução",
    description: "Halter acima da cabeça, desça atrás flexionando os cotovelos.",
    tip: "Cotovelos próximos da cabeça. Movimento só no cotovelo, ombros estáveis.",
    muscles: ["Tríceps Braquial (porção longa)"],
  },
  {
    id: "triceps-testa",
    name: "Tríceps Testa",
    category: "Tríceps",
    youtubeVideoId: "Hk4TZnQ7Nxk",
    youtubeSearchQuery: "tríceps testa barra execução",
    description: "Deitado no banco, barra em direção à testa flexionando os cotovelos.",
    tip: "Não bata a barra na testa. Controle a descida e estenda sem travar os cotovelos.",
    muscles: ["Tríceps Braquial", "Ancôneo"],
  },
  {
    id: "mergulho-banco",
    name: "Mergulho no Banco",
    category: "Tríceps",
    youtubeVideoId: "sE0Mv8sv2Rc",
    youtubeSearchQuery: "mergulho banco tríceps execução",
    description: "Tríceps com peso corporal. Apoie as mãos no banco e desça o quadril.",
    tip: "Mantenha as costas perto do banco. Não desça além do confortável para o ombro.",
    muscles: ["Tríceps Braquial", "Peitoral Menor", "Deltoide Anterior"],
  },

  // ═══════ PERNAS ═══════
  {
    id: "agachamento-livre",
    name: "Agachamento Livre",
    category: "Pernas",
    youtubeVideoId: "zgk71dUUt0Y",
    youtubeSearchQuery: "agachamento livre execução correta",
    description: "O rei dos exercícios de pernas. Trabalha quadríceps, glúteos e cadeia posterior.",
    tip: "Mantenha o peito aberto e os joelhos alinhados com a direção dos pés.",
    muscles: ["Quadríceps", "Glúteos Máximos", "Posterior de Coxa", "Core"],
  },
  {
    id: "leg-press",
    name: "Leg Press",
    category: "Pernas",
    youtubeVideoId: "nY8UsiAqwds",
    youtubeSearchQuery: "leg press execução correta",
    description: "Alternativa segura ao agachamento. Permite trabalhar as pernas com carga alta.",
    tip: "Não ultrapasse 90° de flexão do joelho para evitar stress excessivo.",
    muscles: ["Quadríceps", "Glúteos Máximos", "Posterior de Coxa"],
  },
  {
    id: "cadeira-extensora",
    name: "Cadeira Extensora",
    category: "Pernas",
    youtubeVideoId: "el3oHblB5DM",
    youtubeSearchQuery: "cadeira extensora quadríceps execução",
    description: "Isolamento do quadríceps. Estenda os joelhos contra a resistência.",
    tip: "Não trave os joelhos com força no topo. Movimento contínuo e controlado.",
    muscles: ["Quadríceps (reto femoral, vastos)"],
  },
  {
    id: "mesa-flexora",
    name: "Mesa Flexora",
    category: "Pernas",
    youtubeVideoId: "2-ULaRrQa7c",
    youtubeSearchQuery: "mesa flexora posterior execução",
    description: "Isolamento do posterior de coxa. Flexione os joelhos trazendo o rolo ao glúteo.",
    tip: "Mantenha o quadril fixo no banco. Não use impulso para levantar o peso.",
    muscles: ["Posterior de Coxa (bíceps femoral, semitendíneo, semimembranáceo)"],
  },
  {
    id: "stiff",
    name: "Stiff",
    category: "Pernas",
    youtubeVideoId: "u1E3_u2gJYE",
    youtubeSearchQuery: "stiff barra execução correta",
    description: "Focado no posterior de coxa e glúteos. Desça empurrando o quadril para trás.",
    tip: "Sinta o alongamento no posterior das coxas. Não arredonde a coluna.",
    muscles: ["Posterior de Coxa", "Glúteos Máximos", "Eretor da Espinha"],
  },
  {
    id: "avanco-afundo",
    name: "Avanço",
    category: "Pernas",
    youtubeVideoId: "XBJtM2phDDM",
    youtubeSearchQuery: "avanço afundo halteres execução",
    description: "Exercício unilateral que trabalha pernas e glúteos. Dê um passo à frente e desça.",
    tip: "Mantenha o tronco ereto. Joelho da frente não deve ultrapassar a ponta do pé.",
    muscles: ["Quadríceps", "Glúteos", "Posterior de Coxa", "Core"],
  },

  // ═══════ GLÚTEOS ═══════
  {
    id: "elevacao-pelvica",
    name: "Elevação Pélvica",
    category: "Glúteos",
    youtubeVideoId: "ptK0azwOXwM",
    youtubeSearchQuery: "elevação pélvica glúteos execução",
    description: "Ótimo para ativação dos glúteos. Eleve o quadril contraindo os glúteos no topo.",
    tip: "Pausa de 1 segundo no topo com glúteos contraídos. Não hiperextenda a lombar.",
    muscles: ["Glúteos Máximos", "Posterior de Coxa"],
  },
  {
    id: "cadeira-abdutora",
    name: "Cadeira Abdutora",
    category: "Glúteos",
    youtubeVideoId: "e2gmqTG1OgQ",
    youtubeSearchQuery: "cadeira abdutora glúteos execução",
    description: "Isolamento dos glúteos médio e mínimo. Abra as pernas contra a resistência.",
    tip: "Não use impulso. Foque em contrair os glúteos durante a abertura.",
    muscles: ["Glúteo Médio", "Glúteo Mínimo", "Tensor da Fáscia Lata"],
  },
  {
    id: "coice-polia",
    name: "Coice na Polia",
    category: "Glúteos",
    youtubeVideoId: "JdHbXlggr6Q",
    youtubeSearchQuery: "coice polia glúteos execução",
    description: "Extensão de quadril na polia. Empurre a perna para trás contraindo o glúteo.",
    tip: "Mantenha o tronco estável. Não arqueie a lombar. Sinta o glúteo trabalhando.",
    muscles: ["Glúteo Máximo", "Posterior de Coxa"],
  },

  // ═══════ ABDÔMEN ═══════
  {
    id: "abdominal-supra",
    name: "Abdominal Supra",
    category: "Abdômen",
    youtubeVideoId: "7YxVRiATugo",
    youtubeSearchQuery: "abdominal supra execução correta",
    description: "Foco na porção superior do reto abdominal. Eleve o tronco contraindo o abdômen.",
    tip: "Não puxe o pescoço. Queixo afastado do peito e expire ao subir.",
    muscles: ["Reto Abdominal (porção superior)", "Oblíquos"],
  },
  {
    id: "abdominal-infra",
    name: "Abdominal Infra",
    category: "Abdômen",
    youtubeVideoId: "ixJcUH8AlL8",
    youtubeSearchQuery: "abdominal infra execução",
    description: "Foco na porção inferior do abdômen. Eleve as pernas contraindo o baixo ventre.",
    tip: "Movimento curto e controlado. Eleve o quadril do chão, não apenas as pernas.",
    muscles: ["Reto Abdominal (porção inferior)", "Flexores do Quadril"],
  },
  {
    id: "prancha-abdominal",
    name: "Prancha Abdominal",
    category: "Abdômen",
    youtubeVideoId: "qNRqGqESAWU",
    youtubeSearchQuery: "prancha abdominal execução correta",
    description: "Exercício isométrico para core. Mantenha o corpo alinhado o máximo possível.",
    tip: "Não deixe o quadril cair nem subir. Respire normalmente durante a execução.",
    muscles: ["Reto Abdominal", "Oblíquos", "Transverso do Abdômen", "Core"],
  },
  {
    id: "abdominal-oblicuo",
    name: "Abdominal Oblíquo",
    category: "Abdômen",
    youtubeVideoId: "Smr8ipkN5A0",
    youtubeSearchQuery: "abdominal oblíquo execução",
    description: "Foco nos oblíquos. Rotação do tronco ou flexão lateral para trabalhar as laterais do abdômen.",
    tip: "Movimento controlado sem impulso. Sinta a contração na lateral do abdômen.",
    muscles: ["Oblíquos Externos", "Oblíquos Internos", "Reto Abdominal"],
  },
  {
    id: "elevacao-pernas",
    name: "Elevação de Pernas",
    category: "Abdômen",
    youtubeVideoId: "Q_u3M8gVWKk",
    youtubeSearchQuery: "elevação pernas abdominal execução",
    description: "Exercício para abdômen inferior. Deitado, eleve as pernas estendidas até 90°.",
    tip: "Mantenha a lombar colada ao chão. Se sentir dor nas costas, flexione os joelhos.",
    muscles: ["Reto Abdominal (porção inferior)", "Flexores do Quadril", "Core"],
  },

  // ═══════ PANTURRILHA ═══════
  {
    id: "panturrilha-em-pe",
    name: "Panturrilha em Pé",
    category: "Panturrilha",
    youtubeVideoId: "AevNFIX7lV4",
    youtubeSearchQuery: "panturrilha em pé execução",
    description: "Foco no gastrocnêmio. Suba na ponta dos pés com carga e desça controlado.",
    tip: "Amplitude completa é essencial. Desça até o alongamento máximo e suba até a contração total.",
    muscles: ["Gastrocnêmio", "Sóleo"],
  },
  {
    id: "panturrilha-sentado",
    name: "Panturrilha Sentado",
    category: "Panturrilha",
    youtubeVideoId: "jMWs_p-W9gY",
    youtubeSearchQuery: "panturrilha sentado execução",
    description: "Foco no sóleo. Sentado, eleve os calcanhares contra a resistência.",
    tip: "Mantenha a ponta dos pés apoiada e execute com amplitude total.",
    muscles: ["Sóleo", "Gastrocnêmio"],
  },

  // ═══════ CARDIO ═══════
  {
    id: "esteira",
    name: "Esteira",
    category: "Cardio",
    youtubeSearchQuery: "corrida esteira técnica correta",
    description: "Corrida ou caminhada na esteira. Ótimo para condicionamento cardiovascular.",
    tip: "Mantenha a postura ereta e olhe à frente. Não segure na barra lateral.",
    muscles: ["Sistema Cardiovascular", "Pernas", "Glúteos", "Core"],
  },
  {
    id: "bicicleta-ergometrica",
    name: "Bicicleta Ergométrica",
    category: "Cardio",
    youtubeSearchQuery: "bicicleta ergométrica treino cardio",
    description: "Pedale em intensidade moderada a alta para melhorar o condicionamento.",
    tip: "Ajuste o banco na altura correta. Joelho levemente flexionado no ponto mais baixo.",
    muscles: ["Quadríceps", "Glúteos", "Posterior de Coxa", "Panturrilhas"],
  },
  {
    id: "eliptico",
    name: "Elíptico",
    category: "Cardio",
    youtubeSearchQuery: "elíptico execução correta",
    description: "Movimento elíptico de baixo impacto. Ótimo para cardio sem impacto nas articulações.",
    tip: "Mantenha o tronco ereto e não se apoie excessivamente nos braços.",
    muscles: ["Quadríceps", "Glúteos", "Posterior de Coxa", "Braços"],
  },
  {
    id: "pular-corda",
    name: "Pular Corda",
    category: "Cardio",
    youtubeSearchQuery: "pular corda técnica correta",
    description: "Exercício cardiovascular de alto gasto calórico. Melhora coordenação e resistência.",
    tip: "Mantenha os cotovelos próximos ao corpo. Pule baixo o suficiente para passar a corda.",
    muscles: ["Panturrilhas", "Quadríceps", "Ombro", "Core", "Sistema Cardiovascular"],
  },
];

// Categorias disponíveis para filtro
export const VIDEO_CATEGORIES: MuscleCategory[] = [
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

// =============================================================================
// Helpers
// =============================================================================

/** Retorna a URL de embed do YouTube para um exercício. */
export function getExerciseVideoEmbedUrl(video: ExerciseVideo): string {
  // Se tiver um ID específico de vídeo, use embed direto
  if (video.youtubeVideoId) {
    return `https://www.youtube.com/embed/${video.youtubeVideoId}`;
  }
  // Fallback: busca pelo nome do exercício
  return `https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(
    video.youtubeSearchQuery
  )}`;
}

/** Retorna a URL do YouTube (watch) para abrir direto no YouTube. */
export function getExerciseWatchUrl(video: ExerciseVideo): string {
  if (video.youtubeVideoId) {
    return `https://www.youtube.com/watch?v=${video.youtubeVideoId}`;
  }
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(
    video.youtubeSearchQuery
  )}`;
}

/** Retorna a URL da miniatura do YouTube (fallback caso não carregue o embed). */
export function getExerciseThumbnailUrl(video: ExerciseVideo): string {
  if (video.youtubeVideoId) {
    return `https://img.youtube.com/vi/${video.youtubeVideoId}/mqdefault.jpg`;
  }
  return "";
}

/** Filtra exercícios por categoria. */
export function filterByCategory(
  videos: ExerciseVideo[],
  category: MuscleCategory | "Todos"
): ExerciseVideo[] {
  if (category === "Todos") return videos;
  return videos.filter((v) => v.category === category);
}

/** Busca exercícios por nome. */
export function searchVideos(
  videos: ExerciseVideo[],
  query: string
): ExerciseVideo[] {
  const q = query.trim().toLowerCase();
  if (!q) return videos;
  return videos.filter(
    (v) =>
      v.name.toLowerCase().includes(q) ||
      v.muscles.some((m) => m.toLowerCase().includes(q)) ||
      v.category.toLowerCase().includes(q)
  );
}
