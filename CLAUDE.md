# Busca Imóveis - PWA Colaborativo

## Visão Geral

App web (PWA) para busca colaborativa de apartamentos para alugar. Permite adicionar, comparar e discutir imóveis com outras pessoas através de um link compartilhável, sem necessidade de login.

## Stack Tecnológico

| Camada | Tecnologia | Versão |
|--------|-----------|--------|
| Frontend | Vite + React + TypeScript | Vite 7, React 19 |
| Estilo | Tailwind CSS | v4 (via @tailwindcss/vite) |
| Database | Firebase Firestore | v12 (plano Spark/gratuito) |
| Forms | react-hook-form + zod | RHF 7, Zod 4 |
| Rotas | react-router-dom | v7 |
| IDs | nanoid | v5 |
| Drag & Drop | @dnd-kit (core + sortable + utilities) | latest |
| Ícones | lucide-react | latest |
| PWA | vite-plugin-pwa | v1.2 |
| Scraping | cheerio | latest |
| Hospedagem | Vercel (Hobby/gratuito) | - |

## Estrutura do Projeto

```
D:/Projeto - App imoveis/
├── public/
│   ├── favicon.svg              # Ícone SVG do app (casa azul)
│   └── icons/                   # Ícones PWA (192x192, 512x512) - a criar
├── src/
│   ├── main.tsx                 # Entry point, importa globals.css e monta App
│   ├── App.tsx                  # BrowserRouter + definição de rotas
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx       # Barra superior: nome do quadro, botões Adicionar e Compartilhar
│   │   │   └── BottomNav.tsx    # Navegação inferior mobile (Imóveis, Adicionar, Filtros)
│   │   ├── kanban/
│   │   │   ├── KanbanBoard.tsx      # DndContext + sensores + DragOverlay + estado otimista + drop animation suave
│   │   │   ├── KanbanColumn.tsx     # Coluna droppable (header colorido, contagem, empty state, transição ao receber card)
│   │   │   └── KanbanCard.tsx       # Card arrastável (foto 16:10, título, bairro, imobiliária, custo total + valor /cada)
│   │   ├── property/
│   │   │   ├── PropertyCard.tsx     # Card resumo para view lista: título, ref., bairro, preço, quartos, custo total
│   │   │   ├── PropertyList.tsx     # Grid responsivo de cards + empty state
│   │   │   ├── PropertyForm.tsx     # Formulário com validação zod + importação automática via URL (Lago/Pirâmide)
│   │   │   ├── PropertyFilters.tsx  # Filtros (status, bairro, preço, quartos) + ordenação
│   │   │   └── StatusBadge.tsx      # Badge colorido (Interessado/Agendar Visita/Visitado/Descartado)
│   │   ├── ui/                    # (reservado para componentes UI genéricos)
│   │   └── collaboration/
│   │       ├── UserSelector.tsx    # Modal para selecionar usuário de lista predefinida (Marco/Natália)
│   │       ├── ReactionBar.tsx      # Botões like/dislike/star com contagem
│   │       └── CommentSection.tsx   # Lista de comentários + formulário de envio
│   ├── pages/
│   │   ├── LandingPage.tsx      # Tela inicial: criar quadro, listar e excluir quadros existentes
│   │   ├── BoardPage.tsx        # Kanban (default) ou lista de imóveis, com filtros, ordenação e toggle de view
│   │   ├── AddPropertyPage.tsx  # Formulário para adicionar imóvel
│   │   ├── EditPropertyPage.tsx # Formulário para editar imóvel existente (reutiliza PropertyForm)
│   │   └── PropertyPage.tsx     # Detalhe do imóvel + comentários + reações + status + lightbox de fotos
│   ├── contexts/
│   │   └── UserContext.tsx      # React Context para estado do usuário (nickname via UserSelector)
│   ├── hooks/
│   │   ├── useBoard.ts          # onSnapshot no documento do quadro
│   │   ├── useBoards.ts         # Lista todos os quadros (real-time) para a LandingPage
│   │   ├── useProperties.ts     # CRUD completo + real-time listener na subcollection
│   │   ├── useComments.ts       # Adicionar + listar comentários real-time
│   │   └── useReactions.ts      # Toggle like/dislike/star por visitorId
│   ├── lib/
│   │   ├── firebase.ts          # initializeApp + getFirestore (config via env vars)
│   │   ├── schema.ts            # Schemas zod para validação (propertySchema, boardSchema)
│   │   ├── formatters.ts        # formatCurrency (centavos→BRL), parseCurrency, formatDate
│   │   ├── users.ts             # Lista fixa de usuários do app (USERS: AppUser[]) — Marco e Natália
│   │   └── visitor.ts           # getVisitorId e getNickname/setNickname (localStorage)
│   ├── types/
│   │   └── index.ts             # Interfaces: Board, Property, Comment, Reaction + KANBAN_COLUMNS config
│   └── styles/
│       └── globals.css          # @import "tailwindcss" + base dark mode (bg-gray-950)
├── api/
│   └── scrape.ts                # Vercel Serverless Function: scraping de anúncios (Lago/Pirâmide)
├── .env                         # Variáveis Firebase (VITE_FIREBASE_*)
├── .gitignore                   # Inclui .env
├── index.html                   # HTML base (lang="pt-BR", theme-color)
├── vite.config.ts               # Plugins: react, tailwindcss, VitePWA + apiProxy (dev)
├── vercel.json                  # SPA rewrite + /api serverless functions
├── tsconfig.json                # Referencia tsconfig.app.json e tsconfig.node.json
└── package.json                 # Scripts: dev, build, lint, preview
```

