import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { LoaderCircle, Plus, Search, UserRoundCog } from "lucide-react"
import { Controller, useForm } from "react-hook-form"
import { useTable } from "@tanstack/react-table"
import { toast } from "sonner"

import { PageErrorState } from "@/components/shared/async-state"
import { DataTable } from "@/components/shared/data-table"
import { DataTablePagination } from "@/components/shared/data-table-pagination"
import { PageHeader } from "@/components/shared/page-header"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle,
} from "@/components/ui/sheet"
import { listAllEmployees } from "@/features/employees/employee-repository"
import { createUserColumns, userTableFeatures } from "@/features/users/user-columns"
import { userFormSchema, type UserFormValues } from "@/features/users/user-schema"
import { createUser, listUsers, setUserActive, updateUser, updateUserRole } from "@/features/users/user-service"
import { useApiQuery } from "@/hooks/use-api-query"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { ApiError, getErrorMessage } from "@/lib/api-client"
import type { User } from "@/types/domain"

const defaultValues: UserFormValues = {
  employeeId: "",
  userName: "",
  email: "",
  password: "",
  role: "TECHNICIAN",
}

export function UsersPage() {
  const [search, setSearch] = useState("")
  const [pageIndex, setPageIndex] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [pendingUser, setPendingUser] = useState<User | null>(null)
  const debouncedSearch = useDebouncedValue(search)
  const query = useApiQuery(`users:${debouncedSearch}:${pageIndex}:${pageSize}`, async (signal) => {
    const [result, employees] = await Promise.all([
      listUsers(debouncedSearch, pageIndex + 1, pageSize, signal),
      listAllEmployees(true, signal),
    ])
    return { result, availableEmployees: employees.filter((employee) => !employee.hasUserAccount) }
  })
  const result = query.data?.result
  const form = useForm<UserFormValues>({ resolver: zodResolver(userFormSchema), defaultValues, mode: "onTouched" })
  const columns = createUserColumns({ onEdit: openEdit, onStatusRequest: setPendingUser })
  const table = useTable({
    features: userTableFeatures,
    columns,
    data: result?.items ?? [],
    manualPagination: true,
    rowCount: result?.totalItems ?? 0,
  })

  function openCreate() {
    setEditingUser(null)
    form.reset(defaultValues)
    setSheetOpen(true)
  }

  function openEdit(user: User) {
    setEditingUser(user)
    form.reset({
      employeeId: user.employeeId,
      userName: user.userName,
      email: user.email,
      password: "",
      role: user.role,
    })
    setSheetOpen(true)
  }

  async function submit(values: UserFormValues) {
    if (!editingUser && !values.password) {
      form.setError("password", { message: "La contraseña es obligatoria" }, { shouldFocus: true })
      return
    }

    try {
      if (editingUser) {
        await updateUser(editingUser.id, { userName: values.userName, email: values.email })
        if (values.role !== editingUser.role) await updateUserRole(editingUser.id, values.role)
        toast.success("Usuario actualizado correctamente")
      } else {
        await createUser({ ...values, password: values.password })
        toast.success("Usuario creado correctamente")
      }
      setSheetOpen(false)
      query.reload()
    } catch (error) {
      if (error instanceof ApiError) {
        const firstField = Object.keys(error.validationErrors)[0] as keyof UserFormValues | undefined
        if (firstField && firstField in form.getValues()) {
          form.setError(firstField, { message: error.validationErrors[firstField]?.[0] })
          return
        }
      }
      form.setError("root", { message: getErrorMessage(error, "No fue posible guardar el usuario.") })
    }
  }

  async function changeStatus() {
    if (!pendingUser) return
    try {
      await setUserActive(pendingUser.id, !pendingUser.isActive)
      toast.success(pendingUser.isActive ? "Usuario desactivado" : "Usuario reactivado")
      query.reload()
    } catch (error) {
      toast.error(getErrorMessage(error, "No fue posible actualizar el usuario"))
    } finally {
      setPendingUser(null)
    }
  }

  const totalItems = result?.totalItems ?? 0

  return (
    <div className="space-y-7">
      <PageHeader eyebrow="Administración" title="Usuarios del sistema" description="Gestiona las cuentas autorizadas y sus roles de Administrador o Técnico." actions={<Button onClick={openCreate} size="lg"><Plus />Crear usuario</Button>} />

      {query.error ? <PageErrorState error={query.error} onRetry={query.reload} /> : (
        <Card className="gap-0 overflow-hidden py-0 shadow-sm">
          <div className="border-b p-4"><div className="relative max-w-xl"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input value={search} onChange={(event) => { setSearch(event.target.value); setPageIndex(0) }} placeholder="Buscar por empleado, usuario o correo..." className="h-10 pl-9" /></div></div>
          <CardContent className="p-0"><DataTable table={table} columnCount={columns.length} isLoading={query.isLoading} emptyState={<div className="mx-auto flex max-w-sm flex-col items-center"><UserRoundCog className="size-8 text-muted-foreground" /><h2 className="mt-4 font-semibold">No encontramos usuarios</h2><p className="mt-2 text-sm text-muted-foreground">Cree una cuenta o cambie la búsqueda.</p></div>} /></CardContent>
          <DataTablePagination entityLabel="usuarios" firstVisibleRow={totalItems === 0 ? 0 : pageIndex * pageSize + 1} lastVisibleRow={Math.min((pageIndex + 1) * pageSize, totalItems)} rowCount={totalItems} pageIndex={pageIndex} pageSize={pageSize} pageCount={result?.totalPages ?? 0} pageSizeOptions={[10, 20, 50, 100]} canPreviousPage={pageIndex > 0} canNextPage={pageIndex + 1 < (result?.totalPages ?? 0)} onPageSizeChange={(value) => { setPageSize(value); setPageIndex(0) }} onPreviousPage={() => setPageIndex((value) => Math.max(0, value - 1))} onNextPage={() => setPageIndex((value) => value + 1)} />
        </Card>
      )}

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          <SheetHeader className="border-b p-6"><SheetTitle>{editingUser ? "Editar usuario" : "Crear usuario"}</SheetTitle><SheetDescription>La cuenta se vincula con un empleado institucional.</SheetDescription></SheetHeader>
          <form id="user-form" className="p-6" onSubmit={form.handleSubmit(submit)} noValidate>
            <FieldGroup>
              <Controller name="employeeId" control={form.control} render={({ field, fieldState }) => <Field data-invalid={fieldState.invalid}><FieldLabel>Empleado</FieldLabel><Select value={field.value} onValueChange={field.onChange} disabled={Boolean(editingUser)}><SelectTrigger className="w-full"><SelectValue placeholder="Seleccione un empleado" /></SelectTrigger><SelectContent>{editingUser && <SelectItem value={editingUser.employeeId}>{editingUser.fullName}</SelectItem>}{query.data?.availableEmployees.map((employee) => <SelectItem key={employee.id} value={employee.id}>{employee.fullName} · {employee.employeeNumber}</SelectItem>)}</SelectContent></Select>{fieldState.error && <FieldError errors={[fieldState.error]} />}</Field>} />
              <UserTextField form={form} name="userName" label="Nombre de usuario" />
              <UserTextField form={form} name="email" label="Correo electrónico" type="email" />
              {!editingUser && <UserTextField form={form} name="password" label="Contraseña inicial" type="password" />}
              <Controller name="role" control={form.control} render={({ field, fieldState }) => <Field data-invalid={fieldState.invalid}><FieldLabel>Rol</FieldLabel><Select value={field.value} onValueChange={field.onChange}><SelectTrigger className="w-full"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="TECHNICIAN">Técnico</SelectItem><SelectItem value="ADMINISTRATOR">Administrador</SelectItem></SelectContent></Select>{fieldState.error && <FieldError errors={[fieldState.error]} />}</Field>} />
              {form.formState.errors.root?.message && <div role="alert" className="rounded-xl border border-destructive/20 bg-destructive/6 p-3 text-sm text-destructive">{form.formState.errors.root.message}</div>}
            </FieldGroup>
          </form>
          <SheetFooter className="border-t p-6"><Button variant="outline" onClick={() => setSheetOpen(false)}>Cancelar</Button><Button type="submit" form="user-form" disabled={form.formState.isSubmitting}>{form.formState.isSubmitting && <LoaderCircle className="animate-spin" />}{editingUser ? "Guardar cambios" : "Crear usuario"}</Button></SheetFooter>
        </SheetContent>
      </Sheet>

      <AlertDialog open={Boolean(pendingUser)} onOpenChange={(open) => !open && setPendingUser(null)}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>{pendingUser?.isActive ? "Desactivar usuario" : "Reactivar usuario"}</AlertDialogTitle><AlertDialogDescription>Esta acción cambiará inmediatamente el acceso de {pendingUser?.fullName}.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction variant={pendingUser?.isActive ? "destructive" : "default"} onClick={changeStatus}>{pendingUser?.isActive ? "Desactivar" : "Reactivar"}</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
    </div>
  )
}

function UserTextField({ form, name, label, type = "text" }: { form: ReturnType<typeof useForm<UserFormValues>>; name: "userName" | "email" | "password"; label: string; type?: string }) {
  const error = form.formState.errors[name]
  return <Field data-invalid={Boolean(error)}><FieldLabel htmlFor={name}>{label}</FieldLabel><Input {...form.register(name)} id={name} type={type} aria-invalid={Boolean(error)} />{error && <FieldError errors={[error]} />}</Field>
}
