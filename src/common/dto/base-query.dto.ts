import { IsOptional, IsString, IsNumberString, IsIn } from 'class-validator';

export class BuildQueryDto {
  @IsOptional()
  @IsString()
  keyword?: string;

  @IsOptional()
  @IsString()
  sort?: string;

  @IsOptional()
  @IsNumberString()
  page?: string;

  @IsOptional()
  @IsNumberString()
  limit?: string;

  @IsOptional()
  @IsString()
  fields?: string;

  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  isActive?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  'startDate[gte]'?: string;

  @IsOptional()
  @IsString()
  'startDate[lte]'?: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsNumberString()
  'value[gte]'?: string;

  @IsOptional()
  @IsNumberString()
  'value[lte]'?: string;

  @IsOptional()
  @IsNumberString()
  'paidAmount[gte]'?: string;

  @IsOptional()
  @IsNumberString()
  'paidAmount[lte]'?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsNumberString()
  'amount[gte]'?: string;

  @IsOptional()
  @IsNumberString()
  'amount[lte]'?: string;

  @IsOptional()
  @IsString()
  'date[gte]'?: string;

  @IsOptional()
  @IsString()
  'date[lte]'?: string;

  @IsOptional()
  @IsNumberString()
  'price[gte]'?: string;

  @IsOptional()
  @IsNumberString()
  'price[lte]'?: string;

  @IsOptional()
  @IsNumberString()
  'size[gte]'?: string;

  @IsOptional()
  @IsNumberString()
  'size[lte]'?: string;
@IsOptional()
  conversationId:string
  
@IsOptional()
  content:string

}
