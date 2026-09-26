import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import path from 'node:path';
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import type { Express } from 'express';

@Injectable()
export class FileService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly permanentDir = path.join(process.cwd(), 'uploads', 'permanent');

  async upload(file: Express.Multer.File, userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const temporaryPath = file.path;
    const permanentPath = path.join(this.permanentDir, file.filename);

    await fs.mkdir(this.permanentDir, { recursive: true });

    let fileRecord;

    try {
      fileRecord = await this.prisma.file.create({
        data: {
          storageKey: crypto.randomUUID(),
          originalName: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
          userId,
        },
      });

      await fs.rename(temporaryPath, permanentPath);

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
      } catch (deleteError) {
        console.error('Failed to delete temp file:', {
          temporaryPath,
          deleteError,
        });
      }

      const message = error instanceof Error ? error.message : 'Unknown file upload error';
      throw new BadRequestException(`Failed to save file: ${message}`);
    }
  }
}
