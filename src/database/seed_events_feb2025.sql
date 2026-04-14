-- ============================================================
-- SEED — Eventos reais 19–28/02/2025
-- Regras aplicadas:
--   - ticket_platform derivado do ticket_url (consistente com o service)
--   - todo evento tem instagram OU ao menos um promoter com instagram/whatsapp
-- ============================================================

-- Limpa eventos (CASCADE remove todas as tabelas dependentes)
DELETE FROM events;

-- República Santa Casa (para Bagunsanta)
INSERT INTO republics (id, name, city, instagram) VALUES
  ('10000000-0000-0000-0000-000000000003', 'República Santa Casa', 'Campinas', '@santacasa')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- EVENTS
-- ticket_platform sempre derivado do domínio do ticket_url:
--   blacktag.com.br → 'Blacktag' | byma.com.br → 'Byma' | NULL → NULL
-- ============================================================
INSERT INTO events (
  id, name, description, date, ended_at,
  created_by_user_id, created_by_republic_id,
  ticket_platform, ticket_url, instagram, visibility_type
) VALUES

  -- 20/02 qui — Madre Night
  -- tarde (16h–22h), venue fixo, sem ticket
  -- contato: instagram do evento
  ('30000000-0000-0000-0000-000000000010',
   'Madre Night', NULL,
   '2025-02-20 16:00:00-03', '2025-02-20 22:00:00-03',
   '00000000-0000-0000-0000-000000000002', NULL,
   NULL, NULL, '@madrenight',
   'public'),

  -- 20/02 qui — Mão na Night
  -- after (23h–05h), localização embargada, Blacktag
  -- contato: instagram do evento
  ('30000000-0000-0000-0000-000000000011',
   'Mão na Night', NULL,
   '2025-02-20 23:00:00-03', '2025-02-21 05:00:00-03',
   '00000000-0000-0000-0000-000000000002', NULL,
   'Blacktag', 'https://blacktag.com.br/maonnanight',
   '@maonnanight',
   'public'),

  -- 22/02 sáb — Bagunsanta
  -- noite (22h–04h), república Santa Casa, institutional_only, localização embargada
  -- contato: instagram do evento
  ('30000000-0000-0000-0000-000000000012',
   'Bagunsanta', NULL,
   '2025-02-22 22:00:00-03', '2025-02-23 04:00:00-03',
   '00000000-0000-0000-0000-000000000006',
   '10000000-0000-0000-0000-000000000003',
   NULL, NULL, '@bagunsanta',
   'institutional_only'),

  -- 23/02 dom — Dia Zero
  -- after (23h–05h), venue fixo, Byma
  -- contato: instagram do evento
  ('30000000-0000-0000-0000-000000000013',
   'Dia Zero', NULL,
   '2025-02-23 23:00:00-03', '2025-02-24 05:00:00-03',
   '00000000-0000-0000-0000-000000000005', NULL,
   'Byma', 'https://byma.com.br/diazero',
   '@diazero_oficial',
   'public'),

  -- 24/02 seg — Independência das Repúblicas
  -- noite (22h–05h), localização embargada, Blacktag
  -- contato: instagram do evento
  ('30000000-0000-0000-0000-000000000014',
   'Independência das Repúblicas', NULL,
   '2025-02-24 22:00:00-03', '2025-02-25 05:00:00-03',
   '00000000-0000-0000-0000-000000000006', NULL,
   'Blacktag', 'https://blacktag.com.br/independencia-rep',
   '@independenciadasrep',
   'public'),

  -- 25/02 ter — Cervejada da Elétrica
  -- tarde (16h–22h), sem localização, sem ticket
  -- contato: instagram do evento
  ('30000000-0000-0000-0000-000000000015',
   'Cervejada da Elétrica', NULL,
   '2025-02-25 16:00:00-03', '2025-02-25 22:00:00-03',
   '00000000-0000-0000-0000-000000000002', NULL,
   NULL, NULL, '@cervejada.eletrica',
   'public'),

  -- 26/02 qua — Cervejada Aero + Civil
  -- tarde (15h–22h), venue fixo, sem ticket, sem instagram
  -- contato: promoter com whatsapp (inserido abaixo)
  ('30000000-0000-0000-0000-000000000016',
   'Cervejada Aero + Civil', NULL,
   '2025-02-26 15:00:00-03', '2025-02-26 22:00:00-03',
   '00000000-0000-0000-0000-000000000003', NULL,
   NULL, NULL, NULL,
   'public'),

  -- 26/02 qua — Pinga Night
  -- after (23h–05h), localização embargada, Byma
  -- contato: instagram do evento
  ('30000000-0000-0000-0000-000000000017',
   'Pinga Night', NULL,
   '2025-02-26 23:00:00-03', '2025-02-27 05:00:00-03',
   '00000000-0000-0000-0000-000000000002', NULL,
   'Byma', 'https://byma.com.br/pinganight',
   '@pinga.night',
   'public'),

  -- 27/02 qui — QuimKativa
  -- noite (22h–05h), institutional_only, localização embargada, Blacktag
  -- contato: instagram do evento
  ('30000000-0000-0000-0000-000000000018',
   'QuimKativa', NULL,
   '2025-02-27 22:00:00-03', '2025-02-28 05:00:00-03',
   '00000000-0000-0000-0000-000000000003', NULL,
   'Blacktag', 'https://blacktag.com.br/quimkativa',
   '@quimkativa',
   'institutional_only'),

  -- 27/02 qui — Mata as Aulas — Edição CAASO
  -- noite (22h–04h), institutional_only, sem localização, sem ticket
  -- contato: instagram do evento
  ('30000000-0000-0000-0000-000000000019',
   'Mata as Aulas — Edição CAASO', NULL,
   '2025-02-27 22:00:00-03', '2025-02-28 04:00:00-03',
   '00000000-0000-0000-0000-000000000002', NULL,
   NULL, NULL, '@caaso_unicamp',
   'institutional_only'),

  -- 27/02 qui — Polter Night
  -- after (23h–05h), venue fixo, Byma
  -- contato: instagram do evento
  ('30000000-0000-0000-0000-000000000020',
   'Polter Night', NULL,
   '2025-02-27 23:00:00-03', '2025-02-28 05:00:00-03',
   '00000000-0000-0000-0000-000000000005', NULL,
   'Byma', 'https://byma.com.br/polternight',
   '@polternight',
   'public'),

  -- 27/02 qui — Cervejada da Arq
  -- tarde (14h–22h), venue fixo, sem ticket, sem instagram
  -- contato: promoter com instagram (inserido abaixo)
  ('30000000-0000-0000-0000-000000000021',
   'Cervejada da Arq', NULL,
   '2025-02-27 14:00:00-03', '2025-02-27 22:00:00-03',
   '00000000-0000-0000-0000-000000000002', NULL,
   NULL, NULL, NULL,
   'public');

