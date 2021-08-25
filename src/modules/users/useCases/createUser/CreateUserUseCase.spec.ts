import { rejects } from "node:assert";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserError } from "./CreateUserError";
import { CreateUserUseCase } from "./CreateUserUseCase";

describe("Create User",()=>{
  let createUserUseCase: CreateUserUseCase;
  let usersRepositoryInMemory: InMemoryUsersRepository;

  beforeEach(()=>{
    usersRepositoryInMemory = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory);
  });

  it("should be able to create a new user", async () =>{
    const user = await createUserUseCase.execute({
      name: "Test User",
      email: "user@test.com",
      password: "123456",
    });

    expect(user).toHaveProperty("id");
    expect(user).toHaveProperty("name");
    expect(user).toHaveProperty("email");
    expect(user).toHaveProperty("password");
  });

  it("should not be able to create user with same password", async ()=>{
    await createUserUseCase.execute({
      name: "Test User 01",
      email: "user@test.com",
      password: "123456",
    });

    expect(async () => {
      await createUserUseCase.execute({
        name: "Test User 02",
        email: "user@test.com",
        password: "654321",
      });
    }).rejects.toBeInstanceOf(CreateUserError);
  })
});
