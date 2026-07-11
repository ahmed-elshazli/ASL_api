import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { UserRole } from 'src/users/enums/roles.enum';
import { BCRYPT_ROUNDS } from 'src/common/constants/security.constants';

export type UserDocument = HydratedDocument<User>;

@Schema({
   timestamps:true,
  versionKey: false,

})
export class User {
  @Prop({ required: true, trim: true })
  fullName: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true , index: true })
  email: string;

  @Prop({ required: true, minlength: 6, select: false })
  password: string;

  @Prop({ required: true, trim: true })
  phone: string;

  @Prop({ type: String, enum: UserRole, default: UserRole.PATIENT})
  role: UserRole;

  @Prop({ default: true })
  isActive: boolean;


  @Prop({
    required: true,
    min: 30,
    max: 300,
  })
  weight: number; // kg

  @Prop({
    required: true,
    min: 50,
    max: 250,
  })
  height: number; // cm

  @Prop({
    required: true,
    min: 10,
    max: 120,
  })
  age: number;

  @Prop({
    required: true,
    enum: ['male', 'female'],
  })
  gender: string;

  @Prop({type: String })
  country: string;

  @Prop()
  passwordChangedAt?: Date;

  @Prop({ select: false })
  passwordResetCode?: string;

  @Prop({ select: false })
  passwordResetExpires?: Date;

  @Prop({ default: false,select: false })
  passwordResetVerified?: boolean;

  @Prop({ select: false })
  refreshToken?: string;
  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ type: [String], default: [] })
  images: string[];
}

export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.index({
 createdAt: -1
});

UserSchema.pre<UserDocument>('save', async function () {
  if (!this.isModified('password')) return;

  this.password = await bcrypt.hash(this.password, BCRYPT_ROUNDS);

  if (!this.isNew) {
    this.passwordChangedAt = new Date();
  }
});
