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

  @Get(':id')
  async obtenerUna(@Param('id') id: string) {
    return this.publicacionesService.obtenerPorId(id);
  }

  @Post(':id/comentarios')
  async agregarComentario(
    @Param('id') id: string,
    @Body() body: { autorId: string; autorNombre: string; autorUsuario: string; autorImagen?: string; texto: string }
  ) {
    if (!body?.texto || body.texto.trim().length === 0) {
      throw new BadRequestException('El comentario no puede estar vacío');
    }

    if (body.texto.length > 300) {
      throw new BadRequestException('El comentario excede el límite de 300 caracteres.');
    }

    body.texto = body.texto.trim().replace(/\n{3,}/g, '\n\n');

    return this.publicacionesService.comentar(id, body);
  }

  @Post(':id/editar')
  async editarPublicacion(
    @Param('id') id: string,
    @Body() body: { usuarioId: string; descripcion: string }
  ) {
    if (!body.descripcion) throw new BadRequestException('La descripción no puede quedar vacía');
    return this.publicacionesService.editar(id, body.usuarioId, body.descripcion);
  }
}