import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../src/app";

describe("Auth API", () => {
  const testUser = {
    email: "test@example.com",
    password: "Password123!",
    name: "Test User",
  };

  it("should register a new user", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send(testUser);

    expect(res.status).toBe(201);
    expect(res.body.data).toHaveProperty("id");
    expect(res.body.data.email).toBe(testUser.email);
  });

  it("should not register a user with an existing email", async () => {
    await request(app).post("/api/auth/register").send(testUser);

    const res = await request(app)
      .post("/api/auth/register")
      .send(testUser);

    expect(res.status).toBe(409); // SERVICE throws 409 for existing email
  });

  it("should login a registered user", async () => {
    await request(app).post("/api/auth/register").send(testUser);

    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: testUser.email,
        password: testUser.password,
      });

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty("accessToken");
    // User is nested under data in current implementation
    expect(res.body.data.user.email).toBe(testUser.email);
  });

  it("should return 401 for invalid credentials", async () => {
    await request(app).post("/api/auth/register").send(testUser);

    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: testUser.email,
        password: "wrongpassword",
      });

    expect(res.status).toBe(401);
  });

  it("should get current user profile with valid token", async () => {
    await request(app).post("/api/auth/register").send(testUser);
    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({
        email: testUser.email,
        password: testUser.password,
      });

    const token = loginRes.body.data.accessToken;

    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe(testUser.email);
  });

  it("should return 401 for 'me' endpoint without token", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.status).toBe(401);
  });
});
