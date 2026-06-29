import { BadGatewayException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosError, AxiosInstance } from 'axios';
import * as crypto from 'crypto';

import { User } from 'src/users/schema/users.schema';
import { SubscriptionPlan } from 'src/subscription-plan/schema/subscription-plan.schema';
import { CreatePaymentKeyPayload } from './interfaces/create-payment-key.interface';

@Injectable()
export class PaymobService {
  private readonly logger = new Logger(PaymobService.name);

  private readonly http: AxiosInstance;

  constructor(private readonly configService: ConfigService) {
    this.http = axios.create({
      baseURL: 'https://accept.paymob.com/api',
      timeout: 15000,
    });
  }

  private get apiKey(): string {
    return this.configService.getOrThrow('PAYMOB_API_KEY');
  }

  private get integrationId(): number {
    return Number(this.configService.getOrThrow('PAYMOB_INTEGRATION_ID'));
  }

  private get iframeId(): number {
    return Number(this.configService.getOrThrow('PAYMOB_IFRAME_ID'));
  }

  private get hmacSecret(): string {
    return this.configService.getOrThrow('PAYMOB_HMAC_SECRET');
  }

  // ===============================
  // Public API
  // ===============================

  async checkout(
    plan: SubscriptionPlan,
    user: User,
  ): Promise<{
    paymentUrl: string;
    reference: string;
  }> {
    const authToken = await this.authenticate();

    const orderId = await this.createOrder(
      authToken,
      plan.price,
      plan.currency,
    );
    const [firstName, ...rest] = (user.fullName ?? 'NA').split(' ');
    const lastName = rest.length ? rest.join(' ') : 'NA';

    const paymentToken = await this.createPaymentKey({
      authToken,
      orderId,
      amount: plan.price,
      currency: plan.currency,
      email: user.email,
      firstName,
      lastName,

      phone: user.phone,
    });

    return {
      paymentUrl: this.buildIframeUrl(paymentToken),
      reference: orderId.toString(),
    };
  }

  verifyWebhookHmac(
    webhookData: Record<string, any>,
    receivedHmac: string,
  ): boolean {
    const keys = [
      'amount_cents',
      'created_at',
      'currency',
      'error_occured',
      'has_parent_transaction',
      'id',
      'integration_id',
      'is_3d_secure',
      'is_auth',
      'is_capture',
      'is_refunded',
      'is_standalone_payment',
      'is_voided',
      'order.id',
      'owner',
      'pending',
      'source_data.pan',
      'source_data.sub_type',
      'source_data.type',
      'success',
    ];

    const payload = keys
      .map(
        (key) =>
          key
            .split('.')
            .reduce((obj, current) => obj?.[current], webhookData) ?? '',
      )
      .join('');

    const generated = crypto
      .createHmac('sha512', this.hmacSecret)
      .update(payload)
      .digest('hex');

    return generated === receivedHmac;
  }

  // ===============================
  // Private Methods
  // ===============================

  private async authenticate(): Promise<string> {
    try {
      const { data } = await this.http.post('/auth/tokens', {
        api_key: this.apiKey,
      });

      return data.token;
    } catch (error) {
      this.handleAxiosError(error, 'Authenticate');
    }
  }

  private async createOrder(
    authToken: string,
    amount: number,
    currency: string,
  ): Promise<number> {
    try {
      const { data } = await this.http.post('/ecommerce/orders', {
        auth_token: authToken,
        delivery_needed: false,
        amount_cents: amount * 100,
        currency,
        items: [],
      });

      return data.id;
    } catch (error) {
      this.handleAxiosError(error, 'Create Order');
    }
  }

  private async createPaymentKey(
    payload: CreatePaymentKeyPayload,
  ): Promise<string> {
    try {
      const { data } = await this.http.post('/acceptance/payment_keys', {
        auth_token: payload.authToken,

        amount_cents: payload.amount * 100,

        expiration: 3600,

        order_id: payload.orderId,

        currency: payload.currency,

        integration_id: this.integrationId,

        billing_data: {
          apartment: 'NA',
          floor: 'NA',
          street: 'NA',
          building: 'NA',
          shipping_method: 'NA',
          postal_code: 'NA',
          city: 'Cairo',
          state: 'Cairo',
          country: 'EG',

          email: payload.email,

          first_name: payload.firstName,
          last_name: payload.lastName,

          phone_number: payload.phone,
        },
      });

      return data.token;
    } catch (error) {
      this.handleAxiosError(error, 'Create Payment Key');
    }
  }

  private buildIframeUrl(paymentToken: string): string {
    return `https://accept.paymob.com/api/acceptance/iframes/${this.iframeId}?payment_token=${paymentToken}`;
  }

  private handleAxiosError(error: unknown, operation: string): never {
    if (error instanceof AxiosError) {
      this.logger.error(
        operation,
        JSON.stringify(error.response?.data ?? error.message),
      );
    }

    throw new BadGatewayException(`${operation} failed.`);
  }
}
