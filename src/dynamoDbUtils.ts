interface DynamoDbEmailRecord {
  key: string;
  email: string;
  createdDate: Date;
  isVerified: boolean;
  verifiedDate?: Date;
}

export const createEmailVerificationRecord = async (key: string, email: string, dateCreated: Date) => {

};

export const attemptToVerifyRecord = async (key: string) => {

};
