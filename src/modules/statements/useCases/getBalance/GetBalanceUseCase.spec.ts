import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { OperationType } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { GetBalanceError } from "./GetBalanceError";
import { GetBalanceUseCase } from "./GetBalanceUseCase";

describe("GetBalanceUseCase", () => {
  let usersRepostory: jest.Mocked<IUsersRepository>;
  let statementRepository: IStatementsRepository;

  let getBalanceUseCase: GetBalanceUseCase;
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

    getBalanceUseCase = new GetBalanceUseCase(
      statementRepository,
      usersRepostory
    );
    createStatementUseCase = new CreateStatementUseCase(
      usersRepostory,
      statementRepository
    );
  });

  it("should return balance of user, when all params is valid", async () => {
    await createStatementUseCase.execute({
      user_id: "711336aa-0344-4fd8-b405-94e4f8a5ba7b",
      amount: 200,
      description: "Deposit test",
      type: OperationType.DEPOSIT,
    });
    const sut = await getBalanceUseCase.execute({
      user_id: "711336aa-0344-4fd8-b405-94e4f8a5ba7b",
    });

    expect(sut.balance).toEqual(200);
    expect(sut.statement).toHaveLength(1);
  });

  it("should return an error, when user is not found", async () => {
    try {
      await getBalanceUseCase.execute({
        user_id: "invalid_id",
      });
    } catch (ex) {
      expect(ex).toBeInstanceOf(GetBalanceError);
    }
  });
});
