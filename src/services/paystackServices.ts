import axios from 'axios';

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET!;
const PAYSTACK_BASE_URL = 'https://api.paystack.co';

export class PaystackService {
  async initializePayment(email: string, amount: number, reference: string, callback: string) {
    const response = await axios.post(
      `${PAYSTACK_BASE_URL}/transaction/initialize`,
      {
        email,
        amount: amount * 100,
        reference,
        callback_url: callback
      },
      {
        headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` }
      }
    );
    return response.data.data;
  }

  async verifyTransaction(reference: string) {
    const response = await axios.get(`${PAYSTACK_BASE_URL}/transaction/verify/${reference}`, {
      headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` }
    });
    return response.data.data;
  }
}
