// auth.integration.test.ts
// Example integration test for auth endpoints
import request from "supertest";
import app from "../../src/app";

describe("Auth API", () => {
  it("should register and login a user", async () => {
    const email = `user${Date.now()}@test.com`;
    const registerRes = await request(app)
      .post("/api/v1/auth/register")
      .send({ name: "Test", email, password: "pass" });
    expect(registerRes.status).toBe(201);
    expect(registerRes.body).toHaveProperty("token");

    const loginRes = await request(app)
      .post("/api/v1/auth/login")
      .send({ email, password: "pass" });
    expect(loginRes.status).toBe(200);
    expect(loginRes.body).toHaveProperty("token");
  });
});
