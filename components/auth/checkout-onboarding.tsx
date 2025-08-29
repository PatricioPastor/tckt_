"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import { useUserStore } from "@/lib/store/user-store";
import { z } from "zod";

const checkoutRegistrationSchema = z.object({
  email: z.string().email("Invalid email address"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  dni: z.string().min(7, "DNI must be at least 7 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type CheckoutRegistrationData = z.infer<typeof checkoutRegistrationSchema>;

interface CheckoutOnboardingProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CheckoutOnboarding({ 
  isOpen, 
  onClose, 
  onSuccess 
}: CheckoutOnboardingProps) {
  const [formData, setFormData] = useState<CheckoutRegistrationData>({
    email: "",
    name: "",
    dni: "",
    password: "",
  });
  
  const [errors, setErrors] = useState<Partial<CheckoutRegistrationData>>({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { fetchUser } = useUserStore();

  const validateForm = () => {
    try {
      checkoutRegistrationSchema.parse(formData);
      setErrors({});
      return true;
    } catch (err) {
      if (err instanceof z.ZodError) {
        const fieldErrors: Partial<CheckoutRegistrationData> = {};
        err.errors.forEach((error) => {
          if (error.path[0]) {
            fieldErrors[error.path[0] as keyof CheckoutRegistrationData] = error.message;
          }
        });
        setErrors(fieldErrors);
      }
      return false;
    }
  };

  const handleInputChange = (field: keyof CheckoutRegistrationData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (loading) return; // evita doble submit
  if (!validateForm()) return;

  setLoading(true);
  setError("");

  try {
    const res = await fetch("/api/auth/checkout-register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // importante: mandamos exactamente lo que valida el backend (email, password, name, dni)
      body: JSON.stringify(formData),
    });

    // Si el server devolvió error, intento leer el body para mostrar mensaje/zod details
    if (!res.ok) {
      let payload: { error?: string; details?: Array<{ path?: string[]; message: string }> } | null = null;
      try {
        payload = await res.json();
      } catch {
        // ignore
      }

      // Mapeo de errores de Zod a tus fields, si existen
      if (payload?.details && Array.isArray(payload.details)) {
        const fieldErrors: Partial<typeof formData> = {};
        for (const d of payload.details) {
          const key = d?.path?.[0] as keyof typeof formData | undefined;
          if (key) fieldErrors[key] = d.message;
        }
        setErrors(fieldErrors);
      }

      setError(payload?.error || "No pudimos crear tu cuenta. Intentá de nuevo.");
      setLoading(false);
      return;
    }

    // OK
    await res.json();

    // Pequeña espera para que el navegador aplique Set-Cookie del response
    await new Promise((r) => setTimeout(r, 250));

    // Refrescá sesión (authClient) y tu user store
    await Promise.all([
      authClient.getSession({ fetchOptions: { cache: "no-store" } }),
      fetchUser(),
    ]);

    // Cerrá el modal y dispará el success (micro delay para evitar condiciones de carrera en UI)
    onClose();
    setTimeout(() => onSuccess(), 100);
  } catch (err) {
    console.error("Registration error:", err);
    setError("Ocurrió un error registrando tu cuenta. Intentá de nuevo.");
  } finally {
    setLoading(false);
  }
  };


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-[#0E0E0E] border border-neutral-800">
        <DialogHeader className="text-left">
          <DialogTitle className="text-neutral-100 font-medium text-base">Crear cuenta</DialogTitle>
          <DialogDescription className="text-neutral-400 text-sm">
            Necesitamos algunos datos para completar tu compra
          </DialogDescription>
        </DialogHeader>
        
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-md">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="checkout-email" className="text-neutral-200 text-sm font-medium">Email</Label>
            <Input
              id="checkout-email"
              type="email"
              placeholder="tu@email.com"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              className={`bg-neutral-900 border-neutral-700 text-neutral-100 placeholder:text-neutral-500 focus:border-neutral-600 focus:ring-0 ${errors.email ? "border-red-500 focus:border-red-500" : ""}`}
              required
            />
            {errors.email && (
              <p className="text-xs text-red-400">{errors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="checkout-name" className="text-neutral-200 text-sm font-medium">Nombre completo</Label>
            <Input
              id="checkout-name"
              type="text"
              placeholder="Juan Pérez"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className={`bg-neutral-900 border-neutral-700 text-neutral-100 placeholder:text-neutral-500 focus:border-neutral-600 focus:ring-0 ${errors.name ? "border-red-500 focus:border-red-500" : ""}`}
              required
            />
            {errors.name && (
              <p className="text-xs text-red-400">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="checkout-dni" className="text-neutral-200 text-sm font-medium">DNI</Label>
            <Input
              id="checkout-dni"
              type="text"
              placeholder="12345678"
              value={formData.dni}
              onChange={(e) => handleInputChange("dni", e.target.value)}
              className={`bg-neutral-900 border-neutral-700 text-neutral-100 placeholder:text-neutral-500 focus:border-neutral-600 focus:ring-0 ${errors.dni ? "border-red-500 focus:border-red-500" : ""}`}
              required
            />
            {errors.dni && (
              <p className="text-xs text-red-400">{errors.dni}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="checkout-password" className="text-neutral-200 text-sm font-medium">Contraseña</Label>
            <Input
              id="checkout-password"
              type="password"
              placeholder="Mínimo 6 caracteres"
              value={formData.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
              className={`bg-neutral-900 border-neutral-700 text-neutral-100 placeholder:text-neutral-500 focus:border-neutral-600 focus:ring-0 ${errors.password ? "border-red-500 focus:border-red-500" : ""}`}
              required
            />
            {errors.password && (
              <p className="text-xs text-red-400">{errors.password}</p>
            )}
          </div>

          <div className="flex flex-col gap-3 pt-6">
            <Button 
              type="submit" 
              disabled={loading}
              className="w-full h-9 bg-neutral-100 text-black font-medium text-sm rounded-md hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 border border-black/30 border-t-black rounded-full animate-spin" />
                  <span className="text-xs">Creando cuenta...</span>
                </div>
              ) : (
                "Crear cuenta y continuar"
              )}
            </Button>
            
            <Button 
              type="button" 
              variant="ghost" 
              onClick={onClose}
              disabled={loading}
              className="w-full h-9 text-neutral-400 hover:text-neutral-300 hover:bg-neutral-800 text-sm transition-colors"
            >
              Cancelar
            </Button>
          </div>
        </form>

        <div className="text-xs text-neutral-500 text-center leading-relaxed">
          Al crear una cuenta, aceptas nuestros términos de servicio y política de privacidad.
        </div>
      </DialogContent>
    </Dialog>
  );
}