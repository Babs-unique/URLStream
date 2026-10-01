import {
  Controller,
  UseGuards,
  Post,
  Req,
  Get,
  Param,
  Headers,
  Res,
  Delete,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  HttpStatus,
  HttpException,
  ParseUUIDPipe,
  StreamableFile
} from '@nestjs/common';
import type { Express, Request } from 'express';
import { FileService } from './file.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import {  FlexibleFileValidationPipe } from './file.pipe';
import type { Response } from 'express'
import {
  ApiBody,
  ApiCookieAuth,
  ApiConsumes,
  ApiCreatedResponse,
  ApiHeader,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiProduces,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AUTH_COOKIE_NAME } from '../auth/cookie.constants.js';

type AuthenticatedRequest = Request & {
  user: {
    sub: string;
    email: string;
  };
};

@Controller('files')
@ApiTags('Files')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @UseGuards(AuthGuard)
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  @ApiCookieAuth(AUTH_COOKIE_NAME)
  @ApiOperation({ summary: 'Upload a file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'JPEG, PNG, WebP, GIF, PDF, TXT, JSON, CSV, MP4, WebM, MP3, WAV, or OGG; 1 KB to 100 MB.',
        },
      },
    },
  })
  @ApiCreatedResponse({
    description: 'File uploaded.',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 201 },
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            storageKey: { type: 'string', format: 'uuid' },
            originalName: { type: 'string' },
            mimeType: { type: 'string' },
            size: { type: 'integer', format: 'int32' },
          },
        },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Authentication cookie is missing, invalid, or expired.' })
  @ApiResponse({ status: 400, description: 'Invalid file, missing file, or storage quota exceeded.' })
  @ApiResponse({ status: 422, description: 'File is too small or its content type is unsupported.' })
  uploadFile(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new FileTypeValidator({
            fileType: /(image\/jpeg|image\/png|image\/webp|image\/gif|application\/pdf|text\/plain|application\/json|text\/csv|video\/mp4|video\/webm|audio\/mpeg|audio\/wav|audio\/ogg|audio\/webm)/i,
            skipMagicNumbersValidation: true
          }),
          new MaxFileSizeValidator({
            maxSize: 100 * 1024 * 1024,
            message: 'File is too large. Maximum size is 100MB.',
          }),
        ],
        // exceptionFactory: () =>
        //   new HttpException(
        //     'Validation failed',
        //     HttpStatus.UNPROCESSABLE_ENTITY,
        //   ),
      }),
      FlexibleFileValidationPipe,
    )
    file: Express.Multer.File,
    @Req() req: AuthenticatedRequest,
  ) {
    if (file.size < 1024) {
      throw new HttpException(
        'File is too small. Minimum size required is 1KB.',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'application/pdf',
      'text/plain',
      'application/json',
      'text/csv',
      'video/mp4',
      'video/webm',
      'audio/mpeg',
      'audio/wav',
      'audio/ogg',
      'audio/webm',
    ];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new HttpException(
        'File type is not supported.',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const userId = req.user.sub;
    if (!userId) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    return this.fileService.upload(file, userId);
  }
  @UseGuards(AuthGuard)
  @Get(':id/content')
  @ApiCookieAuth(AUTH_COOKIE_NAME)
  @ApiOperation({ summary: 'Download or stream a file, optionally by byte range' })
  @ApiParam({ name: 'id', format: 'uuid', description: 'File ID.' })
  @ApiHeader({
    name: 'Range',
    required: false,
    description: 'Optional byte range, for example `bytes=0-1023`.',
  })
  @ApiProduces(
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'application/pdf',
    'text/plain',
    'application/json',
    'text/csv',
    'video/mp4',
    'video/webm',
    'audio/mpeg',
    'audio/wav',
    'audio/ogg',
    'audio/webm',
  )
  @ApiOkResponse({ description: 'File content.' , schema: { type: 'string', format: 'binary' } })
  @ApiResponse({ status: 206, description: 'Requested byte range of the file.', schema: { type: 'string', format: 'binary' } })
  @ApiUnauthorizedResponse({ description: 'Authentication cookie is missing, invalid, or expired.' })
  @ApiResponse({ status: 416, description: 'Requested byte range is not satisfiable.' })
  @ApiResponse({ status: 404, description: 'File was not found.' })
  @ApiResponse({ status: 403, description: 'File does not belong to the authenticated user.' })
  streamFile(
    @Param('id',  ParseUUIDPipe) id: string,
    @Req() req: AuthenticatedRequest,
    @Headers('range') range: string,
    @Res({ passthrough: true }) res:Response
  ):Promise<StreamableFile> {
    const userId = req.user.sub;
    if(!userId){
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    return this.fileService.stream(id, userId , range, res);
  }
  @UseGuards(AuthGuard)
  @Get(':id')
  @ApiCookieAuth(AUTH_COOKIE_NAME)
  @ApiOperation({ summary: 'Get file metadata' })
  @ApiParam({ name: 'id', format: 'uuid', description: 'File ID.' })
  @ApiOkResponse({
    description: 'File metadata.',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 200 },
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            storageKey: { type: 'string', format: 'uuid' },
            originalName: { type: 'string' },
            mimeType: { type: 'string' },
            size: { type: 'integer', format: 'int32' },
          },
        },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Authentication cookie is missing, invalid, or expired.' })
  @ApiResponse({ status: 404, description: 'File was not found.' })
  @ApiResponse({ status: 403, description: 'File does not belong to the authenticated user.' })
  getFile(@Param('id',  ParseUUIDPipe) id: string, @Req() req: AuthenticatedRequest) {
    const userId = req.user.sub;
    if(!userId){
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }
    return this.fileService.getFile(id, userId);
  }

  @UseGuards(AuthGuard)
  @Get()
  @ApiCookieAuth(AUTH_COOKIE_NAME)
  @ApiOperation({ summary: 'List the authenticated user’s files' })
  @ApiOkResponse({
    description: 'Files owned by the authenticated user.',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 200 },
        success: { type: 'boolean', example: true },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              storageKey: { type: 'string', format: 'uuid' },
              userId: { type: 'string', format: 'uuid' },
              originalName: { type: 'string' },
              mimeType: { type: 'string' },
              size: { type: 'integer', format: 'int32' },
              createdAt: { type: 'string', format: 'date-time' },
            },
          },
        },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Authentication cookie is missing, invalid, or expired.' })
  getFiles(@Req() req: AuthenticatedRequest){
    const userId = req.user.sub;
    if(!userId){
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }
    return this.fileService.getFiles(userId);
  }
  @UseGuards(AuthGuard)
  @Delete(':id')
  @ApiCookieAuth(AUTH_COOKIE_NAME)
  @ApiOperation({ summary: 'Delete a file' })
  @ApiParam({ name: 'id', format: 'uuid', description: 'File ID.' })
  @ApiOkResponse({ description: 'File deleted. The response data is empty.' })
  @ApiUnauthorizedResponse({ description: 'Authentication cookie is missing, invalid, or expired.' })
  @ApiResponse({ status: 404, description: 'Authenticated user was not found.' })
  @ApiResponse({ status: 403, description: 'File does not belong to the authenticated user.' })
  deleteFile(@Param('id',  ParseUUIDPipe) id: string, @Req() req: AuthenticatedRequest){
    const userId = req.user.sub;
    if(!userId){
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }
    return this.fileService.deleteFile(id, userId);
  }

}
