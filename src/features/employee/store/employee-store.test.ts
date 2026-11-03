import { beforeEach, describe, expect, it, vi } from "vitest";
import type { EmployeeServiceDto } from "@/features/employee/types";

vi.mock("@/lib/api/endpoints/employee.endpoints", () => ({
  listEmployeesRequest: vi.fn(),
  createEmployeeRequest: vi.fn(),
  deleteEmployeeRequest: vi.fn(),
  listWorkingHoursRequest: vi.fn(),
  createWorkingHourRequest: vi.fn(),
  deleteWorkingHourRequest: vi.fn(),
  listEmployeeServicesRequest: vi.fn(),
  assignEmployeeServiceRequest: vi.fn(),
  updateEmployeeServiceRequest: vi.fn(),
  removeEmployeeServiceRequest: vi.fn(),
}));

import {
  assignEmployeeServiceRequest,
  listEmployeeServicesRequest,
  updateEmployeeServiceRequest,
} from "@/lib/api/endpoints/employee.endpoints";
import { useEmployeeStore } from "@/features/employee/store/employee-store";

const assignMock = vi.mocked(assignEmployeeServiceRequest);
const listServicesMock = vi.mocked(listEmployeeServicesRequest);
const updateMock = vi.mocked(updateEmployeeServiceRequest);

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

const assignedService: EmployeeServiceDto = {
  id: 1,
  title: "کوتاهی مو",
  defaultPrice: 150000,
  defaultDurationMinutes: 30,
  priceOverride: null,
  durationMinutesOverride: null,
  effectivePrice: 150000,
  effectiveDurationMinutes: 30,
  businessId: 7,
};

const otherEmployeeService: EmployeeServiceDto = {
  ...assignedService,
  id: 9,
  title: "رنگ مو",
};

const otherEntry = {
  items: [otherEmployeeService],
  status: "loaded" as const,
  error: null,
};

beforeEach(() => {
  useEmployeeStore.getState().reset();
  vi.clearAllMocks();
  vi.stubGlobal("navigator", { onLine: true });
});

describe("useEmployeeStore.assignServices", () => {
  it("assigns a service with defaults, sending no override fields", async () => {
    assignMock.mockResolvedValue(jsonResponse({ id: 1 }, 201));
    listServicesMock.mockResolvedValue(jsonResponse([assignedService]));

    const result = await useEmployeeStore
      .getState()
      .assignServices(1, [{ serviceId: 1 }]);

    expect(assignMock).toHaveBeenCalledWith(1, { serviceId: 1 });
    expect(result).toEqual({ assigned: 1, failed: [] });
    expect(listServicesMock).toHaveBeenCalledWith(1);
    expect(
      useEmployeeStore.getState().servicesByEmployee[1]
    ).toMatchObject({
      status: "loaded",
      items: [assignedService],
      error: null,
    });
  });

  it("forwards independent overrides and refreshes only the selected employee", async () => {
    useEmployeeStore.setState({
      servicesByEmployee: { 2: otherEntry },
    });
    assignMock.mockResolvedValue(jsonResponse({ id: 1 }, 201));
    listServicesMock.mockResolvedValue(
      jsonResponse([
        {
          ...assignedService,
          priceOverride: 120000,
          effectivePrice: 120000,
        },
      ])
    );

    const result = await useEmployeeStore
      .getState()
      .assignServices(1, [{ serviceId: 1, priceOverride: 120000 }]);

    expect(assignMock).toHaveBeenCalledWith(1, {
      serviceId: 1,
      priceOverride: 120000,
    });
    expect(result).toEqual({ assigned: 1, failed: [] });
    expect(
      useEmployeeStore.getState().servicesByEmployee[1]?.items[0]
    ).toMatchObject({ priceOverride: 120000, durationMinutesOverride: null });
    // The other employee's cache is untouched (same object reference).
    expect(useEmployeeStore.getState().servicesByEmployee[2]).toBe(otherEntry);
  });

  it("reports partial failures accurately and refreshes after a conflict", async () => {
    assignMock
      .mockResolvedValueOnce(jsonResponse({ id: 1 }, 201))
      .mockResolvedValueOnce(new Response("conflict", { status: 409 }));
    listServicesMock.mockResolvedValue(jsonResponse([assignedService]));

    const result = await useEmployeeStore.getState().assignServices(1, [
      { serviceId: 1 },
      { serviceId: 2 },
    ]);

    expect(result?.assigned).toBe(1);
    expect(result?.failed).toEqual([
      {
        serviceId: 2,
        message: "این خدمت قبلاً به این کارمند اختصاص داده شده است.",
        status: 409,
      },
    ]);
    // A 409 indicates stale cache, so the selected employee is refreshed.
    expect(listServicesMock).toHaveBeenCalledTimes(1);
  });

  it("does not refresh or report success when every request fails", async () => {
    assignMock.mockResolvedValue(new Response("boom", { status: 500 }));

    const result = await useEmployeeStore
      .getState()
      .assignServices(1, [{ serviceId: 1 }]);

    expect(result?.assigned).toBe(0);
    expect(result?.failed).toHaveLength(1);
    expect(listServicesMock).not.toHaveBeenCalled();
    expect(useEmployeeStore.getState().servicesByEmployee[1]).toBeUndefined();
  });

  it("ignores a duplicate submission while requests are in flight", async () => {
    let resolveFirst!: (value: Response) => void;
    assignMock.mockReturnValue(
      new Promise<Response>((resolve) => {
        resolveFirst = resolve;
      })
    );
    listServicesMock.mockResolvedValue(jsonResponse([assignedService]));

    const first = useEmployeeStore
      .getState()
      .assignServices(1, [{ serviceId: 1 }]);
    expect(useEmployeeStore.getState().assigningServices).toBe(true);

    const second = await useEmployeeStore
      .getState()
      .assignServices(1, [{ serviceId: 2 }]);

    expect(second).toBeNull();
    expect(assignMock).toHaveBeenCalledTimes(1);

    resolveFirst(jsonResponse({ id: 1 }, 201));
    await first;
    expect(useEmployeeStore.getState().assigningServices).toBe(false);
  });
});

