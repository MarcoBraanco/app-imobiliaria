# Branares - Imóveis 🏠

**App colaborativo para busca de apartamentos para alugar.**

Eu e minha namorada estávamos procurando apartamento para alugar juntos e sentimos falta de uma ferramenta onde pudéssemos organizar os imóveis que encontrávamos, comparar opções lado a lado e discutir cada uma — tudo em um lugar só. As conversas ficavam espalhadas entre WhatsApp, prints de tela e abas do navegador. Foi daí que nasceu o Branares.

## O que é

Um PWA (Progressive Web App) que funciona como um quadro Kanban colaborativo para organizar imóveis durante a busca por aluguel. Qualquer pessoa com o link do quadro pode ver, adicionar imóveis, comentar e reagir — sem precisar criar conta.

## Como funciona

### Quadros compartilháveis
Cada busca é um **quadro** com link único. Basta compartilhar a URL para que outra pessoa participe da busca junto com você, em tempo real.

### Kanban de avaliação
Os imóveis passam por um fluxo visual de 4 colunas:

| Coluna | Significado |
|--------|-------------|
| **Interessados** | Gostamos mas ainda não olhamos a fundo |
| **Agendar Visita** | Tentando agendar visita ou negociar preço |
| **Visitados** | Já visitamos — espaço para comentários sobre a visita |
| **Descartados** | Visitamos e não gostamos |

Arraste os cards entre colunas para atualizar o status. Também é possível alternar para uma visualização em lista com filtros e ordenação.

### Importação automática de anúncios
Cole a URL de um anúncio de imobiliária e o app preenche automaticamente todos os campos (título, fotos, preço, condomínio, IPTU, bairro, quartos, etc). Atualmente suporta:
- Lago Imobiliária
- Pirâmide Imóveis

### Colaboração em tempo real
- **Comentários** em cada imóvel para discutir prós e contras
- **Reações** (like, dislike, favorito) para sinalizar preferências rapidamente
- **Sincronização instantânea** — qualquer alteração aparece imediatamente para todos que estão com o quadro aberto

### Custo total calculado
O app calcula e exibe em destaque o custo mensal total (aluguel + condomínio + IPTU) e o valor dividido por pessoa, facilitando a comparação entre imóveis.

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Frontend | React 19 + TypeScript + Vite |
| Estilo | Tailwind CSS v4 |
| Database | Firebase Firestore (real-time) |
| Drag & Drop | @dnd-kit |
| Forms | react-hook-form + Zod |
| PWA | vite-plugin-pwa |
| Scraping | Cheerio (Serverless Function) |
| Hospedagem | Vercel |

## Rodando localmente

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
# Crie um arquivo .env com suas credenciais Firebase:
# VITE_FIREBASE_API_KEY=
# VITE_FIREBASE_AUTH_DOMAIN=
# VITE_FIREBASE_PROJECT_ID=
# VITE_FIREBASE_STORAGE_BUCKET=
# VITE_FIREBASE_MESSAGING_SENDER_ID=
# VITE_FIREBASE_APP_ID=

# Iniciar servidor de desenvolvimento
npm run dev
```

## Screenshots

*Em breve*

## Licença

Projeto pessoal, código aberto para referência.
