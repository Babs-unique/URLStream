import {
    BadRequestException,
    Injectable,
    NotFoundException 
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import path from 'node:path';
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import type { Express } from 'express';

@Injectable()
export class FileService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly permanentDir = path.join(process.cwd(), 'storage', 'permanent');

  async upload(file: Express.Multer.File, userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }
    const storageUUID = crypto.randomUUID();
    const temporaryPath = file.path;
    const permanentPath = path.join(this.permanentDir, storageUUID);

    await fs.mkdir(this.permanentDir, { recursive: true });

    let fileRecord;

    try {
      fileRecord = await this.prisma.file.create({
        data: {
          storageKey: storageUUID,
          originalName: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
          userId,
        },
      });

      //CROSS-DEVICE MOVE FIX
      try {
        // Fast move (Works if folders are on the same partition)
        await fs.rename(temporaryPath, permanentPath);
      } catch (renameError: any) {
        // Fallback move (If directories are on different drive partitions/Docker volumes)
        if (renameError.code === 'EXDEV') {
          await fs.copyFile(temporaryPath, permanentPath);
          await fs.unlink(temporaryPath);
        } else {
          throw renameError;
        }
      }

      return {
        id: fileRecord.id,
        storageKey: fileRecord.storageKey,
        originalName: fileRecord.originalName,
        mimeType: fileRecord.mimeType,
        size: fileRecord.size,
      };
    } catch (error) {
      if (fileRecord?.id) {
        await this.prisma.file.delete({ where: { id: fileRecord.id } }).catch(() => undefined);
      }

      try {
        await fs.unlink(temporaryPath);
      } catch (deleteError: any) {
        // If the error was an EXDEV error and it already wiped the temp file, ignore this error
        if (deleteError.code !== 'ENOENT') {
          console.error('Failed to delete temp file:', {
            temporaryPath,
            deleteError,
          });
        }
      }

      const message = error instanceof Error ? error.message : 'Unknown file upload error';
      throw new BadRequestException(`Failed to save file: ${message}`);
    }
  }
}
