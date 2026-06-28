import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { PublicacionesService } from './publicaciones.service';
import { AdminGuard } from '../auth/guards/admin.guard';

@Controller('estadisticas')
@UseGuards(AdminGuard)
export class EstadisticasController {
  constructor(private readonly pubService: PublicacionesService) {}

  @Get('publicaciones-usuario')
  async getPubsPorUsuario(@Query('inicio') inicio?: string, @Query('fin') fin?: string) {
    return this.pubService.estadisticasPublicacionesPorUsuario(inicio, fin);
  }

  @Get('comentarios-tiempo')
  async getComentariosTiempo(@Query('inicio') inicio?: string, @Query('fin') fin?: string) {
    return this.pubService.estadisticasComentariosEnElTiempo(inicio, fin);
  }

  @Get('comentarios-post')
  async getComentariosPost(@Query('inicio') inicio?: string, @Query('fin') fin?: string) {
    return this.pubService.estadisticasComentariosPorPost(inicio, fin);
  }
}