import { Controller, Get, Put, Post, Delete, Body, Param, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Obtener perfil del usuario actual
   * GET /api/users/profile
   */
  @Get('profile')
  async getProfile(@CurrentUser('id') userId: string) {
    return this.usersService.getProfile(userId);
  }

  /**
   * Actualizar perfil
   * PUT /api/users/profile
   */
  @Put('profile')
  async updateProfile(
    @CurrentUser('id') userId: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.updateProfile(userId, updateUserDto);
  }

  /**
   * Obtener historial de viajes
   * GET /api/users/viajes
   */
  @Get('viajes')
  async getViajesHistory(
    @CurrentUser('id') userId: string,
    @CurrentUser('tipoUsuario') tipoUsuario: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    return this.usersService.getViajesHistory(userId, tipoUsuario, limit, offset);
  }

  /**
   * Obtener estadísticas
   * GET /api/users/estadisticas
   */
  @Get('estadisticas')
  async getEstadisticas(
    @CurrentUser('id') userId: string,
    @CurrentUser('tipoUsuario') tipoUsuario: string,
  ) {
    return this.usersService.getEstadisticas(userId, tipoUsuario);
  }

  /**
   * Obtener favoritos
   * GET /api/users/favoritos
   */
  @Get('favoritos')
  async getFavoritos(@CurrentUser('id') userId: string) {
    return this.usersService.getFavoritos(userId);
  }

  /**
   * Agregar favorito
   * POST /api/users/favoritos
   */
  @Post('favoritos')
  async addFavorito(@CurrentUser('id') userId: string, @Body() data: any) {
    return this.usersService.addFavorito(userId, data);
  }

  /**
   * Eliminar favorito
   * DELETE /api/users/favoritos/:id
   */
  @Delete('favoritos/:id')
  async removeFavorito(
    @CurrentUser('id') userId: string,
    @Param('id') favoritoId: string,
  ) {
    return this.usersService.removeFavorito(userId, favoritoId);
  }
}