-- ============================================================
-- EVENT_PROMOTERS
-- Cervejada Aero + Civil e Cervejada da Arq não têm instagram
-- no evento — canal de contato via promoter
-- ============================================================
INSERT INTO event_promoters (event_id, name, whatsapp, instagram, telegram) VALUES

  -- Cervejada Aero + Civil — representante com whatsapp
  ('30000000-0000-0000-0000-000000000016',
   'CA Engenharia', '19991110001', NULL, NULL),

  -- Cervejada da Arq — representante com instagram
  ('30000000-0000-0000-0000-000000000021',
   'CA Arquitetura', NULL, '@ca.arq.unicamp', NULL);

-- ============================================================
-- EVENT_LOCATION
-- release_at NULL    → localização sempre visível (venue fixo)
-- release_at = 1h antes → embargada até a hora do evento
-- sem registro       → localização não informada
-- ============================================================
INSERT INTO event_location (event_id, latitude, longitude, address, release_at) VALUES

  ('30000000-0000-0000-0000-000000000010',
   -22.8172, -47.0694,
   'Rua Roxo Moreira, 1578 — Barão Geraldo, Campinas', NULL),

  ('30000000-0000-0000-0000-000000000011',
   -22.8201, -47.0712,
   'Av. Prof. Atílio Martini, 340 — Barão Geraldo, Campinas',
   '2025-02-20 22:00:00-03'),

  ('30000000-0000-0000-0000-000000000012',
   -22.8145, -47.0688,
   'Rua das Repúblicas, 42 — Barão Geraldo, Campinas',
   '2025-02-22 21:00:00-03'),

  ('30000000-0000-0000-0000-000000000013',
   -22.8230, -47.0650,
   'Av. Santa Isabel, 205 — Barão Geraldo, Campinas', NULL),

  ('30000000-0000-0000-0000-000000000014',
   -22.8188, -47.0701,
   'Rua Benedito Alves Aranha, 95 — Barão Geraldo, Campinas',
   '2025-02-24 21:00:00-03'),

  ('30000000-0000-0000-0000-000000000016',
   -22.8215, -47.0668,
   'Pátio da Engenharia — UNICAMP, Campinas', NULL),

  ('30000000-0000-0000-0000-000000000017',
   -22.8199, -47.0720,
   'Rua Humberto Borelli, 77 — Barão Geraldo, Campinas',
   '2025-02-26 22:00:00-03'),

  ('30000000-0000-0000-0000-000000000018',
   -22.8160, -47.0705,
   'Rua Prof. Zeferino Vaz, 110 — Barão Geraldo, Campinas',
   '2025-02-27 21:00:00-03'),

  ('30000000-0000-0000-0000-000000000020',
   -22.8241, -47.0635,
   'Rua Tranquilo Prosperi, 330 — Barão Geraldo, Campinas', NULL),

  ('30000000-0000-0000-0000-000000000021',
   -22.8178, -47.0658,
   'Pátio da Arquitetura — UNICAMP, Campinas', NULL);

