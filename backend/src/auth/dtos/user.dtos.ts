import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class userDtos {
  @ApiProperty({ minLength: 2, example: 'Ada Lovelace' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  name: string;

  @ApiProperty({ format: 'email', example: 'ada@example.com' })
  @IsEmail()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  email: string;

  @ApiProperty({ minLength: 6, format: 'password', example: 'correct-horse-battery' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  password: string;
}

export class createUserDtos extends userDtos {}

export class updateUserDtos {
  @ApiProperty({ minLength: 2, example: 'Ada Lovelace' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  name: string;

  @ApiProperty({ format: 'email', example: 'ada@example.com' })
  @IsEmail()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  email: string;
}

export class loginDtos {
  @ApiProperty({ format: 'email', example: 'ada@example.com' })
  @IsEmail()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  email: string;

  @ApiProperty({ minLength: 6, format: 'password', example: 'correct-horse-battery' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  password: string;
}