"use client";

import { create } from "zustand";
import {
  listEmployeesRequest,
  createEmployeeRequest,
  deleteEmployeeRequest,
  listWorkingHoursRequest,
  createWorkingHourRequest,
  deleteWorkingHourRequest,
  listEmployeeServicesRequest,
  assignEmployeeServiceRequest,
  updateEmployeeServiceRequest,
  removeEmployeeServiceRequest,
} from "@/lib/api/endpoints/employee.endpoints";
import { compareWorkingHours } from "@/features/employee/lib/schedule";
import type {
  AssignServiceInput,
  AssignServiceFailure,
  AssignServicesResult,
  CreateEmployeeInput,
  EmployeeDto,
  EmployeeServiceDto,
  UpdateEmployeeServiceInput,
  WorkingHourDto,
  WorkingHourInput,
} from "@/features/employee/types";

export type EmployeeStatus = "idle" | "loading" | "loaded" | "error";

/** Assigned services are cached per employee so switching employees can
 * never render another employee's list or loading/error state. */
export interface EmployeeServicesEntry {
  items: EmployeeServiceDto[];
  status: EmployeeStatus;
  error: string | null;
}

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

  servicesByEmployee: Record<number, EmployeeServicesEntry>;
  loadEmployeeServices: (
    employeeId: number,
    options?: { force?: boolean }
  ) => Promise<void>;
  /** True while one or more assignment requests are in flight. */
  assigningServices: boolean;
  assignServices: (
    employeeId: number,
    inputs: AssignServiceInput[]
  ) => Promise<AssignServicesResult | null>;
  /** True while an employee-service override update is in flight. */
  updatingService: boolean;
  /**
   * Updates overrides for one assigned service. Returns `{ ok: true }` on
   * success, `{ ok: false, message }` on failure, and `null` when a
   * duplicate submission is ignored. Failures never mutate the cache.
   */
  updateEmployeeService: (
    employeeId: number,
    serviceId: number,
    input: UpdateEmployeeServiceInput
  ) => Promise<{ ok: true } | { ok: false; message: string } | null>;
  /** Service id currently being unassigned, or null when idle. */
  removingServiceId: number | null;
  /**
   * Unassigns one service from an employee. Returns `{ ok: true }` on
   * success (cache filtered for that employee only), `{ ok: false, message }`
   * on failure without mutating the list, and `null` when ignored as a
   * duplicate in-flight delete.
   */
  removeEmployeeService: (
    employeeId: number,
    serviceId: number
  ) => Promise<{ ok: true } | { ok: false; message: string } | null>;

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
  servicesFailed: "دریافت خدمات این کارمند ممکن نشد.",
  servicesForbidden: "شما به خدمات این کارمند دسترسی ندارید.",
  employeeNotFound: "کارمند یافت نشد.",
  assignFailed: "اختصاص خدمت انجام نشد.",
  assignNotFound: "کارمند یا خدمت مورد نظر یافت نشد.",
  alreadyAssigned: "این خدمت قبلاً به این کارمند اختصاص داده شده است.",
  updateFailed: "به‌روزرسانی تنظیمات خدمت انجام نشد.",
  updateNotFound: "کارمند یا خدمت مورد نظر یافت نشد.",
  unassignFailed: "حذف خدمت از کارمند انجام نشد.",
  unassignNotFound: "کارمند یا خدمت مورد نظر یافت نشد.",
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

async function readAssignmentError(
  res: Response,
  fallback = FA_MESSAGES.assignFailed
): Promise<string> {
  if (res.status === 403) return FA_MESSAGES.servicesForbidden;
  if (res.status === 404) return FA_MESSAGES.assignNotFound;
  if (res.status === 409) return FA_MESSAGES.alreadyAssigned;
  return readError(res, fallback);
}

async function readUpdateError(
  res: Response,
  fallback = FA_MESSAGES.updateFailed
): Promise<string> {
  if (res.status === 403) return FA_MESSAGES.servicesForbidden;
  if (res.status === 404) return FA_MESSAGES.updateNotFound;
  return readError(res, fallback);
}

async function readUnassignError(
  res: Response,
  fallback = FA_MESSAGES.unassignFailed
): Promise<string> {
  if (res.status === 403) return FA_MESSAGES.servicesForbidden;
  if (res.status === 404) return FA_MESSAGES.unassignNotFound;
  return readError(res, fallback);
}

// Deduplicates concurrent loads for the same employee (e.g. StrictMode
// re-runs or a fast close/reopen) without blocking a different employee.
const inFlightServices = new Map<number, Promise<void>>();

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
  servicesByEmployee: {} as Record<number, EmployeeServicesEntry>,
  assigningServices: false,
  updatingService: false,
  removingServiceId: null as number | null,
};

