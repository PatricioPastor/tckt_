"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { BackHeader } from "@/components/back-header/back-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckCircle, Camera01, User01 } from "@untitledui/icons";
import Image from "next/image";

export default function ProfilePage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/login?tab=signup");
    }
  }, [session, isPending, router]);

  useEffect(() => {
    if (session?.user) {
      setName(session.user.name || "");
      setEmail(session.user.email || "");
      setImageBase64((session.user as any).imageBase64 || null);
    }
  }, [session]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tamaño (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError("La imagen debe pesar menos de 2MB");
      return;
    }

    // Validar tipo
    if (!file.type.startsWith("image/")) {
      setError("Solo se permiten archivos de imagen");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImageBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImageBase64(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSaveProfile = async () => {
    setError(null);
    setSuccess(null);
    setIsSaving(true);

    try {
      // Actualizar nombre e imagen con nuestro endpoint personalizado
      const response = await fetch("/api/user/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          imageBase64
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al actualizar perfil");
      }

      setSuccess("Perfil actualizado correctamente");
      setIsEditing(false);

      // Refrescar la página para recargar la sesión con los datos actualizados
      setTimeout(() => window.location.reload(), 1000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al actualizar perfil");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    setError(null);
    setSuccess(null);

    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    if (newPassword.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres");
      return;
    }

    setIsChangingPassword(true);

    try {
      await authClient.changePassword({
        currentPassword,
        newPassword,
        revokeOtherSessions: false,
      });
      setSuccess("Contraseña actualizada correctamente");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al cambiar contraseña");
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (isPending || !session?.user) {
    return (
      <div className="min-h-screen bg-[#0B0B0B]">
        <BackHeader title="Perfil" className="border-b border-neutral-800 bg-[#0B0B0B]" />
        <div className="flex h-[calc(100vh-64px)] items-center justify-center">
          <div className="text-center space-y-2">
            <div className="h-8 w-8 mx-auto animate-spin rounded-full border-2 border-neutral-800 border-t-neutral-100" />
            <p className="text-sm text-neutral-400">Cargando perfil...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0B0B]">
      <BackHeader title="Mi Perfil" className="border-b border-neutral-800 bg-[#0B0B0B]" />

      <div className="mx-auto max-w-2xl px-4 py-6 space-y-6">
        {/* Mensajes de error/éxito */}
        {error && (
          <div className="flex items-center gap-2 rounded-md border border-red-500/20 bg-red-500/10 p-3">
            <AlertCircle className="h-4 w-4 text-red-400" />
            <p className="text-xs text-red-400">{error}</p>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 rounded-md border border-green-500/20 bg-green-500/10 p-3">
            <CheckCircle className="h-4 w-4 text-green-400" />
            <p className="text-xs text-green-400">{success}</p>
          </div>
        )}

        {/* Sección de información personal */}
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Información Personal</h2>
            {!isEditing && (
              <Button
                onClick={() => setIsEditing(true)}
                variant="ghost"
                className="text-xs text-neutral-400 hover:text-white"
              >
                Editar
              </Button>
            )}
          </div>

          <div className="space-y-4">
            {/* Foto de perfil */}
            <div className="flex flex-col items-center gap-4 pb-4 border-b border-neutral-800">
              <div className="relative group">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-neutral-800 border-2 border-neutral-700 flex items-center justify-center">
                  {imageBase64 ? (
                    <Image
                      src={imageBase64}
                      alt="Foto de perfil"
                      width={96}
                      height={96}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <User01 className="w-10 h-10 text-neutral-600" />
                  )}
                </div>
                {isEditing && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                  >
                    <Camera01 className="w-6 h-6 text-white" />
                  </button>
                )}
              </div>

              {isEditing && (
                <div className="flex gap-2">
                  <Button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                    className="text-xs border-neutral-700 text-neutral-400 hover:text-white"
                  >
                    Cambiar foto
                  </Button>
                  {imageBase64 && (
                    <Button
                      type="button"
                      onClick={handleRemoveImage}
                      variant="ghost"
                      className="text-xs text-red-400 hover:text-red-300"
                    >
                      Eliminar
                    </Button>
                  )}
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm text-neutral-400">
                Nombre completo
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={!isEditing}
                className="bg-neutral-800/50 border-neutral-700 text-white disabled:opacity-50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm text-neutral-400">
                Email
              </Label>
              <Input
                id="email"
                value={email}
                disabled
                className="bg-neutral-800/50 border-neutral-700 text-neutral-400 cursor-not-allowed"
              />
              <p className="text-xs text-neutral-500">El email no se puede modificar</p>
            </div>
          </div>

          {isEditing && (
            <div className="flex gap-2 pt-2">
              <Button
                onClick={handleSaveProfile}
                disabled={isSaving}
                className="flex-1 bg-neutral-100 text-black hover:bg-neutral-200"
              >
                {isSaving ? "Guardando..." : "Guardar cambios"}
              </Button>
              <Button
                onClick={() => {
                  setIsEditing(false);
                  setName(session.user.name || "");
                }}
                variant="outline"
                className="flex-1 border-neutral-700 text-neutral-400 hover:text-white"
              >
                Cancelar
              </Button>
            </div>
          )}
        </div>

        {/* Sección de cambio de contraseña */}
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white">Cambiar Contraseña</h2>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword" className="text-sm text-neutral-400">
                Contraseña actual
              </Label>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="bg-neutral-800/50 border-neutral-700 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword" className="text-sm text-neutral-400">
                Nueva contraseña
              </Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="bg-neutral-800/50 border-neutral-700 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm text-neutral-400">
                Confirmar nueva contraseña
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="bg-neutral-800/50 border-neutral-700 text-white"
              />
            </div>
          </div>

          <Button
            onClick={handleChangePassword}
            disabled={isChangingPassword || !currentPassword || !newPassword || !confirmPassword}
            className="w-full bg-neutral-100 text-black hover:bg-neutral-200 disabled:opacity-50"
          >
            {isChangingPassword ? "Cambiando..." : "Cambiar contraseña"}
          </Button>
        </div>

        {/* Información de la cuenta */}
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white">Información de la Cuenta</h2>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-neutral-400">ID de usuario</span>
              <span className="text-neutral-300 font-mono text-xs">{session.user.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400">Fecha de registro</span>
              <span className="text-neutral-300">
                {new Date(session.user.createdAt).toLocaleDateString("es-AR")}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
