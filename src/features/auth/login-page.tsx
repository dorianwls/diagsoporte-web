import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useNavigate } from "@tanstack/react-router"
import {
  ArrowRight,
  BookOpenCheck,
  Eye,
  EyeOff,
  FileSearch,
  KeyRound,
  LoaderCircle,
  LockKeyhole,
  ShieldAlert,
  ShieldCheck,
  UserRound,
} from "lucide-react"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"

import { AppLogo } from "@/components/shared/app-logo"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  demoCredentials,
  InvalidCredentialsError,
  signIn,
} from "@/features/auth/auth-service"
import { loginSchema, type LoginFormValues } from "@/features/auth/login-schema"

export function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
    mode: "onTouched",
  })

  async function onSubmit(values: LoginFormValues) {
    try {
      const session = await signIn(values)

      toast.success(`Bienvenido, ${session.fullName}`, {
        description: "La sesión de demostración se inició correctamente.",
      })
      await navigate({ to: "/dashboard" })
    } catch (error) {
      const message =
        error instanceof InvalidCredentialsError
          ? error.message
          : "No fue posible iniciar sesión. Intente nuevamente."

      form.setError("root", { message })
    }
  }

  function fillDemoCredentials() {
    form.reset(demoCredentials)
    form.clearErrors()
  }

  return (
    <main className="grid min-h-svh lg:grid-cols-[minmax(0,1.1fr)_minmax(28rem,0.9fr)]">
      <section className="relative hidden overflow-hidden bg-sidebar p-12 text-sidebar-foreground lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 opacity-40 [background-image:radial-gradient(circle_at_20%_20%,oklch(0.72_0.115_187/.32),transparent_28%),radial-gradient(circle_at_80%_80%,oklch(0.55_0.12_242/.28),transparent_35%)]" />
        <AppLogo inverse className="relative" />
        <div className="relative max-w-xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sidebar-primary">
            Repositorio técnico
          </p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-tight text-white xl:text-5xl">
            La memoria técnica de cada equipo, siempre disponible.
          </h1>
          <p className="mt-5 max-w-lg text-base leading-7 text-sidebar-foreground/70">
            Registra, consulta e imprime los diagnósticos realizados sobre los equipos
            tecnológicos de la universidad.
          </p>
          <div className="mt-8 flex gap-6 text-sm text-sidebar-foreground/65">
            <span className="flex items-center gap-2">
              <BookOpenCheck className="size-4 text-sidebar-primary" />
              Historial confiable
            </span>
            <span className="flex items-center gap-2">
              <FileSearch className="size-4 text-sidebar-primary" />
              Consulta rápida
            </span>
          </div>
        </div>
        <p className="relative text-xs text-sidebar-foreground/45">
          Universidad Nacional de Ingeniería · 2026
        </p>
      </section>

      <section className="flex items-center justify-center p-5 sm:p-8">
        <Card className="w-full max-w-md gap-7 border-0 py-8 shadow-[0_20px_60px_-24px_rgb(15_23_42/0.25)] ring-1 ring-border">
          <CardContent className="px-7 sm:px-9">
            <AppLogo className="mb-9 lg:hidden" />
            <div className="grid size-12 place-items-center rounded-2xl bg-primary/8 text-primary">
              <ShieldCheck className="size-5" />
            </div>
            <h2 className="mt-5 text-2xl font-semibold tracking-tight">Acceso al sistema</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Ingrese con su cuenta institucional autorizada.
            </p>

            <form className="mt-7" onSubmit={form.handleSubmit(onSubmit)} noValidate>
              <FieldGroup>
                <Controller
                  name="username"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>Nombre de usuario</FieldLabel>
                      <div className="relative">
                        <UserRound className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          {...field}
                          id={field.name}
                          autoFocus
                          autoComplete="username"
                          placeholder="Ej. dorian"
                          className="h-10 pl-9"
                          aria-invalid={fieldState.invalid}
                          onChange={(event) => {
                            field.onChange(event)
                            form.clearErrors("root")
                          }}
                        />
                      </div>
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />

                <Controller
                  name="password"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>Contraseña</FieldLabel>
                      <div className="relative">
                        <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          {...field}
                          id={field.name}
                          type={showPassword ? "text" : "password"}
                          autoComplete="current-password"
                          placeholder="Ingrese su contraseña"
                          className="h-10 px-9"
                          aria-invalid={fieldState.invalid}
                          onChange={(event) => {
                            field.onChange(event)
                            form.clearErrors("root")
                          }}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          className="absolute right-1.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                          onClick={() => setShowPassword((visible) => !visible)}
                          aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                        >
                          {showPassword ? <EyeOff /> : <Eye />}
                        </Button>
                      </div>
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />

                {form.formState.errors.root?.message && (
                  <div
                    role="alert"
                    className="flex items-start gap-2.5 rounded-xl border border-destructive/20 bg-destructive/6 p-3 text-sm text-destructive"
                  >
                    <ShieldAlert className="mt-0.5 size-4 shrink-0" />
                    <p>{form.formState.errors.root.message}</p>
                  </div>
                )}

                <Button
                  type="submit"
                  size="lg"
                  className="mt-1 w-full"
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting ? (
                    <>
                      <LoaderCircle className="animate-spin" data-icon="inline-start" />
                      Verificando acceso...
                    </>
                  ) : (
                    <>
                      Iniciar sesión
                      <ArrowRight data-icon="inline-end" />
                    </>
                  )}
                </Button>
              </FieldGroup>
            </form>

            <div className="mt-6 rounded-xl border bg-muted/45 p-4">
              <div className="flex items-start gap-3">
                <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-card text-primary ring-1 ring-border">
                  <KeyRound className="size-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-foreground">Acceso de demostración</p>
                  <p className="mt-1 font-mono text-xs text-muted-foreground">
                    dorian · soporte123
                  </p>
                  <button
                    type="button"
                    onClick={fillDemoCredentials}
                    className="mt-2 text-xs font-medium text-primary underline-offset-4 hover:underline"
                  >
                    Completar credenciales
                  </button>
                </div>
              </div>
            </div>

            <p className="mt-6 text-center text-xs text-muted-foreground">
              ¿Problemas para acceder? Contacte al administrador del sistema.
            </p>
          </CardContent>
        </Card>
      </section>
    </main>
  )
}
