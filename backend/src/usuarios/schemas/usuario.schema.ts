import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UsuarioDocument = Usuario & Document;

@Schema({ timestamps: true }) 
export class Usuario {
  @Prop({ required: true })
  nombre!: string;

  @Prop({ required: true })
  apellido!: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  correo!: string;

  @Prop({ required: true, unique: true, trim: true })
  nombreUsuario!: string;

  @Prop({ required: true })
  contrasena!: string; 

  @Prop({ required: true })
  fechaNacimiento!: string; 

  @Prop({ default: '' })
  descripcion!: string;

  @Prop({ default: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png' })
  imagenPerfil!: string; 

  @Prop({ default: 'usuario', enum: ['usuario', 'administrador'] })
  perfil!: string;
}

export const UsuarioSchema = SchemaFactory.createForClass(Usuario);