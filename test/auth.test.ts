import request from "supertest";
import mongoose from "mongoose";
import app from "../src/app"; // your Express app
import { User } from "../src/models/User";

const MONGO_TEST_URL = process.env.MONGO_TEST_URL ||  "";

beforeAll(async () => {
    await mongoose.connect(MONGO_TEST_URL);
});

afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
});

beforeEach(async () => {
    await User.deleteMany({});
});

describe("Auth API", () => {
    test("should register a new user", async () => {
        const res = await request(app)
            .post("/api/auth/register")
            .send({ name: "test", email: "test@example.com", password: "password123" });

        expect(res.status).toBe(201);
        // expect(res.body.message).toBe("User registered successfully");

        const user = await User.findOne({ email: "test@example.com" });
        expect(user).not.toBeNull();
    });
    test("should login with correct credentials", async () => {
        await new User({ name: "test", email: "test@example.com", password: "password123" }).save();

        const res = await request(app)
            .post("/api/auth/login")
            .send({ email: "test@example.com", password: "password123" });

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty("token");
    });
    test("should not login with incorrect credentials", async () => {
        const res = await request(app)
            .post("/api/auth/login")
            .send({ email: "test@example.com", password: "wrongpassword" });
        expect(res.status).toBe(500);
        expect(res.body).toHaveProperty("message");
    })
    test("should get authenticated user details", async () => {
        await new User({ name: "test", email: "test@example.com", password: "password123" }).save();
        const loginRes = await request(app)
            .post("/api/auth/login")
            .send({ email: "test@example.com", password: "password123" });
        const token = loginRes.body.token;
        const res = await request(app)
            .get("/api/auth/me")
            .set("Authorization", `Bearer ${token}`);
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty("email");
        expect(res.body).toHaveProperty("name");
        expect(res.body).toHaveProperty("role");
        expect(res.body).toHaveProperty("_id");
    })
});
