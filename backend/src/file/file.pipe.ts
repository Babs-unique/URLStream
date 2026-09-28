import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { fileTypeFromBuffer } from 'file-type'; // 1. Changed to FromBuffer
import * as fs from 'fs';

@Injectable()
export class FlexibleFileValidationPipe implements PipeTransform {
  private readonly allowedBinaryMimes = [
    'image/jpeg', 'image/png', 'image/webp', 'image/gif',
    'application/pdf', 'text/plain', 'application/json', 'text/csv',
    'video/mp4', 'video/webm', 'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/webm',
  ];
  
  private readonly allowedTextExtensions = ['json', 'csv', 'txt'];

  async transform(file: Express.Multer.File): Promise<Express.Multer.File> {
    if (!file || !file.path) {
      throw new BadRequestException('No file uploaded.');
    }

    let fd: number | null = null;

    try {
      const fileExtension: string = file.originalname.split('.').pop()?.toLowerCase() ?? '';
      // 1. Open the file on disk for reading

      // 2. Read only the first 4100 bytes from disk synchronously
      const buffer = Buffer.alloc(4100);
      fd = fs.openSync(file.path, 'r');
      const bytesRead = fs.readSync(fd, buffer, 0, 4100, 0);
      
      // 3. CLOSE IT IMMEDIATELY. The file on disk is now completely unlocked.
      fs.closeSync(fd);
      fd = null; // Prevent the catch block from trying to close it again

      const sliceBuffer = buffer.subarray(0, bytesRead);

      // 4. Check for binary magic bytes using our safe memory slice
      const detectedType = await fileTypeFromBuffer(sliceBuffer);

      if (detectedType) {
        if (!this.allowedBinaryMimes.includes(detectedType.mime)) {
          this.cleanupFile(file.path);
          throw new BadRequestException('Invalid binary file type detected.');
        }
        return file;
      }

      // 5. Fallback for text files using the exact same pre-read memory slice
      if (this.allowedTextExtensions.includes(fileExtension)) {
        const isValidText = this.validateTextContent(sliceBuffer, fileExtension);
        if (!isValidText) {
          this.cleanupFile(file.path);
          throw new BadRequestException(`Malformed or invalid ${fileExtension.toUpperCase()} structure.`);
        }
        return file;
      }

      this.cleanupFile(file.path);
      throw new BadRequestException('File type could not be verified.');

    } catch (error) {
      // Emergency cleanup if fs.readSync crashes before reaching fs.closeSync
      if (fd !== null) {
        try { fs.closeSync(fd); } catch {}
      }
      this.cleanupFile(file.path);
      throw error instanceof BadRequestException 
        ? error 
        : new BadRequestException('File validation failed.');
    }
  }

  // Adjusted to accept the buffer directly so we don't reopen the file
  private validateTextContent(buffer: Buffer, extension: string): boolean {
    const content = buffer.toString('utf8').trim();

    // Check 1: Ensure it doesn't contain null bytes
    if (content.includes('\0')) {
      return false;
    }

    // Check 2: Structure validations
    if (extension === 'json') {
      return content.startsWith('{') || content.startsWith('[');
    }

    if (extension === 'csv') {
      return content.includes(',') || content.includes(';') || content.includes('\n');
    }

    if (extension === 'txt') {
      return true;
    }

    return false;
  }

  private cleanupFile(filePath: string) {
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (err) {
        console.error(`Cleanup failed for ${filePath}:`, err);
      }
    }
  }
}
