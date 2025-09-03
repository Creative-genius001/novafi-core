/* eslint-disable prettier/prettier */
export interface SignupResponse {
    message: string,
    userId: string,
    maskedEmail: string
    email: string
} 

export interface LoginResponse {
    id: string,
    email: string,
    phone: string,
    accessToken: string,
    refreshToken: string
}