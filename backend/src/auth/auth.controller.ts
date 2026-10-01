import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { loginDtos, userDtos } from './dtos/user.dtos';
import { AuthGuard } from './guards/auth.guard';
import { AUTH_COOKIE_NAME } from './cookie.constants.js';
import {
  ApiBody,
  ApiCookieAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

type AuthenticatedRequest = Request & {
  user: {
    sub: string;
    email: string;
  };
};

@Controller('auth')
@ApiTags('Authentication')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a user account' })
  @ApiBody({ type: userDtos })
  @ApiCreatedResponse({
    description: 'Account created.',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 201 },
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string', example: 'Ada Lovelace' },
            email: { type: 'string', format: 'email', example: 'ada@example.com' },
          },
        },
      },
    },
  })
  @ApiConflictResponse({ description: 'An account with this email already exists.' })
  signUp(@Body() dto: userDtos): Promise<any> {
    return this.authService.register(dto);
  }
  
  @Post('logIn')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Log in and set an HTTP-only authentication cookie' })
  @ApiBody({ type: loginDtos })
  @ApiOkResponse({
    description: 'Authenticated user. The JWT is set in an HTTP-only cookie.',
    headers: {
      'Set-Cookie': {
        description: 'HTTP-only authentication cookie.',
        schema: { type: 'string' },
      },
    },
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 200 },
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            user: {
              type: 'object',
              properties: {
                id: { type: 'string', format: 'uuid' },
                name: { type: 'string' },
                email: { type: 'string', format: 'email' },
              },
            },
          },
        },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Email or password is invalid.' })
  async signIn(
    @Body() dto: loginDtos,
    @Res({ passthrough: true }) response: Response,
  ): Promise<{ user: { id: string; name: string; email: string } }> {
    const result = await this.authService.logIn(dto);
    response.cookie(AUTH_COOKIE_NAME, result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });
    return { user: result.user };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Clear the authentication cookie' })
  @ApiOkResponse({ description: 'Authentication cookie cleared.' })
  signOut(@Res({ passthrough: true }) response: Response): { message: string } {
    response.clearCookie(AUTH_COOKIE_NAME, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });
    return { message: 'Logged out' };
  }

  @UseGuards(AuthGuard)
  @Get('me')
  @ApiCookieAuth(AUTH_COOKIE_NAME)
  @ApiOperation({ summary: 'Get the authenticated user profile' })
  @ApiOkResponse({
    description: 'Authenticated user profile.',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 200 },
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            email: { type: 'string', format: 'email' },
            storageQuota: { type: 'integer', format: 'int64' },
            createdAt: { type: 'string', format: 'date-time' },
            deletedAt: { type: 'string', format: 'date-time', nullable: true },
          },
        },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Authentication cookie is missing, invalid, or expired.' })
  me(@Req() req: AuthenticatedRequest): Promise<any> {
    const userId = req.user.sub;
    return this.authService.me(userId);
  }

  @UseGuards(AuthGuard)
  @Patch('me')
  @Post('updateUser')
  @ApiCookieAuth(AUTH_COOKIE_NAME)
  @ApiOperation({ summary: 'Update the authenticated user name and email' })
  @ApiBody({ type: userDtos })
  @ApiOkResponse({
    description: 'Updated user record without the password hash.',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 200 },
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            email: { type: 'string', format: 'email' },
            storageQuota: { type: 'integer', format: 'int64' },
            createdAt: { type: 'string', format: 'date-time' },
            deletedAt: { type: 'string', format: 'date-time', nullable: true },
          },
        },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Authentication cookie is missing, invalid, or expired.' })
  @ApiConflictResponse({ description: 'The requested email is already in use.' })
  updateUser(@Req() req: AuthenticatedRequest, @Body() dto: userDtos): Promise<any> {
    const userId = req.user.sub;
    return this.authService.updateUser(userId, dto);
  }

  @UseGuards(AuthGuard)
  @Delete('me')
  @Post('deleteUser')
  @ApiCookieAuth(AUTH_COOKIE_NAME)
  @ApiOperation({ summary: 'Delete the authenticated user account' })
  @ApiOkResponse({
    description: 'Deleted user record without the password hash.',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 200 },
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            email: { type: 'string', format: 'email' },
            storageQuota: { type: 'integer', format: 'int64' },
            createdAt: { type: 'string', format: 'date-time' },
            deletedAt: { type: 'string', format: 'date-time', nullable: true },
          },
        },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Authentication cookie is missing, invalid, or expired.' })
  deleteUser(@Req() req: AuthenticatedRequest): Promise<any> {
    const userId = req.user.sub;
    return this.authService.deleteUser(userId);
  }
}