import { 
    BadRequestException, 
    Injectable, 
    NotFoundException, 
    StreamableFile, 
    HttpException, 
    HttpStatus, 
    ForbiddenException 
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import path from 'node:path';
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import type { Express, Response } from 'express';
import { createReadStream } from 'node:fs';
import sanitize  from 'sanitize-filename';
import contentDisposition from 'content-disposition';

@Injectable()
export class FileService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly permanentDir = path.join(process.cwd(), 'storage', 'permanent');

  async upload(file: Express.Multer.File, userId: string) {
    const temporaryPath = file.path;

    // Check user existence first
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      await fs.unlink(temporaryPath).catch(() => undefined);
      throw new NotFoundException('User not found');
    }
    const existingFiles = await this.prisma.file.findMany({
      where: { userId },
      select: { size: true } 
    });

    const totalUsedStorage = existingFiles.reduce((sum, currentFile) => sum + currentFile.size, 0);

    const newTotalSize = totalUsedStorage + file.size;

    const quotaLimit = user.storageQuota ?? 0; 

    if (newTotalSize > quotaLimit) {
      await fs.unlink(temporaryPath).catch(() => undefined);
      throw new BadRequestException(
        `Storage quota exceeded. Available: ${Number(quotaLimit)  - totalUsedStorage} bytes. Attempted to upload: ${file.size} bytes.`
      );
    }

    const storageUUID = crypto.randomUUID();
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

      // Handle cross-device file moves safely
      try {
        await fs.rename(temporaryPath, permanentPath);
      } catch (renameError: any) {
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
        if (deleteError.code !== 'ENOENT') {
          console.error('Failed to delete temp file:', { temporaryPath, deleteError });
        }
      }
      const message = error instanceof Error ? error.message : 'Unknown file upload error';
      throw new BadRequestException(`Failed to save file: ${message}`);
    }
  }

  async stream(id: string, userId: string, range: string | undefined, res: Response) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const file = await this.prisma.file.findUnique({ where: { id } });
    if (!file) {
      throw new NotFoundException('File not found');
    }

    if (file.userId !== userId) {
      throw new ForbiddenException('File does not belong to user'); 
    }

    const permanentPath = path.join(this.permanentDir, file.storageKey);
    try {
      await fs.access(permanentPath);
    } catch {
      throw new NotFoundException('File not found on disk.');
    }

    // const encodedFileName = encodeURIComponent(file.originalName);
    // const disposition = `attachment; filename="${file.originalName}"; filename*=UTF-8''${encodedFileName}`;
    const safeFileName = sanitize(file.originalName);
    const disposition = (contentDisposition as any)(safeFileName, { type: 'attachment' });

    // Standard Full File Request(No Range)
    if (!range) {
      const fileStream = createReadStream(permanentPath);
      return new StreamableFile(fileStream, {
        type: file.mimeType,
        disposition: disposition,
        length: file.size,
      });
    }

    // Range Request (Partial Content)
    const fileStats = await fs.stat(permanentPath);
    const totalSize = fileStats.size;
    const parts = range.replace(/bytes=/, '').split('-');
    let start = parseInt(parts[0], 10);
    let end = parseInt(parts[1], 10);

    if (isNaN(start)) {
      start = totalSize - end;
      end = totalSize - 1;
    } else if (isNaN(end)) {
      end = totalSize - 1;
    }

    // Validate bounds
    if (start > end || start >= totalSize || end >= totalSize || start < 0) {
      res.setHeader('Content-Range', `bytes */${totalSize}`);
      throw new HttpException('Invalid Range', HttpStatus.REQUESTED_RANGE_NOT_SATISFIABLE);
    }

    const chunkSize = end - start + 1;
    const fileStream = createReadStream(permanentPath, { start, end });

    res.status(HttpStatus.PARTIAL_CONTENT);
    res.set({
      'Content-Range': `bytes ${start}-${end}/${totalSize}`,
      'Accept-Ranges': 'bytes',
    });

    return new StreamableFile(fileStream, {
      type: file.mimeType,
      disposition: disposition,
      length: chunkSize,
    });
  }

  async getFile(id: string, userId: string) { 
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const file = await this.prisma.file.findUnique({ where: { id } });
    if (!file) {
      throw new NotFoundException('File not found');
    }

    if (file.userId !== userId) {
      throw new ForbiddenException('File does not belong to user'); 
    }

    return {
      id: file.id,
      storageKey: file.storageKey,
      originalName: file.originalName,
      mimeType: file.mimeType,
      size: file.size,
    };
  }

  async getFiles(userId: string) { 
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.prisma.file.findMany({ where: { userId: userId } });
  }

  async deleteFile(id: string, userId: string): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const file = await this.prisma.file.findUnique({ where: { id } });
    
    if (!file) {
      return;
    }

    if (file.userId !== userId) {
      throw new ForbiddenException('File does not belong to user');
    }

    const permanentPath = path.join(this.permanentDir, file.storageKey);

    try {
      await fs.unlink(permanentPath);
    } catch (fsError: any) {
      if (fsError.code !== 'ENOENT') {
        console.error(`Failed to delete file from disk: ${permanentPath}`, fsError);
        throw new BadRequestException('Failed to delete physical file from storage');
      }
    }
    try {
      await this.prisma.file.delete({ where: { id } });
    } catch (dbError: any) {
      if (dbError.code !== 'P2025') {
        console.error(`Failed to remove file record from database: ${id}`, dbError);
        throw new BadRequestException('Failed to clean up database file record');
      }
    }
  }
}
