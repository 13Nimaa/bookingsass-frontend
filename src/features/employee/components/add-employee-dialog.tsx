"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Phone, UserPlus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthError } from "@/components/shared/auth-error";
import { useEmployeeStore } from "@/features/employee/store/employee-store";
import {
  employeeSchema,
  toAddEmployeeInput,
  type EmployeeFormData,
} from "@/features/employee/schemas/employee.schema";

interface AddEmployeeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  businessId: number;
}

export function AddEmployeeDialog({
  open,
  onOpenChange,
  businessId,
}: AddEmployeeDialogProps) {
  const addEmployee = useEmployeeStore((s) => s.addEmployee);
  const saving = useEmployeeStore((s) => s.saving);
  const error = useEmployeeStore((s) => s.error);
  const clearError = useEmployeeStore((s) => s.clearError);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
    defaultValues: { phoneNumber: "" },
  });

  useEffect(() => {
    if (!open) {
      reset();
      clearError();
    }
  }, [open, reset, clearError]);

  const onSubmit = async (data: EmployeeFormData) => {
    const ok = await addEmployee(businessId, toAddEmployeeInput(data));
    if (ok) {
      reset();
      clearError();
      onOpenChange(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) clearError();
        onOpenChange(next);
      }}
    >
      <DialogContent showClose={false}>
        <DialogHeader>
          <DialogTitle>افزودن کارمند</DialogTitle>
          <DialogDescription>
            شمارهٔ موبایل کارمند را وارد کنید. او باید از قبل در BookFlow حساب
            کاربری داشته باشد.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-5 flex flex-col gap-4">
          {error && <AuthError message={error} />}

          <Input
            id="employee-phone"
            label="شمارهٔ موبایل"
            type="tel"
            inputMode="tel"
            dir="ltr"
            autoComplete="tel"
            placeholder="0912 345 6789"
            startIcon={<Phone className="h-4 w-4" aria-hidden="true" />}
            error={errors.phoneNumber?.message}
            hint="کارمند باید با همین شماره در سامانه ثبت‌نام کرده باشد."
            {...register("phoneNumber")}
          />

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              size="lg"
              className="h-11 px-5"
              onClick={() => onOpenChange(false)}
            >
              انصراف
            </Button>
            <Button
              type="submit"
              size="lg"
              className="h-11 px-6 text-[15px] font-bold"
              disabled={saving}
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <UserPlus className="h-4 w-4" aria-hidden="true" />
              )}
              {saving ? "در حال افزودن..." : "افزودن کارمند"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
