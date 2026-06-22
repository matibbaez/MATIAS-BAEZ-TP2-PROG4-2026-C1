import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose'; 

@Schema({ timestamps: true }) 
export class Publicacion extends Document {
  @Prop({ required: true })
  texto!: string; 

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

  @Prop({ default: 0 })
  likes!: number;
}

export const PublicacionSchema = SchemaFactory.createForClass(Publicacion);