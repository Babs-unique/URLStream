import {
  Controller,
  UseGuards,
  Post,
  Req,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import type { Express, Request } from 'express';
import { FileService } from './file.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import {  FlexibleFileValidationPipe } from './file.pipe';

type AuthenticatedRequest = Request & {
  user: {
    sub: string;
    email: string;
  };
};

@Controller('files')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @UseGuards(AuthGuard)
  @Post()
  @UseInterceptors(FileInterceptor('file'))
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

    return this.fileService.upload(file, userId);
  }
}
