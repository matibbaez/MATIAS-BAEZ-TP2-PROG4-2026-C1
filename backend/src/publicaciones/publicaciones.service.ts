import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Publicacion } from './schemas/publicacion.schema';

@Injectable()
export class PublicacionesService {
  constructor(@InjectModel(Publicacion.name) private publicacionModel: Model<Publicacion>) {}

  async crear(datos: any): Promise<Publicacion> {
    const nuevaPublicacion = new this.publicacionModel(datos);
    return nuevaPublicacion.save();
  }

  async obtenerTodas(): Promise<Publicacion[]> {
    return this.publicacionModel.find().sort({ createdAt: -1 }).exec();
  }
}