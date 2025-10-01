"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface MercadoPagoBrickProps {
  amount: number;
  paymentId: number;
  externalReference: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function MercadoPagoBrick({
  amount,
  paymentId,
  externalReference,
  onSuccess,
  onError
}: MercadoPagoBrickProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const publicKey = process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY;

    if (!publicKey) {
      const err = 'MercadoPago public key not configured';
      setError(err);
      setIsLoading(false);
      onError?.(err);
      return;
    }

    // Cargar SDK de MercadoPago
    const script = document.createElement('script');
    script.src = 'https://sdk.mercadopago.com/js/v2';
    script.async = true;

    script.onload = async () => {
      try {
        // @ts-expect-error - MercadoPago SDK global
        const mp = new window.MercadoPago(publicKey, {
          locale: 'es-AR'
        });

        const bricksBuilder = mp.bricks();

        await bricksBuilder.create('cardPayment', 'mercadopago-brick-container', {
          initialization: {
            amount: amount,
            payer: {
              email: ''
            }
          },
          customization: {
            visual: {
              style: {
                theme: 'dark',
                customVariables: {
                  baseColor: '#f5f5f5',
                  textPrimaryColor: '#f5f5f5',
                  textSecondaryColor: '#a3a3a3',
                  inputBackgroundColor: '#0E0E0E',
                  formBackgroundColor: '#0B0B0B',
                  borderRadiusSmall: '4px',
                  borderRadiusMedium: '6px',
                  borderRadiusLarge: '8px',
                  fontSizeSmall: '12px',
                  fontSizeMedium: '14px',
                  fontSizeLarge: '16px',
                }
              },
              hidePaymentButton: false,
              texts: {
                formTitle: 'Datos de tu tarjeta',
                emailSectionTitle: 'Email',
                cardholderName: {
                  label: 'Titular de la tarjeta',
                  placeholder: 'Nombre como aparece en la tarjeta'
                },
                email: {
                  label: 'Email',
                  placeholder: 'tu@email.com'
                },
                cardNumber: {
                  label: 'Número de tarjeta',
                  placeholder: '0000 0000 0000 0000'
                },
                expirationDate: {
                  label: 'Vencimiento',
                  placeholder: 'MM/AA'
                },
                securityCode: {
                  label: 'CVV',
                  placeholder: '123'
                },
                installmentsSectionTitle: 'Cuotas',
                selectInstallments: 'Elegí cuotas',
                identificationTypes: {
                  label: 'Tipo de documento',
                  placeholder: 'Tipo'
                },
                identificationType: {
                  label: 'Tipo de documento'
                },
                identificationNumber: {
                  label: 'Número de documento',
                  placeholder: '12345678'
                },
                formSubmit: 'Pagar'
              }
            }
          },
          callbacks: {
            onReady: () => {
              setIsLoading(false);
              console.log('[MP Brick] Ready');
            },
            onSubmit: async (formData: {
              token: string;
              installments: number;
              issuer_id: string;
              payment_method_id: string;
            }) => {
              console.log('[MP Brick] Submit', formData);

              try {
                const response = await fetch('/api/payments/process', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    paymentId,
                    token: formData.token,
                    installments: formData.installments,
                    issuerId: formData.issuer_id,
                    paymentMethodId: formData.payment_method_id
                  })
                });

                const result = await response.json();
                console.log('[MP Brick] Payment result:', result);

                if (result.success && result.status === 'approved') {
                  onSuccess?.();
                  router.push('/payment/success?ref=' + externalReference);
                } else if (result.status === 'in_process' || result.status === 'pending') {
                  router.push('/payment/pending?ref=' + externalReference);
                } else {
                  const errorMsg = result.error || 'Payment was rejected';
                  setError(errorMsg);
                  onError?.(errorMsg);
                  router.push('/payment/failure?ref=' + externalReference + '&reason=' + encodeURIComponent(result.status_detail || 'rejected'));
                }
              } catch (err) {
                console.error('[MP Brick] Error processing payment:', err);
                const errorMsg = err instanceof Error ? err.message : 'Error processing payment';
                setError(errorMsg);
                onError?.(errorMsg);
              }
            },
            onError: (error: { message: string }) => {
              console.error('[MP Brick] Error:', error);
              setError(error.message);
              onError?.(error.message);
            }
          }
        });

      } catch (err) {
        console.error('[MP Brick] Initialization error:', err);
        const errorMsg = err instanceof Error ? err.message : 'Failed to initialize payment';
        setError(errorMsg);
        onError?.(errorMsg);
        setIsLoading(false);
      }
    };

    script.onerror = () => {
      const err = 'Failed to load MercadoPago SDK';
      setError(err);
      setIsLoading(false);
      onError?.(err);
    };

    document.body.appendChild(script);

    return () => {
      // Cleanup
      const container = document.getElementById('mercadopago-brick-container');
      if (container) {
        container.innerHTML = '';
      }
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [amount, paymentId, externalReference, router, onSuccess, onError]);

  return (
    <div className="w-full">
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-800 border-t-neutral-100" />
            <p className="text-sm text-neutral-400">Cargando método de pago...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-900/50 bg-red-950/20 p-4 text-sm text-red-400">
          <p className="font-medium">Error al cargar el formulario de pago</p>
          <p className="mt-1 text-xs text-red-500">{error}</p>
        </div>
      )}

      <div id="mercadopago-brick-container" className="w-full" />
    </div>
  );
}