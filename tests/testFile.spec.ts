import { test, expect, Locator } from '@playwright/test';
import{getRecord} from '../utils/sfConnection';

test('Your test', async ({ page }) => {
  
  const query = `SELECT 
      conference360__Account_Name__c,
      conference360__Event_Name__c,
      conference360__Email2__c
  FROM conference360__Attendee__c
  WHERE conference360__Email2__c = 'tst_2201@bu.edu'
  AND conference360__Event_Name__c LIKE 'May Orientation clone of winter'`;
  
    const records = await getRecord(query);

    if (records)
    {
      console.log("Record Found");
    }

    else
    {
      console.log("Record Not found");
    }


});