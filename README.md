# Sobre o trabalho

Projeto da Faculdade.

Professor: Elemar.

Aluno: Lucas Matheus Matos de Lima, João Vitor da Silva Nogueira, Victor Macedo Cruz Belo, Felipe Gabriel Loose

# Gestor de Restaurante

Painel mobile para operacao de restaurante com foco em agilidade no caixa, controle de estoque e organizacao do cardapio.

O projeto foi construido com `React Native + Expo`, usa `Expo Router` para navegacao, `Supabase` como backend e `React Query` para sincronizacao de dados.

## Visao do Produto

O `Gestor de Restaurante` centraliza a rotina da loja em um unico app:

- acompanhamento rapido da operacao no dashboard
- abertura de pedidos no PDV
- cadastro e manutencao de produtos do cardapio
- gestao de complementos e molhos por produto
- controle de estoque com entradas, saidas e consumo automatico
- consulta de pedidos recentes e pendentes

## Principais Modulos

### Dashboard

- resumo da operacao do dia
- receita acumulada
- pedidos pendentes
- alertas de estoque
- pedidos recentes

Arquivo principal:

- [src/app/(admin)/index.tsx](</c:/Users/LUCAS.LIMA/Documents/10%20-%20FACULDADE/trabalho%20facul%202026/konus-pizza/src/app/(admin)/index.tsx>)

### PDV

- listagem de produtos ativos
- configuracao de complementos e molhos
- carrinho com subtotal
- criacao de pedidos
- baixa de estoque no fluxo de venda

Arquivo principal:

- [src/app/(admin)/pdv.tsx](</c:/Users/LUCAS.LIMA/Documents/10%20-%20FACULDADE/trabalho%20facul%202026/konus-pizza/src/app/(admin)/pdv.tsx>)

### Cardapio

- cadastro de produtos
- associacao de modificadores ao produto
- controle de categorias
- configuracao de consumo de estoque

Arquivo principal:

- [src/app/(admin)/menu.tsx](</c:/Users/LUCAS.LIMA/Documents/10%20-%20FACULDADE/trabalho%20facul%202026/konus-pizza/src/app/(admin)/menu.tsx>)

### Estoque

- cadastro de insumos e itens de estoque
- entradas e saidas
- alerta de minimo
- vinculo com produtos e modificadores para consumo automatico

Arquivo principal:

- [src/app/(admin)/inventory.tsx](</c:/Users/LUCAS.LIMA/Documents/10%20-%20FACULDADE/trabalho%20facul%202026/konus-pizza/src/app/(admin)/inventory.tsx>)

## Stack

- `Expo`
- `React Native`
- `TypeScript`
- `Expo Router`
- `Supabase`
- `@tanstack/react-query`
- `Zustand`
- `expo-linear-gradient`
- `react-native-reanimated`

## Estrutura

```text
src/
  app/                 rotas e telas
  components/          componentes compartilhados
  constants/           tema, assets e constantes
  features/            componentes por dominio
  hooks/               hooks de dados
  lib/                 helpers, labels e query client
  services/            integracao com Supabase e regras de negocio
  store/               estados globais
  types/               tipagens do banco e modelos
supabase/
  migrations/          migracoes SQL do projeto
```

## Requisitos

- `Node.js` 18 ou superior
- `npm`
- conta no `Supabase`
- `Expo CLI` ou uso via `npx expo`
- `EAS CLI` para builds Android/iOS

## Configuracao Local

1. Instale as dependencias:

```bash
npm install
```

2. Crie o arquivo `.env` com base no `.env.example`:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
EXPO_PUBLIC_SUPABASE_STORAGE_BUCKET=product-images
```

3. Execute o projeto:

```bash
npm run start
```

Atalhos uteis:

```bash
npm run android
npm run ios
npm run web
```

## Scripts

```bash
npm run start
npm run android
npm run ios
npm run web
npm run lint
npm run typecheck
```

## Ambiente e Supabase

As variaveis publicas sao lidas em:

- [src/services/supabase.ts](/c:/Users/LUCAS.LIMA/Documents/10%20-%20FACULDADE/trabalho%20facul%202026/konus-pizza/src/services/supabase.ts)

Se `EXPO_PUBLIC_SUPABASE_URL` ou `EXPO_PUBLIC_SUPABASE_ANON_KEY` nao estiverem disponiveis, o painel admin nao inicia.

## Build com Expo e EAS

### Gerar APK para testes

```bash
eas build -p android --profile preview
```

### Gerar build de producao

```bash
eas build -p android --profile production
```

### Variaveis no EAS

Para builds em nuvem, o `.env` local nao basta. Configure tambem as variaveis no ambiente do EAS:

- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- `EXPO_PUBLIC_SUPABASE_STORAGE_BUCKET`

O perfil usado no build precisa bater com o ambiente configurado no `eas.json`, por exemplo:

- `preview` para APK interno
- `production` para release

## Experiencia do Sistema

### Fluxo principal

1. o operador faz login
2. acessa dashboard, PDV, estoque ou cardapio
3. cria um pedido no PDV
4. o sistema registra os itens vendidos
5. o estoque e atualizado conforme o consumo configurado

### Regras importantes

- produtos podem ter complementos e molhos vinculados diretamente
- historico de pedidos preserva nomes mesmo se produto ou modificador forem excluidos
- itens de estoque podem ser removidos automaticamente quando a saida zera a quantidade

## Identidade do Projeto

`Gestor de Restaurante` nao e apenas um cardapio digital. A proposta do app e funcionar como centro operacional da loja:

- vender com rapidez
- manter a cozinha abastecida
- reduzir erro humano
- dar visibilidade do que esta acontecendo agora

## Melhorias Futuras Sugeridas

- permissao por perfil de usuario
- notificacoes de estoque critico
- relatorios por periodo
- comparativo de faturamento diario
- impressao ou compartilhamento de pedidos
- upload mais completo de imagens dos produtos

## Observacoes

- o app usa tema dark como base visual
- o projeto foi preparado para operacao mobile com foco em Android
- o nome interno antigo `konus-pizza` ainda pode aparecer em alguns arquivos historicos e migrations

## Licenca

Projeto academico e/ou privado. Ajuste esta secao conforme a licenca real do repositorio.
