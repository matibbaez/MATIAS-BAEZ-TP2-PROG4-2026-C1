import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose'; 

@Schema({ timestamps: true }) 
export class Publicacion extends Document {
  @Prop({ 
    required: true, 
    maxlength: [60, 'El título no puede superar los 60 caracteres.'] 
  })
  titulo!: string; 

  @Prop({ 
    required: true, 
    maxlength: [280, 'La descripción no puede superar los 280 caracteres.'] 
  })
  descripcion!: string;

  @Prop()
  imagenUrl?: string;

  @Prop({ required: true })
  autorId!: string;

  @Prop({ required: true })
  autorNombre!: string;

  @Prop({ required: true })
  autorUsuario!: string;

  @Prop()
  autorImagen?: string;

  @Prop({ type: [String], default: [] })
  likes!: string[];

  @Prop({ default: true })
  activo!: boolean;

  @Prop({ default: [] })
  comentarios!: any[];

  @Prop({ default: false })
  modificado!: boolean;
}

export const PublicacionSchema = SchemaFactory.createForClass(Publicacion);