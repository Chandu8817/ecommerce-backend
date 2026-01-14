import request from "supertest";
import app from "../src/app";
import mongoose from "mongoose";
import { Product } from "../src/models/Product";
import { WishList } from "../src/models/WishList";

const MONGO_TEST_URL = process.env.MONGO_TEST_URL || "mongodb://localhost:27017/ecommerce-test";
let adminToken: string;
let buyerToken: string;
let productId: string;

// Increase Jest timeout for all tests
jest.setTimeout(30000);

beforeAll(async () => {
    try {
        await mongoose.connect(MONGO_TEST_URL);
        // Clear all collections before starting tests
        const collections = mongoose.connection.collections;
        for (const key in collections) {
            await collections[key].deleteMany({});
        }
    } catch (error) {
        console.error('Failed to connect to MongoDB:', error);
        process.exit(1);
    }
});

afterAll(async () => {
    try {
        await mongoose.connection.dropDatabase();
        await mongoose.connection.close();
    } catch (error) {
        console.error('Error during cleanup:', error);
    }
});

beforeEach(async () => {
    // Clear all collections before each test
    const collections = mongoose.connection.collections;
    for (const key in collections) {
        await collections[key].deleteMany({});
    }
    
    // Create a test product
    adminToken = await loginAndGetToken("admin");
    const productRes = await request(app)
        .post("/api/products")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
            name: "Test Product",
            description: "Test Description",
            price: 100,
            category: "Test Category",
            brand: "Test Brand",
            stock: 10,
            isActive: true
        });
    productId = productRes.body._id;
    
    // Create a buyer user
    buyerToken = await loginAndGetToken("user");
});

describe("Wishlist Operations", () => {
    test("should add item to wishlist", async () => {
        const response = await request(app)
            .post("/api/wishlist")
            .set("Authorization", `Bearer ${buyerToken}`)
            .send({ productId });
        
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("products");
        expect(response.body.products[0]).toBe(productId);
    });

    test("should not add duplicate item to wishlist", async () => {
        // First add item to wishlist
        await request(app)
            .post("/api/wishlist")
            .set("Authorization", `Bearer ${buyerToken}`)
            .send({ productId });
            
        // Try to add the same item again
        const response = await request(app)
            .post("/api/wishlist")
            .set("Authorization", `Bearer ${buyerToken}`)
            .send({ productId });
            
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("error");
    });

    test("should remove item from wishlist", async () => {
        // First add item to wishlist
        await request(app)
            .post("/api/wishlist")
            .set("Authorization", `Bearer ${buyerToken}`)
            .send({ productId });
            
        // Then remove it
        const response = await request(app)
            .delete(`/api/wishlist/${productId}`)
            .set("Authorization", `Bearer ${buyerToken}`);
            
        expect(response.status).toBe(200);
        expect(response.body.products).not.toContainEqual(expect.objectContaining({
            _id: productId
        }));
    });

    test("should get user's wishlist", async () => {
        // First add item to wishlist
        await request(app)
            .post("/api/wishlist")
            .set("Authorization", `Bearer ${buyerToken}`)
            .send({ productId });
            
        // Then get wishlist
        const response = await request(app)
            .get("/api/wishlist")
            .set("Authorization", `Bearer ${buyerToken}`);
            
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("products");
        expect(response.body.products).toHaveLength(1);
        expect(response.body.products[0]._id).toBe(productId);
    });

    test("should clear wishlist", async () => {
        // First add item to wishlist
        await request(app)
            .post("/api/wishlist")
            .set("Authorization", `Bearer ${buyerToken}`)
            .send({ productId });
            
        // Then clear wishlist
        const response = await request(app)
            .delete("/api/wishlist")
            .set("Authorization", `Bearer ${buyerToken}`);
        
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("acknowledged", true);
        
    });
});

// hepler for login and get token
async function loginAndGetToken(
    role: string = "admin"
  ): Promise<string> {
    await request(app)
      .post("/api/auth/register")
      .send({
        name: role,
        email: `${role}@test.com`,
        password: "password123",
        role: role,
      });
    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({ email: `${role}@test.com`, password: "password123" });
    return  loginRes.body.token;
  }
  
  async function addProductAndGetId(): Promise<string> {
    adminToken = await loginAndGetToken();
    const productRes = await request(app)
      .post("/api/products")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        name: "Order Test Product",
        description: "Product for order testing",
        price: 200,
        category: "TestCategory",
        brand: "TestBrand",
        stock: 20,
        isActive: true,
      });
    expect(productRes.status).toBe(201);
    return productRes.body._id;
  }