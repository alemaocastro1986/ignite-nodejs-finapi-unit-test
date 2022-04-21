import request from "supertest";

import { connection } from "../../../../database";
import { app } from "../../../../app";

describe("AuthenticateUserController POST /api/v1/sessions", () => {
  beforeAll(async () => {
    await connection.create();
    await connection.createTestUser();
  });

  afterAll(async () => {
    await connection.clear();
    await connection.close();
  });

  it("should return status code 200 and user, when all params is valid", async () => {
    const sut = await request(app).post("/api/v1/sessions").send({
      email: "john.doe@test.com",
      password: "123456",
    });

    expect(sut.status).toBe(200);
    expect(sut.body).toEqual(
      expect.objectContaining({
        token: expect.any(String),
        user: {
          id: expect.any(String),
          name: "John Doe",
          email: "john.doe@test.com",
        },
      })
    );
  });

  it("Should return status code 401, when user credentials is invalid", async () => {
    const [sut1, sut2] = await Promise.all([
      await request(app).post("/api/v1/sessions").send({
        email: "unknow@testing.com",
        password: "testing123",
      }),
      await request(app).post("/api/v1/sessions").send({
        email: "john.doe@test.com",
        password: "anything",
      }),
    ]);

    expect(sut1.status).toBe(401);
    expect(sut2.status).toBe(401);
  });
});
