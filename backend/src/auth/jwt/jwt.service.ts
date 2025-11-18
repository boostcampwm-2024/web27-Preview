import { JwtService as ParentService } from "@nestjs/jwt";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { Transactional } from "typeorm-transactional";
import { UserRepository } from "../../user/user.repository";
import { DAY, HOUR } from "../../utils/time";
import { IJwtToken, IJwtTokenPair } from "./jwt.model";
import { UserInternalDto } from "@/user/dto/user.dto";
import { jwtConfig } from "@/config/jwt.config";

@Injectable()
export class JwtService {
    private static ACCESS_TOKEN_TIME = 3 * HOUR;
    private static REFRESH_TOKEN_TIME = 10 * DAY;

    constructor(
        private readonly parent: ParentService,
        private readonly userRepository: UserRepository
    ) {}

    @Transactional()
    public async createJwtToken(userData: UserInternalDto): Promise<IJwtTokenPair> {
        const accessToken = await this.createAccessToken(userData);
        const refreshToken = await this.createRefreshToken(userData.id);

        userData.refreshToken = refreshToken.token;
        await this.userRepository.updateUser(userData);

        return {
            accessToken,
            refreshToken,
        };
    }

    public async getNewAccessToken(id: number, refreshToken: string) {
        const user = await this.userRepository.getUserByUserId(id);

        if (!user) throw new UnauthorizedException("Invalid refresh token");
        if (user.refreshToken !== refreshToken)
            throw new UnauthorizedException("Refresh token expired!");

        return this.createAccessToken(user);
    }

    private async createAccessToken(user: UserInternalDto): Promise<IJwtToken> {
        const accessToken = this.parent.sign(
            {
                userId: user.id,
                username: user.username,
                loginType: user.loginType,
            },
            {
                secret: jwtConfig.accessTokenKey,
            }
        );

        return {
            token: accessToken,
            expireTime: JwtService.ACCESS_TOKEN_TIME,
        };
    }

    private async createRefreshToken(id: number): Promise<IJwtToken> {
        const refreshToken = this.parent.sign(
            {
                exp: Date.now() + JwtService.REFRESH_TOKEN_TIME,
            },
            {
                secret: jwtConfig.refreshTokenKey,
                audience: String(id),
            }
        );

        return {
            token: refreshToken,
            expireTime: JwtService.REFRESH_TOKEN_TIME,
        };
    }
}
