-- ============================================================
-- SEED — Dados de exemplo para testes
-- ============================================================
-- Senhas todas: 'senha123' (hash bcrypt fictício p/ teste)
-- ============================================================

-- ------------------------------------------------------------
-- users
-- ------------------------------------------------------------
INSERT INTO users (id, name, email_personal, email_institutional, phone, password_hash, role) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Admin Geral',    'admin@gmail.com',   'admin@unicamp.br',  '19900000001', '$2b$10$HASH_ADMIN',  'admin'),
  ('00000000-0000-0000-0000-000000000002', 'João Estudante', 'joao@gmail.com',    'joao@unicamp.br',   '19900000002', '$2b$10$HASH_JOAO',   'institutional'),
  ('00000000-0000-0000-0000-000000000003', 'Maria Estudante','maria@gmail.com',   'maria@unicamp.br',  '19900000003', '$2b$10$HASH_MARIA',  'institutional'),
  ('00000000-0000-0000-0000-000000000004', 'Carlos Público', 'carlos@hotmail.com', NULL,               '19900000004', '$2b$10$HASH_CARLOS', 'public'),
  ('00000000-0000-0000-0000-000000000005', 'Ana Promoter',   'ana@gmail.com',     'ana@unicamp.br',    '19900000005', '$2b$10$HASH_ANA',    'institutional'),
  ('00000000-0000-0000-0000-000000000006', 'Pedro República','pedro@gmail.com',   'pedro@unicamp.br',  '19900000006', '$2b$10$HASH_PEDRO',  'institutional');

-- ------------------------------------------------------------
-- republics
-- ------------------------------------------------------------
INSERT INTO republics (id, name, city, instagram) VALUES
  ('10000000-0000-0000-0000-000000000001', 'República Oasis',  'Campinas', '@oasis_republic'),
  ('10000000-0000-0000-0000-000000000002', 'República Banana', 'Campinas', '@banana_republic');

