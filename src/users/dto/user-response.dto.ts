import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from 'src/users/enums/roles.enum';
import {  UserDocument } from '../schema/users.schema';

export class UserResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  fullName: string;

  @ApiProperty({ enum: UserRole })
  role: UserRole;

  @ApiProperty()
  phone: string;

   @ApiProperty()
   isActive: boolean;
 @ApiProperty()
  gender: string;
   @ApiProperty()
  age: number;
   @ApiProperty()
   height: number;
    @ApiProperty()
    weight: number;

 
  @ApiProperty()
  createdAt: Date;
  @ApiProperty()
   country: string;


  @ApiProperty({ type: [String], default: [] })
  images: string[];

  static fromEntity(
    user:UserDocument,
    
  ): UserResponseDto {
    const dto = new UserResponseDto();

    dto.id = user._id.toString();
    dto.email = user.email;
    dto.fullName = user.fullName;
    dto.phone = user.phone;
    dto.isActive = user.isActive;
    dto.createdAt = user.createdAt;
    dto.images = user.images || [];
    dto.country = user.country;
    dto.age=user.age
    dto.height=user.height
    dto.gender=user.gender
    dto.weight=user.weight
    
    dto.role = user.role;


    return dto;
  }
}