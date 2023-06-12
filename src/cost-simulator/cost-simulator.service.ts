import { Injectable } from '@nestjs/common';
import { CreateCostSimulatorDto } from './dto/create-cost-simulator.dto';
import { UpdateCostSimulatorDto } from './dto/update-cost-simulator.dto';

@Injectable()
export class CostSimulatorService {
  create(createCostSimulatorDto: CreateCostSimulatorDto) {
    return 'This action adds a new costSimulator';
  }

  findAll() {
    return `This action returns all costSimulator`;
  }

  findOne(id: number) {
    return `This action returns a #${id} costSimulator`;
  }

  update(id: number, updateCostSimulatorDto: UpdateCostSimulatorDto) {
    return `This action updates a #${id} costSimulator`;
  }

  remove(id: number) {
    return `This action removes a #${id} costSimulator`;
  }
}
