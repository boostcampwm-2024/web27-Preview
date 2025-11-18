import {
    Controller,
    Get,
    InternalServerErrorException,
    Post,
    Res,
    UnauthorizedException,
    UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Response } from "express";
import { setCookieConfig } from "@/config/cookie.config";
import { JwtPayload, JwtTokenPair } from "./jwt/jwt.decorator";
import { IJwtPayload, IJwtToken, IJwtTokenPair } from "./jwt/jwt.model";

@Controller("auth")
export class AuthController {
    constructor() {}

    @Post("github")
    @UseGuards(AuthGuard("github"))
    async githubCallback(
        @Res({ passthrough: true }) res: Response,
        @JwtTokenPair() pair: IJwtTokenPair
    ) {
        if (!pair) throw new InternalServerErrorException();
        return this.setCookie(res, pair.accessToken, pair.refreshToken);
    }

    @Get("whoami")
    @UseGuards(AuthGuard("jwt"))
    async handleWhoami(@JwtPayload() payload: IJwtPayload) {
        if (!payload) throw new UnauthorizedException();
        return payload;
    }

    @Get("refresh")
    @UseGuards(AuthGuard("jwt-refresh"))
    async handleRefresh(
        @Res({ passthrough: true }) res: Response,
        @JwtTokenPair() pair: IJwtTokenPair
    ) {
        if (!pair) throw new InternalServerErrorException();
        return this.setCookie(res, pair.accessToken);
    }

    @Post("login")
    @UseGuards(AuthGuard("local"))
    async login(@Res({ passthrough: true }) res: Response, @JwtTokenPair() pair: IJwtTokenPair) {
        if (!pair) throw new UnauthorizedException();
        return this.setCookie(res, pair.accessToken, pair.refreshToken);
    }

    private setCookie(res: Response, accessToken: IJwtToken, refreshToken?: IJwtToken) {
        res.cookie("accessToken", accessToken.token, {
            maxAge: accessToken.expireTime,
            ...setCookieConfig,
        });

        if (refreshToken)
            res.cookie("refreshToken", refreshToken.token, {
                maxAge: refreshToken.expireTime,
                ...setCookieConfig,
            });

        return {
            success: true,
        };
    }
}
