/* eslint-disable prettier/prettier */
export function maskEmail(email: string): string {

  const regex = /^([^@]+)@(.+)$/;
  const match = email.match(regex);

  if (!match || match.length < 3) {
    return email;
  }

  const username = match[1];
  const domain = match[2];

 
  const firstTwoChars = username.slice(0, 2);

  const maskedUsername = `${firstTwoChars}*****`;

  return `${maskedUsername}@${domain}`;
}


