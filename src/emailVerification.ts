import { webcrypto } from "node:crypto";
import { createEmailVerificationRecord } from "./dynamoDbUtils";
import { sendVerificationEmail } from "./sesUtils";

const  BODY_TEMPLATE =
  `Thank you for signing up! Please verify your email by <a href="">clicking here</a>.`;

export const generateEmailVerificationKey = (email: string): string => {
  const uuids = webcrypto.randomUUID() + webcrypto.randomUUID();
  const cleanedUuids = uuids.replaceAll("-", "");
  return `${btoa(email)}_${cleanedUuids}`;
};

/**
 * To verify an email:
 *   1. Generate the verification key
 *   2. Store the record
 *   3. Send the verification email
 */
export const createNewEmailVerification = async (email: string) => {
  const key = generateEmailVerificationKey(email);
  const body = "";
  await Promise.all([
    createEmailVerificationRecord(key, email, new Date()),
    sendVerificationEmail(email, `<a href="https://localhost:8080/verify/${encodeURI(key)}">Click here</a> to verify your email for the New Jersey Office of Innovation.`),
  ]);
};
