import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(
    private readonly mailerService: MailerService,
  ) {}

  async sendResetPasswordEmail(
    email: string,
    fullName: string,
    code: string,
  ): Promise<void> {
    await this.mailerService.sendMail({
      to: email,

      subject: 'Password Reset',

      html: `
        <h2>Hello ${fullName}</h2>

        <p>You requested to reset your password.</p>

        <h1>${code}</h1>

        <p>This code expires in 10 minutes.</p>

        <p>If you didn't request this, please ignore this email.</p>
      `,
    });
  }
}