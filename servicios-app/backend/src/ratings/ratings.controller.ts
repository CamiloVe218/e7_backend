import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { RatingsService } from './ratings.service';
import { CreateRatingDto } from './dto/create-rating.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('ratings')
@UseGuards(JwtAuthGuard)
export class RatingsController {
  constructor(private ratingsService: RatingsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('CLIENTE')
  create(@CurrentUser() user: any, @Body() dto: CreateRatingDto) {
    return this.ratingsService.create(user.id, dto);
  }

  @Get('provider/:id')
  findByProvider(@Param('id') id: string) {
    return this.ratingsService.findByProvider(id);
  }
}
