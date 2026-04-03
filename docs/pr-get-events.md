# PR — Implementação do GET /events (listagem de eventos)

## Contexto

Implementação do endpoint de listagem de eventos para suportar a tela de calendário do frontend. O calendário exibe eventos agrupados por dia em janelas de 3 dias, 1 semana ou 15 dias, com navegação por setas.

---

## O que foi implementado

### `GET /events`

Endpoint público que retorna eventos dentro de um intervalo de datas.

**Query params:**

| Param | Tipo | Obrigatório | Exemplo |
|---|---|---|---|
| `start_date` | string (YYYY-MM-DD) | sim | `2026-04-03` |
| `end_date` | string (YYYY-MM-DD) | sim | `2026-04-09` |

**Resposta — `200 OK`:**

```json
[
  {
    "id": "uuid-do-evento",
    "name": "Festa da Engenharia 2026",
    "date": "2026-04-08T22:00:00.000Z",
    "ended_at": "2026-04-09T04:00:00.000Z",
    "visibility_type": "public",
    "instagram": "@festaeng2026",
    "ticket_platform": "Blacktag",
    "ticket_url": "https://...",
    "location": {
      "address": "Rua XV de Novembro, 123, São Carlos",
      "latitude": "-22.004612",
      "longitude": "-47.890978"
    }
  }
]
```

**Respostas de erro:**

| Status | Mensagem | Motivo |
|---|---|---|
| `400` | Parâmetros obrigatórios: start_date, end_date. | Algum param ausente |
| `400` | Campo start_date deve estar no formato YYYY-MM-DD. | Formato inválido |
| `400` | Campo end_date deve estar no formato YYYY-MM-DD. | Formato inválido |
| `400` | Campo end_date deve ser posterior a start_date. | Intervalo invertido |
| `500` | Erro interno do servidor. | Erro inesperado |

---

## Decisões técnicas

**Lista plana, agrupamento no frontend**
O backend retorna um array simples ordenado por `date ASC`. O frontend é responsável por agrupar os eventos por dia para montar as colunas do calendário.

**Embargo de localização**
A lógica de `release_at` é aplicada na listagem:
- `release_at = null` ou no passado → retorna `address`, `latitude` e `longitude`
- `release_at` no futuro → retorna apenas `address`, omite `latitude` e `longitude`

**Visibilidade**
Por ora retorna apenas eventos `public`. Quando o JWT middleware for implementado, eventos `institutional_only` serão incluídos para usuários com e-mail institucional verificado. Há um `TODO` marcado no service.

---

## Arquivos modificados

- `src/models/event.js` — função `list`
- `src/services/eventService.js` — função `listEvents`
- `src/controllers/event.js` — função `listEvents`
- `src/routes/event.js` — `GET /events`
- `tests/unit/services/eventService.test.js` — testes de `listEvents`
- `tests/unit/controllers/eventController.test.js` — testes de `listEvents`

---

## Testes

19 novos testes adicionados. Todos os 101 testes passando.

Cobertura dos cenários:
- Parâmetros ausentes ou com formato inválido
- Intervalo de datas invertido
- Filtro de visibilidade passando apenas `public` ao repositório
- Embargo de localização (release_at null, passado e futuro)
- Evento sem localização retorna `location: null`
- Controller repassando query params corretamente ao service
- Propagação de erros 400 e 500

---

## Pendências relacionadas (fora deste PR)

- JWT middleware — necessário para incluir eventos `institutional_only` na listagem
- `GET /events/:id` — detalhe do evento com promoters
- Frontend: corrigir regra de localização privada de "5 horas" para **1 hora** antes do evento
- Frontend: adicionar campo `ended_at` (horário de término) no formulário de criação
