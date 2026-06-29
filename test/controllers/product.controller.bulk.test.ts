import { Types } from "mongoose";
import { addProducts } from "../../src/controllers/product.controller";
import * as authService from "../../src/services/auth.service";
import * as productService from "../../src/services/product.service";

jest.mock("../../src/services/auth.service");
jest.mock("../../src/services/product.service");

describe("product bulk controller", () => {
  const adminId = new Types.ObjectId();

  beforeEach(() => {
    jest.resetAllMocks();
    (authService.getAuthUser as jest.Mock).mockResolvedValue({
      _id: adminId,
      role: "admin",
    });
  });

  test("accepts a raw array body and normalizes the payload before insert", async () => {
    (productService.addProducts as jest.Mock).mockImplementation(async (products) => products);

    const req = {
      user: { id: adminId.toString(), email: "admin@test.com" },
      body: [
        {
          name: "RB Essential Classic Tee",
          description:
            "<h2>Everyday Comfort. Timeless Style.</h2><p>The RB Essential Classic Tee is crafted for daily wear with a clean silhouette and soft cotton feel.</p>",
          price: 399,
          originalPrice: 999,
          discount: 60,
          category: ["mens", "tshirts", "new-drops--rawbharat"],
          sku: "RB-TS-001",
          brand: "RawBharat",
          material: "100% Cotton",
          stock: 120,
          images: ["tee1.jpg"],
          isActive: true,
          ageGroup: "16-40",
          gender: "Men",
          featured: true,
          isNFT: false,
          sizes: ["S", "M", "L", "XL"],
          reviewCount: 0,
          colors: ["Black", "White", "Olive"],
          features: ["Soft fabric", "Breathable", "Durable"],
          highlights: ["Daily wear essential"],
        },
      ],
    } as any;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as any;
    const next = jest.fn();

    await addProducts(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(productService.addProducts).toHaveBeenCalledTimes(1);

    const normalizedProducts = (productService.addProducts as jest.Mock).mock.calls[0][0];
    expect(normalizedProducts).toHaveLength(1);
    expect(normalizedProducts[0]).toMatchObject({
      name: "RB Essential Classic Tee",
      category: ["mens", "tshirts", "new-drops--rawbharat"],
      images: ["tee1.jpg"],
      gender: "Men",
      colors: [{ name: "Black" }, { name: "White" }, { name: "Olive" }],
      highlights: [{ title: "Daily wear essential" }],
    });
    expect(normalizedProducts[0].createdBy).toBeInstanceOf(Types.ObjectId);
    expect(res.status).toHaveBeenCalledWith(201);
  });

  test("passes a validation error to next when the bulk payload is empty", async () => {
    const req = {
      user: { id: adminId.toString(), email: "admin@test.com" },
      body: {},
    } as any;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as any;
    const next = jest.fn();

    await addProducts(req, res, next);

    expect(productService.addProducts).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledTimes(1);
    expect(next.mock.calls[0][0]).toMatchObject({
      code: "INVALID_PRODUCT_BULK_PAYLOAD",
      statusCode: 400,
    });
  });
});
