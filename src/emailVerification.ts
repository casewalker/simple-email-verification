import { webcrypto } from "node:crypto";
import { API_URL } from "./constants";
import { createEmailVerificationRecord } from "./dynamoDbUtils";
import { sendVerificationEmail } from "./sesUtils";

export const generateEmailVerificationKey = (email: string): string => {
  const uuids = webcrypto.randomUUID() + webcrypto.randomUUID();
  const cleanedUuids = uuids.replaceAll("-", "");
  return `${btoa(email)}_${cleanedUuids}`;
};

const getBody = (key: string): string =>
  "Thank you for signing up! Please verify your email by " +
  `<a href="${API_URL}/verify/${encodeURI(key)}">clicking here</a>.`;

/**
 * To verify an email:
 *   1. Generate the verification key
 *   2. Store the record
 *   3. Send the verification email
 */
export const createNewEmailVerification = async (
  email: string,
): Promise<void> => {
  const key = generateEmailVerificationKey(email);
  await createEmailVerificationRecord(key, email, new Date());
  await sendVerificationEmail(email, getBody(key));
};
