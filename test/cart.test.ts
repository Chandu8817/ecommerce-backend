import request from "supertest";
import app from "../src/app";
import mongoose from "mongoose";
import { Product } from "../src/models/Product";
import { Cart } from "../src/models/Cart";

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

describe("Cart Operations", () => {
    test("should add item to cart", async () => {
        const response = await request(app)
            .post("/api/cart")
            .set("Authorization", `Bearer ${buyerToken}`)
            .send({ productId, quantity: 2 });
            
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("items");
        expect(response.body.items[0].productId._id).toBe(productId);
        expect(response.body.items[0].quantity).toBe(2);
    });

    test("should update cart item quantity", async () => 
        {
            
        // First add item to cart
        const addResponse = await request(app)
            .post("/api/cart")
            .set("Authorization", `Bearer ${buyerToken}`)
            .send({ productId, quantity: 1 });
            
        
            
        // Then update quantity
        const response = await request(app)
            .put(`/api/cart`)
            .set("Authorization", `Bearer ${buyerToken}`)
            .send({ productId, quantity: 3 });
        
        expect(response.status).toBe(200);
        expect(response.body.items[0].quantity).toBe(3);
    });

    test("should remove item from cart", async () => {
        // First add item to cart
        await request(app)
            .post("/api/cart")
            .set("Authorization", `Bearer ${buyerToken}`)
            .send({ productId, quantity: 1 });
            
        // Then remove it
        const response = await request(app)
            .delete(`/api/cart/${productId}`)
            .set("Authorization", `Bearer ${buyerToken}`);
            
        expect(response.status).toBe(200);
        expect(response.body.items).toHaveLength(0);
    });

    test("should get user's cart", async () => {
        // First add item to cart
        await request(app)
            .post("/api/cart")
            .set("Authorization", `Bearer ${buyerToken}`)
            .send({ productId, quantity: 2 });
            
        // Then get cart
        const response = await request(app)
            .get("/api/cart")
            .set("Authorization", `Bearer ${buyerToken}`);
            
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("items");
        expect(response.body.items).toHaveLength(1);
        expect(response.body.items[0].productId._id).toBe(productId);
    });

    test("should clear cart", async () => {
        // First add item to cart
        await request(app)
            .post("/api/cart")
            .set("Authorization", `Bearer ${buyerToken}`)
            .send({ productId, quantity: 1 });
            
        // Then clear cart
        const response = await request(app)
            .delete("/api/cart")
            .set("Authorization", `Bearer ${buyerToken}`);
            
        expect(response.status).toBe(200);
        expect(response.body.items).toHaveLength(0);
    });
});

async function loginAndGetToken(role: string = "user"): Promise<string> {
    const email = `${role}@test.com`;
    
    // Try to register first
    await request(app)
        .post("/api/auth/register")
        .send({
            name: role,
            email,
            password: "password123",
            role: role,
        });
        
    // Then login
    const loginRes = await request(app)
        .post("/api/auth/login")
        .send({ email, password: "password123" });
        
    return loginRes.body.token;
}