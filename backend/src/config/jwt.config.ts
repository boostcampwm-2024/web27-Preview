export const jwtConfig = {
    accessTokenKey:
        process.env.JWT_REFRESH_TOKEN_SECRET_KEY ||
        "DEwEmgw2xDjIrapTbkPtCry2y3Vl3wZXyldXQWwXOy5aRbhswvZr2AR6LCFevyzq",
    refreshTokenKey:
        process.env.JWT_REFRESH_TOKEN_SECRET_KEY ||
        "DEwEmgw2xDjIrapTbkPtCry2y3Vl3wZXyldXQWwXOy5aRbhswvZr2AR6LCFevyzq",
};
