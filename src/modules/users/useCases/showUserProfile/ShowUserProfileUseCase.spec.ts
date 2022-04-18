import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { IUsersRepository } from "../../repositories/IUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ShowUserProfileError } from "./ShowUserProfileError";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";

describe("ShowUserProfileUseCase", () => {
  let userRepository: IUsersRepository;
  let showUserProfileUseCase: ShowUserProfileUseCase;
  let createUserUseCase: CreateUserUseCase;

  beforeEach(() => {
    userRepository = new InMemoryUsersRepository();
    showUserProfileUseCase = new ShowUserProfileUseCase(userRepository);
    createUserUseCase = new CreateUserUseCase(userRepository);
  });
  it("should return an user, when already exists valid id", async () => {
    const user = await createUserUseCase.execute({
      name: "Jane Doe",
      email: "jd@test.com",
      password: "123456",
    });

    const sut = await showUserProfileUseCase.execute(user.id as string);

    expect(sut).toEqual(user);
  });

  it("should return an error, when user not found", async () => {
    try {
      await showUserProfileUseCase.execute("nothing");
    } catch (err) {
      expect(err).toBeInstanceOf(ShowUserProfileError);
    }
  });
});
