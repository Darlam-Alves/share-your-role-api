-- ============================================================
-- SHARE YOUR ROLE
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
  id                             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name                           TEXT        NOT NULL,
  email_personal                 TEXT,
  email_institutional            TEXT,
  phone                          TEXT        NOT NULL,
  password_hash                  TEXT        NOT NULL,
  role                           user_role   NOT NULL DEFAULT 'public',
  created_at                     TIMESTAMPTZ NOT NULL DEFAULT now(),
  email_institutional_verified   BOOLEAN     NOT NULL DEFAULT false,
  verification_token             TEXT,
  verification_token_expires_at  TIMESTAMPTZ,

  CONSTRAINT chk_at_least_one_email
    CHECK (email_personal IS NOT NULL OR email_institutional IS NOT NULL)
);

-- Índices únicos case-insensitive — impedem duplicatas como ANA@GMAIL.COM e ana@gmail.com
CREATE UNIQUE INDEX users_email_personal_lower_idx
  ON users (LOWER(email_personal)) WHERE email_personal IS NOT NULL;

CREATE UNIQUE INDEX users_email_institutional_lower_idx
  ON users (LOWER(email_institutional)) WHERE email_institutional IS NOT NULL;

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
  ended_at                 TIMESTAMPTZ      NOT NULL,
  created_by_user_id       UUID             NOT NULL REFERENCES users(id),
  created_by_republic_id   UUID             REFERENCES republics(id),
  ticket_platform          TEXT,
  ticket_url               TEXT,
  instagram                TEXT CHECK (instagram IS NULL OR instagram ~ '^@[a-zA-Z0-9_.]{1,30}$'),
  visibility_type          visibility_type  NOT NULL DEFAULT 'public',
  created_at               TIMESTAMPTZ      NOT NULL DEFAULT now(),
);

-- Índice único case-insensitive — impede mesmo nome na mesma data independente de capitalização
CREATE UNIQUE INDEX events_name_lower_date_idx ON events (LOWER(name), date);

-- ------------------------------------------------------------
-- event_promoters
-- ------------------------------------------------------------
CREATE TABLE event_promoters (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id   UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  whatsapp   TEXT,
  instagram  TEXT CHECK (instagram IS NULL OR instagram ~ '^@[a-zA-Z0-9_.]{1,30}$'),
  telegram   TEXT,

  CONSTRAINT chk_promoters_at_least_one_contact
    CHECK (whatsapp IS NOT NULL OR instagram IS NOT NULL OR telegram IS NOT NULL),

  CONSTRAINT uq_event_promoters_whatsapp  UNIQUE (event_id, whatsapp),
  CONSTRAINT uq_event_promoters_instagram UNIQUE (event_id, instagram),
  CONSTRAINT uq_event_promoters_telegram  UNIQUE (event_id, telegram)
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
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT now(),

  CONSTRAINT uq_sellers_user_event UNIQUE (user_id, event_id)
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