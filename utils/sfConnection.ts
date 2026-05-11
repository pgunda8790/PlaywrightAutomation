import * as jsforce from 'jsforce';
import dotenv from 'dotenv';

dotenv.config();

let accessToken: string | null = null;
let instanceUrl: string | null = null;

export async function getSFConnection() {
  if (accessToken && instanceUrl) {
    console.log('♻️ Reusing existing Salesforce connection');
    return { accessToken, instanceUrl };
  }

  console.log('🔄 Step 1: Logging in via jsforce SOAP...');
  const tempConn = new jsforce.Connection({
    loginUrl: process.env.sfConnectionURL!,
    version: '57.0'
  });

  await tempConn.login(
    process.env.MY_USERNAME!,
    process.env.MY_PASSWORD! + (process.env.SF_SECURITY_TOKEN ?? '')
  );

  accessToken = tempConn.accessToken!;
  instanceUrl = tempConn.instanceUrl;

  console.log('✅ Login successful');
  console.log('✅ Instance URL:', instanceUrl);
  console.log('✅ Access Token:', accessToken ? 'set' : '❌ missing');

  return { accessToken, instanceUrl };
}

export async function runQuery(query: string) {
  const { accessToken, instanceUrl } = await getSFConnection();

  console.log('🔄 Running query via direct REST fetch...');

  const url = `${instanceUrl}/services/data/v57.0/query?q=${encodeURIComponent(query)}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('❌ Query failed:', error);
    throw new Error(`Query failed: ${error}`);
  }

  const result = await response.json();
  console.log('✅ Records found:', result.totalSize);
  console.log('✅ Records:', result.records);
  return result;
}

export async function disconnectSF(): Promise<void> {
  accessToken = null;
  instanceUrl = null;
  console.log('✅ Salesforce disconnected');
}