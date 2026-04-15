import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import app from "../src/app";

describe("Category API", () => {
  let token: string;
  let userId: string;

  beforeEach(async () => {
    // Unique user per test to avoid any database state leakage
    const uniqueId = Math.random().toString(36).substring(7);
    const testUser = {
      email: `cat_${uniqueId}@example.com`,
      password: "Password123!",
      name: "Category User",
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

  it("should create a new category", async () => {
    const res = await request(app)
      .post("/api/categories")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Food",
        type: "expense",
        icon: "🍔",
        color: "#FF0000",
      });

    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe("Food");
  });

  it("should get all categories", async () => {
    const res = await request(app)
      .get("/api/categories")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it("should update a category", async () => {
    const createRes = await request(app)
      .post("/api/categories")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Old Category",
        type: "expense",
      });

    const categoryId = createRes.body.data.id;

    const res = await request(app)
      .put(`/api/categories/${categoryId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Updated Category",
      });

    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe("Updated Category");
  });

  it("should delete a category", async () => {
    const createRes = await request(app)
      .post("/api/categories")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "To Delete",
        type: "expense",
      });

    const categoryId = createRes.body.data.id;

    const res = await request(app)
      .delete(`/api/categories/${categoryId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
  });
});
