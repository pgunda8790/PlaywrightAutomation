import { Page, Locator } from '@playwright/test';

export class EventsPage {

  EventsTab:Locator;
  recentView:Locator;
  all:Locator;


  constructor(private page: Page) {

    const frame = page.frameLocator('iframe[src*="blackthorn.io"]');
    
    this.EventsTab =page.locator("//a[@title='Events']//span[normalize-space()='Events']");
    this.recentView=page.locator("//lst-list-view-picker//span[normalize-space()='Recently Viewed']");
    this.all=page.locator("//span[@title='All']");
 
   
  } 
}