# FitTrack - Sistema Integrado de Gestao Fitness e Inteligencia Artificial

O FitTrack e uma plataforma web robusta voltada para a gestao completa de saude, desempenho fisico e acompanhamento de treinos. Desenvolvida para resolver a falta de centralizacao de dados e a dificuldade de personalizacao na rotina de praticantes de atividades fisicas, a aplicacao unifica o poder da inteligencia artificial ao monitoramento antropometrico rigoroso e organizacao de midias de evolucao em um unico ambiente.

---

## Estrutura da Plataforma e Arquitetura de Software

A arquitetura do FitTrack foi projetada focando em escalabilidade, integracao continua e experiencia do usuario. A aplicacao separa de forma clara a camada de apresentacao, a logica de negocio e a persistencia de dados, garantindo respostas rapidas e processamento eficiente de informacoes complexas.

### Frontend e Interface
Construido com React e TypeScript, o sistema utiliza o Vite como ferramenta de build para otimizacao de performance e carregamento instantaneo. A estilizacao e gerenciada via Tailwind CSS, proporcionando uma interface totalmente responsiva, limpa e adaptavel a diferentes dispositivos. O prototipo de componentes e a estrutura visual foram desenhados com auxilio da ferramenta Lovable, garantindo fluidez na navegacao.

### Backend, Banco de Dados e Autenticacao
A infraestrutura de backend e suportada pelo Supabase, utilizando o banco de dados relacional PostgreSQL para o gerenciamento de dados de usuarios, historico de medidas e rotinas de treino. A autenticacao de usuarios e nativa, garantindo isolamento completo das informacoes. O armazenamento de fotos e feito via Supabase Storage com politicas de acesso restrito.

### Servidor e Deploy
O ambiente de execucao conta com suporte ao runtime Node.js e Bun, permitindo gerenciamento eficiente de dependencias e scripts de automacao. A hospedagem e a infraestrutura de producao estao configuradas na plataforma Render.

---

## Funcionalidades Detalhadas

### Modulo de Inteligencia Artificial para Treinos
- Geracao automatizada de fichas de treino personalizadas com base no objetivo principal do usuario, como hipertrofia, emagrecimento, reabilitacao ou condicionamento cardiovascular.
- Adaptacao do volume e da divisao de treino de acordo com a frequencia semanal e o nivel de experiencia informado.
- Sugestao de exercicios alternativos e distribuicao estrategica de grupos musculares para otimizar o descanso e a hipertrofia.

### Avaliacao Antropometrica e Medicoes Corporais
- Registro detalhado de parametros corporais globais, incluindo peso, altura e percentual de gordura.
- Mapeamento segmentado de medidas anatomicas:
  - Membros superiores: bracos (relaxado e contraido) e antebracos.
  - Tronco: peitoral, ombros, cintura e quadril.
  - Membros inferiores: coxas (proximal, media e distal) e panturrilhas.
- Historico estruturado para analise temporal das variacoes de medidas e composicao corporal.

### Diario de Evolucao Visual
- Modulo dedicado para upload e organizacao de fotografias de acompanhamento fisico.
- Categorizacao de imagens por data e angulo (frente, perfil e costas).
- Armazenamento seguro que permite a comparacao direta de diferentes periodos para analise de simetria e ganho de massa magra.

### Painel de Desempenho e Metricas
- Visualizacao centralizada das atividades concluidas, frequencia semanal e metas atingidas.
- Historico de cargas e repeticoes para acompanhamento da progressao de carga nos exercicios.
- Indicadores diretos sobre a constancia e o ritmo de treinos do usuario.

---

## Fluxo de Uso do Sistema

1. Autenticacao de Usuario: O usuario realiza o cadastro ou login seguro para acessar seu painel individual.
2. Definicao de Perfil e Objetivos: Insercao de dados iniciais, historico de treino e metas fisicas.
3. Geracao de Treinos: A inteligencia artificial processa o perfil do usuario e gera a estrutura de treino ideal.
4. Registro de Medidas e Fotos: Insercao das metricas antropometricas e upload das imagens de progresso.
5. Acompanhamento Continuo: Atualizacao periodica de dados para monitorar o desenvolvimento ao longo do tempo.

---

## Status do Projeto

Projeto completamente desenvolvido, documentado e pronto para producao.