-- Sem localização: Cervejada da Elétrica (0015), Mata as Aulas (0019)

-- ============================================================
-- EVENT_LOTS — somente eventos com ticket_platform
-- ============================================================
INSERT INTO event_lots (id, event_id, lot_number, price, start_date, end_date, active) VALUES

  -- Mão na Night (Blacktag): lote 1 encerrado, lote 2 ativo
  ('40000000-0000-0000-0000-000000000001',
   '30000000-0000-0000-0000-000000000011', 1, 25.00,
   '2025-02-10 09:00:00-03', '2025-02-15 23:59:00-03', false),
  ('40000000-0000-0000-0000-000000000002',
   '30000000-0000-0000-0000-000000000011', 2, 35.00,
   '2025-02-16 00:00:00-03', NULL, true),

  -- Dia Zero (Byma): lote único ativo
  ('40000000-0000-0000-0000-000000000003',
   '30000000-0000-0000-0000-000000000013', 1, 30.00,
   '2025-02-10 09:00:00-03', NULL, true),

  -- Independência das Repúblicas (Blacktag): 3 lotes
  ('40000000-0000-0000-0000-000000000004',
   '30000000-0000-0000-0000-000000000014', 1, 20.00,
   '2025-02-01 09:00:00-03', '2025-02-10 23:59:00-03', false),
  ('40000000-0000-0000-0000-000000000005',
   '30000000-0000-0000-0000-000000000014', 2, 35.00,
   '2025-02-11 00:00:00-03', '2025-02-20 23:59:00-03', false),
  ('40000000-0000-0000-0000-000000000006',
   '30000000-0000-0000-0000-000000000014', 3, 50.00,
   '2025-02-21 00:00:00-03', NULL, true),

  -- Pinga Night (Byma): lote único ativo
  ('40000000-0000-0000-0000-000000000007',
   '30000000-0000-0000-0000-000000000017', 1, 20.00,
   '2025-02-15 09:00:00-03', NULL, true),

  -- QuimKativa (Blacktag): lote 1 encerrado, lote 2 ativo
  ('40000000-0000-0000-0000-000000000008',
   '30000000-0000-0000-0000-000000000018', 1, 30.00,
   '2025-02-10 09:00:00-03', '2025-02-20 23:59:00-03', false),
  ('40000000-0000-0000-0000-000000000009',
   '30000000-0000-0000-0000-000000000018', 2, 45.00,
   '2025-02-21 00:00:00-03', NULL, true),

  -- Polter Night (Byma): lote único ativo
  ('40000000-0000-0000-0000-000000000010',
   '30000000-0000-0000-0000-000000000020', 1, 25.00,
   '2025-02-15 09:00:00-03', NULL, true);

-- ============================================================
-- Verificação
-- ============================================================
SELECT
  e.date::date                 AS dia,
  to_char(e.date, 'HH24:MI')  AS inicio,
  to_char(e.ended_at, 'HH24:MI') AS fim,
  e.name,
  e.visibility_type,
  e.ticket_platform,
  COALESCE(e.instagram,
    '(promoter: ' || (
      SELECT string_agg(COALESCE(p.instagram, p.whatsapp), ', ')
      FROM event_promoters p
      WHERE p.event_id = e.id AND (p.instagram IS NOT NULL OR p.whatsapp IS NOT NULL)
    ) || ')'
  )                            AS contato,
  CASE
    WHEN el.event_id IS NULL THEN 'sem localização'
    WHEN el.release_at IS NULL THEN 'sempre visível'
    ELSE 'embargada'
  END                          AS localizacao
FROM events e
LEFT JOIN event_location el ON el.event_id = e.id
ORDER BY e.date;
