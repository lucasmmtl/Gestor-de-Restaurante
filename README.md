# Gestor de Restaurante

Painel mobile para operacao de restaurante com foco em tres frentes:

- PDV para abertura e fechamento de pedidos
- cardapio com produtos, imagens e modificadores
- estoque com entradas, saidas e consumo automatico

O projeto foi construido com `React Native + Expo`, usa `Expo Router` para navegacao, `Supabase` como backend e `React Query` para sincronizacao de dados.

## Objetivo do Projeto

O app centraliza a rotina operacional de uma loja em um unico painel admin. A proposta e evitar controles espalhados, acelerar o caixa e aproximar a venda do impacto no estoque.

Em uma demonstracao, a ideia principal para defender o projeto e:

"cada venda feita no PDV conversa com o cardapio e com o estoque, entao o sistema nao e apenas visual, ele tambem aplica regras de negocio."

## Stack e Bibliotecas Importantes

### Base do app

- `expo`: base do projeto mobile, build e execucao
- `react-native`: construcao das telas
- `typescript`: tipagem forte em telas, services e modelos
- `expo-router`: organizacao das rotas por arquivos

### Dados e estado

- `@supabase/supabase-js`: autenticacao, banco e storage
- `@tanstack/react-query`: cache, queries, mutations e invalidacao
- `zustand`: estado global leve para auth, carrinho e UI
- `@react-native-async-storage/async-storage`: persistencia da sessao do Supabase

### UI e experiencia

- `expo-image`: renderizacao de imagens dos produtos
- `expo-image-picker`: selecao de imagem no cadastro de produto
- `expo-linear-gradient`: destaque visual do dashboard
- `@expo/vector-icons`: icones da navegacao e das telas
- `react-native-gesture-handler`: base para gestos e integracao com a arvore principal
- `react-native-safe-area-context`: respeito a areas seguras
- `expo-splash-screen`: controle do carregamento inicial
- `expo-system-ui`: ajuste de cor de fundo do sistema
- `@expo-google-fonts/sora`: tipografia padrao do app

## Como a Arquitetura Esta Organizada

```text
src/
  app/          rotas e telas
  components/   componentes compartilhados
  constants/    tema e assets
  features/     componentes por dominio
  hooks/        integracao com React Query
  lib/          helpers e query client
  services/     acesso ao Supabase e regras de negocio
  store/        estado global com Zustand
  types/        modelos e tipos do banco
supabase/
  migrations/   schema, policies e funcoes SQL
```

### Leitura rapida da arquitetura

O fluxo padrao do projeto e:

`Tela -> Hook -> Service -> Supabase`

Exemplo real:

1. a tela do PDV chama `useCreateOrder`
2. o hook dispara uma mutation do `React Query`
3. o hook delega a regra para `ordersService.createOrder`
4. o service grava pedido, itens, modificadores e movimenta estoque no Supabase
5. o hook invalida queries relacionadas para atualizar dashboard, pedidos e estoque

Esse desenho e bom para apresentacao porque mostra separacao clara entre camada visual, estado assicrono e regra de negocio.

## Rotas e Modulos Principais

### Login

Arquivo principal: `src/app/login.tsx`

Responsabilidades:

- controla acesso ao painel admin
- mostra bloqueio se o usuario existir mas nao tiver role `admin`
- usa o componente `LoginForm`

Ponto interessante:
o projeto diferencia "usuario autenticado" de "usuario autorizado". Nao basta ter conta, o perfil precisa ter permissao no banco.

### Dashboard

Arquivo principal: `src/app/(admin)/index.tsx`

Responsabilidades:

- mostra indicadores do dia
- exibe receita, pedidos pendentes e alertas de estoque
- traz pedidos recentes
- oferece atalhos rapidos para os modulos principais

Funcoes locais interessantes:

- `getGreeting`: adapta a saudacao ao horario
- `getFormattedDate`: formata a data em `pt-BR`
- `getFirstName`: extrai nome amigavel do perfil
- `getPerformanceSnapshot`: transforma metricas em mensagem de situacao da operacao

Essas funcoes ajudam a discutir UX orientada a contexto, nao apenas exibicao bruta de dados.

### PDV