describe("useEmployeeStore.updateEmployeeService", () => {
  it("updates an override and refreshes only the selected employee", async () => {
    useEmployeeStore.setState({
      servicesByEmployee: {
        1: {
          items: [assignedService],
          status: "loaded",
          error: null,
        },
        2: otherEntry,
      },
    });
    updateMock.mockResolvedValue(jsonResponse({ ok: true }));
    listServicesMock.mockResolvedValue(
      jsonResponse([
        {
          ...assignedService,
          priceOverride: 120000,
          effectivePrice: 120000,
        },
      ])
    );

    const result = await useEmployeeStore
      .getState()
      .updateEmployeeService(1, 1, { priceOverride: 120000 });

    expect(updateMock).toHaveBeenCalledWith(1, 1, { priceOverride: 120000 });
    expect(result).toEqual({ ok: true });
    expect(listServicesMock).toHaveBeenCalledWith(1);
    expect(
      useEmployeeStore.getState().servicesByEmployee[1]?.items[0]
    ).toMatchObject({ priceOverride: 120000, durationMinutesOverride: null });
    expect(useEmployeeStore.getState().servicesByEmployee[2]).toBe(otherEntry);
  });

  it("sends explicit null to reset one override", async () => {
    updateMock.mockResolvedValue(jsonResponse({ ok: true }));
    listServicesMock.mockResolvedValue(jsonResponse([assignedService]));

    await useEmployeeStore.getState().updateEmployeeService(1, 1, {
      priceOverride: null,
    });

    expect(updateMock).toHaveBeenCalledWith(1, 1, { priceOverride: null });
  });

  it("skips the network for an empty patch and leaves the cache untouched", async () => {
    const entry = {
      items: [assignedService],
      status: "loaded" as const,
      error: null,
    };
    useEmployeeStore.setState({ servicesByEmployee: { 1: entry } });

    const result = await useEmployeeStore
      .getState()
      .updateEmployeeService(1, 1, {});

    expect(result).toEqual({ ok: true });
    expect(updateMock).not.toHaveBeenCalled();
    expect(listServicesMock).not.toHaveBeenCalled();
    expect(useEmployeeStore.getState().servicesByEmployee[1]).toBe(entry);
  });

  it("keeps the cache intact when the update fails", async () => {
    const entry = {
      items: [assignedService],
      status: "loaded" as const,
      error: null,
    };
    useEmployeeStore.setState({ servicesByEmployee: { 1: entry } });
    updateMock.mockResolvedValue(new Response("boom", { status: 500 }));

    const result = await useEmployeeStore
      .getState()
      .updateEmployeeService(1, 1, { durationMinutesOverride: 40 });

    expect(result).toEqual({ ok: false, message: "boom" });
    expect(listServicesMock).not.toHaveBeenCalled();
    expect(useEmployeeStore.getState().servicesByEmployee[1]).toBe(entry);
  });

  it("ignores a duplicate submission while an update is in flight", async () => {
    let resolveFirst!: (value: Response) => void;
    updateMock.mockReturnValue(
      new Promise<Response>((resolve) => {
        resolveFirst = resolve;
      })
    );
    listServicesMock.mockResolvedValue(jsonResponse([assignedService]));

    const first = useEmployeeStore
      .getState()
      .updateEmployeeService(1, 1, { priceOverride: 100000 });
    expect(useEmployeeStore.getState().updatingService).toBe(true);

    const second = await useEmployeeStore
      .getState()
      .updateEmployeeService(1, 1, { durationMinutesOverride: 50 });

    expect(second).toBeNull();
    expect(updateMock).toHaveBeenCalledTimes(1);

    resolveFirst(jsonResponse({ ok: true }));
    await first;
    expect(useEmployeeStore.getState().updatingService).toBe(false);
  });
});
