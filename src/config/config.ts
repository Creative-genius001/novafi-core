/* eslint-disable prettier/prettier */
const config = {
    SMTP_USERNAME: process.env.SMTP_USER_NAME as string,
    SMTP_PASSWORD: process.env.SMTP_PASSWORD as string,
    SUMSUB_BASE_URL: process.env.SUMSUB_BASE_URL as string,
    SUMSUB_API_TOKEN: process.env.SUMSUB_API_TOKEN as string,
    SUMSUB_API_SECRET: process.env.SUMSUB_API_SECRET as string,
    FLUTTERWAVE_CLIENT_ID: process.env.FLUTTERWAVE_CLIENT_ID as string,
    FLUTTERWAVE_CLIENT_SECRET: process.env.FLUTTERWAVE_CLIENT_SECRET as string,
    FLUTTERWAVE_ENCRYPTION_KEY: process.env.FLUTTERWAVE_ENCRYPTION_KEY as string,
    FLUTTERWAVE_ACCESS_TOKEN: process.env.FLUTTERWAVE_ACCESS_TOKEN as string,
    FLUTTERWAVE_SECRET_KEY: process.env.FLUTTERWAVE_SECRET_KEY as string,
    FIREBLOCKS_BASE_PATH: process.env.FIREBLOCKS_BASE_PATH as string,
    FIREBLOCKS_API_KEY: process.env.FIREBLOCKS_API_KEY as string,
    FIREBLOCKS_SECRET_KEY: process.env.FIREBLOCKS_SECRET_KEY as string,
} as const

export { config };