# Frota API

API REST para controlar a utilização dos automóveis da empresa: cadastro de automóveis, motoristas e o registro de quem está usando qual carro.

Feito com Node.js + Express. Os dados ficam em memória, então tudo é perdido ao reiniciar a aplicação.

## Requisitos

- Node.js 18 ou superior
- npm

## Como rodar

```bash
npm install
npm start
```

A API sobe em `http://localhost:3000` (dá pra trocar com a variável `PORT`).

Para desenvolvimento, `npm run dev` reinicia o servidor a cada alteração.

## Testes

```bash
npm test
```

Para ver a cobertura:

```bash
npm run test:coverage
```

Os testes estão em `tests/`:

- `tests/unit`: testes dos services, onde ficam as regras de negócio
- `tests/integration`: testes das rotas usando supertest

## Endpoints

### Automóveis

| Método | Rota         | Descrição                                      |
| ------ | ------------ | ---------------------------------------------- |
| GET    | `/cars`      | Lista os automóveis. Filtros: `color`, `brand` |
| GET    | `/cars/:id`  | Busca um automóvel                             |
| POST   | `/cars`      | Cadastra um automóvel                          |
| PUT    | `/cars/:id`  | Atualiza um automóvel                          |
| DELETE | `/cars/:id`  | Exclui um automóvel                            |

```json
{ "plate": "ABC1D23", "color": "Prata", "brand": "Fiat" }
```

A placa aceita o padrão antigo (`ABC1234`) e o Mercosul (`ABC1D23`), com ou sem hífen. Ela é salva sempre em maiúsculo e sem hífen, e não pode se repetir.

### Motoristas

| Método | Rota            | Descrição                                       |
| ------ | --------------- | ----------------------------------------------- |
| GET    | `/drivers`      | Lista os motoristas. Filtro: `name`             |
| GET    | `/drivers/:id`  | Busca um motorista                              |
| POST   | `/drivers`      | Cadastra um motorista                           |
| PUT    | `/drivers/:id`  | Atualiza um motorista                           |
| DELETE | `/drivers/:id`  | Exclui um motorista                             |

```json
{ "name": "João da Silva" }
```

O filtro por nome busca por parte do nome, sem diferenciar maiúsculas e minúsculas.

### Utilização

| Método | Rota                  | Descrição                                   |
| ------ | --------------------- | ------------------------------------------- |
| GET    | `/usages`             | Lista as utilizações com motorista e carro  |
| POST   | `/usages`             | Inicia uma utilização                       |
| PATCH  | `/usages/:id/finish`  | Finaliza uma utilização                     |

Iniciar:

```json
{
  "carId": "<id do automóvel>",
  "driverId": "<id do motorista>",
  "reason": "Visita a cliente",
  "startDate": "2026-10-27T08:00:00.000Z"
}
```

Finalizar:

```json
{ "endDate": "2026-10-27T12:00:00.000Z" }
```

`startDate` e `endDate` são opcionais. Se não forem enviados, a API usa a data/hora atual.

Exemplo de resposta da listagem:

```json
[
  {
    "id": "6b0f...",
    "reason": "Visita a cliente",
    "startDate": "2026-10-27T08:00:00.000Z",
    "endDate": null,
    "driver": { "id": "a1c2...", "name": "João da Silva" },
    "car": { "id": "f9e8...", "plate": "ABC1D23", "color": "Prata", "brand": "Fiat" }
  }
]
```

## Regras de negócio

- Um automóvel só pode estar com um motorista por vez (`409`).
- Um motorista não pode usar dois automóveis ao mesmo tempo (`409`).
- A data de término não pode ser anterior à data de início (`400`).
- Uma utilização já finalizada não pode ser finalizada de novo (`409`).
- Automóveis e motoristas que já têm registros de utilização não podem ser excluídos (`409`). Optei por isso para não deixar o histórico com referências quebradas.

## Erros

Todos os erros seguem o mesmo formato:

```json
{ "message": "Automóvel não encontrado" }
```

| Status | Quando                                           |
| ------ | ------------------------------------------------ |
| 400    | Dados inválidos ou JSON mal formado              |
| 404    | Recurso ou rota não encontrada                   |
| 409    | Conflito com alguma regra de negócio             |

## Estrutura

```
src/
  app.js              monta o express e injeta as dependências
  server.js           sobe o servidor
  errors/             classes de erro da aplicação
  middlewares/        404 e tratamento de erros
  shared/             repositório em memória e validações
  modules/
    cars/             repository, service, controller e rotas
    drivers/
    usages/
tests/
  unit/
  integration/
```

Cada módulo separa as responsabilidades em camadas: o controller só lida com HTTP, o service concentra as regras e o repository guarda os dados. Como o repository é injetado no service, trocar a persistência em memória por um banco não exige mexer nas regras.
