import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import app from "../src/app";

describe("Transaction API", () => {
  let token: string;
  let accountId: string;
  let toAccountId: string;
  let categoryId: string;

  beforeEach(async () => {
    // 1. Register and Login
    const uniqueId = Math.random().toString(36).substring(7);
    const testUser = {
      email: `tx_${uniqueId}@example.com`,
      password: "Password123!",
      name: "Transaction User",
    };

    const regRes = await request(app).post("/api/auth/register").send(testUser);
    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({ email: testUser.email, password: testUser.password });
    token = loginRes.body.data.accessToken;

    // 2. Create 2 accounts
    const acc1Res = await request(app)
      .post("/api/accounts")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "BCA", type: "bank", initialBalance: 1000000 });
    accountId = acc1Res.body.data.id;

    const acc2Res = await request(app)
      .post("/api/accounts")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Cash", type: "cash", initialBalance: 0 });
    toAccountId = acc2Res.body.data.id;

    // 3. Create a category
    const catRes = await request(app)
      .post("/api/categories")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Food", type: "expense", icon: "🍔" });
    categoryId = catRes.body.data.id;
  });

  it("should create an income transaction and increase balance", async () => {
    const res = await request(app)
      .post("/api/transactions")
      .set("Authorization", `Bearer ${token}`)
      .send({
        type: "income",
        amount: 500000,
        accountId,
        categoryId,
        transactionDate: "2026-04-10",
        description: "Bonus",
      });

    expect(res.status).toBe(201);
    
    // Check account balance
    const accRes = await request(app)
      .get(`/api/accounts/${accountId}`)
      .set("Authorization", `Bearer ${token}`);
    
    expect(Number(accRes.body.data.balance)).toBe(1500000);
  });

  it("should create an expense transaction and decrease balance", async () => {
    const res = await request(app)
      .post("/api/transactions")
      .set("Authorization", `Bearer ${token}`)
      .send({
        type: "expense",
        amount: 200000,
        accountId,
        categoryId,
        transactionDate: "2026-04-10",
      });

    expect(res.status).toBe(201);
    
    // Check account balance
    const accRes = await request(app)
      .get(`/api/accounts/${accountId}`)
      .set("Authorization", `Bearer ${token}`);
    
    expect(Number(accRes.body.data.balance)).toBe(800000);
  });

  it("should create a transfer transaction and update both balances", async () => {
    const res = await request(app)
      .post("/api/transactions")
      .set("Authorization", `Bearer ${token}`)
      .send({
        type: "transfer",
        amount: 300000,
        accountId,
        toAccountId,
        categoryId,
        transactionDate: "2026-04-10",
      });

    expect(res.status).toBe(201);
    
    // Check accounts balances
    const acc1Res = await request(app)
      .get(`/api/accounts/${accountId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(Number(acc1Res.body.data.balance)).toBe(700000);

    const acc2Res = await request(app)
      .get(`/api/accounts/${toAccountId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(Number(acc2Res.body.data.balance)).toBe(300000);
  });

  it("should rollback balance when a transaction is deleted", async () => {
    // 1. Create income
    const createRes = await request(app)
      .post("/api/transactions")
      .set("Authorization", `Bearer ${token}`)
      .send({
        type: "income",
        amount: 500000,
        accountId,
        categoryId,
        transactionDate: "2026-04-10",
      });
    const txId = createRes.body.data.id;

    // 2. Delete it
    await request(app)
      .delete(`/api/transactions/${txId}`)
      .set("Authorization", `Bearer ${token}`);

    // 3. Check balance
    const accRes = await request(app)
      .get(`/api/accounts/${accountId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(Number(accRes.body.data.balance)).toBe(1000000);
  });

  it("should fail if balance is insufficient for expense", async () => {
    const res = await request(app)
      .post("/api/transactions")
      .set("Authorization", `Bearer ${token}`)
      .send({
        type: "expense",
        amount: 2000000, // exceeds 1,000,000
        accountId,
        categoryId,
        transactionDate: "2026-04-10",
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain("tidak mencukupi");
  });
});
