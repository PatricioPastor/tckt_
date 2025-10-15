-- ============================================
-- QUERIES PARA CONFIGURAR EVENTO CORA
-- ============================================

-- PASO 1: Buscar el ID del evento CORA
-- ============================================
SELECT id, name, date, location, status
FROM "public"."event" 
WHERE name ILIKE '%hallowen%' 
   OR name ILIKE '%cora%'
   OR location ILIKE '%cora%'
ORDER BY created_at DESC;

-- Resultado esperado: Anotar el `id` del evento


-- PASO 2: Eliminar tipos de ticket antiguos (OPCIONAL)
-- ============================================
-- ⚠️ CUIDADO: Solo ejecutar si estás seguro de que quieres eliminar los tickets existentes
-- DELETE FROM "public"."ticket_type" WHERE event_id = <EVENT_ID>;


-- PASO 3: Crear los 3 tipos de ticket con precios escalonados
-- ============================================
-- Reemplazar <EVENT_ID> con el ID obtenido en el PASO 1

-- 1️⃣ OPCIÓN 1: Entrada Individual - $6000 c/u (sin combo)
INSERT INTO "public"."ticket_type" (
  event_id, 
  code, 
  label, 
  price, 
  stock_max, 
  stock_current, 
  user_max_per_type,
  min_purchase_quantity,
  is_visible, 
  is_disabled
) VALUES (
  <EVENT_ID>,                    -- ⬅️ REEMPLAZAR CON EL ID DEL EVENTO
  'promo_individual',
  '6000 c/u',
  6000.00,
  50,                            -- Stock máximo (ajustar según necesidad)
  50,                            -- Stock actual disponible
  10,                            -- Máximo 10 por usuario
  1,                             -- ✅ Mínimo 1 (compra individual)
  true,                          -- Visible en frontend
  false                          -- No deshabilitado
);

-- 2️⃣ OPCIÓN 2: Combo 2x - $5500 c/u abonando 2
INSERT INTO "public"."ticket_type" (
  event_id, 
  code, 
  label, 
  price, 
  stock_max, 
  stock_current, 
  user_max_per_type,
  min_purchase_quantity,
  is_visible, 
  is_disabled
) VALUES (
  <EVENT_ID>,                    -- ⬅️ REEMPLAZAR CON EL ID DEL EVENTO
  'promo_2x',
  '5500 c/u abonando 2',
  5500.00,
  50,                            -- Stock máximo
  50,                            -- Stock actual disponible
  10,                            -- Máximo 10 por usuario
  2,                             -- ✅ Mínimo 2 (COMBO)
  true,
  false
);

-- 3️⃣ OPCIÓN 3: Combo 3x - $5000 c/u abonando 3 (MEJOR PRECIO)
INSERT INTO "public"."ticket_type" (
  event_id, 
  code, 
  label, 
  price, 
  stock_max, 
  stock_current, 
  user_max_per_type,
  min_purchase_quantity,
  is_visible, 
  is_disabled
) VALUES (
  <EVENT_ID>,                    -- ⬅️ REEMPLAZAR CON EL ID DEL EVENTO
  'promo_3x',
  '5000 c/u abonando 3',
  5000.00,
  50,                            -- Stock máximo
  50,                            -- Stock actual disponible
  10,                            -- Máximo 10 por usuario
  3,                             -- ✅ Mínimo 3 (COMBO)
  true,
  false
);


-- PASO 4: Verificar que se crearon correctamente
-- ============================================
SELECT 
  id,
  code,
  label,
  price,
  stock_current,
  min_purchase_quantity AS "mínimo",
  user_max_per_type AS "máximo_por_usuario",
  is_visible AS "visible"
FROM "public"."ticket_type"
WHERE event_id = <EVENT_ID>      -- ⬅️ REEMPLAZAR CON EL ID DEL EVENTO
ORDER BY min_purchase_quantity ASC;

-- Resultado esperado:
-- | id | code             | label                 | price  | stock | mínimo | máximo | visible |
-- |----|------------------|-----------------------|--------|-------|--------|--------|---------|
-- | XX | promo_individual | 6000 c/u              | 6000   | 50    | 1      | 10     | true    |
-- | XX | promo_2x         | 5500 c/u abonando 2   | 5500   | 50    | 2      | 10     | true    |
-- | XX | promo_3x         | 5000 c/u abonando 3   | 5000   | 50    | 3      | 10     | true    |


-- ============================================
-- EJEMPLO DE USO
-- ============================================
/*
Si el evento tiene ID = 5, los queries quedarían así:

-- Crear ticket individual
INSERT INTO "public"."ticket_type" (
  event_id, code, label, price, stock_max, stock_current, 
  user_max_per_type, min_purchase_quantity, is_visible, is_disabled
) VALUES (
  5, 'promo_individual', '6000 c/u', 6000.00, 50, 50, 10, 1, true, false
);

-- Crear combo 2x
INSERT INTO "public"."ticket_type" (
  event_id, code, label, price, stock_max, stock_current, 
  user_max_per_type, min_purchase_quantity, is_visible, is_disabled
) VALUES (
  5, 'promo_2x', '5500 c/u abonando 2', 5500.00, 50, 50, 10, 2, true, false
);

-- Crear combo 3x
INSERT INTO "public"."ticket_type" (
  event_id, code, label, price, stock_max, stock_current, 
  user_max_per_type, min_purchase_quantity, is_visible, is_disabled
) VALUES (
  5, 'promo_3x', '5000 c/u abonando 3', 5000.00, 50, 50, 10, 3, true, false
);
*/
