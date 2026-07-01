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

  async obtenerPorId(id: string): Promise<Publicacion> {
    const post = await this.publicacionModel.findOne({ _id: id, activo: true }).exec();
    if (!post) throw new NotFoundException('Publicación no encontrada');
    return post;
  }

  async comentar(idPublicacion: string, comentarioData: { autorId: string; autorNombre: string; autorUsuario: string; autorImagen?: string; texto: string }) {
    const post = await this.publicacionModel.findById(idPublicacion);
    if (!post || !post.activo) throw new NotFoundException('Publicación no disponible');

    const nuevoComentario = {
      _id: new (require('mongoose').Types.ObjectId)(), 
      ...comentarioData,
      createdAt: new Date() 
    };

    post.comentarios.push(nuevoComentario as any);
    return post.save();
  }

  async editar(id: string, usuarioId: string, nuevoTexto: string) {
    const post = await this.publicacionModel.findById(id);
    if (!post) throw new NotFoundException('Publicación no encontrada');

    if (post.autorId !== usuarioId) {
      throw new ForbiddenException('No tienes permisos para editar esta publicación');
    }

    post.descripcion = nuevoTexto;
    (post as any).modificado = true; 

    return post.save();
  }

  async estadisticasPublicacionesPorUsuario(inicio?: string, fin?: string) {
    const match: any = { activo: true };
    if (inicio && fin) {
      match.createdAt = { $gte: new Date(inicio), $lte: new Date(fin) }; // si llegan fechas, filtramos
    }

    return this.publicacionModel.aggregate([ // en vez de find usamos aggregate para las estadísticas 
      { $match: match },
      { $group: { _id: '$autorUsuario', cantidad: { $sum: 1 } } },
      { $sort: { cantidad: -1 } }
    ]).exec();
  }

  async estadisticasComentariosEnElTiempo(inicio?: string, fin?: string) {
    const match: any = { activo: true };
    if (inicio && fin) {
      match.createdAt = { $gte: new Date(inicio), $lte: new Date(fin) };
    }

    return this.publicacionModel.aggregate([
      { $match: match },
      { $unwind: '$comentarios' }, // para separar cada comentario en un doc individual
      { 
        $group: { 
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$comentarios.createdAt' } },
          totalComentarios: { $sum: 1 }
        } 
      },
      { $sort: { _id: 1 } } 
    ]).exec();
  }

  async estadisticasComentariosPorPost(inicio?: string, fin?: string) {
    const match: any = { activo: true };
    if (inicio && fin) {
      match.createdAt = { $gte: new Date(inicio), $lte: new Date(fin) };
    }

    return this.publicacionModel.aggregate([
      { $match: match },
      { 
        $project: { 
          titulo: 1, 
          autorUsuario: 1,
          cantidadComentarios: { $size: { $ifNull: ['$comentarios', []] } } 
        } 
      },
      { $match: { cantidadComentarios: { $gt: 0 } } }, // gt --> greather than 0, para filtrar publicaciones sin comentarios
      { $sort: { cantidadComentarios: -1 } }, // mayor a menor cant
      { $limit: 10 } 
    ]).exec();
  }

  async modificarComentario(idPost: string, idComentario: string, idUsuario: string, nuevoTexto: string) {
    const publicacion = await this.publicacionModel.findById(idPost);
    
    if (!publicacion) {
      throw new NotFoundException('La publicación no existe.');
    }

    const comentario = publicacion.comentarios.find(
      (c: any) => c._id.toString() === idComentario.toString()
    );

    if (!comentario) {
      throw new NotFoundException('El comentario no fue encontrado en la base de datos.');
    }

    if (comentario.autorId.toString() !== idUsuario.toString()) {
      throw new NotFoundException('No se pudo editar: No tenés permisos para modificar este comentario.');
    }

    comentario.texto = nuevoTexto;
    comentario.modificado = true;

    publicacion.markModified('comentarios');
    
    return await publicacion.save();
  }
}