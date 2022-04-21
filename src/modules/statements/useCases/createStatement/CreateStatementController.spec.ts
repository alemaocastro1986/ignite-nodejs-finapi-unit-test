import request from "supertest";

import { connection } from "../../../../database";
import { app } from "../../../../app";
import { IAuthenticateUserResponseDTO } from "../../../users/useCases/authenticateUser/IAuthenticateUserResponseDTO";

describe("CreateStatementController", () => {
  let auth: IAuthenticateUserResponseDTO;
  beforeAll(async () => {
    await connection.create();
    await connection.createTestUser();

    const response = await request(app).post("/api/v1/sessions").send({
      email: "john.doe@test.com",
      password: "123456",
    });
    auth = response.body;
  });

  afterAll(async () => {
    await connection.clear();
    await connection.close();
  });

  describe("POST /api/v1/statements/deposit", () => {
    it("Should return status code 200, when a valid deposit", async () => {
      const sut = await request(app)
        .post("/api/v1/statements/deposit")
        .set("Authorization", `Bearer ${auth.token}`)
        .send({
          amount: 5.5,
          description: "Salary",
        });

      expect(sut.status).toBe(201);
    });

    it("should return status code 401, when is invalid user", async () => {
      const sut = await request(app)
        .post("/api/v1/statements/deposit")
        .set("Authorization", `Bearer unknown`)
        .send({
          amount: 5.5,
          description: "Salary",
        });

      expect(sut.status).toBe(401);
    });
  });

  describe("POST /api/v1/statements/withdraw", () => {
    it("Should return status code 200, when the withdrawal amount is within the balance", async () => {
      const sut = await request(app)
        .post("/api/v1/statements/withdraw")
        .set("Authorization", `Bearer ${auth.token}`)
        .send({
          amount: 2.5,
          description: "Food",
        });

      expect(sut.status).toBe(201);
    });

    it("Should return status code 400, when the withdrawal amount is greater than the balance", async () => {
      const sut = await request(app)
        .post("/api/v1/statements/withdraw")
        .set("Authorization", `Bearer ${auth.token}`)
        .send({
          amount: 8.5,
          description: "Food",
        });

      expect(sut.status).toBe(400);
    });
  });
});