export const useEmployeeStore = create<EmployeeState>((set, get) => ({
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

  loadEmployeeServices: (employeeId, options) => {
    const cached = get().servicesByEmployee[employeeId];
    // A successful list is reused until a mutation or an explicit retry
    // invalidates it; this avoids duplicate requests on re-open.
    if (!options?.force && cached?.status === "loaded") return Promise.resolve();

    const pending = inFlightServices.get(employeeId);
    if (pending) return pending;

    const request = (async () => {
      set((state) => {
        const previous = state.servicesByEmployee[employeeId];
        return {
          servicesByEmployee: {
            ...state.servicesByEmployee,
            [employeeId]: {
              items: previous?.items ?? [],
              // Keep cached cards visible while an explicit retry refreshes.
              status: previous?.items.length ? "loaded" : "loading",
              error: null,
            },
          },
        };
      });

      try {
        const res = await listEmployeeServicesRequest(employeeId);
        if (!res.ok) {
          const message =
            res.status === 404
              ? FA_MESSAGES.employeeNotFound
              : res.status === 403
                ? FA_MESSAGES.servicesForbidden
                : await readError(res, FA_MESSAGES.servicesFailed);
          set((state) => ({
            servicesByEmployee: {
              ...state.servicesByEmployee,
              [employeeId]: {
                items: state.servicesByEmployee[employeeId]?.items ?? [],
                status: "error",
                error: message,
              },
            },
          }));
          return;
        }
        const data = (await res.json()) as EmployeeServiceDto[];
        set((state) => ({
          servicesByEmployee: {
            ...state.servicesByEmployee,
            [employeeId]: {
              items: Array.isArray(data) ? data : [],
              status: "loaded",
              error: null,
            },
          },
        }));
      } catch {
        set((state) => ({
          servicesByEmployee: {
            ...state.servicesByEmployee,
            [employeeId]: {
              items: state.servicesByEmployee[employeeId]?.items ?? [],
              status: "error",
              error: FA_MESSAGES.network,
            },
          },
        }));
      }
    })();

    inFlightServices.set(employeeId, request);
    void request.finally(() => {
      if (inFlightServices.get(employeeId) === request)
        inFlightServices.delete(employeeId);
    });
    return request;
  },

  assignServices: async (employeeId, inputs) => {
    // Store-level guard: a double click (or any concurrent caller) must not
    // start a second round of assignments while requests are in flight.
    if (get().assigningServices) return null;
    if (inputs.length === 0) return { assigned: 0, failed: [] };

    set({ assigningServices: true });
    try {
      // One request per selected service, per the backend contract.
      const outcomes = await Promise.all(
        inputs.map(async (input) => {
          try {
            const res = await assignEmployeeServiceRequest(employeeId, input);
            if (!res.ok) {
              return {
                serviceId: input.serviceId,
                status: res.status as number | null,
                message: await readAssignmentError(res),
              };
            }
            return {
              serviceId: input.serviceId,
              status: res.status as number | null,
              message: null,
            };
          } catch {
            return {
              serviceId: input.serviceId,
              status: null,
              message: FA_MESSAGES.network,
            };
          }
        })
      );

      const failed: AssignServiceFailure[] = [];
      for (const outcome of outcomes) {
        if (outcome.message !== null) {
          failed.push({
            serviceId: outcome.serviceId,
            message: outcome.message,
            status: outcome.status,
          });
        }
      }
      const assigned = outcomes.length - failed.length;

      // Refresh only the selected employee's cache. A 409 means the cached
      // list is stale even if every request in this batch failed.
      if (assigned > 0 || failed.some((item) => item.status === 409)) {
        // Let an already-running list request settle first; otherwise its
        // older response could land after the refresh and restore stale data.
        const pending = inFlightServices.get(employeeId);
        if (pending) {
          await pending;
          if (inFlightServices.get(employeeId) === pending)
            inFlightServices.delete(employeeId);
        }
        await get().loadEmployeeServices(employeeId, { force: true });
      }

      return { assigned, failed };
    } finally {
      set({ assigningServices: false });
    }
  },

  updateEmployeeService: async (employeeId, serviceId, input) => {
    if (get().updatingService) return null;

    // No intentional changes — treat as a successful no-op so the dialog
    // can close without touching the cache or hitting the network.
    if (
      !("priceOverride" in input) &&
      !("durationMinutesOverride" in input)
    ) {
      return { ok: true };
    }

    set({ updatingService: true });
    try {
      const res = await updateEmployeeServiceRequest(
        employeeId,
        serviceId,
        input
      );
      if (!res.ok) {
        return { ok: false, message: await readUpdateError(res) };
      }

      // Refresh only this employee's list so the drawer shows the new
      // effective values and override chips without touching other caches.
      const pending = inFlightServices.get(employeeId);
      if (pending) {
        await pending;
        if (inFlightServices.get(employeeId) === pending)
          inFlightServices.delete(employeeId);
      }
      await get().loadEmployeeServices(employeeId, { force: true });
      return { ok: true };
    } catch {
      return { ok: false, message: FA_MESSAGES.network };
    } finally {
      set({ updatingService: false });
    }
  },

  removeEmployeeService: async (employeeId, serviceId) => {
    // Store-level guard: never start a second unassign while one is in flight.
    if (get().removingServiceId !== null) return null;

    set({ removingServiceId: serviceId });
    try {
      // Let any in-flight list settle first so an older GET cannot restore
      // the deleted assignment after we filter the cache.
      const pending = inFlightServices.get(employeeId);
      if (pending) {
        await pending;
        if (inFlightServices.get(employeeId) === pending)
          inFlightServices.delete(employeeId);
      }

      const res = await removeEmployeeServiceRequest(employeeId, serviceId);
      if (!res.ok) {
        return { ok: false, message: await readUnassignError(res) };
      }

      set((state) => {
        const previous = state.servicesByEmployee[employeeId];
        if (!previous) return state;
        return {
          servicesByEmployee: {
            ...state.servicesByEmployee,
            [employeeId]: {
              ...previous,
              items: previous.items.filter((item) => item.id !== serviceId),
              status: "loaded",
              error: null,
            },
          },
        };
      });
      return { ok: true };
    } catch {
      return { ok: false, message: FA_MESSAGES.network };
    } finally {
      set({ removingServiceId: null });
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
