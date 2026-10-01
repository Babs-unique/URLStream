import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';

@Controller()
@ApiTags('Health')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Check that the API is responding' })
  @ApiOkResponse({
    description: 'The API greeting, wrapped by the global response interceptor.',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 200 },
        success: { type: 'boolean', example: true },
        data: { type: 'string', example: 'Hello World!' },
      },
    },
  })
  getHello(): string {
    return this.appService.getHello();
  }
}
