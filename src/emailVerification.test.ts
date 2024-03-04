import {
  createNewEmailVerification,
  generateEmailVerificationKey,
} from "./emailVerification";
import { createEmailVerificationRecord } from "./dynamoDbUtils";
import { sendVerificationEmail } from "./sesUtils";

jest.mock("./dynamoDbUtils");
jest.mock("./sesUtils");

const TEST_EMAIL = "test@example.com";
const TEST_EMAIL_B64_VALUE = "dGVzdEBleGFtcGxlLmNvbQ==";

describe("generateEmailVerificationKey", () => {
  it("includes the encoded email, followed by a separator, followed by 64 random chars", () => {
    const key = generateEmailVerificationKey(TEST_EMAIL);

    expect(key.startsWith(TEST_EMAIL_B64_VALUE)).toBeTruthy();

    const keyWithoutEmail = key.replace(TEST_EMAIL_B64_VALUE, "");
    expect(keyWithoutEmail.startsWith("_")).toBeTruthy();

    const keyWithoutSeparator = keyWithoutEmail.replace("_", "");
    expect(keyWithoutSeparator.length).toEqual(64);
    expect(keyWithoutSeparator).toMatch(/^[a-f0-9]{64}$/);
  });
});

describe("createNewEmailVerification", () => {
  it("calls DynamoDB with a valid email key", async () => {
    await createNewEmailVerification(TEST_EMAIL);
    expect(createEmailVerificationRecord).toHaveBeenCalledWith(
      expect.stringMatching(
        new RegExp(`^${TEST_EMAIL_B64_VALUE}_[a-f0-9]{64}$`),
      ),
      TEST_EMAIL,
      expect.any(Date),
    );
  });

  it("calls SES with the provided email and a body containing an HTTPS URL which contains the email key", async () => {
    await createNewEmailVerification(TEST_EMAIL);
    expect(sendVerificationEmail).toHaveBeenCalledWith(
      TEST_EMAIL,
      expect.stringMatching(
        new RegExp(
          `href="https://[^ "]*${encodeURI(TEST_EMAIL_B64_VALUE)}_[a-f0-9]{64}"`,
        ),
      ),
    );
  });
});
