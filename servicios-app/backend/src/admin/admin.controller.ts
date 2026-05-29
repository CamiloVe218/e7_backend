import { Controller, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../shared/types/user.types';

@ApiTags('admin')
@ApiBearerAuth()
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @ApiOperation({ summary: 'Suspender cuenta de usuario' })
  @ApiParam({ name: 'id', description: 'ID del usuario a suspender' })
  @Patch('users/:id/suspend')
  suspendUser(
    @Param('id') id: string,
    @CurrentUser() admin: AuthenticatedUser,
  ) {
    return this.adminService.suspendUser(admin.id, id);
  }

  @ApiOperation({ summary: 'Reactivar cuenta de usuario suspendida' })
  @ApiParam({ name: 'id', description: 'ID del usuario a reactivar' })
  @Patch('users/:id/reactivate')
  reactivateUser(@Param('id') id: string) {
    return this.adminService.reactivateUser(id);
  }

  @ApiOperation({ summary: 'Cancelar solicitud de servicio (override de administrador)' })
  @ApiParam({ name: 'id', description: 'ID de la solicitud a cancelar' })
  @Patch('requests/:id/cancel')
  cancelRequest(@Param('id') id: string) {
    return this.adminService.cancelRequest(id);
  }
}
