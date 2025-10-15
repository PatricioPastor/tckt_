# Feature: Combos de Tickets con Cantidad Mínima de Compra

## Descripción
Esta funcionalidad permite crear **combos de tickets** estableciendo una cantidad mínima obligatoria de compra por tipo de ticket. El precio se mantiene por unidad, pero el usuario debe comprar al menos la cantidad mínima especificada.

## Cambios en la Base de Datos

### Nueva Columna en `ticket_type`
```sql
ALTER TABLE "public"."ticket_type" 
ADD COLUMN "min_purchase_quantity" INTEGER NOT NULL DEFAULT 1;
```

| Campo | Tipo | Default | Descripción |
|-------|------|---------|-------------|
| `min_purchase_quantity` | INTEGER | 1 | Cantidad mínima de compra obligatoria |

## Ejemplo de Uso

### Crear un Combo VIP (4 tickets mínimo)
```typescript
await prisma.ticketType.create({
  data: {
    eventId: 1,
    code: "combo_vip",
    label: "Combo VIP 4x",
    price: 5000,              // Precio por unidad
    stockMax: 100,
    stockCurrent: 100,
    userMaxPerType: 8,
    minPurchaseQuantity: 4,   // ✅ Mínimo 4 tickets
    isVisible: true,
    isDisabled: false
  }
});
```

### Crear un Ticket Individual Normal
```typescript
await prisma.ticketType.create({
  data: {
    eventId: 1,
    code: "individual",
    label: "Entrada Individual",
    price: 2000,
    stockMax: 500,
    stockCurrent: 500,
    userMaxPerType: 5,
    minPurchaseQuantity: 1,   // ✅ Sin restricción (default)
    isVisible: true,
    isDisabled: false
  }
});
```

## Comportamiento del Sistema

### Backend (API)

#### Validación en `/api/tickets/buy` y `/api/tickets/buy-free`
- Si `quantity < minPurchaseQuantity`, se rechaza la compra con error descriptivo
- Ejemplo: `"Combo VIP 4x requires a minimum purchase of 4 tickets"`

#### Request de Compra
```json
{
  "eventId": 1,
  "selections": [
    {
      "code": "combo_vip",
      "quantity": 4  // ✅ Válido (cumple el mínimo de 4)
    }
  ]
}
```

❌ **Request inválido:**
```json
{
  "eventId": 1,
  "selections": [
    {
      "code": "combo_vip",
      "quantity": 2  // ❌ Error: mínimo 4
    }
  ]
}
```

### Frontend (UI)

#### Indicador Visual
En la tarjeta de ticket se muestra:
```
Disponibles: 100 • Mín: 4 • Máx: 8
```
- **Mín:** Solo se muestra si `minPurchaseQuantity > 1`
- Color amarillo para destacar el requisito

#### Comportamiento del Botón "+"
1. Si `quantity = 0` y `minPurchaseQuantity > 1`:
   - Agrega directamente la cantidad mínima
   - Muestra toast: "Agregaste 4 tickets (mínimo requerido)"

2. Si `quantity >= minPurchaseQuantity`:
   - Incrementa de a 1 como siempre

#### Comportamiento del Botón "-"
1. Si `quantity - 1 < minPurchaseQuantity` y `quantity - 1 > 0`:
   - Resetea a 0 automáticamente
   - Muestra toast: "Este ticket requiere un mínimo de 4 unidades"

2. Esto evita que el usuario quede "atrapado" con una cantidad inválida

## Casos de Uso

### 1. Combo Familiar (Mínimo 4 tickets)
- **Precio unitario:** $3.500
- **Mínimo:** 4 tickets
- **Total mínimo:** $14.000
- **Uso:** Grupos familiares, promoción grupal

### 2. Combo Pareja (Mínimo 2 tickets)
- **Precio unitario:** $4.000
- **Mínimo:** 2 tickets
- **Total mínimo:** $8.000
- **Uso:** Parejas, promoción 2x1

### 3. Entrada Individual (Sin restricción)
- **Precio unitario:** $2.500
- **Mínimo:** 1 ticket
- **Uso:** Compra individual estándar

## Migración Aplicada

### Archivo de Migración
`prisma/migrations/20251015143600_add_min_purchase_quantity/migration.sql`

### Comando para Aplicar
```bash
bunx prisma db push
```

O en producción:
```bash
bunx prisma migrate deploy
```

## Archivos Modificados

### Backend
- ✅ `prisma/schema.prisma` - Modelo `ticketType`
- ✅ `app/api/tickets/buy/route.ts` - Validación de cantidad mínima
- ✅ `app/api/tickets/buy-free/route.ts` - Validación de cantidad mínima

### Frontend
- ✅ `app/(public)/(subpages)/events/[id]/components/ticket/ticket-card.tsx` - UI y lógica

## Validaciones Implementadas

### Backend
1. ✅ Rechaza compras con `quantity < minPurchaseQuantity`
2. ✅ Mensaje de error descriptivo por tipo de ticket
3. ✅ Validación tanto para tickets pagos como gratuitos

### Frontend
1. ✅ Muestra indicador visual de cantidad mínima
2. ✅ Botón "+" agrega directamente el mínimo desde 0
3. ✅ Botón "-" resetea a 0 si se baja del mínimo
4. ✅ Toasts informativos para el usuario
5. ✅ Validaciones de stock y máximos compatibles con el mínimo

## Notas Técnicas

- **Default:** `minPurchaseQuantity = 1` (sin restricción)
- **Compatibilidad:** Funciona con todos los tickets existentes
- **Retrocompatible:** Los tickets antiguos funcionan igual (mínimo = 1)
- **TypeScript:** Tipos actualizados en cliente generado de Prisma
