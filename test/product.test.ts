import { Product, IProduct } from "../src/models/Product";
import mongoose from "mongoose";
import app from "../src/app";
import request from "supertest";
import { CONNREFUSED } from "dns";

const MONGO_TEST_URL = process.env.MONGO_TEST_URL || "";
let token: string;

const productData: Partial<IProduct> = {
  name: "Test Product",
  description: "This is a test product",
  price: 100,
  category: "Electronics",
  brand: "Test Brand",
  stock: 50,
  isActive: true,
};

beforeAll(async () => {
  await mongoose.connect(MONGO_TEST_URL);
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

beforeEach(async () => {
  await Product.deleteMany({});
  token = await loginAndGetToken();
  const now = new Date();
  const earlier = new Date(now.getTime() - 24 * 60 * 60 * 1000);
 

     const products = [];
    for (let i = 1; i <= 15; i++) {
      const product = new Product({
        name: `Product ${i}`,
        description: `Description for product ${i}`,
        price: i * 100,
        category: `Cat${i}`,
        brand: `Brand${i}`,
        stock: i * 5,
        isActive: i<5 ? true: false,
        createdAt: i % 2 === 0 ? now : earlier,
      });
      products.push(product);
    }
    const result = await request(app)
      .post("/api/products/bulk")
      .set("Authorization", `Bearer ${token}`)
      .send(products);
      
     
});

describe("Product API", () => {
  let productId: string;

  test("should add a new product", async () => {
    const res = await request(app)
      .post("/api/products")
      .set("Authorization", `Bearer ${token}`)
      .send(productData);
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("_id");
    expect(res.body).toHaveProperty("name");
    expect(res.body.name).toBe("Test Product");
  });

  test("should get a product by ID", async () => {
    const result = await request(app)
      .post("/api/products")
      .set("Authorization", `Bearer ${token}`)
      .send(productData);
    const product = result.body;

    const res = await request(app).get(
      `/api/products/${product._id?.toString()}`
    );
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("_id");
  });

  test("should return 404 for non-existing product ID", async () => {
    const nonExistingId = new mongoose.Types.ObjectId();
    const res = await request(app).get(`/api/products/${nonExistingId}`);
    expect(res.status).toBe(404);
    expect(res.body.error).toHaveProperty("message", "Product not found");
  });

  test("should return 400 for invalid product ID", async () => {
    const res = await request(app).get("/api/products/invalid-id");
    expect(res.status).toBe(400);
    expect(res.body.error).toHaveProperty("message", "Invalid product ID");
  });

  test("should  addd bulk and get products with pagination", async () => {


    const res = await request(app).get("/api/products?take=5&skip=5");

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(5);
    expect(res.body.data[0].name).toBe("Product 6");
  });

  test("should return 404 when no products found", async () => {
    await Product.deleteMany({});
    const res = await request(app).get("/api/products?take=5&skip=0");
    expect(res.status).toBe(404);
    expect(res.body.error).toHaveProperty("message", "Product not found");
  });

describe("Product filtering", () => {
  const now = new Date();
  const earlier = new Date(now.getTime() - 24 * 60 * 60 * 1000);

 
  test("filters by category", async () => {
    const filter = { 
            category: ["Cat1"],
     };
    const res = await request(app).post("/api/products/filter").send(filter);
   

    expect(res.status).toBe(200);
    expect(res.body.data.every((p: any) => p.category === "Cat1")).toBe(true);
  });

  test("filters by brand", async () => {
    const filter = { brand: "Brand1" };
    const res = await request(app).post("/api/products/filter").send(filter);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].brand).toBe("Brand1");
  });

  test("filters by price range", async () => {
    const filter = { price: { min: 100, max: 150 } };
    const res = await request(app).post("/api/products/filter").send(filter);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].price).toBe(100);
  });

  test("filters by stock range", async () => {
    const filter = { stock: { min: 25, max: 35 } };
    const res = await request(app).post("/api/products/filter").send(filter);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(3);
    expect(res.body.data[0].stock).toBe(25);
  });

  test("filters by createdAt range", async () => {
    const filter = { createdAt: { from: earlier.toISOString(), to: now.toISOString() } };
    const res = await request(app).post("/api/products/filter").send(filter);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  test("filters by isActive", async () => {
    const filter = { isActive: false };
    const res = await request(app).post("/api/products/filter").send(filter);
   

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(10);
    expect(res.body.data[0].isActive).toBe(false);
  });

  test("applies pagination (skip + take)", async () => {
    const filter = { take: 1, skip: 14 }; // get only 1 product after skipping 1
    const res = await request(app).post("/api/products/filter").send(filter);

    expect(res.status).toBe(200);
    expect(res.body.pageSize).toBe(1);
    expect(res.body.data).toHaveLength(1);
  });
});
});




// hepler for login and get token
async function loginAndGetToken() {
  await request(app)
    .post("/api/auth/register")
    .send({
      name: "admin",
      email: "admin@test.com",
      password: "password123",
      role: "admin",
    });
  const loginRes = await request(app)
    .post("/api/auth/login")
    .send({ email: "admin@test.com", password: "password123" });
  return loginRes.body.token;
}