-- ------------------------------------------------------------
-- republic_members
-- ------------------------------------------------------------
INSERT INTO republic_members (user_id, republic_id, role) VALUES
  ('00000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000001', 'admin'),
  ('00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'member'),
  ('00000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000002', 'admin');

-- ------------------------------------------------------------
-- republic_invites
-- ------------------------------------------------------------
INSERT INTO republic_invites (id, republic_id, invited_user_id, invited_by_user_id, status) VALUES
  ('20000000-0000-0000-0000-000000000001',
   '10000000-0000-0000-0000-000000000001',
   '00000000-0000-0000-0000-000000000005',
   '00000000-0000-0000-0000-000000000006',
   'pending');

-- ------------------------------------------------------------
-- events
-- ------------------------------------------------------------
INSERT INTO events (id, name, description, date, ended_at, created_by_user_id, created_by_republic_id, ticket_platform, ticket_url, instagram, visibility_type) VALUES
  -- Brick: evento público, localização pública
  ('30000000-0000-0000-0000-000000000001',
   'Brick Fest Vol. 3',
   'A maior festa do bloco universitário. Open bar premium, 3 atrações.',
   '2026-04-05 22:00:00-03',
   '2026-04-06 04:00:00-03',
   '00000000-0000-0000-0000-000000000002',
   NULL,
   'Blacktag',
   'https://blacktag.com.br/brickfest3',
   '@brickfest',
   'public'),

  -- República Oasis: localização restrita a email institucional
  ('30000000-0000-0000-0000-000000000002',
   'Integra Oasis x Banana',
   'Integração entre as repúblicas Oasis e Banana. Traga seu copo.',
   '2026-04-12 21:00:00-03',
   '2026-04-13 03:00:00-03',
   '00000000-0000-0000-0000-000000000006',
   '10000000-0000-0000-0000-000000000001',
   'Byma',
   'https://byma.com.br/integra-oasis-banana',
   '@oasis_republic',
   'institutional_only'),

  -- After pequeno, privado, sem plataforma de ingresso
  ('30000000-0000-0000-0000-000000000003',
   'After Banana (privado)',
   'After reservado. Segue o @banana_republic para saber mais.',
   '2026-04-06 03:00:00-03',
   '2026-04-06 07:00:00-03',
   '00000000-0000-0000-0000-000000000003',
   '10000000-0000-0000-0000-000000000002',
   NULL,
   NULL,
   '@banana_republic',
   'private');

-- ------------------------------------------------------------
-- event_promoters
-- ------------------------------------------------------------
INSERT INTO event_promoters (event_id, name, whatsapp, instagram, telegram) VALUES
  ('30000000-0000-0000-0000-000000000001', 'Ana Promoter',   '5519900000005', '@ana_promoter', NULL),
  ('30000000-0000-0000-0000-000000000001', 'Zé Produtor',    '5519900000099', '@ze_produtor',  '@ze_prod'),
  ('30000000-0000-0000-0000-000000000002', 'Pedro República','5519900000006', '@pedro_rep',    NULL);

-- ------------------------------------------------------------
-- event_location
-- -- Brick: release_at NULL = localização sempre visível
-- -- Oasis integra: release_at = 1h antes do evento
-- -- After Banana: sem localização cadastrada
-- ------------------------------------------------------------
INSERT INTO event_location (event_id, latitude, longitude, address, release_at) VALUES
  ('30000000-0000-0000-0000-000000000001',
   -22.8199, -47.0691,
   'Rua das Festas, 123 — Barão Geraldo, Campinas',
   NULL),

  ('30000000-0000-0000-0000-000000000002',
   -22.8150, -47.0720,
   'Av. das Repúblicas, 456 — Barão Geraldo, Campinas',
   '2026-04-12 20:00:00-03');

-- ------------------------------------------------------------
-- event_lots  (Brick: 3 lotes; Oasis: 1 lote)
-- ------------------------------------------------------------
INSERT INTO event_lots (id, event_id, lot_number, price, start_date, end_date, active) VALUES
  ('40000000-0000-0000-0000-000000000001',
   '30000000-0000-0000-0000-000000000001', 1, 30.00,
   '2026-03-17 09:00:00-03', '2026-03-20 23:59:00-03', false),

  ('40000000-0000-0000-0000-000000000002',
   '30000000-0000-0000-0000-000000000001', 2, 50.00,
   '2026-03-21 00:00:00-03', '2026-03-31 23:59:00-03', true),

  ('40000000-0000-0000-0000-000000000003',
   '30000000-0000-0000-0000-000000000001', 3, 70.00,
   '2026-04-01 00:00:00-03', NULL, false),

  ('40000000-0000-0000-0000-000000000004',
   '30000000-0000-0000-0000-000000000002', 1, 20.00,
   '2026-03-25 09:00:00-03', NULL, true);

-- ------------------------------------------------------------
-- event_presence
-- ------------------------------------------------------------
INSERT INTO event_presence (event_id, user_id, status) VALUES
  ('30000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'confirmed'),
  ('30000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000004', 'confirmed'),
  ('30000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', 'confirmed'),
  ('30000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000003', 'confirmed');

-- ------------------------------------------------------------
-- resales  (lote 2 do Brick = R$50 → máx R$65)
-- ------------------------------------------------------------
INSERT INTO resales (id, user_id, event_id, price, quantity, status) VALUES
  ('50000000-0000-0000-0000-000000000001',
   '00000000-0000-0000-0000-000000000004',
   '30000000-0000-0000-0000-000000000001',
   55.00, 2, 'open'),

  ('50000000-0000-0000-0000-000000000002',
   '00000000-0000-0000-0000-000000000005',
   '30000000-0000-0000-0000-000000000001',
   50.00, 1, 'open');

-- ------------------------------------------------------------
-- resale_reviews
-- ------------------------------------------------------------
INSERT INTO resale_reviews (reviewer_user_id, resale_id, rating, comment) VALUES
  ('00000000-0000-0000-0000-000000000002',
   '50000000-0000-0000-0000-000000000002',
   5,
   'Entregou rápido, ingresso veio certinho. Recomendo!');

-- ------------------------------------------------------------
-- Queries úteis para testar
-- ------------------------------------------------------------

-- Eventos com localização liberada agora (sem embargo ou já passou do horário)
-- SELECT e.name, el.address, el.release_at
-- FROM events e
-- JOIN event_location el ON el.event_id = e.id
-- WHERE el.release_at IS NULL OR el.release_at <= now();

-- Lotes ativos por evento
SELECT e.name, el.lot_number, el.price, el.start_date
FROM event_lots el
JOIN events e ON e.id = el.event_id
WHERE el.active = true
ORDER BY el.price;

-- Menor preço de revenda por evento
-- SELECT e.name, MIN(s.price) AS menor_preco
-- FROM resales s
-- JOIN events e ON e.id = s.event_id
-- WHERE s.status = 'open'
-- GROUP BY e.name
-- ORDER BY menor_preco;

-- Vendedores com média de avaliação
-- SELECT u.name, AVG(sr.rating) AS media, COUNT(sr.id) AS avaliacoes
-- FROM resales s
-- JOIN users u ON u.id = s.user_id
-- LEFT JOIN resale_reviews sr ON sr.resale_id = s.id
-- WHERE s.event_id = '30000000-0000-0000-0000-000000000001'
-- GROUP BY u.name
-- ORDER BY media DESC NULLS LAST;

-- Membros de uma república com seus papéis
SELECT u.name, u.email_institutional, rm.role
FROM republic_members rm
JOIN users u ON u.id = rm.user_id
WHERE rm.republic_id = '10000000-0000-0000-0000-000000000001';