
import { Page, Locator } from '@playwright/test';

export class AttendeePage {
  
    eventLabel:Locator;


  constructor(private page: Page,registerData:any)
  
  {

    this.eventLabel=page.locator("//h3[contains(@class,'summit-events-card-title')]");

  }
}


