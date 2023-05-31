import { PartialType } from '@nestjs/swagger';
import { CreateCustomerConditionDto } from './create-customer-condition.dto';

export class UpdateCustomerConditionDto extends PartialType(CreateCustomerConditionDto) {}
