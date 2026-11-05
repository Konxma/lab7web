import { INestApplication, ValidationPipe } from '@nestjs/common';
import { TrimPipe } from './common/pipes/trim.pipe';
import { GlobalExceptionFilter } from './common/filters/http-exception.filter';
import { TimingInterceptor } from './common/interceptors/timing.interceptor';

// Production startup and e2e checks use exactly the same pipeline configuration.
export function configureApp(app: INestApplication): void {
  app.useGlobalPipes(
    new TrimPipe(),
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
  );
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalInterceptors(new TimingInterceptor());
  app.enableShutdownHooks();
}
