# Share Your Role — API

## Pré-requisitos

- Node.js 18+
- PostgreSQL 14+

## Instalação

### 1. Clone o repositório

```bash
git clone <url-do-repositorio>
cd share-your-role-api
```

### 2. Instale as dependências

```bash
npm install
```

Para Linux - 
```bash
sudo apt install npm
sudo apt install postgresql-14 postgresql-contrib
sudo -u postgres psql
CREATE USER darlam WITH PASSWORD 'sua_senha_aqui' SUPERUSER;
CREATE DATABASE share_your_role;
GRANT ALL PRIVILEGES ON DATABASE share_your_role TO darlam;
\q
```
### 3. Configure as variáveis de ambiente

Copie o arquivo de exemplo e preencha os valores:

```bash
cp .env.example .env
```

| Variável       | Descrição                                  |
|----------------|--------------------------------------------|
| `DATABASE_URL` | String de conexão com o banco PostgreSQL   |
| `JWT_SECRET`   | Segredo para assinar os tokens JWT         |
| `PORT`         | Porta onde a API vai rodar (padrão: 3000)  |

### 4. Crie o banco de dados

```bash
psql -U seu_usuario -c "CREATE DATABASE share_your_role;"
psql -U seu_usuario -d share_your_role -f src/database/schema.sql
```

Opcionalmente, popule o banco com dados de exemplo:

```bash
psql -U seu_usuario -d share_your_role -f src/database/seed_events.sql
```

### 5. Gere o Prisma Client

```bash
npx prisma generate
```

### 6. Inicie o servidor

```bash
# Desenvolvimento (com reload automático)
npm run dev

# Produção
npm start
```
```bash
# ver dados inseridos na base 
npx prisma studio
```

A API estará disponível em `http://localhost:3000`.

---

## Endpoints implementados

### Usuários

#### `POST /users` — Cadastro
```json
{
  "name": "Ana Lima",
  "phone": "19999999999",
  "password": "senha123",
  "email_personal": "ana@gmail.com",
  "email_institutional": "ana@usp.br"
}
```
> Pelo menos um dos emails é obrigatório. O `role` é definido automaticamente pelo backend.

---

### Autenticação

#### `POST /auth/login`
```json
{
  "email": "ana@gmail.com",
  "password": "senha123"
}
```
Resposta:
```json
{
  "token": "<jwt>",
  "user": { "id": "...", "name": "Ana Lima", "role": "institutional" }
}
```

---

### Eventos

#### `GET /events` — Listagem por período
Query params obrigatórios:
```
?start_date=2025-03-01&end_date=2025-03-07
```

#### `GET /events/:id` — Detalhe do evento
> Localização retorna `latitude` e `longitude` apenas se não estiver embargada (campo `release_at`).

#### `POST /events` — Criar evento `[JWT]`
Requer `Authorization: Bearer <token>` de usuário `institutional` ou `admin`.

```json
{
  "name": "Banana Minamora",
  "date": "2026-04-09T22:00:00-03:00",
  "ended_at": "2026-04-10T05:00:00-03:00",
  "visibility_type": "public",
  "instagram": "@repminamorasc",
  "ticket_url": "https://byma.com.br/event/69ca93ed2b7ae90004ec4bfd",
  "location": {
    "latitude": -22.0130,
    "longitude": -47.8920,
    "address": "R. Maj. José Inácio, 2206 - Centro, São Carlos - SP"
  },
  "promoters": [
    {
      "name": "Mate",
      "whatsapp": "19999324055",
      "instagram": null,
      "telegram": null
    },
    {
      "name": "M11",
      "whatsapp": "1999740254",
      "instagram": null,
      "telegram": null
    }
  ]
}
```
> `location` e `promoters` são opcionais. O evento precisa ter `instagram` ou ao menos um promoter com `instagram` ou `whatsapp`. A `ticket_platform` é derivada automaticamente da `ticket_url`.
