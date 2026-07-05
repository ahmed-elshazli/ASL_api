import {
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class MailService {
  private readonly resend: Resend;
  constructor(private readonly configService: ConfigService) {
    this.resend = new Resend(this.configService.getOrThrow<string>('RESEND_API_KEY'));
  }
  async sendResetPasswordEmail( 
      email: string,
      fullName: string,
      resetCode: string,
  ): Promise<void> {
    const { error } = await this.resend.emails.send({
      from: this.configService.getOrThrow('MAIL_FROM'),
      to: email,
      subject: 'Reset Password',
      html: `
        <h2>Hello ${fullName}</h2>

        <p>Your password reset code is:</p>
        <h1>${resetCode}</h1>

        <p>This code will expire in 10 minutes.</p>
        <p>If you didn't request this, you can ignore this email.</p>
      `,
    });

    if (error) {
      throw new InternalServerErrorException(
        'Failed to send email.',
      );
    }
  }
}