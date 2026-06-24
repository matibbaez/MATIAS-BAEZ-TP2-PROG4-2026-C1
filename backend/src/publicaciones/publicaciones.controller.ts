import { Controller, Get, Post, Delete, Body, Param, Query, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PublicacionesService } from './publicaciones.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service'; 

@Controller('publicaciones')
export class PublicacionesController {
  constructor(
    private readonly publicacionesService: PublicacionesService,
    private readonly cloudinaryService: CloudinaryService, 
  ) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async crear(
    @Body() body: any,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    console.log('📬 [POST PUBLICACIÓN]:', body.titulo);
    let urlImagen: string | undefined = undefined;

    if (file) {
      console.log('☁️ [CLOUDINARY] Subiendo imagen de publicación a la nube...');
      const resultado = await this.cloudinaryService.subirImagen(file);
      urlImagen = resultado.secure_url;
    }

    return this.publicacionesService.crear(body, urlImagen);
  }

  @Get()
  async obtenerTodas(
    @Query('orden') orden?: 'fecha' | 'likes',
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
    @Query('usuario') usuario?: string,
  ) {
    return this.publicacionesService.obtenerTodas(orden, limit, offset, usuario);
  }

  @Delete(':id')
  async eliminar(
    @Param('id') id: string,
    @Query('usuarioId') usuarioId: string,
    @Query('rol') rol: string,
  ) {
    return this.publicacionesService.eliminar(id, usuarioId, rol);
  }

  @Post(':id/like')
  async darLike(
    @Param('id') id: string,
    @Body('usuarioId') usuarioId: string,
  ) {
    if (!usuarioId) throw new BadRequestException('Falta el ID del usuario');
    return this.publicacionesService.darLike(id, usuarioId);
  }

  @Delete(':id/like')
  async quitarLike(
    @Param('id') id: string,
    @Query('usuarioId') usuarioId: string,
  ) {
    if (!usuarioId) throw new BadRequestException('Falta el ID del usuario');
    return this.publicacionesService.quitarLike(id, usuarioId);
  }
}