Arquivo principal: `src/app/(admin)/pdv.tsx`

Responsabilidades:

- lista produtos ativos
- adiciona item simples ou configurado ao carrinho
- permite item manual
- cria pedido
- marca pedido pendente como pago

Regras importantes:

- produto com modificadores abre modal de configuracao
- item manual nao depende de produto cadastrado
- carrinho soma modificadores junto ao preco final
- ao concluir venda, o sistema atualiza pedidos, estoque e dashboard

### Cardapio

Arquivo principal: `src/app/(admin)/menu.tsx`

Responsabilidades:

- cadastrar e editar produtos
- ativar e desativar itens
- vincular categorias
- vincular modificadores diretos
- configurar consumo de estoque por produto
- cadastrar modificadores
- vincular consumo de estoque por modificador

Esse modulo e uma das partes mais fortes do projeto, porque conecta cadastro com impacto operacional real.

### Estoque

Arquivo principal: `src/app/(admin)/inventory.tsx`

Responsabilidades:

- cadastrar itens de estoque
- registrar entrada
- registrar saida
- avisar quando quantidade esta abaixo do minimo

Regra importante:
em algumas saidas, se o item zerar, ele pode ser removido do estoque pela regra aplicada no service.

## Hooks Importantes

Os hooks em `src/hooks` fazem a ponte entre interface e services.

### `useDashboardStats`

Arquivo: `src/hooks/use-dashboard.ts`

Busca metricas consolidadas do dashboard. E um bom exemplo de hook enxuto que encapsula uma query.

### `useRecentOrders` e `usePendingOrders`

Arquivo: `src/hooks/use-orders.ts`

Separaram dois cenarios comuns do PDV:

- historico recente
- fila pendente

Isso melhora legibilidade da tela e evita ifs desnecessarios dentro da UI.

### `useCreateOrder`

Arquivo: `src/hooks/use-orders.ts`

Ponto forte para apresentar:

- usa mutation
- centraliza criacao de pedido
- apos sucesso invalida:
  - `recent-orders`
  - `pending-orders`
  - `stock-items`
  - `dashboard`

Isso mostra sincronizacao automatica entre modulos sem refresh manual.

### `useMarkOrderPaid`

Arquivo: `src/hooks/use-orders.ts`

Atualiza o status do pedido e recarrega as areas impactadas. E uma boa demonstracao de consistencia entre telas.

### `useProducts`, `useCategories`, `useModifiers`

Arquivo: `src/hooks/use-menu.ts`

Hooks de leitura do cardapio.

### Hooks de mutation do cardapio

Arquivo: `src/hooks/use-menu.ts`

- `useCreateProduct`
- `useUpdateProduct`
- `useDeleteProduct`
- `useCreateModifier`
- `useUpdateModifier`
- `useDeleteModifier`

O interessante aqui e que as invalidacoes foram pensadas por dominio. Alterar cardapio tambem atualiza dashboard e, em alguns casos, grupos de modificadores.

### `useStockItems`, `useCreateStockItem`, `useRegisterStockMovement`

Arquivo: `src/hooks/use-inventory.ts`

Representam bem a ideia de CRUD + regra operacional, porque nao fazem apenas insercao simples: apos a mutation, outras areas do app sao invalidadas.

## Stores Globais com Zustand

### `useAuthStore`

Arquivo: `src/store/auth-store.ts`

Guarda:

- sessao atual
- perfil do usuario
- loading
- status de inicializacao

Funcoes importantes:

- `bootstrap`: restaura sessao e registra listener de auth
- `handleSession`: atualiza sessao e busca perfil
- `refreshProfile`
- `signIn`
- `signUp`
- `signOut`

Ponto de apresentacao:
o app sobe a autenticacao logo no layout raiz, antes de liberar a navegacao principal.

### `useCartStore`

Arquivo: `src/store/cart-store.ts`

Guarda:

- itens do carrinho
- subtotal
- quantidade total

Funcoes importantes:

- `addConfiguredProduct`
- `addManualItem`
- `incrementItem`
- `decrementItem`
- `removeItem`
- `clear`

Funcoes auxiliares interessantes:

- `recalculate`: recalcula subtotal e quantidade total
- `buildProductSignature`: evita duplicacao de itens iguais com a mesma combinacao de modificadores
- `buildManualId`: gera identificador unico para item manual

Esse e um dos melhores pontos para explicar modelagem de estado.

### `useUiStore`

Arquivo: `src/store/ui-store.ts`

Controla modais e entidades em edicao:

- produto sendo editado
- modificador sendo editado
- produto selecionado para configurar no PDV
- item de estoque em movimentacao

E um store de interface, nao de negocio. Essa separacao e boa para mostrar maturidade arquitetural.

## Services e Regras de Negocio

Os services sao a camada mais importante para entender o projeto.

### `supabase.ts`

Arquivo: `src/services/supabase.ts`

Responsabilidades:

- cria cliente Supabase
- configura persistencia de sessao
- le variaveis de ambiente
- define bucket de storage
- protege o app com `ensureSupabaseConfigured`

Funcao importante:

- `ensureSupabaseConfigured`: impede uso do painel sem as variaveis publicas necessarias

### `auth-service.ts`

Arquivo: `src/services/auth-service.ts`

Responsabilidades:

- recuperar sessao
- buscar perfil em `profiles`
- login
- cadastro
- logout
- observar mudancas de autenticacao

Ponto legal para apresentar:
o projeto mistura `Supabase Auth` com tabela `profiles`, o que permite autorizacao por papel.

### `dashboard-service.ts`

Arquivo: `src/services/dashboard-service.ts`

Responsabilidades:

- contar produtos ativos
- contar pedidos pendentes
- somar receita do dia
- calcular itens abaixo do estoque minimo

Ponto tecnico forte:
usa `Promise.all` para montar o dashboard em paralelo e reduzir tempo de espera.

### `inventory-service.ts`

Arquivo: `src/services/inventory-service.ts`

Responsabilidades:

- listar estoque
- criar item
- registrar entrada e saida
- excluir item quando necessario

Pontos interessantes:

- usa RPC `register_stock_movement`
- remove vinculos em `product_stock` e `modifier_stock` antes de excluir item
- converte valores com `toNumber` para evitar inconsistencias de tipo

### `menu-service.ts`

Arquivo: `src/services/menu-service.ts`

E o service mais rico do projeto.

Responsabilidades:

- listar produtos com categorias, modificadores e insumos relacionados
- listar modificadores e grupos
- criar, atualizar e excluir produto
- criar, atualizar e excluir modificador
- criar, atualizar e excluir grupos de modificadores
- subir imagem para o Supabase Storage
- sincronizar tabelas relacionais

Funcoes muito interessantes:

- `slugify`: gera nome de arquivo amigavel para upload
- `getSingleRelation`: normaliza retorno relacional do Supabase
- `mapStockLinks`: converte relacionamento de estoque para modelo da aplicacao
- `syncProductCategories`
- `syncProductModifiers`
- `syncProductStock`
- `syncModifierGroupItems`
- `syncModifierStock`

Decisao importante:
ao excluir produto ou modificador, o projeto preserva o nome no historico do pedido. Isso evita perder contexto em vendas antigas.

### `orders-service.ts`

Arquivo: `src/services/orders-service.ts`

Responsabilidades:

- buscar pedidos recentes
- buscar pendentes
- criar pedido com itens e modificadores
- marcar pedido como pago
- calcular impacto no estoque

Pontos fortes:

- calcula o total do pedido no service
- busca dados de produtos e modificadores antes de gravar
- monta mapas (`Map`) para acelerar lookup por id
- calcula consumo total de estoque por item vendido
- grava nomes de produto e modificador junto do pedido para manter historico consistente

Esse arquivo e excelente para apresentar porque concentra regra de negocio real.

## Componentes e Modais que Merecem Atencao

### `ProductFormModal`

Arquivo: `src/features/menu/components/product-form-modal.tsx`

O modal de produto faz muita coisa:

- cadastro e edicao
- upload de imagem
- selecao de categorias
- selecao de modificadores por tipo
- definicao de insumos consumidos por produto

Ele mostra bem a proposta do sistema: um cadastro nao serve so para "mostrar no cardapio", mas tambem para alimentar operacao e estoque.

### `ModifierFormModal`

