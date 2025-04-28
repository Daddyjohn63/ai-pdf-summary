'use server';

import { getDbConnection } from '@/db/db';
//import { getDbConnection } from '@/lib/db';
import { currentUser } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';

export async function deleteSummaryAction({
  summaryId
}: {
  summaryId: string;
}) {
  try {
    const user = await currentUser();
    const userId = user?.id;

    if (!userId) {
      throw new Error('User not found');
    }

    const sql = await getDbConnection();

    //delete from db
    const result = await sql.query(
      `
    DELETE FROM pdf_summaries
    WHERE id = $1 AND user_id = $2
    RETURNING id;`,
      [summaryId, userId]
    );

    if (result.rows.length > 0) {
      revalidatePath('/dashboard');
      return { success: true };
    }
    return { success: false };
  } catch (error) {
    console.error('Error deleting summary', error);
    return { success: false };
  }
}
