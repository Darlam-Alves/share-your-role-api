-- ============================================================
-- ROLEZIM — Schema Postgres (atualizado)
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ENUMs
CREATE TYPE user_role        AS ENUM ('public', 'institutional', 'admin');
CREATE TYPE member_role      AS ENUM ('member', 'admin', 'aggregate');
CREATE TYPE invite_status    AS ENUM ('pending', 'accepted', 'rejected');
CREATE TYPE visibility_type  AS ENUM ('public', 'institutional_only', 'private');
CREATE TYPE presence_status  AS ENUM ('confirmed', 'cancelled', 'maybe');
CREATE TYPE seller_status    AS ENUM ('open', 'sold', 'cancelled');

-- ------------------------------------------------------------
-- users
-- ------------------------------------------------------------
CREATE TABLE users (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                 TEXT        NOT NULL,
  email_personal       TEXT        UNIQUE,
  email_institutional  TEXT        UNIQUE,
  phone                TEXT        NOT NULL,
  password_hash        TEXT        NOT NULL,
  role                 user_role   NOT NULL DEFAULT 'public',
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT chk_at_least_one_email
    CHECK (email_personal IS NOT NULL OR email_institutional IS NOT NULL)
);

-- ------------------------------------------------------------
-- republics
-- ------------------------------------------------------------
CREATE TABLE republics (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT        NOT NULL,
  city        TEXT        NOT NULL,
  instagram   TEXT        NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
-- republic_members
-- ------------------------------------------------------------
CREATE TABLE republic_members (
  user_id      UUID        NOT NULL REFERENCES users(id)      ON DELETE CASCADE,
  republic_id  UUID        NOT NULL REFERENCES republics(id)  ON DELETE CASCADE,
  role         member_role NOT NULL DEFAULT 'member',
  PRIMARY KEY (user_id, republic_id)
);

-- ------------------------------------------------------------
-- republic_invites
-- ------------------------------------------------------------
CREATE TABLE republic_invites (
  id                   UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  republic_id          UUID          NOT NULL REFERENCES republics(id) ON DELETE CASCADE,
  invited_user_id      UUID          NOT NULL REFERENCES users(id)     ON DELETE CASCADE,
  invited_by_user_id   UUID          NOT NULL REFERENCES users(id)     ON DELETE CASCADE,
  status               invite_status NOT NULL DEFAULT 'pending',
  created_at           TIMESTAMPTZ   NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
-- events
-- -- ticket_platform / ticket_url: uma única plataforma por evento (opcional)
-- -- visibility_type:
-- --   'public'             → localização visível para todos
-- --   'institutional_only' → localização visível só p/ email institucional
-- --   'private'            → república / after pequeno
-- ------------------------------------------------------------
CREATE TABLE events (
  id                       UUID             PRIMARY KEY DEFAULT gen_random_uuid(),
  name                     TEXT             NOT NULL,
  description              TEXT,
  date                     TIMESTAMPTZ      NOT NULL,
  created_by_user_id       UUID             NOT NULL REFERENCES users(id),
  created_by_republic_id   UUID             REFERENCES republics(id),
  ticket_platform          TEXT,
  ticket_url               TEXT,
  instagram                TEXT,
  visibility_type          visibility_type  NOT NULL DEFAULT 'public',
  created_at               TIMESTAMPTZ      NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
-- event_promoters
-- ------------------------------------------------------------
CREATE TABLE event_promoters (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id   UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  whatsapp   TEXT,
  instagram  TEXT,
  telegram   TEXT
);

-- ------------------------------------------------------------
-- event_location  (1:1 com events — nem todo evento tem)
-- -- release_at NULL = sempre visível (Brick, Banana, Oasis etc.)
-- -- release_at preenchido = localização embargada até esse momento
-- ------------------------------------------------------------
CREATE TABLE event_location (
  event_id    UUID         PRIMARY KEY REFERENCES events(id) ON DELETE CASCADE,
  latitude    NUMERIC(9,6) NOT NULL,
  longitude   NUMERIC(9,6) NOT NULL,
  address     TEXT,
  release_at  TIMESTAMPTZ
);

-- ------------------------------------------------------------
-- event_lots
-- ------------------------------------------------------------
CREATE TABLE event_lots (
  id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id    UUID          NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  lot_number  INT           NOT NULL,
  price       NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  start_date  TIMESTAMPTZ   NOT NULL,
  end_date    TIMESTAMPTZ,
  active      BOOLEAN       NOT NULL DEFAULT false,
  UNIQUE (event_id, lot_number)
);

-- ------------------------------------------------------------
-- event_presence
-- ------------------------------------------------------------
CREATE TABLE event_presence (
  event_id  UUID            NOT NULL REFERENCES events(id)  ON DELETE CASCADE,
  user_id   UUID            NOT NULL REFERENCES users(id)   ON DELETE CASCADE,
  status    presence_status NOT NULL DEFAULT 'confirmed',
  PRIMARY KEY (event_id, user_id)
);

-- ------------------------------------------------------------
-- sellers
-- -- Regra dos 130%: validada na aplicação (SellerService)
-- ------------------------------------------------------------
CREATE TABLE sellers (
  id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID          NOT NULL REFERENCES users(id)   ON DELETE CASCADE,
  event_id    UUID          NOT NULL REFERENCES events(id)  ON DELETE CASCADE,
  price       NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  quantity    INT           NOT NULL CHECK (quantity > 0),
  status      seller_status NOT NULL DEFAULT 'open',
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
-- seller_reviews
-- ------------------------------------------------------------
CREATE TABLE seller_reviews (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  reviewer_user_id    UUID        NOT NULL REFERENCES users(id)    ON DELETE CASCADE,
  seller_id           UUID        NOT NULL REFERENCES sellers(id)  ON DELETE CASCADE,
  rating              SMALLINT    NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment             TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (reviewer_user_id, seller_id)
);

-- ------------------------------------------------------------
-- Tabelas auxiliares (estrutura apenas — popular depois)
-- ------------------------------------------------------------

-- CREATE TABLE notifications (
--   id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
--   user_id     UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
--   type        TEXT        NOT NULL,
--   payload     JSONB       NOT NULL DEFAULT '{}',
--   read        BOOLEAN     NOT NULL DEFAULT false,
--   created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
-- );

-- CREATE TABLE audit_logs (
--   id          BIGSERIAL   PRIMARY KEY,
--   user_id     UUID        REFERENCES users(id) ON DELETE SET NULL,
--   action      TEXT        NOT NULL,
--   entity      TEXT        NOT NULL,
--   entity_id   UUID,
--   payload     JSONB,
--   created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
-- );

-- CREATE TABLE media (
--   id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
--   url         TEXT        NOT NULL,
--   type        TEXT        NOT NULL,
--   owner_type  TEXT        NOT NULL,
--   owner_id    UUID        NOT NULL,
--   created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
-- );