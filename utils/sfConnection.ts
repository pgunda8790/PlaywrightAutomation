import * as jsforce from 'jsforce';
import dotenv from 'dotenv';

dotenv.config();

let conn: jsforce.Connection | null = null;

export async function getSFConnection() {
  if (conn) return conn; // reuse existing connection

  conn = new jsforce.Connection({
    loginUrl: process.env.orgURL!,
  });

  await conn.login(
    process.env.SF_USERNAME!,
    process.env.SF_PASSWORD! + process.env.SF_SECURITY_TOKEN!
  );

  console.log('✅ JSForce connected to Salesforce');
  return conn;
}

export async function disconnectSF(): Promise<void> {
  if (conn) {
    await conn.logout();
    conn = null;
    console.log('JSForce disconnected');
  }
}