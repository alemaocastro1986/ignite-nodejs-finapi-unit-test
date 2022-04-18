import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { OperationType } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { CreateStatementError } from "./CreateStatementError";
import { CreateStatementUseCase } from "./CreateStatementUseCase";

describe("CreateStatementUseCase", () => {
  let usersRepostory: jest.Mocked<IUsersRepository>;
  let statementRepository: IStatementsRepository;

  let createStatementUseCase: CreateStatementUseCase;

  beforeEach(() => {
    usersRepostory = {
      findById: jest.fn().mockResolvedValue({
        id: "711336aa-0344-4fd8-b405-94e4f8a5ba7b",
        name: "Jane Doe",
        email: "jd88@testing.com",
      }),
      create: jest.fn(),
      findByEmail: jest.fn(),
    };
    statementRepository = new InMemoryStatementsRepository();

    createStatementUseCase = new CreateStatementUseCase(
      usersRepostory,
      statementRepository
    );
  });

  it("should return a new statement operation, when all parameters is valid", async () => {
    const sut = await createStatementUseCase.execute({
      amount: 200,
      description: "Freelance nodejs",
      type: OperationType.DEPOSIT,
      user_id: "711336aa-0344-4fd8-b405-94e4f8a5ba7b",
    });

    expect(sut).toEqual({
      amount: 200,
      description: "Freelance nodejs",
      id: expect.any(String),
      type: "deposit",
      user_id: "711336aa-0344-4fd8-b405-94e4f8a5ba7b",
    });
  });

  it("should return an error, when user is not found", async () => {
    try {
      await createStatementUseCase.execute({
        amount: 200,
        description: "Freelance nodejs",
        type: OperationType.DEPOSIT,
        user_id: "invalid-uuid",
      });
    } catch (err) {
      expect(err).toBeInstanceOf(CreateStatementError.UserNotFound);
    }
  });

  it("should return an error, when the instruction type is 'withdraw' and the amount is less than the balance", async () => {
    try {
      await createStatementUseCase.execute({
        amount: 200,
        description: "Freelance nodejs",
        type: OperationType.DEPOSIT,
        user_id: "711336aa-0344-4fd8-b405-94e4f8a5ba7b",
      });

      await createStatementUseCase.execute({
        amount: 201,
        description: "XBOX One game pass",
        type: OperationType.WITHDRAW,
        user_id: "711336aa-0344-4fd8-b405-94e4f8a5ba7b",
      });
    } catch (err) {
      expect(err).toBeInstanceOf(CreateStatementError.InsufficientFunds);
    }
  });
});