Arquivo: `src/features/menu/components/modifier-form-modal.tsx`

Permite cadastrar complemento ou molho e definir estoque associado.

### `ModifierSelectionModal`

Arquivo: `src/features/pdv/components/modifier-selection-modal.tsx`

Usado no PDV para escolher complementos e molhos antes de adicionar um item ao carrinho.

### `ManualItemModal`

Arquivo: `src/features/pdv/components/manual-item-modal.tsx`

Permite adicionar itens fora do cadastro tradicional. Isso e bom para operacao real, porque nem toda venda passa por um produto previamente estruturado.

### `StockMovementModal`

Arquivo: `src/features/inventory/components/stock-movement-modal.tsx`

Modal simples, mas importante, porque conecta a tela com a regra operacional de entrada e saida.

### `ProductCard`, `CartItem`, `StockItemCard`

Arquivos:

- `src/components/product-card.tsx`
- `src/components/cart-item.tsx`
- `src/features/inventory/components/stock-item-card.tsx`

Esses componentes ajudam a apresentar padronizacao visual e reaproveitamento.

## Banco, Migrations e Regras SQL

O diretorio `supabase/migrations` e muito importante para a apresentacao. Ali nao esta apenas o schema, mas tambem parte relevante da regra de negocio.

### O que existe no banco

- tabelas de produtos, pedidos, itens e estoque
- tabelas de relacionamento para categorias, modificadores e consumo de insumos
- enum de tipo de modificador
- enum de tipo de item de estoque
- policies com Row Level Security
- funcoes SQL para regras criticas

### Funcoes SQL que chamam atencao

- `register_stock_movement`
- `mark_order_paid`
- `assert_modifier_selection_for_product`
- `consume_order_stock`
- `create_order_with_items`

Essas funcoes mostram que o projeto nao depende apenas do frontend para garantir consistencia.

### Boa resposta para apresentacao

Se perguntarem "por que colocar regra no banco?", uma boa defesa e:

"porque estoque e pagamento sao regras sensiveis. Colocar parte disso no banco ajuda a manter consistencia mesmo se no futuro existir outro cliente alem do app mobile."

## Utilitarios e Convencoes

### `src/lib/utils.ts`

Funcoes pequenas, mas muito usadas:

- `formatCurrency`
- `formatDateTime`
- `getErrorMessage`
- `toNumber`

### `src/lib/query-client.ts`

Configuracao padrao do `React Query`:

- `retry: 1` para queries
- `retry: 0` para mutations
- `staleTime: 30_000`
- `refetchOnWindowFocus: false`

Isso e interessante de explicar porque mostra controle de comportamento de rede e cache.

### `src/constants/theme.ts`

Centraliza:

- cores
- fontes
- espacamentos
- bordas
- sombras

Mostrar isso na apresentacao reforca organizacao e consistencia visual.

## Fluxos de Negocio Mais Importantes

### Fluxo 1: login admin

1. usuario entra com email e senha
2. `auth-service` valida no Supabase Auth
3. `useAuthStore` busca o perfil na tabela `profiles`
4. o layout admin so libera acesso se `role === 'admin'`

### Fluxo 2: cadastro de produto

1. usuario abre o modal de produto
2. escolhe categorias, modificadores, estoque e imagem
3. `menuService` faz upload da imagem se necessario
4. produto e salvo
5. tabelas relacionais sao sincronizadas

### Fluxo 3: venda no PDV

1. operador escolhe produto
2. se houver modificadores, abre modal de configuracao
3. item vai para o carrinho
4. mutation cria pedido
5. queries afetadas sao invalidadas
6. dashboard, pedidos e estoque refletem a mudanca

### Fluxo 4: reposicao ou baixa de estoque

1. operador escolhe entrada ou saida
2. mutation chama service
3. service usa RPC para registrar movimentacao
4. dashboard e lista de estoque sao atualizados

## Perguntas Boas para Fazer na Apresentacao

### Arquitetura

- Por que separar `hooks`, `services` e `store`?
- Por que usar `React Query` se ja existe `Zustand`?
- O que fica melhor em estado global e o que fica melhor em cache remoto?

### Produto

