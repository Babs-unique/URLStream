import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import type { Request } from 'express';
import { AuthService } from './auth.service';
import { loginDtos, userDtos } from './dtos/user.dtos';
import { AuthGuard } from './guards/auth.guard';

type AuthenticatedRequest = Request & {
  user: {
    sub: string;
    email: string;
  };
};

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  signUp(@Body() dto: userDtos): Promise<any> {
    return this.authService.register(dto);
  }
  
  @Post('logIn')
  signIn(@Body() dto: loginDtos): Promise<any> {
    return this.authService.logIn(dto);
  }

  @UseGuards(AuthGuard)
  @Get('me')
  me(@Req() req: AuthenticatedRequest): Promise<any> {
    const userId = req.user.sub;
    return this.authService.me(userId);
  }

  @UseGuards(AuthGuard)
  @Patch('me')
  @Post('updateUser')
  updateUser(@Req() req: AuthenticatedRequest, @Body() dto: userDtos): Promise<any> {
    const userId = req.user.sub;
    return this.authService.updateUser(userId, dto);
  }

  @UseGuards(AuthGuard)
  @Delete('me')
  @Post('deleteUser')
  deleteUser(@Req() req: AuthenticatedRequest): Promise<any> {
    const userId = req.user.sub;
    return this.authService.deleteUser(userId);
  }
}