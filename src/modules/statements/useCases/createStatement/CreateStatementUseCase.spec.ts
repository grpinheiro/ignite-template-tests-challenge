import { stat } from "node:fs";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { AuthenticateUserUseCase } from "../../../users/useCases/authenticateUser/AuthenticateUserUseCase";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementError } from "./CreateStatementError";
import { CreateStatementUseCase } from "./CreateStatementUseCase";
import { ICreateStatementDTO } from "./ICreateStatementDTO";

let inMemoryStatementsRepository: InMemoryStatementsRepository;
let inMemoryUserRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let createStatementUseCase: CreateStatementUseCase;
let authenticateUserUseCase: AuthenticateUserUseCase;

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
  TRANSFER = 'transfer',
}

describe("Create Statement", () => {
  beforeEach(()=>{
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    inMemoryUserRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUserRepository);
    authenticateUserUseCase = new AuthenticateUserUseCase(inMemoryUserRepository);
    createStatementUseCase = new CreateStatementUseCase(inMemoryUserRepository, inMemoryStatementsRepository);
  });

  it("should be able to create a new deposit", async () => {
    const user: ICreateUserDTO = {
      name: "John Doe",
      email: "johndoe@test.com",
      password: "123456"
    };

    await createUserUseCase.execute(user);

    const result = await authenticateUserUseCase.execute({
      email: user.email,
      password: user.password
    });

    const deposit: ICreateStatementDTO = {
      user_id: result.user.id,
      type: 'deposit' as OperationType,
      amount: 100,
      description: "test deposit"
    };

    const statement = await createStatementUseCase.execute(deposit);

    expect(statement).toHaveProperty("id");
    expect(statement).toHaveProperty("amount");
    expect(statement).toHaveProperty("type");
    expect(statement).toHaveProperty("description");
  });

  it("should be able to create a new withdraw", async () => {
    const user: ICreateUserDTO = {
      name: "John Doe",
      email: "johndoe@test.com",
      password: "123456"
    };

    await createUserUseCase.execute(user);

    const result = await authenticateUserUseCase.execute({
      email: user.email,
      password: user.password
    });

      const deposit: ICreateStatementDTO = {
      user_id: result.user.id,
      type: 'deposit' as OperationType,
      amount: 200,
      description: "test deposit"
    };

    await createStatementUseCase.execute(deposit);

    const withdraw: ICreateStatementDTO = {
      user_id: result.user.id,
      type: 'withdraw' as OperationType,
      amount: 200,
      description: "test deposit"
    };

    const statement = await createStatementUseCase.execute(withdraw);

    expect(statement).toHaveProperty("id");
    expect(statement).toHaveProperty("amount");
    expect(statement).toHaveProperty("type");
    expect(statement).toHaveProperty("description");
  });

  it("should not be able to create a new withdraw with insufficient founds available", async () => {

      const user: ICreateUserDTO = {
        name: "John Doe",
        email: "johndoe@test.com",
        password: "123456"
      };

      await createUserUseCase.execute(user);

      const result = await authenticateUserUseCase.execute({
        email: user.email,
        password: user.password
      });

      expect(async () => {

      const withdraw: ICreateStatementDTO = {
        user_id: result.user.id,
        type: 'withdraw' as OperationType,
        amount: 200,
        description: "test deposit"
      };

      await createStatementUseCase.execute(withdraw);
    }).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds);
  });

  it("should not be able to create a statement with user not found", () => {
    expect(async () => {
        const deposit: ICreateStatementDTO = {
        user_id: "not-found",
        type: 'deposit' as OperationType,
        amount: 100,
        description: "test deposit"
      };

      await createStatementUseCase.execute(deposit);
    }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound);
  });
});
