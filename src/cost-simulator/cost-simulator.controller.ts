import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CostSimulatorService } from './cost-simulator.service';
import { CreateCostSimulatorDto } from './dto/create-cost-simulator.dto';
import { UpdateCostSimulatorDto } from './dto/update-cost-simulator.dto';

@Controller('cost-simulator')
export class CostSimulatorController {
  constructor(private readonly costSimulatorService: CostSimulatorService) {}

  @Post()
  create(@Body() createCostSimulatorDto: CreateCostSimulatorDto) {
    return this.costSimulatorService.create(createCostSimulatorDto);
  }

  @Get()
  findAll() {
    return this.costSimulatorService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.costSimulatorService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCostSimulatorDto: UpdateCostSimulatorDto) {
    return this.costSimulatorService.update(+id, updateCostSimulatorDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.costSimulatorService.remove(+id);
  }
}
