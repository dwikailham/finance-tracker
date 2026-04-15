import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import app from "../src/app";

describe("Account API", () => {
  let token: string;
  let userId: string;

  beforeEach(async () => {
    // Unique user per test to avoid any database state leakage
    const uniqueId = Math.random().toString(36).substring(7);
    const testUser = {
      email: `acc_${uniqueId}@example.com`,
      password: "Password123!",
      name: "Account User",
    };

    const regRes = await request(app).post("/api/auth/register").send(testUser);
    userId = regRes.body.data.id;

    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({
        email: testUser.email,
        password: testUser.password,
      });
    token = loginRes.body.data.accessToken;
  });

  it("should create a new account", async () => {
    const res = await request(app)
      .post("/api/accounts")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Savings",
        type: "bank",
        balance: 1000000,
        currency: "IDR",
      });

    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe("Savings");
  });

  it("should get all accounts", async () => {
    const res = await request(app)
      .get("/api/accounts")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it("should get account by id", async () => {
    const createRes = await request(app)
      .post("/api/accounts")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Specific Account",
        type: "cash",
      });

    const accountId = createRes.body.data.id;

    const res = await request(app)
      .get(`/api/accounts/${accountId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(accountId);
  });

  it("should update an account", async () => {
    const createRes = await request(app)
      .post("/api/accounts")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Old Account",
        type: "bank",
      });

    const accountId = createRes.body.data.id;

    const res = await request(app)
      .put(`/api/accounts/${accountId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Updated Account",
      });

    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe("Updated Account");
  });

  it("should archive/delete an account", async () => {
    const createRes = await request(app)
      .post("/api/accounts")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "To Archive",
        type: "bank",
      });

    const accountId = createRes.body.data.id;

    const res = await request(app)
      .delete(`/api/accounts/${accountId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
  });
});
