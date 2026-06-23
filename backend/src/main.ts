import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // 1. ESCUDO CORS: Permite que Vercel (Front) hable con Render (Back)
  app.enableCors(); 

  // 2. PUERTO DINÁMICO: Render te va a asignar un puerto aleatorio, jamás usa el 3000
  await app.listen(process.env.PORT || 3000);
}
bootstrap();