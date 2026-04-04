# Share Your Role — Contexto do projeto

## O que é

Plataforma web para divulgação e descoberta de eventos universitários (festas, integras, afters) em cidades universitárias. Resolve o problema de calendários espalhados em planilhas e grupos de WhatsApp, centralizando eventos, vendedores de ingresso e contato com promoters.

---

## Stack definida

- **Backend:** Node.js + Express
- **ORM:** Prisma
- **Banco de dados:** PostgreSQL
- **Autenticação:** JWT
- **Hash de senha:** bcrypt
- **Envio de e-mail:** Resend
- **Frontend:** React (web)
- **Testes:** Jest + Supertest
- **Banco local:** `share_your_role` (usuário: `darlam.alves`, sem senha)

---

## Estrutura de pastas

```
share-your-role-api/
├── prisma/
│   └── schema.prisma
├── src/
│   ├── config/
│   │   └── prisma.js          # instância única do PrismaClient
│   ├── controllers/
│   │   ├── event.js
│   │   └── user.js
│   ├── database/
│   │   ├── schema.sql         # schema validado no Postgres
│   │   └── seed.sql           # dados de exemplo para testes
│   ├── middlewares/
│   │   └── auth.js            # middleware JWT + requireRole()
│   ├── models/
│   │   ├── event.js
│   │   └── user.js
│   ├── routes/
│   │   ├── event.js
│   │   └── user.js
│   ├── services/
│   │   ├── eventService.js
│   │   └── userService.js
│   └── index.js
├── tests/
├── .env                       # DATABASE_URL, JWT_SECRET, PORT
├── .gitignore
├── jest.config.js
├── package.json
└── prisma.config.ts
```

---

## Banco de dados

### Decisões importantes

- Schema validado com `schema.sql` e `seed.sql` rodando no Postgres local
- Prisma usa o banco existente via `npx prisma db pull` + `npx prisma generate`
- **Nunca escrever SQL na aplicação** — usar sempre Prisma Client
- SQL puro só no terminal para validar integridade do modelo

### Tabelas e ENUMs

**ENUMs:**
- `user_role`: `public` | `institutional` | `admin`
- `member_role`: `member` | `admin` | `aggregate`
- `invite_status`: `pending` | `accepted` | `rejected`
- `visibility_type`: `public` | `institutional_only` | `private`
- `presence_status`: `confirmed` | `cancelled` | `maybe`
- `seller_status`: `open` | `sold` | `cancelled`

**Tabelas:**
- `users` — campos: id, name, email_personal, email_institutional, phone, password_hash, role, created_at, email_institutional_verified, verification_token, verification_token_expires_at
- `republics` — id, name, city, instagram, created_at
- `republic_members` — user_id, republic_id, role (PK composta)
- `republic_invites` — id, republic_id, invited_user_id, invited_by_user_id, status, created_at
- `events` — id, name, description, date, created_by_user_id, created_by_republic_id, ticket_platform, ticket_url, instagram, visibility_type, created_at
- `event_location` — event_id (PK/FK), latitude, longitude, address, release_at
- `event_promoters` — id, event_id, name, whatsapp, instagram, telegram
- `event_lots` — id, event_id, lot_number, price, start_date, end_date, active
- `event_presence` — event_id, user_id, status (PK composta)
- `sellers` — id, user_id, event_id, price, quantity, status, created_at
- `seller_reviews` — id, reviewer_user_id, seller_id, rating, comment, created_at

### Constraints importantes
- `users`: pelo menos um email obrigatório (`chk_at_least_one_email`)
- `event_lots`: `price >= 0`, `lot_number` único por evento
- `sellers`: `price >= 0`, `quantity > 0`
- `seller_reviews`: `rating BETWEEN 1 AND 5`, único por reviewer + seller
- Todos os FKs com `ON DELETE CASCADE`

### Mudanças pendentes no banco
Adicionar em `users` antes de implementar o cadastro:
```sql
ALTER TABLE users ADD COLUMN email_institutional_verified BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE users ADD COLUMN verification_token TEXT;
ALTER TABLE users ADD COLUMN verification_token_expires_at TIMESTAMPTZ;
```

---

## Regras de negócio

### Usuários e autenticação
- `role` é definido **automaticamente pelo backend**, nunca pelo frontend
- Se `email_institutional` for enviado → `role = institutional` (após verificação)
- Se só `email_personal` → `role = public`
- `password_hash` **nunca** aparece em respostas da API
- Token de verificação de e-mail expira em 24h e é de uso único
- JWT expira em 7 dias, payload: `{ id, role, email_institutional_verified }`

### Visibilidade de eventos
- `public` → qualquer pessoa vê, localização sempre visível se `release_at IS NULL`
- `institutional_only` → localização visível só para `email_institutional_verified = true`
- `private` → só membros da república veem

### Localização
- `release_at NULL` = localização sempre visível (ex: Brick, Banana, Oasis)
- `release_at` preenchido = localização embargada até esse horário (ex: repúblicas — libera 1h antes)

### Lotes
- Só um lote `active = true` por evento por vez (regra de negócio no backend)
- Admin pode encerrar lote manualmente (`active = false`)
- `end_date` opcional — encerramento pode ser manual ou pelo início do próximo lote

### Sellers (revenda)
- Preço máximo: **130% do menor lote ativo** do evento
- Validação feita no `SellerService`, não no banco
- `GET /events/:id/sellers` é rota **pública** — não exige login
- `POST /events/:id/sellers` exige login
- Listagem ordenada por `price ASC`

### Repúblicas
- Criador vira `admin` automaticamente em `republic_members`
- Só admin da república pode convidar membros
- Convite aceito cria registro em `republic_members` com `role = member`

---

## Contratos de API (MVP)