- Como o sistema garante que o produto vendido tenha os dados corretos de preco e nome?
- O que acontece com pedidos antigos se um produto for excluido?
- Por que permitir item manual no PDV?

### Estoque

- Como o consumo de estoque e calculado a partir de um pedido?
- Por que um modificador tambem pode consumir estoque?
- O que acontece se um item de estoque chegar a zero?

### Seguranca e acesso

- Como o projeto diferencia autenticacao de autorizacao?
- Onde a permissao de admin e validada?
- Como o Supabase ajuda nisso?

### Banco

- Quais regras estao no frontend e quais estao no banco?
- Por que usar RPC no Supabase para movimentacao de estoque?
- Como o projeto evita perder historico de vendas quando um cadastro e removido?

### UX e operacao

- Por que o dashboard usa mensagens contextuais em vez de mostrar so numeros?
- Como a UI foi pensada para mobile e telas compactas?
- Por que criar atalhos rapidos no dashboard?

## Pontos Muito Bons para Destacar

- separacao clara de responsabilidades
- integracao entre venda, cardapio e estoque
- uso de tipagem forte do banco no frontend
- historico de pedidos preservado mesmo com exclusoes
- invalidacao de cache bem definida
- uso de storage para imagem de produto
- controle de permissao por perfil admin

## Pontos de Atencao Tecnicos

Esses pontos nao diminuem o projeto. Pelo contrario: sao otimos para mostrar visao critica e maturidade na apresentacao.

### 1. Grupos de modificadores existem no backend, mas nao estao integrados na UI principal

O codigo possui:

- tipos para grupos
- hooks para grupos
- service para grupos
- modal para grupos
- tabelas SQL para grupos

Mas a tela principal de cardapio usa hoje modificadores diretos por produto. Isso sugere uma funcionalidade parcialmente preparada para evolucao futura.

### 2. Existe duplicacao de regra entre frontend e banco para criacao de pedido

O banco possui `create_order_with_items`, mas o frontend usa `ordersService.createOrder` com a logica montada no app.

Boa pergunta de apresentacao:
"vale mais centralizar a regra no banco ou manter no frontend?"

### 3. A logica de baixa de estoque merece ser explicada com cuidado

O SQL mostra uma estrategia para consumir estoque no pagamento do pedido, mas o service atual tambem faz baixa ao criar pedido.

Isso e importante porque pode gerar debate sobre o momento correto de descontar estoque:

- ao abrir pedido
- ao marcar como pago
- ao finalizar preparo

Esse e um excelente tema para justificativa de regra de negocio.

### 4. README antigo estava desalinhado do repositorio

Havia referencias a caminhos de outro projeto. Agora o README foi refeito com base no codigo atual.

## Arquivos Mais Importantes para Estudar Antes de Apresentar

- `src/app/_layout.tsx`
- `src/app/(admin)/index.tsx`
- `src/app/(admin)/pdv.tsx`
- `src/app/(admin)/menu.tsx`
- `src/app/(admin)/inventory.tsx`
- `src/store/auth-store.ts`
- `src/store/cart-store.ts`
- `src/store/ui-store.ts`
- `src/services/orders-service.ts`
- `src/services/menu-service.ts`
- `src/services/inventory-service.ts`
- `src/services/dashboard-service.ts`
- `supabase/migrations/20260321_000002_konus_advanced_restaurant.sql`

## Configuracao Local

### Requisitos

- `Node.js` 18+
- `npm`
- projeto Supabase configurado

### Variaveis de ambiente

Crie o `.env` com base no `.env.example`:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
EXPO_PUBLIC_SUPABASE_STORAGE_BUCKET=product-images
```

### Rodando o projeto

```bash
npm install
npm run start
```

Atalhos:

```bash
npm run android
npm run ios
npm run web
npm run lint
npm run typecheck
```

## Resumo para Defender o Projeto

Se precisar resumir o projeto em poucos segundos:

"O Gestor de Restaurante e um painel admin mobile feito com Expo, Supabase, React Query e Zustand. Ele integra autenticacao, cardapio, PDV e estoque em um unico fluxo. O principal diferencial e que a venda nao termina na interface: ela impacta o banco, o historico do pedido e o controle de insumos da operacao."
