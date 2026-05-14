import * as jsforce from 'jsforce';
import dotenv from 'dotenv';

dotenv.config();

// Each call creates its own connection — safe for parallel tests
async function createConnection(): Promise<jsforce.Connection> {
  const conn = new jsforce.Connection({
    loginUrl: process.env.sfConnectionURL!,
    version: process.env.SF_API_VERSION ?? '59.0'
  });

  await conn.login(
    process.env.MY_USERNAME!,
    process.env.MY_PASSWORD! + (process.env.SF_SECURITY_TOKEN ?? '')
  );

  console.log('✅ Salesforce login successful');
  console.log('✅ Instance URL:', conn.instanceUrl);

  return conn;
}

export async function getRecord(query: string): Promise<boolean> {
  let conn: jsforce.Connection | null = null;

  try {
    conn = await createConnection();

    console.log('🔄 Running SOQL query...');
    const result = await conn.query(query);

    console.log('✅ Total records found:', result.totalSize);
    return result.totalSize > 0;

  } catch (error) {
    console.error('❌ Salesforce query failed:', error);
    throw error;
  } finally {
    if (conn) {
      await conn.logout();
      console.log('✅ Salesforce disconnected');
    }
  }
}