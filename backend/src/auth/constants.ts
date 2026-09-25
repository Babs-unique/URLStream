import { ConfigService } from '@nestjs/config';

const configService = new ConfigService();

interface JwtConfig {
  secret: string;
}

export const jwtConstants: JwtConfig = {
  secret: configService.getOrThrow<string>('JWT_SECRET'),
};