### Rotas públicas (sem JWT)
- `GET /health`
- `POST /users` — cadastro
- `POST /auth/login`
- `GET /users/verify/:token`
- `GET /events` — lista eventos (filtra visibilidade conforme token se presente)
- `GET /events/:id` — detalhe do evento
- `GET /events/:id/sellers` — lista vendedores

### Rotas autenticadas (exigem JWT)
- `POST /events` — requer `institutional` ou `admin`
- `PATCH /events/:id` — somente criador ou admin
- `POST /events/:id/lots`
- `PATCH /events/:id/lots/:id/close`
- `POST /events/:id/presence`
- `DELETE /events/:id/presence`
- `POST /events/:id/sellers` — qualquer usuário logado
- `POST /sellers/:id/reviews`
- `POST /republics` — requer `institutional` ou `admin`
- `POST /republics/:id/invites` — somente admin da república
- `PATCH /republics/invites/:id` — somente usuário convidado

---

## MVP — escopo de entrega (2 meses)

### Incluído
- Cadastro e login de usuário
- Verificação de e-mail institucional via Resend
- Calendário de eventos (semana atual por padrão, navegação por semanas)
- Detalhe do evento com promoters, lotes e localização condicional
- Criar e editar eventos (usuário institucional)
- Ver vendedores de ingresso com contato (WhatsApp/Instagram)
- Anunciar ingresso para revenda

### Fora do MVP (fase 2)
- Repúblicas e integras
- Avaliação de vendedores
- Lotes avançados
- Notificações
- Testes automatizados completos
- CI/CD

---

## Cronograma resumido (8 semanas)

| Semana | Foco | Reunião (segunda) |
|--------|------|-------------------|
| 1 | Setup + fundação + user flows UX | Kickoff |
| 2 | Auth (cadastro + login + JWT) + wireframes | Revisão user flows |
| 3 | Verificação e-mail + criar evento + wireframes auth | Revisão wireframes tela 1 e 2 |
| 4 | Sellers + revisão geral wireframes | Aprovação wireframes |
| 5 | Deploy API + início frontend | Kickoff frontend |
| 6 | Integração frontend + backend | Demo primeira integração |
| 7 | Polimento e testes | Demo ponta a ponta |
| 8 | Deploy produção + entrega | Ensaio apresentação |

---

## Time e responsabilidades

- **Você (Darlam):** backend, arquitetura, refinamento de tasks, organização do Trello
- **Eng. 2:** backend (eventos — leitura e listagem)
- **Eng. 3:** backend (eventos — escrita, lotes)
- **UX:** user flows (FigJam) + wireframes (Figma/Uizard com IA)

---

## Trello — estrutura de colunas

- **Backlog - Backend** — tasks ainda não refinadas
- **Refinado** — tasks com descrição e checklist prontas
- **Em progresso** — sendo desenvolvido (máx 1 card por pessoa)
- **Em revisão** — PR aberto ou pronto para feedback
- **Concluído**
- **UX — Em progresso**
- **UX — Aguardando revisão** — pronto para discutir na reunião de segunda

**Etiquetas:**
- Vermelho = alta prioridade
- Amarelo = média prioridade
- Verde = baixa prioridade
- Roxo = backend
- Azul = frontend
- Rosa = UX/design

---

## Regras obrigatórias para toda sessão de desenvolvimento

- **Sempre rodar `npm test` antes de qualquer PR ou entrega de código**
- Se algum teste falhar, corrigir antes de continuar
- Nunca considerar uma feature concluída sem os testes passando
- Ao criar um novo endpoint, criar o teste correspondente no mesmo PR

```bash
npm test                  # roda todos os testes
npm test -- --watch       # modo watch durante desenvolvimento
npm test -- --coverage    # verifica cobertura de código
```

Critério mínimo: **todos os testes existentes passando** antes de qualquer merge.

---

## Normalização de dados no service

Toda normalização de input acontece **no service**, antes de qualquer validação ou persistência.

### Regras obrigatórias

- **Campos de texto:** sempre aplicar `.trim()` para remover espaços extras
- **campos textuais usados como comparacao:** sempre aplicar `.trim().toLowerCase()` — nunca salvar com maiúsculas
- **Campos opcionais:** se após o trim o valor for string vazia, tratar como `null`

### Por que normalizar no service

- Garante consistência independente de como o dado chega (Postman, frontend, testes)
- Evita duplicatas silenciosas (`ANA@GMAIL.COM` e `ana@gmail.com` são o mesmo e-mail)
- Centraliza a regra em um único lugar — model e controller não precisam se preocupar com isso

### Padrão de implementação

```js
// Correto — normaliza antes de usar
const email = toOptionalTrimmedString(payload.email)?.toLowerCase();

// Errado — salva o valor cru do body
const email = payload.email;
```

### Checklist de revisão para novos campos

Ao implementar um novo endpoint, verificar se cada campo foi tratado corretamente:

| Tipo de campo | trim | toLowerCase | null se vazio |
|---|---|---|---|
| nome, descrição, endereço | sim | não | sim |
| e-mail, instagram, domínio | sim | **sim** | sim |
| senha (antes do hash) | sim | não | sim |
| número, UUID, booleano | não se aplica | não se aplica | — |

---

## Observações para continuar o desenvolvimento

- Prisma pode ser bloqueado em máquina corporativa (Nubank) — usar máquina pessoal para `db pull` e `generate`
- `src/config/prisma.js` deve exportar instância única do PrismaClient (evitar múltiplas conexões)
- Padrão de arquitetura: `route → controller → service → Prisma`
- Erros da API sempre no formato `{ error: "mensagem clara" }` com status HTTP correto
- Nunca retornar `password_hash` em nenhuma resposta
- `created_by_user_id` em eventos vem sempre do token JWT, nunca do body da requisição