-- ============================================================
-- SEED — Eventos reais de São Carlos
-- ============================================================
-- Idempotente: apaga eventos do seed antes de reinserir.
-- ON DELETE CASCADE cuida de event_location e event_promoters.
DELETE FROM events WHERE id::text LIKE '30000000-0000-0000-0000-%';

-- ============================================================
-- EVENTS
-- ============================================================
INSERT INTO events (
  id, name, description, date, ended_at,
  created_by_user_id, created_by_republic_id,
  ticket_platform, ticket_url, instagram, visibility_type
) VALUES

  -- 09/04 qua — Polter Pool Party
  ('30000000-0000-0000-0000-000000000022',
   'Polter Pool Party', NULL,
   '2026-04-09 14:00:00-03', '2026-04-09 18:00:00-03',
   '00000000-0000-0000-0000-000000000005', NULL,
   NULL, NULL, '@rep_polter',
   'public'),

  -- 09/04 qua — Banana Minamora
  ('30000000-0000-0000-0000-000000000023',
   'Banana Minamora', E'🍌💜 SAVE THE DATE 🍌💜\n09/04 tem encontro marcado na nossa casinha FAVORITA, e não é qualquer um…\nvem aí o: Namora na Quinta!!!!! 😍\nja deixamos o clima armado, agora é com vocês 😮‍💨🔥\n\nmais informações em breve, aguardem 🔄',
   '2026-04-09 22:00:00-03', '2026-04-10 05:00:00-03',
   '00000000-0000-0000-0000-000000000003',
   NULL,
   'Byma', 'https://byma.com.br/event/69ca93ed2b7ae90004ec4bfd?utm_source=ig&utm_medium=social&utm_content=link_in_bio&fbclid=PAZXh0bgNhZW0CMTEAc3J0AZhcHBfaWQMMjU2MjgxMDQwNTU4AAGnw3GqdItuBZdhw_i-vlRBjXRFubT5AJe5Ay4MZjB2Y-c4cMNeDjsfgkGW76o_aem_Me_odj0fq5gdeWK9vSzaaA&utm_id=97760_v0_s00_e0_tv3_a1dennhc8l4a3k_tp1', '@repminamorasc',
   'public'),

  -- 10/04 sex — Arapuskush
  ('30000000-0000-0000-0000-000000000024',
   'Arapuskush', NULL,
   '2026-04-10 16:00:00-03', '2026-04-10 22:00:00-03',
   '00000000-0000-0000-0000-000000000002', NULL,
   NULL, NULL, '@republica_arapuca',
   'public'),

  -- 10/04 sex — Sextas da IES: Especial Pankadao
  ('30000000-0000-0000-0000-000000000035',
   'Sextas da IES: Especial Pankadao', 'Sdds de um Pankadão de IeS, né minhas filhas?! Quando chega abril a gente fica manhosa de lembrar dos shows e sets que vivemos no passado. Por isso, e também atendendo aos pedidos das nossas funkeiras de carteirinha que estão sempre pedindo funk no front das festas de pop, a próxima edição das Sextas da IeS é ESPECIAL PANKADÃO! \n\n\nEsse rolê é inteiramente voltado para o funk, aka música eletrônica 100% brasileira! Vai ter um pouquinho de cada vertente, passando pelo tamborzão, miami bass, furacão 2000, brega funk, rave dos fluxos e acabando no mandelão delícia. E claro, vai tocar principalmente as melhores das nossas divas & drags do funk: Anitta, Ludmilla, Gloria Groove, Kaya Conky, Lia Clark, Irmãs de Pau, Katy da Voz e as Abusadas, Pabllo Vittar, Pocah, Lexa, Tati Quebra Barraco, Valesca Popozuda, além das melhores produções dos DJs ++ do país: Pedro Sampaio, GBR, Caio Prince, Ramemes, Dayeh, mu540 e muito mais!\n\n\nSexta que vem é dia pra gente rebolar muito a noite toda. VAI DJ MAIS FORTY!!! 🏳️‍🌈 Festa voltada ao público LGBTQIAPN+ feito por e para pessoas LGBTQIAPN+. Todes são bem-vindes, mas respeito e zero tolerância ao preconceito vêm em primeiro lugar! \n\n\n⛔ Se você veio até esse rolê para ser misógino, homofóbico, racista ou transfóbico, este não é um lugar para você. Nenhum tipo de violência será tolerada no espaço do evento. A organização reserva o direito de expulsar e banir permanentemente qualquer pessoa que desrespeite as normas do evento. Caso você seja vítima de alguma situação de violência, dirija-se ao posto de acolhimento da Recanto, localizado na área externa, e denuncie.\n\n\n⚠️ Esse rolê é no estilo BALADA! Sendo assim, não conta com open bar e nem permite a entrada de bebidas de fora. Faz aquele esquenta gostoso com as amigas pra chegar no grau ou aproveite o cardápio de bar do Banana Club\n\n\n🔞 Evento proibido para menores de 18 anos.',
   '2026-04-10 22:00:00-03', '2026-04-11 04:00:00-03',
   '00000000-0000-0000-0000-000000000002', NULL,
   'Byma', 'https://byma.com.br/event/69cdb420fb63590004f2f47a',
   '@sextasdaies', 'public'),

  -- 11/04 sáb — Chama a Mãe
  ('30000000-0000-0000-0000-000000000025',
   'Chama a Mãe', NULL,
   '2026-04-11 14:00:00-03', '2026-04-11 22:00:00-03',
   '00000000-0000-0000-0000-000000000002', NULL,
   'Byma', 'https://byma.com.br/chama-a-mae',
   '@chamamaeoficial',
   'public'),

  -- 11/04 sáb — Palquinho FAG
  ('30000000-0000-0000-0000-000000000026',
   'Palquinho FAG', NULL,
   '2026-04-11 19:00:00-03', '2026-04-12 04:00:00-03',
   '00000000-0000-0000-0000-000000000003', NULL,
   NULL, NULL, '@fggtryparty',
   'public'),

  -- 11/04 sáb — Sambohemia
  ('30000000-0000-0000-0000-000000000027',
   'Sambohemia', NULL,
   '2026-04-11 22:00:00-03', '2026-04-12 05:00:00-03',
   '00000000-0000-0000-0000-000000000005', NULL,
   'Cheers', 'https://cheers.com.br/evento/sambohemia-29853', '@sigasambohemia',
   'public'),

  -- 16/04 qui — Entorta Bixo
  ('30000000-0000-0000-0000-000000000028',
   'Entorta Bixo', NULL,
   '2026-04-16 16:00:00-03', '2026-04-16 22:00:00-03',
   '00000000-0000-0000-0000-000000000002', NULL,
   'Blacktag', 'https://blacktag.com.br/entortabixo',
   '@entorta_bicho',
   'public'),

  -- 16/04 qui — Banana Capitu
  ('30000000-0000-0000-0000-000000000029',
   'Banana Capitu', NULL,
   '2026-04-16 22:00:00-03', '2026-04-17 05:00:00-03',
   '00000000-0000-0000-0000-000000000003',
   NULL,
   NULL, NULL, '@repcapitu',
   'public'),

  -- 17/04 sex — Me de Groselha
  ('30000000-0000-0000-0000-000000000030',
   'Me de Groselha', NULL,
   '2026-04-17 16:00:00-03', '2026-04-17 22:00:00-03',
   '00000000-0000-0000-0000-000000000002', NULL,
   NULL, NULL, '@repmariagroselha',
   'public'),

  -- 17/04 sex — After na Matadouro
  -- instagram não confirmado → promoter
  ('30000000-0000-0000-0000-000000000031',
   'After na Matadouro', NULL,
   '2026-04-17 23:00:00-03', '2026-04-18 05:00:00-03',
   '00000000-0000-0000-0000-000000000005', NULL,
   NULL, NULL, NULL,
   'public'),

  -- 18/04 sáb — After na Voodoo
  ('30000000-0000-0000-0000-000000000032',
   'After na Voodoo', NULL,
   '2026-04-18 23:00:00-03', '2026-04-19 05:00:00-03',
   '00000000-0000-0000-0000-000000000005', NULL,
   NULL, NULL, '@repvoodoo',
   'public'),

  -- 23/04 qui — Brick
  ('30000000-0000-0000-0000-000000000033',
   'Brick', NULL,
   '2026-04-23 22:00:00-03', '2026-04-24 05:00:00-03',
   '00000000-0000-0000-0000-000000000002', NULL,
   'Blacktag', 'https://blacktag.com.br/brick',
   '@brickeventos',
   'public'),

  -- 24/04 sex — Absinta-me
  ('30000000-0000-0000-0000-000000000034',
   'Absinta-me', E'🍻 Bebidas:\n\nChopp de Vinho\nBeats\nLicor 43\nBudweiser\nAbsinto\n🎤 Atrações:\n\nMC Pedrinho\nDJ GP da ZL\nDJ Blakes\nBraba da NBR\nInformações extras:\n\nEntrada liberada até 23h\nLevar documento com foto\nProibida entrada com bebida',
   '2026-04-24 22:00:00-03', '2026-04-25 10:00:00-03',
   '00000000-0000-0000-0000-000000000002', NULL,
   'Blacktag', 'https://blacktag.com.br/eventos/30215/absinta-me',
   '@absintame',
   'public'),

  -- 01/05 sex — Copa Civil
  ('30000000-0000-0000-0000-000000000036',
   'Copa Civil', 'Localização a confirmar.',
   '2026-05-01 16:00:00-03', '2026-05-01 22:00:00-03',
   '00000000-0000-0000-0000-000000000002', NULL,
   NULL, NULL, '@copa.civil', 'public'),

  -- 01/05 sex — Clandeco da Capitu
  ('30000000-0000-0000-0000-000000000037',
   'Clandeco da Capitu', NULL,
   '2026-05-01 16:00:00-03', '2026-05-01 22:00:00-03',
   '00000000-0000-0000-0000-000000000003', NULL,
   NULL, NULL, '@repcapitu', 'public'),

  -- 02/05 sáb — Rota Bar
  ('30000000-0000-0000-0000-000000000038',
   'Rota Bar', NULL,
   '2026-05-02 16:00:00-03', '2026-05-02 22:00:00-03',
   '00000000-0000-0000-0000-000000000005', NULL,
   NULL, NULL, '@rep.versalhes', 'public'),

  -- 07/05 qui — SkyLine
  ('30000000-0000-0000-0000-000000000039',
   'SkyLine',
   E'SAVE THE DATE - 07/05/2026\n\nCanta Grillo Skyline - Ciudad de México\n\nO melhor rolê do ano já tem data definida! Não fique de fora, mais informações em breve!',
   '2026-05-07 22:00:00-03', '2026-05-08 05:00:00-03',
   '00000000-0000-0000-0000-000000000002', NULL,
   NULL, NULL, NULL, 'public'),

  -- 07/05 qui — ARALOTUSNIGHT (after)
  ('30000000-0000-0000-0000-000000000040',
   'ARALOTUSNIGHT', NULL,
   '2026-05-07 22:00:00-03', '2026-05-08 05:00:00-03',
   '00000000-0000-0000-0000-000000000002', NULL,
   NULL, NULL, NULL, 'public'),

  -- 08/05 sex — Underseth
  ('30000000-0000-0000-0000-000000000041',
   'Underseth', NULL,
   '2026-05-08 20:00:00-03', '2026-05-09 04:00:00-03',
   '00000000-0000-0000-0000-000000000002', NULL,
   NULL, NULL, '@underseth7', 'public'),

  -- 08/05 sex — AEQ
  ('30000000-0000-0000-0000-000000000042',
   'AEQ', NULL,
   '2026-05-08 16:00:00-03', '2026-05-08 22:00:00-03',
   '00000000-0000-0000-0000-000000000002', NULL,
   NULL, NULL, NULL, 'public'),

  -- 08/05 sex — DKUsh
  ('30000000-0000-0000-0000-000000000043',
   'DKUsh', NULL,
   '2026-05-08 22:00:00-03', '2026-05-09 05:00:00-03',
   '00000000-0000-0000-0000-000000000005', NULL,
   NULL, NULL, '@dominakana.rep', 'public');

