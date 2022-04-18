import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { IUsersRepository } from "../../repositories/IUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError";

describe("AuthenticateUserUseCase", () => {
  let userRepository: IUsersRepository;
  let authenticateUserUseCase: AuthenticateUserUseCase;
  let createUserUseCase: CreateUserUseCase;

  let fakeUserParams = {
    name: "John Doe",
    email: "John@testing.com",
    password: "123456",
  };

  beforeAll(async () => {
    userRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(userRepository);

    await createUserUseCase.execute(fakeUserParams);
  });

  beforeEach(() => {
    authenticateUserUseCase = new AuthenticateUserUseCase(userRepository);
  });

  it("should return an user and a token, when all parameters is valid", async () => {
    const sut = await authenticateUserUseCase.execute({
      email: fakeUserParams.email,
      password: fakeUserParams.password,
    });

    expect(sut).toHaveProperty("user");
    expect(sut).toHaveProperty("token");
    expect(sut.user).toEqual({
      id: expect.any(String),
      name: fakeUserParams.name,
      email: fakeUserParams.email,
    });
    expect(sut.token).toEqual(expect.any(String));
  });

  it("should return an error, when the email of user does not exists", async () => {
    try {
      await authenticateUserUseCase.execute({
        email: "unknown@test.com",
        password: fakeUserParams.password,
      });
    } catch (err) {
      expect(err).toBeInstanceOf(IncorrectEmailOrPasswordError);
      expect((err as any).message).toEqual("Incorrect email or password");
    }
  });

  it("should return an error, when the password of user is not match", async () => {
    try {
      await authenticateUserUseCase.execute({
        email: fakeUserParams.email,
        password: "invalid_pass",
      });
    } catch (err) {
      expect(err).toBeInstanceOf(IncorrectEmailOrPasswordError);
      expect((err as any).message).toEqual("Incorrect email or password");
    }
  });
});
