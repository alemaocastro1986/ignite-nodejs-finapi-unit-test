import { hash } from "bcryptjs";
import {
  createConnection,
  getConnection,
  getConnectionOptions,
  getManager,
} from "typeorm";
import {
  OperationType,
  Statement,
} from "../modules/statements/entities/Statement";
import { User } from "../modules/users/entities/User";

const connection = {
  async create() {
    const defaultOptions = await getConnectionOptions();

    const conn = await createConnection(
      Object.assign(defaultOptions, {
        database:
          process.env.NODE_ENV === "test"
            ? "fin_api_test"
            : defaultOptions.database,
      })
    );

    await conn.runMigrations();
  },

  async close() {
    await getConnection().dropDatabase();
    await getConnection().close();
  },

  async clear() {
    const connection = getConnection();
    const entities = connection.entityMetadatas;

    entities.forEach(async (entity) => {
      const repository = connection.getRepository(entity.name);
      await repository.query(`DELETE FROM ${entity.tableName}`);
    });
  },

  async createTestUser() {
    await getConnection();

    const userTest = new User();
    userTest.name = "John Doe";
    userTest.email = "john.doe@test.com";
    userTest.password = await hash("123456", 8);

    await getManager().save(userTest);
  },

  async createStatements() {
    const userTest = new User();
    userTest.name = "John Doe";
    userTest.email = "john.doe@test.com";
    userTest.password = await hash("123456", 8);

    const { id: user_id } = await getManager().save(userTest);

    const statement1 = new Statement();
    statement1.amount = 5.5;
    statement1.description = "Salary";
    statement1.type = OperationType.DEPOSIT;
    statement1.user_id = user_id as string;

    const statement2 = new Statement();
    statement2.amount = 1.7;
    statement2.description = "Unknown Group";
    statement2.type = OperationType.DEPOSIT;
    statement2.user_id = user_id as string;

    const statement3 = new Statement();
    statement3.amount = 1;
    statement3.description = "Investiments";
    statement3.type = OperationType.WITHDRAW;
    statement3.user_id = user_id as string;

    await getManager().save([statement1, statement2, statement3]);
  },
};

export { connection };
