export interface CreatePaymentKeyPayload {
  authToken: string;

  orderId: number;

  amount: number;

  currency: string;

  email: string;

  firstName: string;
  lastName: string;


  phone: string;
}