## Rotas

| Rota | Página | Descrição |
|------|--------|-----------|
| `/` | LandingPage | Criar novo quadro, listar e excluir quadros existentes |
| `/b/:boardId` | BoardPage | Kanban board (default) ou lista de imóveis, com filtros e ordenação |
| `/b/:boardId/adicionar` | AddPropertyPage | Formulário de adicionar imóvel |
| `/b/:boardId/editar/:propertyId` | EditPropertyPage | Formulário de edição do imóvel |
| `/b/:boardId/imovel/:propertyId` | PropertyPage | Detalhe + comentários + reações |

## Schema do Firestore

### `boards/{boardId}`
```
id: string (nanoid 10 chars)
nome: string
criadoEm: Timestamp
atualizadoEm: Timestamp
```

### `boards/{boardId}/properties/{propertyId}`
```
titulo, codigoImovel, bairro, endereco: string
aluguel, condominio, iptu: number (em centavos)
quartos, banheiros: number
area: number | null (m²)
imobiliaria, linkAnuncio, observacoes, descricao: string
fotos: string[] (URLs externas)
status: "interessado" | "agendar_visita" | "visitado" | "descartado"
adicionadoPor: string (nickname)
criadoEm, atualizadoEm: Timestamp
```

### `boards/{boardId}/properties/{propertyId}/comments/{commentId}`
```
texto: string
autor: string (nickname)
criadoEm: Timestamp
```

### `boards/{boardId}/properties/{propertyId}/reactions/{reactionId}`
```
visitorId: string (localStorage)
tipo: "like" | "dislike" | "star"
criadoEm: Timestamp
```

## Tema Visual

O app usa **modo escuro fixo** (não há toggle claro/escuro). Paleta baseada em tons de `gray-950`/`gray-800`/`gray-700` com acentos em `blue-600` (botões) e `blue-400` (textos de destaque). O `theme-color` do PWA é `#111827`. Inputs usam `bg-gray-700` com bordas `gray-600`.

## Conceitos Importantes

### Quadro (Board)
Cada busca de imóveis é um "quadro" com ID único. A URL do quadro é compartilhável — qualquer pessoa com o link pode ver, adicionar imóveis, comentar e reagir sem login.

### Preços em Centavos
Valores monetários (aluguel, condomínio, IPTU) são armazenados como inteiros em centavos para evitar problemas de ponto flutuante. A formatação para BRL (R$ 1.500,00) é feita por `formatCurrency()` e o parse por `parseCurrency()`.

### Custo Total
Calculado client-side: `aluguel + condominio + iptu`. Exibido em destaque no KanbanCard, PropertyCard e PropertyPage. No KanbanCard, exibe também o valor dividido por 2 (`/cada`) ao lado do total mensal.

### Kanban Board
O BoardPage exibe por padrão um quadro Kanban com 4 colunas que representam o fluxo de avaliação:
- **Interessados** (`interessado`): Gostamos mas ainda não olhamos a fundo (coluna inicial)
- **Agendar Visita** (`agendar_visita`): Tentando agendar visita / negociar preço
- **Visitados** (`visitado`): Visitamos, espaço para comentários sobre a visita
- **Descartados** (`descartado`): Visitamos e não gostamos

