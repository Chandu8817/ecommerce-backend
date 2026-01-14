// user.service.test.ts
// Example unit test for UserService
import { UserService } from "../../src/services/user.service";
import { UserRepository } from "../../src/repositories/user.repository";

jest.mock("../../src/repositories/user.repository");

describe("UserService", () => {
  let userService: UserService;
  let userRepository: jest.Mocked<UserRepository>;

  beforeEach(() => {
    userRepository = new UserRepository() as jest.Mocked<UserRepository>;
    userService = new UserService();
    (userService as any).userRepository = userRepository;
  });

  it("should register a new user", async () => {
    userRepository.findByEmail.mockResolvedValue(null);
    userRepository.create.mockResolvedValue({ _id: "1", name: "Test", email: "test@example.com" });
    const user = await userService.register({ name: "Test", email: "test@example.com", password: "pass" });
    expect(user.name).toBe("Test");
    expect(userRepository.create).toHaveBeenCalled();
  });

  it("should throw if user exists", async () => {
    userRepository.findByEmail.mockResolvedValue({ _id: "1", name: "Test", email: "test@example.com" });
    await expect(userService.register({ name: "Test", email: "test@example.com", password: "pass" }))
      .rejects.toThrow();
  });
});
