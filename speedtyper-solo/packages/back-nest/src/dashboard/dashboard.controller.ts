import { Controller, Get, Query } from '@nestjs/common';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  @Get('stats')
  async getStats() {
    return this.dashboardService.getStats();
  }

  @Get('trends')
  async getTrends(@Query('days') days: string = '30') {
    return this.dashboardService.getTrends(parseInt(days, 10));
  }

  @Get('by-language')
  async getByLanguage() {
    return this.dashboardService.getByLanguage();
  }

  @Get('recent')
  async getRecent(@Query('limit') limit: string = '10') {
    return this.dashboardService.getRecent(parseInt(limit, 10));
  }
}