-- ============================================================
-- EVENT_PROMOTERS
-- Apenas After na Matadouro sem instagram confirmado
-- ============================================================
INSERT INTO event_promoters (event_id, name, whatsapp, instagram, telegram) VALUES
  ('30000000-0000-0000-0000-000000000031', 'Matadouro Bar', '19991110014', NULL, NULL),
  -- SkyLine, ARALOTUSNIGHT, AEQ — sem instagram confirmado
  ('30000000-0000-0000-0000-000000000039', 'Canta Grillo', '16999000039', NULL, NULL),
  ('30000000-0000-0000-0000-000000000040', 'ARALOTUSNIGHT', '16999000040', NULL, NULL),
  ('30000000-0000-0000-0000-000000000042', 'AEQ', '16999000042', NULL, NULL),
  -- Banana Minamora — promoters
  ('30000000-0000-0000-0000-000000000023', 'Mate', '19999324055', NULL, NULL),
  ('30000000-0000-0000-0000-000000000023', 'M11', '1999740254', NULL, NULL),
  -- Me de Groselha — promoters
  ('30000000-0000-0000-0000-000000000030', 'Masha', '14996068287', NULL, NULL),
  ('30000000-0000-0000-0000-000000000030', 'Piupas', '19996655348', NULL, NULL),
  ('30000000-0000-0000-0000-000000000030', 'MG3', '11954686334', NULL, NULL),
  ('30000000-0000-0000-0000-000000000030', 'República Caipirinhas', '11959199720', NULL, NULL),
  ('30000000-0000-0000-0000-000000000030', 'Isa Cintra', '11955928115', NULL, NULL),
  -- Entorta Bixo — promoters
  ('30000000-0000-0000-0000-000000000028', 'Fero', '19996565105', NULL, NULL),
  ('30000000-0000-0000-0000-000000000028', 'Camomila', '17997542670', NULL, NULL),
  ('30000000-0000-0000-0000-000000000028', 'Jady', '11987373006', NULL, NULL),
  ('30000000-0000-0000-0000-000000000028', 'Jose Victor', '16994611515', NULL, NULL),
  ('30000000-0000-0000-0000-000000000028', 'Pichula', '16996197579', NULL, NULL),
  -- Sambohemia — promoters
  ('30000000-0000-0000-0000-000000000027', 'Caca', '11973141006', NULL, NULL),
  ('30000000-0000-0000-0000-000000000027', 'Luiza', '35998960785', NULL, NULL),
  ('30000000-0000-0000-0000-000000000027', 'Luiz', '16996420203', NULL, NULL),
  ('30000000-0000-0000-0000-000000000027', 'Isa Cintra', '11955928115', NULL, NULL),
  ('30000000-0000-0000-0000-000000000027', 'Billy Boy', '19989553803', NULL, NULL),
  -- Absinta-me — promoters
  ('30000000-0000-0000-0000-000000000034', 'República Cama de Gato', NULL, '@repcamadegato', NULL),
  ('30000000-0000-0000-0000-000000000034', 'Tita', NULL, '@patigotti', NULL),
  ('30000000-0000-0000-0000-000000000034', 'Clo Leão', '19999078678', '@cloleao', NULL),
  ('30000000-0000-0000-0000-000000000034', 'República Caipirinhas', '12997320229', '@republicacaipirinhas', NULL),
  ('30000000-0000-0000-0000-000000000034', 'República Capitu', NULL, '@repcapitu', NULL),
  ('30000000-0000-0000-0000-000000000034', 'República Tudo Pela Dona', NULL, '@tudopeladona', NULL),
  ('30000000-0000-0000-0000-000000000034', 'República Maria Groselha', NULL, '@repmariagroselha', NULL),
  ('30000000-0000-0000-0000-000000000034', 'Wag', '16981822553', '@wagnysson', NULL),
  ('30000000-0000-0000-0000-000000000034', 'República Dauhma', NULL, '@dauhma', NULL);

