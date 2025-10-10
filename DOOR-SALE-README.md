# At-the-Door Ticket Sales Feature

## Overview

The door-sale feature allows users to purchase tickets directly at the event entrance using a public, authentication-free page. Payment is processed through Mercado Pago, and upon successful payment, the system automatically creates a user account (if needed), payment record, and ticket with QR code.

## Architecture

### Flow Diagram

```
User visits URL → Validates Event → Shows Price Breakdown → User Clicks Pay
    ↓
Creates MP Preference → Redirects to Mercado Pago → User Completes Payment
    ↓
Webhook Receives Notification → Creates/Finds User → Creates Payment → Creates Ticket
    ↓
User Redirected to Success Page → Can View Ticket in /tickets
```

## Files Created

### 1. Public Pages

- **`app/(public)/(subpages)/door-sale/page.tsx`**
  - Main door-sale page
  - Validates `eventId` query parameter
  - Displays event name and price breakdown
  - Handles payment initiation

- **`app/(public)/(subpages)/door-sale/success/page.tsx`**
  - Success confirmation page
  - Displays after approved payment

- **`app/(public)/(subpages)/door-sale/failure/page.tsx`**
  - Payment failure page
  - Allows retry

- **`app/(public)/(subpages)/door-sale/pending/page.tsx`**
  - Pending payment status page

### 2. API Routes

- **`app/api/payments/create-door-sale/route.ts`**
  - Creates Mercado Pago payment preference
  - Server-side price calculation (prevents manipulation)
  - Generates unique external reference

### 3. Enhanced Webhook

- **`app/api/payments/webhook/route.ts`** (modified)
  - Added `handleDoorSalePayment()` function
  - Detects door-sale payments by external reference prefix
  - Creates user, payment, and ticket on approved payment

### 4. Setup Script

- **`scripts/create-door-sale-ticket-type.ts`**
  - Helper script to create DOOR-SALE ticket type for events

## Setup Instructions

### 1. Environment Variables

Ensure these are set in your `.env` file:

```env
MERCADOPAGO_ACCESS_TOKEN=your_access_token
NEXT_PUBLIC_BASE_URL=https://your-domain.com
# Optional for webhook verification:
MERCADOPAGO_WEBHOOK_SECRET=your_webhook_secret
```

### 2. Create DOOR-SALE Ticket Type

Before using the door-sale feature, you must create a `DOOR-SALE` ticket type for each event:

```bash
# Using the helper script
npx tsx scripts/create-door-sale-ticket-type.ts <eventId>

# Example
npx tsx scripts/create-door-sale-ticket-type.ts 1
```

Or manually via Prisma Studio or direct SQL:

```sql
INSERT INTO ticket_type (
  event_id,
  code,
  label,
  price,
  stock_max,
  stock_current,
  user_max_per_type,
  is_visible,
  is_disabled
) VALUES (
  1,                          -- event_id
  'DOOR-SALE',                -- code
  'At-the-door Ticket',       -- label
  34200.00,                   -- price (in ARS)
  1000,                       -- stock_max
  1000,                       -- stock_current
  10,                         -- user_max_per_type
  true,                       -- is_visible
  false                       -- is_disabled
);
```

### 3. Configure Mercado Pago Webhook

Make sure your Mercado Pago webhook is pointing to:
```
https://your-domain.com/api/payments/webhook
```

You can use the MCP Mercado Pago server to configure this:
```bash
# Using MCP tools
mcp__mercadopago-mcp-server__save_webhook
```

## Usage

### Access URL

```
https://your-domain.com/door-sale?eventId=<EVENT_ID>
```

Example:
```
https://your-domain.com/door-sale?eventId=1
```

### Price Calculation

The price is calculated server-side to prevent manipulation:

```typescript
const BASE_PRICE = 30000;        // $30,000 ARS
const APP_FEE_RATE = 0.08;       // 8% app fee
const MP_FEE_RATE = 0.06;        // 6% Mercado Pago fee

// Calculation
const appFee = BASE_PRICE * APP_FEE_RATE;              // $2,400
const priceWithAppFee = BASE_PRICE + appFee;           // $32,400
const totalPrice = priceWithAppFee / (1 - MP_FEE_RATE); // $34,200
```

**Total: $34,200 ARS**

To modify the base price, edit:
- `app/api/payments/create-door-sale/route.ts` (line ~36)
- `app/(public)/(subpages)/door-sale/page.tsx` (line ~19)

## How It Works

### 1. User Access
- User visits `/door-sale?eventId=123`
- Page fetches event data via `/api/events/123`
- Displays event name and price breakdown

### 2. Payment Initiation
- User clicks "Pay with Mercado Pago"
- Frontend calls `/api/payments/create-door-sale`
- API validates event exists and is published
- Creates Mercado Pago preference with:
  - Unique external reference: `DOOR-SALE-<UUID>`
  - Price calculated server-side
  - Metadata: `{ type: 'door-sale', event_id: X }`
- Returns `init_point` URL
- User redirected to Mercado Pago checkout

### 3. Payment Processing
- User completes payment on Mercado Pago
- Mercado Pago sends webhook notification to `/api/payments/webhook`
- Webhook handler:
  1. Fetches payment details from Mercado Pago API
  2. Detects door-sale by checking if external reference starts with `DOOR-SALE-`
  3. Extracts `event_id` from metadata
  4. Extracts payer email and name from payment data
  5. If payment status is `approved`:
     - **Upserts user** (finds existing or creates new)
     - **Creates payment record** in database
     - **Creates ticket** with unique QR code
     - **Logs action** for audit

