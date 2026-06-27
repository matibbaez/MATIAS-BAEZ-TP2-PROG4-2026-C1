import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsuariosModule } from '../usuarios/usuarios.module'; 

@Module({
  imports: [
    UsuariosModule, 
    
    JwtModule.register({
      global: true,
      secret: 'CLAVE_SECRETA_TP2_PROG4_2026',
      signOptions: { expiresIn: '15m' }, 
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}