import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { IUsersRepository } from "../../repositories/IUsersRepository";
import { CreateUserError } from "./CreateUserError";
import { CreateUserUseCase } from "./CreateUserUseCase";

describe("CreateUserUseCase", () => {
  let userRepository: IUsersRepository;
  let createUserUseCase: CreateUserUseCase;

  const defaultUserParams = {
    email: "john.doe@finapi.com",
    name: "John Doe",
    password: "123456",
  };

  beforeEach(() => {
    userRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(userRepository);
  });
  it("should return a new user, when all parameters is valid", async () => {
    const sut = await createUserUseCase.execute(defaultUserParams);

    expect(sut).toEqual({
      ...defaultUserParams,
      id: expect.any(String),
      password: expect.any(String),
    });
  });

  it("should return an error, when already exists user with same email", async () => {
    try {
      await createUserUseCase.execute(defaultUserParams);
      await createUserUseCase.execute({
        ...defaultUserParams,
        name: "Jane Doe",
        email: "jd@fin_api.com",
      });
    } catch (error) {
      expect(error).toBeInstanceOf(CreateUserError);
    }
  });
});