### 4. Confirmation
- User redirected to `/door-sale/success`
- Ticket available at `/tickets`
- User receives email (if email sending is configured)

## Database Models

### User (created/found via upsert)
```typescript
{
  id: UUID,
  email: string,              // from payer.email
  name: string,               // from payer.first_name + last_name
  emailVerified: true,
  role: 'user',
  createdAt: Date,
  updatedAt: Date
}
```

### Payment
```typescript
{
  userId: string,
  eventId: number,
  status: 'approved',
  amount: Decimal,            // from transaction_amount
  currency: 'ARS',
  provider: 'mercadopago',
  externalReference: string,  // 'DOOR-SALE-<UUID>'
  mpPaymentId: string,        // MP payment ID
  payerEmail: string,
  payerName: string
}
```

### Ticket
```typescript
{
  eventId: number,
  ownerId: string,            // user.id
  typeId: number,             // DOOR-SALE ticket type ID
  paymentId: number,
  qrCode: string,             // 'DOOR-<UUID>'
  code: string,               // 'DOOR-<timestamp>-<random>'
  status: 'paid'
}
```

## Testing

### Local Testing

1. **Start development server:**
   ```bash
   npm run dev
   ```

2. **Create a DOOR-SALE ticket type:**
   ```bash
   npx tsx scripts/create-door-sale-ticket-type.ts 1
   ```

3. **Visit the door-sale page:**
   ```
   http://localhost:3000/door-sale?eventId=1
   ```

4. **Test with Mercado Pago sandbox:**
   - Use test credentials in `.env`
   - Use test cards: https://www.mercadopago.com.ar/developers/es/docs/checkout-pro/additional-content/test-cards

### Webhook Testing

#### Using Mercado Pago MCP Tools

```bash
# Simulate a webhook notification
mcp__mercadopago-mcp-server__simulate_webhook

# Check webhook notification history
mcp__mercadopago-mcp-server__notifications_history
```

#### Manual Webhook Testing

You can test the webhook manually using the GET endpoint:

```bash
# Process a payment ID
curl "http://localhost:3000/api/payments/webhook?id=<MP_PAYMENT_ID>"
```

### Important Notes

1. **DOOR-SALE Ticket Type Required**: Each event must have a ticket type with `code: 'DOOR-SALE'` before door-sale payments will work.

2. **External Reference Pattern**: The webhook detects door-sale payments by checking if the external reference starts with `DOOR-SALE-`.

3. **User Creation**: Users are automatically created if they don't exist (based on email). Existing users with the same email will be used.

4. **QR Code Generation**: Each ticket gets a unique QR code (`DOOR-<UUID>`) and tracking code.

5. **Public Access**: The `/door-sale` page does NOT require authentication.

## Security Considerations

- **Server-side price calculation** prevents client-side price manipulation
- **Event validation** ensures only published events can be purchased
- **Webhook signature verification** (if `MERCADOPAGO_WEBHOOK_SECRET` is set)
- **Idempotency**: Payment external references are unique, preventing duplicates
- **User email verification**: Auto-created users have `emailVerified: true` since email comes from Mercado Pago

## Troubleshooting

### "DOOR-SALE ticket type not found"
**Solution**: Create the ticket type using the setup script:
```bash
npx tsx scripts/create-door-sale-ticket-type.ts <eventId>
```

### "Event not found or invalid"
**Solution**: Ensure the event exists and is published:
```sql
SELECT id, name, status FROM event WHERE id = <eventId>;
UPDATE event SET status = 'published' WHERE id = <eventId>;
```

### Webhook not being called
**Solutions**:
1. Ensure webhook URL is publicly accessible (use ngrok for local testing)
2. Verify webhook configuration in Mercado Pago dashboard
3. Check Mercado Pago webhook logs using MCP tools:
   ```bash
   mcp__mercadopago-mcp-server__notifications_history
   ```

### Payment successful but no ticket created
**Check**:
1. Webhook logs in your API console
2. Database to see if payment record exists
3. Ensure DOOR-SALE ticket type exists for the event
4. Check error logs for transaction failures

## Customization

### Change Base Price

Edit both files to keep client and server in sync:

**Server**: `app/api/payments/create-door-sale/route.ts`
```typescript
const BASE_PRICE = 30000; // Change this value
```

**Client**: `app/(public)/(subpages)/door-sale/page.tsx`
```typescript
const BASE_PRICE = 30000; // Change this value
```

### Change Fee Rates

```typescript
const APP_FEE_RATE = 0.08; // 8% app fee
const MP_FEE_RATE = 0.06;  // 6% MP fee
```

### Customize Success Page

Edit `app/(public)/(subpages)/door-sale/success/page.tsx` to add:
- Event-specific messaging
- QR code display
- Entry instructions

## Future Enhancements

- [ ] Email notification with QR code
- [ ] SMS notification option
- [ ] Multiple ticket purchase support
- [ ] Dynamic pricing based on event
- [ ] Integration with QR scanner app
- [ ] Real-time stock updates
- [ ] Analytics dashboard for door sales

## Support

For issues or questions:
- Check the logs in `/api/payments/webhook` route
- Use Mercado Pago MCP tools for diagnostics
- Review payment and ticket records in Prisma Studio
