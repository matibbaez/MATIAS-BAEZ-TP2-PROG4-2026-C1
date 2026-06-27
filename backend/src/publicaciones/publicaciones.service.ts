import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Publicacion } from './schemas/publicacion.schema';

@Injectable()
export class PublicacionesService {
  constructor(@InjectModel(Publicacion.name) private publicacionModel: Model<Publicacion>) {}

  async crear(datos: any, imagenUrl?: string): Promise<Publicacion> {
    const nuevaPublicacion = new this.publicacionModel({
      titulo: datos.titulo,
      descripcion: datos.descripcion,
      imagenUrl: imagenUrl || undefined,
      autorId: datos.autorId,
      autorNombre: datos.autorNombre,
      autorUsuario: datos.autorUsuario,
      autorImagen: datos.autorImagen || '',
      likes: [],
      activo: true,
      comentarios: [],
    });
    return nuevaPublicacion.save();
  }

  async obtenerTodas(
    orden: 'fecha' | 'likes' = 'fecha',
    limit: number = 10,
    offset: number = 0,
    usuario?: string,
  ): Promise<any[]> {
    const query: any = { activo: true };

    if (usuario) {
      query.autorUsuario = usuario;
    }

    const limiteNum = Number(limit) || 10;
    const offsetNum = Number(offset) || 0;

    if (orden === 'likes') {
      return this.publicacionModel.aggregate([
        { $match: query },
        // campo temporal cantidad de likes
        { $addFields: { cantidadLikes: { $size: { $ifNull: ['$likes', []] } } } },
        // por cantidad de likes (mayor menor)
        { $sort: { cantidadLikes: -1, createdAt: -1 } },
        { $skip: offsetNum },
        { $limit: limiteNum },
      ]).exec();
    } else {
      return this.publicacionModel.find(query)
      // mas nueva a mas vieja
        .sort({ createdAt: -1 })
        .skip(offsetNum)
        .limit(limiteNum)
        .exec();
    }
  }

  async eliminar(id: string, usuarioLogueadoId: string, rol: string) {
    const post = await this.publicacionModel.findById(id);
    if (!post) throw new NotFoundException('Publicación no encontrada');

    if (post.autorId !== usuarioLogueadoId && rol !== 'administrador') {
      throw new ForbiddenException('No tenés permisos para borrar esta publicación');
    }

    post.activo = false; 
    return post.save();
  }

  async darLike(id: string, usuarioId: string) {
    const post = await this.publicacionModel.findById(id);
    if (!post) throw new NotFoundException('Publicación no encontrada');

    if (post.likes.includes(usuarioId)) {
      throw new BadRequestException('Ya le diste me gusta a esta publicación');
    }

    post.likes.push(usuarioId);
    return post.save();
  }

  async quitarLike(id: string, usuarioId: string) {
    const post = await this.publicacionModel.findById(id);
    if (!post) throw new NotFoundException('Publicación no encontrada');

    if (!post.likes.includes(usuarioId)) {
      throw new BadRequestException('No le habías dado me gusta a esta publicación');
    }

    post.likes = post.likes.filter((item) => item !== usuarioId);
    return post.save();
  }
}