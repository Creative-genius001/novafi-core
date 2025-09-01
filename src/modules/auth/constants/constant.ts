/* eslint-disable prettier/prettier */
export const jwtConstants = {
  access_token_secret: process.env.JWT_ACCESS_TOKEN_SECRET as string,
  refresh_token_secret: process.env.JWT_REFRESH_TOKEN_SECRET as string
};
