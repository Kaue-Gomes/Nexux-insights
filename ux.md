Esse dashboard atinge uma sensação de UX profissional não porque tem muitos elementos, mas porque segue vários princípios de design modernos ao mesmo tempo: hierarquia visual, espaçamento consistente, baixa carga cognitiva, feedback visual e previsibilidade.

Vou decompor exatamente o que faz esse layout parecer tão bom.

1\. Estrutura Geral (Layout)

Utiliza o padrão SaaS moderno:

┌──────── Sidebar ────────┐

│ │

│ │

│ │

└─────────────────────────┘

┌─────────────────────────────────────┐

│ Header │

├─────────────────────────────────────┤

│ KPI Cards │

├─────────────┬───────────┬───────────┤

│ Gráficos │ Widgets │ Widgets │

├─────────────┴───────────┴───────────┤

│ Mais widgets │

└─────────────────────────────────────┘

Características:

Sidebar fixa

Header fixo

Conteúdo scrollável

Grid de cards

Bordas suaves

Muito espaço em branco

O segredo está no whitespace.

2\. Sistema de Espaçamento

Tudo segue praticamente uma escala de 8px.

Exemplo:

8px

16px

24px

32px

48px

64px

Nunca existem elementos "grudados".

Observe:

Cards possuem padding interno grande

Gráficos possuem respiro

Menu possui espaçamento vertical generoso

Isso gera sensação premium.

3\. Sidebar Moderna

Largura aproximada:

260px

Cor:

\#0F172A

ou

\#111827

Características:

Ícones outline

Texto claro

Item ativo destacado

Separadores sutis

Item ativo:

background:

rgba(59,130,246,0.15);

border-radius:

12px;

Não existe sombra pesada.

A seleção é suave.

4\. Topbar

A barra superior segue padrão:

Esquerda

Campo de busca global

height: 48px;

border-radius: 12px;

Com:

ícone de lupa

placeholder cinza

atalho Ctrl+K

Direita

Área do usuário

Contém:

Notificações

Mensagens

Avatar

Nome

Tudo extremamente compacto.

5\. Paleta de Cores

O design utiliza apenas 5 cores principais.

Azul

\#3B82F6

Ações primárias

Verde

\#22C55E

Sucesso

Amarelo

\#EAB308

Avisos

Vermelho

\#EF4444

Crítico

Cinzas

\#F8FAFC

\#E2E8F0

\#64748B

\#334155

Base do sistema.

6\. KPI Cards

Os cards superiores seguem um padrão extremamente importante.

Estrutura:

Título

Número principal

Indicador de crescimento

Ícone

Exemplo:

Total Projetos

28

+18%

📁

Tamanho:

height: 130px;

border-radius: 16px;

padding: 24px;

Cada card possui:

fundo levemente colorido

ícone em container próprio

Exemplo:

background:

rgba(59,130,246,0.05);

O fundo nunca é saturado.

7\. Grid de Conteúdo

Esse é o maior diferencial.

A página usa um grid:

grid-template-columns:

2fr 1fr 1fr;

ou

repeat(12, 1fr)

Exemplo:

████████

████████

█████ ███ ███

█████ ███ ███

████ ████ ████

Isso cria equilíbrio visual.

8\. Cards

Todos seguem o mesmo padrão.

background: white;

border:

1px solid #E5E7EB;

border-radius:

16px;

padding:

24px;

Sombra:

box-shadow:

0 1px 2px rgba(0,0,0,.05);

Sombras quase invisíveis.

O segredo é esse.

Muitos iniciantes exageram.

9\. Tipografia

Provavelmente:

Inter

SF Pro

Poppins

Eu usaria:

font-family: Inter;

Hierarquia:

Título

32px

700

Título de card

18px

600

Valor KPI

42px

700

Texto auxiliar

14px

400

10\. Gráficos

Os gráficos ocupam mais espaço horizontal.

Proporção:

60%

do bloco.

Porque são a informação principal.

Cores:

Azul

Verde

Cinza

Poucas séries.

Pouca poluição.

11\. Feedback Visual

Tudo tem feedback.

Hover:

transition:

all .2s ease;

Card:

transform:

translateY(-2px);

Botão:

opacity:

0.9;

Menu:

background muda suavemente

12\. UX que leva para outro nível

Se você quiser um dashboard realmente premium em 2026, adicione:

Modo escuro

Dark / Light

Comando global

Ctrl + K

Pesquisa universal.

Widgets arrastáveis

Drag and Drop

Insights com IA

Exemplo:

Sua equipe concluiu

18% mais tarefas

que na semana passada.

Dashboard adaptativo

Desktop:

4 KPIs

Tablet:

2 KPIs

Mobile:

1 KPI

Skeleton Loading

Ao carregar:

efeito shimmer

em vez de spinner.

O que faria esse design parecer nível Notion, Linear, Stripe e Vercel

Fonte Inter

Grid de 12 colunas

Espaçamento baseado em 8px

Cards de 16px de radius

Sombras extremamente suaves

Sidebar escura

Conteúdo claro

Paleta limitada a 5 cores

Microanimações de 200ms

Busca global Ctrl+K

Modo escuro

Insights gerados por IA

Layout totalmente responsivo

KPIs em destaque no topo

Gráficos ocupando a área central

Sem excesso de cores

Sem excesso de bordas

Sem excesso de ícones

É exatamente essa combinação que faz esse dashboard transmitir sensação de produto SaaS de alto nível, semelhante a interfaces de plataformas como Linear, Notion, Vercel e Stripe Dashboard.
