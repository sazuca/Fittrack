
# Plano de Evolução do FitTrack

O escopo é grande (8 frentes). Vou executar em **3 fases**, na ordem que entrega valor mais rápido e corrige os bugs críticos primeiro. Posso ajustar a ordem se você preferir.

---

## Fase 1 — Correções críticas + fundação (prioridade máxima)

**1.1 Fix mobile de mídia (bug crítico)**
- Refatorar `photos.tsx`: botões de excluir/editar visíveis e clicáveis em touch (hoje ficam no `hover`, por isso só funciona no desktop).
- Trocar `onMouseDown` / hover-only por `onClick` + área de toque ≥44px.
- Upload via `<input capture>` para abrir câmera no celular.
- Preview e exclusão com confirmação funcionando em iOS/Android.

**1.2 Cronômetro de descanso (timer global)**
- Novo `RestTimerProvider` (Context) que persiste em `localStorage` e continua rodando mesmo ao trocar de tela.
- Presets 30/45/60/90/120s + custom.
- Barra circular animada, vibração (`navigator.vibrate`) e bipe ao terminar.
- Botão flutuante "Iniciar descanso" dentro da tela do treino.

**1.3 Edição manual do treino (override da IA)**
- Em `workouts.$day.tsx`: botão **"Editar treino"** que abre modo edição.
- Ações: adicionar, remover, reordenar (drag), trocar exercício, editar séries/reps/descanso/observações/carga.
- Nova coluna `customized: boolean` no plano — IA não sobrescreve sem confirmação ("Você editou esse treino. Substituir mesmo assim?").
- Persiste em `fittrack_profiles.workout_plan` (já existe).

---

## Fase 2 — Tracking de carga + comparação corporal

**2.1 Controle de carga/PR**
- Nova tabela `exercise_logs` (user_id, exercise_name, date, weight, sets, reps).
- Ao finalizar série, registrar peso usado. Gráfico de progressão por exercício + badge de **PR** quando bate recorde.
- Histórico acessível pelo exercício e por uma aba "Cargas".

**2.2 Comparação corporal "Antes vs Depois"**
- Em `photos.tsx`: dois seletores de data → slider antes/depois (touch friendly) + métricas lado a lado (peso, medidas de `body_measurements`, frequência de treino, evolução de carga).
- Timeline horizontal scrollável com miniaturas.
- **Insights automáticos** (heurística local em `src/lib/insights.ts`): compara medidas, frequência por grupo muscular e progressão de carga; gera frases como "Maior evolução em pernas", "Baixa frequência em ombro".

---

## Fase 3 — Mídia dos exercícios + polimento de UI

**3.1 Biblioteca de exercícios com mídia**
- `src/lib/exercise-library.ts` com catálogo (nome, GIF/vídeo, músculos, dicas, erros comuns). Uso de GIFs públicos do **wger** (open-source) ou Wikimedia, sem chaves.
- Modal ao clicar no exercício: vídeo/GIF, músculos ativados, instruções, dicas de postura, erros comuns.

**3.2 Refinamento de UI**
- Ícone de fogo (streak) com gradiente quente, glow e animação leve (framer-motion).
- Micro-interações em botões, badges com gradiente, melhor contraste, hierarquia visual.
- Mantém paleta `#014D4E` + branco + glassmorphism do design system atual.

---

## Detalhes técnicos

- **Banco de dados:** novas tabelas `exercise_logs` com RLS por `auth.uid()` e `GRANT` para `authenticated` + `service_role`.
- **Plano de treino:** estendo o tipo `Exercise` com `weight?: number`, `notes?: string`, `order: number`; estendo `WorkoutDay` com `customized?: boolean`. Migração não-destrutiva (JSON em `workout_plan`).
- **Persistência:** continua usando `fittrack_profiles` (debounced upsert já existente em `store.ts`) + tabelas dedicadas para logs.
- **Mobile-first:** todos os controles novos com `min-h-11`, eventos `onClick` (não hover), `touch-action: manipulation`.
- **Sem novas dependências pesadas:** drag-and-drop com `@dnd-kit/core` (leve), restante com o que já existe (framer-motion, recharts, lucide).

---

## O que eu gostaria de confirmar antes de começar

1. **Ordem das fases:** posso seguir 1 → 2 → 3 ou você quer priorizar outra (ex.: mídia dos exercícios primeiro)?
2. **Biblioteca de exercícios:** ok usar GIFs públicos do wger (gratuito, sem API key)? Alternativa é você subir as mídias depois.
3. **Edição da IA:** ao re-gerar treino com IA, devo **mesclar** os dias customizados (mantendo-os) ou perguntar dia a dia?

Se preferir, respondo "vai" e implemento tudo na ordem proposta com as escolhas padrão (1→2→3, wger, manter dias customizados por padrão).
