import { getDbConnection } from '@/db/db';

export async function getSummaries(userId: string) {
  const db = await getDbConnection();
  const result = await db.query(
    'SELECT * from pdf_summaries where user_id = $1 ORDER BY created_at DESC',
    [userId]
  );
  return result.rows;
}

export async function getSummaryById(id: string) {
  try {
    const db = await getDbConnection();
    const result = await db.query(
      `SELECT 
        id, 
        user_id, 
        title, 
        original_file_url, 
        summary_text, 
        status,
        created_at, 
        updated_at, 
        file_name, 
        LENGTH(summary_text) - LENGTH(REPLACE(summary_text, ' ', '')) + 1 as word_count
        from pdf_summaries where id = $1`,
      [id]
    );
    return result.rows[0];
  } catch (err) {
    console.error('Error fetching summary by id', err);
    return null;
  }
}

export async function getUserUploadCount(userId: string) {
  const db = await getDbConnection();
  try {
    const result = await db.query(
      'SELECT COUNT(*) as count FROM pdf_summaries WHERE user_id = $1',
      [userId]
    );
    return result.rows[0]?.count || 0;
  } catch (err) {
    console.error('Error fetching user upload count', err);
    return 0;
  }
}
