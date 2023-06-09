import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDate, IsEnum, IsMongoId, IsOptional } from 'class-validator';

export class MaterialPriceReportDto {
  @ApiProperty({ type: String, required: false })
  @IsMongoId()
  @IsOptional()
  restaurantId: string;

  @ApiProperty({ type: String, required: false })
  @IsMongoId()
  @IsOptional()
  materialId: string;

  @ApiProperty({ type: String, required: false })
  @IsMongoId()
  @IsOptional()
  vendorId: string;
}
