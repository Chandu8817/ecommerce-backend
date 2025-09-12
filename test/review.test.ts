import request from "supertest";
import app from "../src/app";
import mongoose from "mongoose";
import { Product } from "../src/models/Product";
import { Review } from "../src/models/Review";

const MONGO_TEST_URL = process.env.MONGO_TEST_URL || "mongodb://localhost:27017/ecommerce-test";
let adminToken: string;
let buyerToken: string;
let productId: string;
let reviewId: string;

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
    
    // Create a review for some tests
    const reviewRes = await request(app)
        .post(`/api/reviews/product/${productId}`)
        .set("Authorization", `Bearer ${buyerToken}`)
        .send({
            rating: 4,
            comment: "Great product!"
        });
    reviewId = reviewRes.body._id;
});

describe("Review Operations", () => {
    test("should create a review", async () => {
        const collections = mongoose.connection.collections;
        for (const key in collections) {
            await collections[key].deleteMany({});
        }
        const response = await request(app)
            .post(`/api/reviews/product/${productId}`)
            .set("Authorization", `Bearer ${buyerToken}`)
            .send({
                rating: 5,
                comment: "Excellent product!"
            });
        
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("_id");
        expect(response.body.rating).toBe(5);
        expect(response.body.comment).toBe("Excellent product!");
        
    });

    test("should not create duplicate review", async () => {
        const response = await request(app)
            .post(`/api/reviews/product/${productId}`)
            .set("Authorization", `Bearer ${buyerToken}`)
            .send({
                rating: 5,
                comment: "Another review"
            });
            
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("error");
    });

    test("should update a review", async () => {
        const response = await request(app)
            .put(`/api/reviews/${reviewId}`)
            .set("Authorization", `Bearer ${buyerToken}`)
            .send({
                rating: 3,
                comment: "Updated review"
            });
            
        expect(response.status).toBe(200);
        expect(response.body.rating).toBe(3);
        expect(response.body.comment).toBe("Updated review");
    });

    test("should delete a review", async () => {
        const response = await request(app)
            .delete(`/api/reviews/${reviewId}`)
            .set("Authorization", `Bearer ${buyerToken}`);
            
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("success", true);
        
        // Verify it's deleted
        const deletedReview = await Review.findById(reviewId);
        expect(deletedReview).toBeNull();
    });

    test("should get product reviews", async () => {
        const response = await request(app)
            .get(`/api/reviews/product/${productId}`)
            .query({ page: 1, limit: 10 });
            
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("reviews");
        expect(response.body.reviews).toHaveLength(1);
        expect(response.body.reviews[0]._id).toBe(reviewId);
    });

    test("should get user's review for a product", async () => {
        const loginRes = await request(app)
        .post("/api/auth/login")
        .send({ email: "user@test.com", password: "password123" });
        const userId = loginRes.body._id;
        const response = await request(app)
            .get(`/api/reviews/product/${productId}/user/${userId}`)
            .set("Authorization", `Bearer ${adminToken}`);
        
        expect(response.status).toBe(200);
        expect(response.body._id).toBe(reviewId);
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
