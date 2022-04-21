import request from "supertest";

import { app } from "../../../../app";
import { connection } from "../../../../database";
import { IAuthenticateUserResponseDTO } from "../../../users/useCases/authenticateUser/IAuthenticateUserResponseDTO";

describe("GetBalanceController GET /api/v1/statements/balance", () => {
  let session: IAuthenticateUserResponseDTO;
  beforeAll(async () => {
    await connection.create();
    await connection.createStatements();

    const response = await request(app).post("/api/v1/sessions").send({
      email: "john.doe@test.com",
      password: "123456",
    });
    session = response.body;
  });

  afterAll(async () => {
    await connection.clear();
    await connection.close();
  });

  it("should return a status code 200 and balance value when called", async () => {
    const sut = await request(app)
      .get("/api/v1/statements/balance")
      .set("Authorization", `Bearer ${session.token}`);

    expect(sut.status).toBe(200);
    expect(sut.body).toHaveProperty("balance");
    expect(sut.body.balance).toEqual(6.2);
    expect(sut.body).toHaveProperty("statement");
    expect(sut.body.statement).toHaveLength(3);
  });

  it("should return a status code 401, when is invalid user JWT token", async () => {
    const sut = await request(app)
      .get("/api/v1/statements/balance")
      .set("Authorization", `Bearer unlnown}`);

    expect(sut.status).toBe(401);
  });
});
