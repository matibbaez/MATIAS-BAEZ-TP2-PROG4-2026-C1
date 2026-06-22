import { Controller, Get, Post, Body } from '@nestjs/common';
import { PublicacionesService } from './publicaciones.service';

@Controller('publicaciones')
export class PublicacionesController {
  constructor(private readonly publicacionesService: PublicacionesService) {}

  @Post()
  async crear(@Body() body: any) {
    console.log('📬 [NESTJS RECIBIÓ EL POST DESDE ANGULAR]:', body);
    
    try {
      const resultado = await this.publicacionesService.crear(body);
      console.log('✅ [POSTEO GUARDADO EN MONGO ATLAS CON ÉXITO]');
      return resultado; 
    } catch (error) {
      console.log('❌ [ERROR DE MONGO ATLAS AL GUARDAR]:', error);
      throw error;
    }
  }

  @Get()
  async obtenerTodas() {
    return this.publicacionesService.obtenerTodas();
  }
}