-- ============================================================
-- EVENT_LOCATION
-- São Carlos: coords ~ -22.01 / -47.89
-- ============================================================
INSERT INTO event_location (event_id, latitude, longitude, address, release_at) VALUES

  -- Polter Pool Party — localização a confirmar
  ('30000000-0000-0000-0000-000000000022',
   -22.0087, -47.8909,
   'São Carlos, SP', NULL),

  -- Banana Minamora — venue fixo
  ('30000000-0000-0000-0000-000000000023',
   -22.0130, -47.8920,
   'R. Maj. José Inácio, 2206 - Centro, São Carlos - SP, 13560-160',
   NULL),

  -- Chama a Mãe — embargada
  ('30000000-0000-0000-0000-000000000025',
   -22.0087, -47.8909,
   'São Carlos, SP',
   '2026-04-11 13:00:00-03'),

  -- Palquinho FAG — venue fixo, UFSCar
  ('30000000-0000-0000-0000-000000000026',
   -21.987913, -47.881058,
   'Palquinho FAG — São Carlos, SP', NULL),

  -- Entorta Bixo — embargada
  ('30000000-0000-0000-0000-000000000028',
   -22.0087, -47.8909,
   'São Carlos, SP',
   '2026-04-16 21:00:00-03'),

  -- Banana Capitu — venue fixo
  ('30000000-0000-0000-0000-000000000029',
   -22.0130, -47.8920,
   'R. Maj. José Inácio, 2206 - Centro, São Carlos - SP, 13560-160',
   NULL),

  -- After na Matadouro — localização a confirmar
  ('30000000-0000-0000-0000-000000000031',
   -22.0087, -47.8909,
   'São Carlos, SP', NULL),

  -- After na Voodoo — localização a confirmar
  ('30000000-0000-0000-0000-000000000032',
   -22.0087, -47.8909,
   'São Carlos, SP', NULL),

  -- Brick — embargada
  ('30000000-0000-0000-0000-000000000033',
   -22.0052, -47.8853,
   'Rua Santa Cruz, 262 — Centreville, São Carlos - SP',
   '2026-04-23 21:00:00-03'),

  -- Sextas da IES — venue fixo (Banana)
  ('30000000-0000-0000-0000-000000000035',
   -22.0130, -47.8920,
   'R. Maj. José Inácio, 2206 - Centro, São Carlos - SP, 13560-160',
   NULL),

  -- Absinta-me — venue fixo (Oasis)
  ('30000000-0000-0000-0000-000000000034',
   -22.0050, -47.9100,
   'Rodovia Washington Luiz, S/N, KM 241, 13565-800, Jardim Guanabara, São Carlos, SP',
   NULL),

  -- Copa Civil — loc mockada
  ('30000000-0000-0000-0000-000000000036', -22.0087, -47.8909, 'São Carlos, SP', NULL),

  -- Clandeco da Capitu — loc mockada
  ('30000000-0000-0000-0000-000000000037', -22.0087, -47.8909, 'São Carlos, SP', NULL),

  -- Rota Bar — loc mockada
  ('30000000-0000-0000-0000-000000000038', -22.0087, -47.8909, 'São Carlos, SP', NULL);

-- Sem localização: Arapuskush (0024), Sambohemia (0027), Me de Groselha (0030),
--   SkyLine (0039), ARALOTUSNIGHT (0040), Underseth (0041), AEQ (0042), DKUsh (0043)
