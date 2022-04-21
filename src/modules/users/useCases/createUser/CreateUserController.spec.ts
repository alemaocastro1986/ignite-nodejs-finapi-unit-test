import request from "supertest";

import { connection } from "../../../../database";
import { app } from "../../../../app";

describe("CreateUserController POST /api/v1/users", () => {
  beforeAll(async () => {
    await connection.create();
  });

  afterAll(async () => {
    await connection.clear();
    await connection.close();
  });

  it("should return a new user and status code 200", async () => {
    const sut = await request(app).post("/api/v1/users").send({
      name: "Jane Doe",
      email: "jane.doe@testing.com",
      password: "testing123",
    });

    expect(sut.status).toEqual(201);
    expect(sut.body).toEqual({});
  });

  it("shold return an error with status code 400, when already exists user with same email", async () => {
    const sut = await request(app).post("/api/v1/users").send({
      name: "Jane Doe",
      email: "jane.doe@testing.com",
      password: "testing123",
    });

    expect(sut.status).toEqual(400);
    expect(sut.body).toEqual({ message: "User already exists" });
  });
});
