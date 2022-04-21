import request from "supertest";

import { connection } from "../../../../database";
import { app } from "../../../../app";

describe("ShowUserProfileController GET /api/v1/profile", () => {
  beforeAll(async () => {
    await connection.create();
    await connection.createTestUser();
  });

  afterAll(async () => {
    await connection.clear();
    await connection.close();
  });

  it("should return user info, when token is valid", async () => {
    const {
      body: { token },
    } = await request(app).post("/api/v1/sessions").send({
      email: "john.doe@test.com",
      password: "123456",
    });

    const sut = await request(app)
      .get("/api/v1/profile")
      .set("Authorization", `Bearer ${token}`);

    expect(sut.body).toEqual({
      created_at: expect.any(String),
      email: "john.doe@test.com",
      id: expect.any(String),
      name: "John Doe",
      updated_at: expect.any(String),
    });
  });

  it("should return an error with status code 401, when invalid token", async () => {
    const sut = await request(app)
      .get("/api/v1/profile")
      .set("Authorization", `Bearer invalid_token`);

    expect(sut.status).toEqual(401);
  });
});
