"use client";

import { create } from "zustand";
import {
  listEmployeesRequest,
  createEmployeeRequest,
  deleteEmployeeRequest,
  listWorkingHoursRequest,
  createWorkingHourRequest,
  deleteWorkingHourRequest,
} from "@/lib/api/endpoints/employee.endpoints";
import { compareWorkingHours } from "@/features/employee/lib/schedule";
import type {
  CreateEmployeeInput,
  EmployeeDto,
  WorkingHourDto,
  WorkingHourInput,
} from "@/features/employee/types";

export type EmployeeStatus = "idle" | "loading" | "loaded" | "error";

interface EmployeeState {
  employees: EmployeeDto[];
  status: EmployeeStatus;
  error: string | null;
  saving: boolean;
  removingId: number | null;
  notice: string | null;

  workingHoursByEmployee: Record<number, WorkingHourDto[]>;
  scheduleStatus: EmployeeStatus;
  scheduleError: string | null;
  scheduleSaving: boolean;

  fetchEmployees: (businessId: number) => Promise<void>;
  addEmployee: (businessId: number, input: CreateEmployeeInput) => Promise<boolean>;
  removeEmployee: (businessId: number, employeeId: number) => Promise<boolean>;

  loadSchedule: (businessId: number, employeeId: number) => Promise<void>;
  addWorkingHour: (
    businessId: number,
    employeeId: number,
    input: WorkingHourInput
  ) => Promise<boolean>;
  removeWorkingHour: (
    businessId: number,
    employeeId: number,
    id: number
  ) => Promise<boolean>;

  clearError: () => void;
  clearNotice: () => void;
  reset: () => void;
}

const FA_MESSAGES = {
  listFailed: "دریافت فهرست کارمندان ممکن نشد.",
  addFailed: "افزودن کارمند انجام نشد.",
  userNotFound: "کاربری با این شمارهٔ موبایل ثبت‌نام نکرده است.",
  notEligible:
    "این کاربر را نمی‌توان به‌عنوان کارمند افزود. تنها کاربران با نقش مشتری قابل افزودن هستند و هر کاربر فقط یک‌بار.",
  added: "کارمند جدید با موفقیت افزود شد.",
  deleteFailed: "حذف کارمند انجام نشد.",
  removed: "کارمند از مجموعه حذف شد.",
  scheduleFailed: "دریافت برنامهٔ کاری ممکن نشد.",
  scheduleSaveFailed: "ثبت ساعت کاری انجام نشد.",
  scheduleSaved: "ساعت کاری ثبت شد.",
  scheduleRemoved: "ساعت کاری حذف شد.",
  network: "اتصال به سرور ممکن نیست. لطفاً دوباره تلاش کنید.",
} as const;

async function readError(res: Response, fallback: string): Promise<string> {
  try {
    const text = (await res.text()).trim().replace(/^"|"$/g, "");
    // Prefer the backend's own message when short and readable.
    if (text && text.length < 200) return text;
  } catch {
    // fall through
  }
  if (typeof navigator !== "undefined" && !navigator.onLine)
    return FA_MESSAGES.network;
  return fallback;
}

const initial = {
  employees: [] as EmployeeDto[],
  status: "idle" as EmployeeStatus,
  error: null as string | null,
  saving: false,
  removingId: null as number | null,
  notice: null as string | null,
  workingHoursByEmployee: {} as Record<number, WorkingHourDto[]>,
  scheduleStatus: "idle" as EmployeeStatus,
  scheduleError: null as string | null,
  scheduleSaving: false,
};

