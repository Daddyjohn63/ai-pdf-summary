export async function hasReachedUploadLimit({
  userId,
  email
}: {
  userId: string;
  email: string;
}) {
  // const uploadCount = await getUserUploadCount(userId);

  // const priceId = await getPriceIdForActiveUser(email);

  // const isPro =
  //   pricingPlans.find(plan => plan.priceId === priceId)?.id === 'pro';

  // const uploadLimit: number = isPro ? 1000 : 5;

  // return { hasReachedLimit: uploadCount >= uploadLimit, uploadLimit };
  return { hasReachedLimit: false, uploadLimit: 5 };
}
