import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/api/client", () => ({
  apiClient: vi.fn(),
}));

vi.mock("@/lib/api/http", () => ({
  backendFetch: vi.fn(),
}));

import { apiClient } from "@/lib/api/client";
import { backendFetch } from "@/lib/api/http";
import {
  createBusinessRequest,
  EMPTY_BUSINESS_PAGE,
  listBusinesses,
  registerBusinessRequest,
  getMineBusiness,
  updateBusinessRequest,
} from "@/lib/api/endpoints/business.endpoints";

const apiClientMock = vi.mocked(apiClient);
const backendFetchMock = vi.mocked(backendFetch);

const samplePage = {
  items: [{ id: 1, name: "A", city: "Tehran", address: "x", description: null, profileImageUrl: null, ownerId: "u1" }],
  page: 1,
  pageSize: 9,
  totalCount: 1,
  totalPages: 1,
  hasPreviousPage: false,
  hasNextPage: false,
};

describe("business endpoints", () => {
  beforeEach(() => {
    apiClientMock.mockReset();
    backendFetchMock.mockReset();
  });

  it("listBusinesses returns paged data from GET /api/business", async () => {
    backendFetchMock.mockResolvedValue(
      new Response(JSON.stringify(samplePage), { status: 200 }),
    );

    const result = await listBusinesses({ page: 1, pageSize: 9 });

    expect(backendFetchMock).toHaveBeenCalledWith(
      "/api/business?page=1&pageSize=9",
      { cache: "no-store" },
    );
    expect(result).toEqual({ data: samplePage, failed: false });
  });

  it("listBusinesses serializes search, city, and sort query params", async () => {
    backendFetchMock.mockResolvedValue(
      new Response(JSON.stringify(samplePage), { status: 200 }),
    );

    await listBusinesses({
      search: "salon",
      city: "Tehran",
      sortBy: "city",
      sortOrder: "desc",
      page: 2,
      pageSize: 10,
    });

    expect(backendFetchMock).toHaveBeenCalledWith(
      "/api/business?search=salon&city=Tehran&sortBy=city&sortOrder=desc&page=2&pageSize=10",
      { cache: "no-store" },
    );
  });

  it("listBusinesses marks failed when the backend errors", async () => {
    backendFetchMock.mockResolvedValue(new Response("", { status: 500 }));
    await expect(listBusinesses()).resolves.toEqual({
      data: EMPTY_BUSINESS_PAGE,
      failed: true,
    });
  });

  it("owner registration uses POST /api/Business/register (not create)", async () => {
    apiClientMock.mockResolvedValue(new Response("{}", { status: 200 }));
    const input = {
      name: "سالن",
      city: "تهران",
      address: "آدرس",
      description: null,
    };

    await registerBusinessRequest(input);
    await createBusinessRequest(input);

    expect(apiClientMock).toHaveBeenNthCalledWith(
      1,
      "/api/Business/register",
      expect.objectContaining({ method: "POST" }),
    );
    expect(apiClientMock).toHaveBeenNthCalledWith(
      2,
      "/api/business",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("mine and update hit the authenticated CRUD paths", async () => {
    apiClientMock.mockResolvedValue(new Response("{}", { status: 200 }));

    await getMineBusiness();
    await updateBusinessRequest(9, {
      name: "n",
      city: "c",
      address: "a",
      description: null,
    });

    expect(apiClientMock).toHaveBeenCalledWith("/api/business/mine");
    expect(apiClientMock).toHaveBeenCalledWith(
      "/api/business/9",
      expect.objectContaining({ method: "PUT" }),
    );
  });
});
