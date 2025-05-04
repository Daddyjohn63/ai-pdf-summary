import { getDbConnection } from '@/db/db';
import Stripe from 'stripe';
//import { getDbConnection } from './db';

export async function handleSubscriptionDeleted({
  subscriptionId,
  stripe
}: {
  subscriptionId: string;
  stripe: Stripe;
}) {
  console.log('Subscription deleted', subscriptionId);

  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    const sql = await getDbConnection();

    await sql.query('UPDATE users SET status = $1 WHERE customer_id = $2', [
      'cancelled',
      subscription.customer
    ]);

    console.log('Subscription cancelled successfully');
  } catch (error) {
    console.error('Error handling subscription deleted', error);
    throw error;
  }
}

export async function handleCheckoutSessionCompleted({
  session,
  stripe
}: {
  session: Stripe.Checkout.Session;
  stripe: Stripe;
}) {
  console.log('Checkout session completed', session);
  const customerId = session.customer as string;
  const customer = await stripe.customers.retrieve(customerId);
  const priceId = session.line_items?.data[0]?.price?.id;

  if ('email' in customer && priceId) {
    const { email, name } = customer;

    const sql = await getDbConnection();

    await createOrUpdateUser({
      sql,
      email: email as string,
      fullName: name as string,
      customerId,
      priceId: priceId as string,
      status: 'active'
    });

    await createPayment({
      sql,
      session,
      priceId: priceId as string,
      userEmail: email as string
    });
  }
}

async function createOrUpdateUser({
  sql,
  email,
  fullName,
  customerId,
  priceId,
  status
}: {
  sql: any;
  email: string;
  fullName: string;
  customerId: string;
  priceId: string;
  status: string;
}) {
  try {
    const result = await sql.query('SELECT * FROM users WHERE email = $1', [
      email
    ]);
    const existingUser = result.rows[0];

    if (!existingUser) {
      await sql.query(
        'INSERT INTO users (email, full_name, customer_id, price_id, status) VALUES ($1, $2, $3, $4, $5)',
        [email, fullName, customerId, priceId, status]
      );
    }
  } catch (error) {
    console.error('Error creating or updating user', error);
  }
}

async function createPayment({
  sql,
  session,
  priceId,
  userEmail
}: {
  sql: any;
  session: Stripe.Checkout.Session;
  priceId: string;
  userEmail: string;
}) {
  try {
    const { amount_total, id, status } = session;

    await sql.query(
      'INSERT INTO payments (amount, status, stripe_payment_id, price_id, user_email) VALUES ($1, $2, $3, $4, $5)',
      [amount_total || 0, status, id, priceId, userEmail]
    );
  } catch (error) {
    console.error('Error creating payment', error);
  }
}
