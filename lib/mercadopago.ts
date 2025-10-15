import { MercadoPagoConfig, Preference } from 'mercadopago';

// Initialize MercadoPago with access token
if (!process.env.MERCADOPAGO_ACCESS_TOKEN) {
  console.error('MERCADOPAGO_ACCESS_TOKEN is not configured in environment variables');
}

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
  options: {
    timeout: 5000,
    idempotencyKey: 'abc',
  }
});

const preference = new Preference(client);

export interface TicketItem {
  id: string;
  title: string;
  description?: string;
  category_id?: string;
  quantity: number;
  unit_price: number;
  currency_id?: string;
}

export interface PaymentPreferenceData {
  items: TicketItem[];
  payer?: {
    name?: string;
    surname?: string;
    email?: string;
    phone?: {
      area_code?: string;
      number?: string;
    };
    identification?: {
      type?: string;
      number?: string;
    };
    address?: {
      street_name?: string;
      street_number?: number;
      zip_code?: string;
    };
  };
  back_urls?: {
    success?: string;
    failure?: string;
    pending?: string;
  };
  auto_return?: 'approved' | 'all';
  external_reference?: string;
  notification_url?: string;
  statement_descriptor?: string;
  binary_mode?: boolean;
  metadata?: Record<string, unknown>;
}

/**
 * Creates a payment preference for MercadoPago Checkout Pro
 * Includes all fields from MercadoPago Quality Checklist for optimal approval rate
 */
export async function createPaymentPreference(data: PaymentPreferenceData) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    console.log('[MP Preference] Creating preference:', {
      baseUrl,
      itemsCount: data.items.length,
      externalReference: data.external_reference,
      hasAccessToken: !!process.env.MERCADOPAGO_ACCESS_TOKEN
    });

    const preferenceData = {
      // ITEMS - Requerido por checklist
      items: data.items.map(item => ({
        id: item.id,                              // item_id ✓
        title: item.title,                        // item_title ✓
        description: item.description,            // item_description ✓
        category_id: item.category_id || 'tickets', // item_category_id ✓
        quantity: item.quantity,                  // item_quantity ✓
        unit_price: Number(item.unit_price),     // item_unit_price ✓
        currency_id: item.currency_id || 'ARS',
      })),

      // PAYER - Información del comprador para mejorar tasa de aprobación
      payer: data.payer ? {
        name: data.payer.name,                    // payer_first_name ✓
        surname: data.payer.surname,              // payer_last_name ✓
        email: data.payer.email,                  // email ✓
        phone: data.payer.phone,                  // payer_phone ✓
        identification: data.payer.identification, // payer_identification ✓
        address: data.payer.address,              // address ✓
      } : undefined,

      // BACK URLS - URLs de retorno
      back_urls: {
        success: `${baseUrl}/payment/success`,    // back_urls ✓ - Limpia carrito y redirige a tickets
        failure: `${baseUrl}/payment/failure`,
        pending: `${baseUrl}/payment/pending`,
        ...data.back_urls,
      },

      // AUTO RETURN - Redirección automática
      auto_return: data.auto_return || 'approved' as const,

      // EXTERNAL REFERENCE - Referencia para correlación
      external_reference: data.external_reference, // external_reference ✓

      // NOTIFICATION URL - Webhook
      notification_url: data.notification_url || `${baseUrl}/api/payments/webhook`, // webhooks_ipn ✓

      // STATEMENT DESCRIPTOR - Descripción en resumen de tarjeta
      statement_descriptor: data.statement_descriptor || 'NoTrip Tickets', // statement_descriptor ✓

      // BINARY MODE - Respuesta binaria (aprobado/rechazado instantáneo)
      binary_mode: data.binary_mode ?? true,     // binary_mode ✓ (buena práctica)

      // METADATA - Información adicional
      metadata: data.metadata,

      // EXPIRATION - Vigencia de la preferencia
      expires: true,                              // expiration ✓ (buena práctica)
      expiration_date_from: new Date().toISOString(),
      expiration_date_to: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours

      // INSTALLMENTS - Máximo de cuotas (opcional)
      // payment_methods: {
      //   installments: 12,                      // max_installments (buena práctica)
      // }
    };

    console.log('[MP Preference] Sending to MercadoPago:', {
      itemsCount: preferenceData.items.length,
      hasPayer: !!preferenceData.payer,
      binaryMode: preferenceData.binary_mode,
      externalRef: preferenceData.external_reference
    });

    const result = await preference.create({ body: preferenceData as any});

    console.log('[MP Preference] Created successfully:', {
      id: result.id,
      hasInitPoint: !!result.init_point,
      hasSandboxInitPoint: !!result.sandbox_init_point
    });

    return {
      success: true,
      data: {
        id: result.id,
        init_point: result.init_point,
        sandbox_init_point: result.sandbox_init_point,
      }
    };
  } catch (error) {
    console.error('[MP Preference] Creation error:', error);
    console.error('[MP Preference] Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      response: error?.response?.data || error?.response || 'No response data'
    });

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create payment preference'
    };
  }
}

/**
 * Gets payment information by preference ID
 */
export async function getPaymentInfo(preferenceId: string) {
  try {
    const result = await preference.get({ preferenceId });
    return {
      success: true,
      data: result
    };
  } catch (error) {
    console.error('MercadoPago get payment info error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get payment info'
    };
  }
}

export { client as mercadopagoClient };