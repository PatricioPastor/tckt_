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
  };
  back_urls?: {
    success?: string;
    failure?: string;
    pending?: string;
  };
  auto_return?: 'approved' | 'all';
  external_reference?: string;
  notification_url?: string;
}

/**
 * Creates a payment preference for MercadoPago Checkout Pro
 */
export async function createPaymentPreference(data: PaymentPreferenceData) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    
    console.log('Creating MercadoPago preference with data:', {
      baseUrl,
      itemsCount: data.items.length,
      externalReference: data.external_reference,
      hasAccessToken: !!process.env.MERCADOPAGO_ACCESS_TOKEN
    });
    
    const preferenceData = {
      items: data.items.map(item => ({
        id: item.id,
        title: item.title,
        quantity: item.quantity,
        unit_price: Number(item.unit_price),
        currency_id: item.currency_id || 'ARS',
      })),
      payer: data.payer,
      back_urls: {
        success: `${baseUrl}/payment/success`,
        failure: `${baseUrl}/payment/failure`,
        pending: `${baseUrl}/payment/pending`,
        ...data.back_urls,
      },
      auto_return: data.auto_return || 'approved',
      external_reference: data.external_reference,
      notification_url: `${baseUrl}/api/payments/webhook`,
      statement_descriptor: 'NoTrip Tickets',
      expires: true,
      expiration_date_from: new Date().toISOString(),
      expiration_date_to: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
    };

    console.log('Preference data to send to MercadoPago:', JSON.stringify(preferenceData, null, 2));

    const result = await preference.create({ body: preferenceData });
    
    console.log('MercadoPago preference created successfully:', {
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
    console.error('MercadoPago preference creation error:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      // @ts-expect-error - MercadoPago error object may have response property
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