export const useEmployeeStore = create<EmployeeState>((set) => ({
  ...initial,

  clearError: () => set({ error: null }),
  clearNotice: () => set({ notice: null }),
  reset: () => set({ ...initial }),

  fetchEmployees: async (businessId) => {
    set({ status: "loading", error: null });
    try {
      const res = await listEmployeesRequest(businessId);
      if (!res.ok) {
        set({
          status: "error",
          error: await readError(res, FA_MESSAGES.listFailed),
        });
        return;
      }
      const data = (await res.json()) as EmployeeDto[];
      set({
        employees: Array.isArray(data) ? data : [],
        status: "loaded",
      });
    } catch {
      set({ status: "error", error: FA_MESSAGES.network });
    }
  },

  addEmployee: async (businessId, input) => {
    set({ saving: true, error: null, notice: null });
    try {
      const res = await createEmployeeRequest(businessId, input);
      if (!res.ok) {
        const message =
          res.status === 404
            ? FA_MESSAGES.userNotFound
            : res.status === 409
              ? FA_MESSAGES.notEligible
              : await readError(res, FA_MESSAGES.addFailed);
        set({ error: message });
        return false;
      }
      const employee = (await res.json()) as EmployeeDto;
      set((s) => ({ employees: [employee, ...s.employees] }));
      set({ notice: FA_MESSAGES.added });
      return true;
    } catch {
      set({ error: FA_MESSAGES.network });
      return false;
    } finally {
      set({ saving: false });
    }
  },

  removeEmployee: async (businessId, employeeId) => {
    set({ removingId: employeeId, error: null, notice: null });
    try {
      const res = await deleteEmployeeRequest(businessId, employeeId);
      if (!res.ok) {
        set({ error: await readError(res, FA_MESSAGES.deleteFailed) });
        return false;
      }
      set((s) => {
        const nextHours = { ...s.workingHoursByEmployee };
        delete nextHours[employeeId];
        return {
          employees: s.employees.filter((e) => e.id !== employeeId),
          workingHoursByEmployee: nextHours,
          notice: FA_MESSAGES.removed,
        };
      });
      return true;
    } catch {
      set({ error: FA_MESSAGES.network });
      return false;
    } finally {
      set({ removingId: null });
    }
  },

  loadSchedule: async (businessId, employeeId) => {
    set({ scheduleStatus: "loading", scheduleError: null });
    try {
      const res = await listWorkingHoursRequest(businessId, employeeId);
      if (!res.ok) {
        set({
          scheduleStatus: "error",
          scheduleError: await readError(res, FA_MESSAGES.scheduleFailed),
        });
        return;
      }
      const data = (await res.json()) as WorkingHourDto[];
      const list = Array.isArray(data) ? data : [];
      list.sort(compareWorkingHours);
      set((s) => ({
        workingHoursByEmployee: { ...s.workingHoursByEmployee, [employeeId]: list },
        scheduleStatus: "loaded",
      }));
    } catch {
      set({ scheduleStatus: "error", scheduleError: FA_MESSAGES.network });
    }
  },

  addWorkingHour: async (businessId, employeeId, input) => {
    set({ scheduleSaving: true, scheduleError: null });
    try {
      const res = await createWorkingHourRequest(businessId, employeeId, input);
      if (!res.ok) {
        set({
          scheduleError: await readError(res, FA_MESSAGES.scheduleSaveFailed),
        });
        return false;
      }
      const body = (await res.json()) as { data?: WorkingHourDto } | WorkingHourDto;
      const created = "data" in body && body.data ? body.data : (body as WorkingHourDto);
      set((s) => {
        const list = [...(s.workingHoursByEmployee[employeeId] ?? []), created];
        list.sort(compareWorkingHours);
        return {
          workingHoursByEmployee: { ...s.workingHoursByEmployee, [employeeId]: list },
        };
      });
      return true;
    } catch {
      set({ scheduleError: FA_MESSAGES.network });
      return false;
    } finally {
      set({ scheduleSaving: false });
    }
  },

  removeWorkingHour: async (businessId, employeeId, id) => {
    set({ scheduleSaving: true, scheduleError: null });
    try {
      const res = await deleteWorkingHourRequest(businessId, employeeId, id);
      if (!res.ok) {
        set({
          scheduleError: await readError(res, FA_MESSAGES.scheduleSaveFailed),
        });
        return false;
      }
      set((s) => ({
        workingHoursByEmployee: {
          ...s.workingHoursByEmployee,
          [employeeId]: (s.workingHoursByEmployee[employeeId] ?? []).filter(
            (w) => w.id !== id
          ),
        },
      }));
      return true;
    } catch {
      set({ scheduleError: FA_MESSAGES.network });
      return false;
    } finally {
      set({ scheduleSaving: false });
    }
  },
}));
