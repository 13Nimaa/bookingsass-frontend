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
  deleteBusinessGalleryImageRequest,
  EMPTY_BUSINESS_PAGE,
  getBusinessById,
  listBusinesses,
  registerBusinessRequest,
  getMineBusiness,
  updateBusinessRequest,
  uploadBusinessGalleryRequest,
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

  it("getBusinessById returns public detail from GET /api/business/:id", async () => {
    const dto = {
      id: 7,
      name: "سالن",
      city: "تهران",
      address: "آدرس",
      description: null,
      profileImageUrl: null,
      ownerId: "u1",
      employees: [
        {
          id: 3,
          fullName: "Ada",
          avatarUrl: null,
          services: [
            {
              id: 9,
              title: "Haircut",
              effectivePrice: 150000,
              effectiveDurationMinutes: 45,
            },
          ],
          workingHours: [
            {
              id: 41,
              employeeId: 3,
              date: "2026-11-06",
              dayOfWeek: 5,
              startTime: "09:00:00",
              endTime: "17:00:00",
            },
          ],
        },
      ],
    };
    backendFetchMock.mockResolvedValue(
      new Response(JSON.stringify(dto), { status: 200 }),
    );

    await expect(getBusinessById(7)).resolves.toEqual({
      data: expect.objectContaining({
        id: 7,
        name: "سالن",
        employees: [
          expect.objectContaining({
            id: 3,
            fullName: "Ada",
            services: [
              expect.objectContaining({
                id: 9,
                effectivePrice: 150000,
                effectiveDurationMinutes: 45,
              }),
            ],
            workingHours: [
              expect.objectContaining({
                id: 41,
                date: "2026-11-06",
              }),
            ],
          }),
        ],
      }),
      notFound: false,
      failed: false,
    });
    expect(backendFetchMock).toHaveBeenCalledWith("/api/business/7", {
      cache: "no-store",
    });
  });

  it("getBusinessById defaults missing employees to an empty array", async () => {
    backendFetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          id: 1,
          name: "سالن",
          city: "تهران",
          address: "آدرس",
          description: null,
          profileImageUrl: null,
          ownerId: "u1",
        }),
        { status: 200 },
      ),
    );

    const result = await getBusinessById(1);
    expect(result.data?.employees).toEqual([]);
    expect(result.data?.businessGallery).toEqual([]);
  });

  it("getBusinessById parses businessGallery items", async () => {
    backendFetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          id: 1,
          name: "سالن",
          city: "تهران",
          address: "آدرس",
          description: null,
          profileImageUrl: null,
          ownerId: "u1",
          businessGallery: [
            { url: "https://cdn.test/a.jpg", publicId: "a" },
            { url: "https://cdn.test/bad.jpg" },
          ],
        }),
        { status: 200 },
      ),
    );

    const result = await getBusinessById(1);
    expect(result.data?.businessGallery).toEqual([
      { url: "https://cdn.test/a.jpg", publicId: "a" },
    ]);
  });

  it("uploadBusinessGalleryRequest posts multipart files field", async () => {
    apiClientMock.mockResolvedValue(new Response("", { status: 200 }));
    const file = new File(["x"], "a.jpg", { type: "image/jpeg" });
    await uploadBusinessGalleryRequest([file]);

    expect(apiClientMock).toHaveBeenCalledWith(
      "/api/business/gallery",
      expect.objectContaining({ method: "POST", body: expect.any(FormData) }),
    );
    const body = apiClientMock.mock.calls[0][1]?.body as FormData;
    expect(body.getAll("files")).toHaveLength(1);
  });

  it("deleteBusinessGalleryImageRequest sends publicId query", async () => {
    apiClientMock.mockResolvedValue(new Response("", { status: 200 }));
    await deleteBusinessGalleryImageRequest("booking-saas/g1");
    expect(apiClientMock).toHaveBeenCalledWith(
      "/api/business/gallery?publicId=booking-saas%2Fg1",
      { method: "DELETE" },
    );
  });

  it("getBusinessById marks notFound on 404", async () => {
    backendFetchMock.mockResolvedValue(new Response("", { status: 404 }));
    await expect(getBusinessById(99)).resolves.toEqual({
      data: null,
      notFound: true,
      failed: false,
    });
  });

  it("getBusinessById marks failed on server error", async () => {
    backendFetchMock.mockResolvedValue(new Response("", { status: 500 }));
    await expect(getBusinessById(1)).resolves.toEqual({
      data: null,
      notFound: false,
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
