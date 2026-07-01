import { Injectable, CanActivate, ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('Petición sin cabecera de autorización.');
    }

    const [tipo, token] = authHeader.split(' ');
    if (tipo !== 'Bearer' || !token) {
      throw new UnauthorizedException('Formato de token Bearer inválido.');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET || 'CLAVE_SECRETA_TP2_PROG4_2026'
      });

      if (payload.rol !== 'administrador') {
        throw new ForbiddenException('Área restringida: Se requieren privilegios de Administrador.');
      }

      request.user = payload; // asi pueden los controladores acceder a la info del usuario si es necesario sin verificar el token de nuevo
      return true;

    } catch (error: any) {
      if (error instanceof ForbiddenException) throw error;
      throw new UnauthorizedException('Token expirado o adulterado.');
    }
  }
}