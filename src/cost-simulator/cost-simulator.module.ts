import { Module } from '@nestjs/common';
import { CostSimulatorService } from './cost-simulator.service';
import { CostSimulatorController } from './cost-simulator.controller';

@Module({
  controllers: [CostSimulatorController],
  providers: [CostSimulatorService]
})
export class CostSimulatorModule {}
