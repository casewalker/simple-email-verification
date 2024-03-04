import { basicAuthHandler } from "./authorizer";
import { getValidAuthorizerKeys } from "./ssmUtils";

jest.mock("./ssmUtils");

const getValidAuthorizerKeysMock =
  getValidAuthorizerKeys as jest.MockedFunction<typeof getValidAuthorizerKeys>;

describe("basicAuthHandler", () => {
  const GOOD_KEY = "goodKey";

  beforeEach(() => {
    getValidAuthorizerKeysMock.mockImplementation(async () => [GOOD_KEY]);
  });

  it("returns isAuthorized==true when the Authorization header is good and the email is present", async () => {
    const response = await basicAuthHandler({
      headers: { Authorization: `Basic ${GOOD_KEY}` },
      body: new URLSearchParams({ email: "test@example.com" }).toString(),
    });

    expect(response.isAuthorized).toBeTruthy();
    expect(response.context?.email).toBe("test@example.com");
  });

  it.each([
    [null],
    [new URLSearchParams({ foo: "bar" }).toString()],
    [new URLSearchParams({ email: "" }).toString()],
  ])(
    "returns isAuthorized==false when the body is null, doesn't contain 'email', or the email is empty",
    async (body) => {
      const response = await basicAuthHandler({
        headers: { Authorization: `Basic ${GOOD_KEY}` },
        body,
      });

      expect(response.isAuthorized).toBeFalsy();
    },
  );

  it.each([[{}], [{ cookies: "yumYumYum" }]])(
    "returns isAuthorized==false when the headers are empty or don't contain 'Authorization'",
    async (headers) => {
      const response = await basicAuthHandler({
        headers,
        body: new URLSearchParams({ email: "test@example.com" }).toString(),
      });

      expect(response.isAuthorized).toBeFalsy();
    },
  );

  it("returns isAuthorized==false when the authorization string is bad", async () => {
    const response = await basicAuthHandler({
      headers: { Authorization: "Basic badKeySadness" },
      body: new URLSearchParams({ email: "test@example.com" }).toString(),
    });

    expect(response.isAuthorized).toBeFalsy();
  });
});
