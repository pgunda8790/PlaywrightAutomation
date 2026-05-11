import { test, expect } from '@playwright/test';
import { getSFConnection } from '../utils/sfConnection';

test('Verify Salesforce Connection @testNow', async() => {
test.setTimeout(15000);
    let conn;
    try {
        const newLocal = conn = await getSFConnection();
    } catch (error) {
        console.error('❌ Connection failed:', error);
        throw error; // fail the test with the actual error
    }

    console.log('Instance URL:', conn.instanceUrl);
    console.log('Access Token:', conn.accessToken);
    console.log('User ID:', conn.userInfo?.id);
    console.log('Org ID:', conn.userInfo?.organizationId);

    expect(conn).toBeDefined();
    expect(conn.instanceUrl).toBeTruthy();
    expect(conn.accessToken).toBeTruthy();

    console.log('✅ Salesforce Connection is Successful');


}); // ← 15s timeout, fails fast instead of hanging