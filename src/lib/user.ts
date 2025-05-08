import { pricingPlans } from '@/utils/constants';
//import { getDbConnection } from './db';
import { getUserUploadCount } from './summaries';
import { User } from '@clerk/nextjs/server';
import { getDbConnection } from '@/db/db';

export async function getPriceIdForActiveUser(email: string) {
  const sql = await getDbConnection();

  const query = await sql.query(
    'SELECT price_id FROM users WHERE email = $1 AND status = $2',
    [email, 'active']
  );

  console.log('query', query);

  return query.rows?.[0]?.price_id || null;
}

export async function hasActivePlan(email: string) {
  const sql = await getDbConnection();

  const query = await sql.query(
    'SELECT price_id, status FROM users WHERE email = $1 AND status = $2 AND price_id IS NOT NULL',
    [email, 'active']
  );

  return query.rows && query.rows.length > 0;
}

export async function hasReachedUploadLimit({
  userId,
  email
}: {
  userId: string;
  email: string;
}) {
  const uploadCount = await getUserUploadCount(userId);

  const priceId = await getPriceIdForActiveUser(email);

  const isPro =
    pricingPlans.find(plan => plan.priceId === priceId)?.id === 'pro';

  const uploadLimit: number = isPro ? 1000 : 5;

  return { hasReachedLimit: uploadCount >= uploadLimit, uploadLimit };
}

export async function getSubscriptionStatus(user: User) {
  const hasSubscription = await hasActivePlan(
    user.emailAddresses[0].emailAddress
  );

  return hasSubscription;
}