Os cards são arrastáveis entre colunas via drag-and-drop (@dnd-kit) com estado otimista (card move instantaneamente sem esperar Firestore). O KanbanBoard usa `onDragOver` para feedback visual imediato durante o arraste e `dropAnimation` com easing suave (250ms cubic-bezier). Click no card navega para o detalhe. Toggle Kanban/Lista disponível no header (preferência salva em localStorage). No mobile, colunas fazem scroll horizontal com snap. O KanbanCard exibe: foto (aspect 16:10), título, ref., bairro, quartos/banheiros, imobiliária, custo total mensal e valor por pessoa (/cada).

### Migração de Status
O hook `useProperties` normaliza status antigos no read-time: `novo` e `favorito` → `interessado`. Novos imóveis são criados com status `interessado`.

### Identificação sem Login
- **visitorId**: nanoid de 12 chars salvo no localStorage, usado para controlar reações (evitar duplicatas)
- **nickname**: selecionado pelo usuário no UserSelector (lista fixa: Marco, Natália), salvo no localStorage via UserContext, usado em comentários e ao adicionar imóveis. O UserSelector é exibido como modal ao entrar em páginas que precisam de identificação (AddPropertyPage, CommentSection).

### Real-time
Todos os hooks usam `onSnapshot` do Firestore para sincronização instantânea entre usuários. Quando alguém adiciona um imóvel ou comentário, todos com o quadro aberto veem imediatamente.

### Exclusão de Quadros
A LandingPage permite excluir quadros com confirmação inline. A exclusão remove recursivamente todas as subcollections (properties, comments, reactions) usando `writeBatch` antes de deletar o documento do board.

### Código do Imóvel (codigoImovel)
Campo opcional para armazenar o número de referência da imobiliária (ex: "AP-12345"). Exibido como "Ref: AP-12345" no card e na página de detalhe. Facilita a identificação ao conversar sobre imóveis específicos.

### Fotos
Armazenadas como array de URLs externas (não há upload direto). O usuário cola o link da foto do anúncio original. Na PropertyPage, clicar em uma foto abre um lightbox fullscreen com navegação entre fotos (setas) e contador.

### Importação de Anúncios via URL
O PropertyForm permite importar dados automaticamente colando a URL de um anúncio. Suporta dois sites (mesma plataforma KSI):
- **Lago Imobiliária** (`lagoimobiliaria.com.br`)
- **Pirâmide Imóveis** (`imobiliariapiramide.com.br`)

O fluxo: usuário cola URL → clica "Importar" → `POST /api/scrape` (Vercel Serverless Function) faz fetch com headers de navegador, parseia HTML com cheerio, extrai dados do JSON-LD (título, fotos, código, imobiliária, descrição) e seletores CSS (aluguel, condomínio, IPTU, quartos, banheiros, área, bairro) → preenche todos os campos do formulário via `reset()` do react-hook-form. Em dev local, o plugin `apiProxy` no `vite.config.ts` intercepta `/api/scrape` e executa a mesma lógica.

## Comandos

```bash
npm run dev      # Servidor de desenvolvimento (http://localhost:5173)
npm run build    # Build de produção (output: dist/)
npm run preview  # Preview do build de produção
npm run lint     # ESLint
```

## Variáveis de Ambiente (.env)

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

## Firebase - Projeto Atual

- **Nome**: App imobiliaria
- **ID**: app-imobiliaria-dc57a
- **Plano**: Spark (gratuito)
- **Firestore**: Ativado

## Deploy

O projeto está configurado para deploy no Vercel:
1. Conectar repositório GitHub ao Vercel
2. Configurar variáveis de ambiente (VITE_FIREBASE_*) no painel Vercel
3. Build command: `npm run build`, output: `dist`
4. `vercel.json` com rewrite SPA já configurado

## Possíveis Melhorias Futuras

- Exportar quadro para CSV/planilha
- Upload direto de fotos (via Cloudinary free tier)
- Firebase Anonymous Auth para visitorId mais robusto
- Code splitting para reduzir bundle size (Firebase SDK é ~620kb)
- Ícones PWA 192x192 e 512x512 (pasta `public/icons/` criada mas vazia)
- Suporte a mais sites de imobiliárias na importação por URL (adicionar hosts em `api/scrape.ts` ALLOWED_HOSTS + ajustar parser se necessário)
