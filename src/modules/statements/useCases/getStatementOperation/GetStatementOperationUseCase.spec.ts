import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { OperationType, Statement } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { GetStatementOperationError } from "./GetStatementOperationError";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";

describe("GetStatementOperationUseCase", () => {
  let usersRepostory: jest.Mocked<IUsersRepository>;
  let statementRepository: IStatementsRepository;

  let getStatementOperationUseCase: GetStatementOperationUseCase;
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

    getStatementOperationUseCase = new GetStatementOperationUseCase(
      usersRepostory,
      statementRepository
    );
    createStatementUseCase = new CreateStatementUseCase(
      usersRepostory,
      statementRepository
    );
  });

  it("should return a statement operation, when all params is valid", async () => {
    const statement = await createStatementUseCase.execute({
      user_id: "711336aa-0344-4fd8-b405-94e4f8a5ba7b",
      amount: 5500,
      description: "Month salary",
      type: OperationType.DEPOSIT,
    });
    const sut = await getStatementOperationUseCase.execute({
      statement_id: statement.id as string,
      user_id: "711336aa-0344-4fd8-b405-94e4f8a5ba7b",
    });

    expect(sut).toBeInstanceOf(Statement);
    expect(sut).toEqual({
      amount: 5500,
      description: "Month salary",
      id: expect.any(String),
      type: "deposit",
      user_id: "711336aa-0344-4fd8-b405-94e4f8a5ba7b",
    });
  });

  it("should return an error, when user is not found", async () => {
    try {
      usersRepostory.findById.mockImplementationOnce(
        async (id: string) => undefined
      );

      await getStatementOperationUseCase.execute({
        user_id: "invalid_id",
        statement_id: "cc1db323-b4e1-45e0-afdc-86eeeb269efa",
      });
    } catch (ex) {
      expect(ex).toBeInstanceOf(GetStatementOperationError.UserNotFound);
    }
  });

  it("should return an error, when statement_id is not found", async () => {
    try {
      await getStatementOperationUseCase.execute({
        user_id: "711336aa-0344-4fd8-b405-94e4f8a5ba7b",
        statement_id: "invalid_statement_id",
      });
    } catch (ex) {
      expect(ex).toBeInstanceOf(GetStatementOperationError.StatementNotFound);
    }
  });
});
