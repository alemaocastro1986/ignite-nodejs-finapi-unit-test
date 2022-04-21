import request from "supertest";

import { app } from "../../../../app";
import { connection } from "../../../../database";
import { IAuthenticateUserResponseDTO } from "../../../users/useCases/authenticateUser/IAuthenticateUserResponseDTO";
import { IGetBalanceResponse } from "../getBalance/GetBalanceUseCase";
import { IGetBalanceDTO } from "../getBalance/IGetBalanceDTO";

describe("GetBalanceController GET /api/v1/statements/:statement_id", () => {
  let session: IAuthenticateUserResponseDTO;
  let userBalance: IGetBalanceResponse;
  beforeAll(async () => {
    await connection.create();
    await connection.createStatements();

    const response = await request(app).post("/api/v1/sessions").send({
      email: "john.doe@test.com",
      password: "123456",
    });

    const balanceResponse = await request(app)
      .get("/api/v1/statements/balance")
      .set("Authorization", `Bearer ${response.body.token}`);

    session = response.body;
    userBalance = balanceResponse.body;
  });

  afterAll(async () => {
    await connection.clear();
    await connection.close();
  });

  it("should return a status code 200 and balance value when called", async () => {
    const sut = await request(app)
      .get(`/api/v1/statements/${userBalance.statement[0].id}`)
      .set("Authorization", `Bearer ${session.token}`);

    expect(sut.status).toBe(200);
    expect(sut.body).toEqual({
      amount: expect.any(String),
      created_at: expect.any(String),
      description: expect.any(String),
      id: expect.any(String),
      type: expect.any(String),
      updated_at: expect.any(String),
      user_id: expect.any(String),
    });
  });

  it("should return a status code 401, when is invalid user JWT token", async () => {
    const sut = await request(app)
      .get(`/api/v1/statements/${userBalance.statement[0].id}`)
      .set("Authorization", `Bearer unknown}`);

    expect(sut.status).toBe(401);
  });

  it("should return a status code 400, when statement_id not exists", async () => {
    const sut = await request(app)
      .get(`/api/v1/statements/anything_id`)
      .set("Authorization", `Bearer ${session.token}}`);

    expect(sut.status).toBe(401);
  });
});
