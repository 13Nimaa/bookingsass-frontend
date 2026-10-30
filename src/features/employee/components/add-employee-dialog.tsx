"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Phone, UserPlus } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthError } from "@/components/shared/auth-error";
import { useEmployeeStore } from "@/features/employee/store/employee-store";
import { employeeSchema, normalizePhone, toAddEmployeeInput, type EmployeeFormData } from "@/features/employee/schemas/employee.schema";

interface AddEmployeeDialogProps { open: boolean; onOpenChange: (open: boolean) => void; businessId: number; }

function formatPhone(value: string) {
  const digits = normalizePhone(value).slice(0, 11);
  return digits.replace(/(\d{4})(\d{0,3})(\d{0,4})/, (_match, first, second, third) => [first, second, third].filter(Boolean).join(" "));
}

export function AddEmployeeDialog({ open, onOpenChange, businessId }: AddEmployeeDialogProps) {
  const addEmployee = useEmployeeStore((s) => s.addEmployee);
  const saving = useEmployeeStore((s) => s.saving);
  const error = useEmployeeStore((s) => s.error);
  const clearError = useEmployeeStore((s) => s.clearError);
  const { register, handleSubmit, reset, setValue, formState: { errors, isValid } } = useForm<EmployeeFormData>({ resolver: zodResolver(employeeSchema), defaultValues: { phoneNumber: "" }, mode: "onChange" });

  useEffect(() => { if (!open) { reset(); clearError(); } }, [open, reset, clearError]);
  const onSubmit = async (data: EmployeeFormData) => { const ok = await addEmployee(businessId, toAddEmployeeInput(data)); if (ok) { reset(); clearError(); onOpenChange(false); } };
  const phoneField = register("phoneNumber", { onChange: (event) => setValue("phoneNumber", formatPhone(event.target.value), { shouldValidate: true }) });

  return <Dialog open={open} onOpenChange={(next) => { if (!next) clearError(); onOpenChange(next); }}>
    <DialogContent>
      <DialogHeader><DialogTitle>افزودن کارمند</DialogTitle><DialogDescription>شمارهٔ موبایل فردی را وارد کنید که پیش‌تر در BookFlow حساب دارد.</DialogDescription></DialogHeader>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-5 flex flex-col gap-4">
        {error && <AuthError message={error} />}
        <Input id="employee-phone" label="شمارهٔ موبایل" type="tel" inputMode="tel" dir="ltr" autoFocus autoComplete="tel" placeholder="0912 345 6789" startIcon={<Phone className="h-4 w-4" />} error={errors.phoneNumber?.message} hint="شماره را با ۰۹ وارد کنید." className="text-right" {...phoneField} />
        <DialogFooter>
          <Button type="button" variant="ghost" size="lg" className="h-11 px-5" onClick={() => onOpenChange(false)} disabled={saving}>انصراف</Button>
          <Button type="submit" size="lg" className="h-11 px-6 text-[15px] font-bold" disabled={saving || !isValid}>{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}{saving ? "در حال افزودن…" : "افزودن کارمند"}</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>;
}
