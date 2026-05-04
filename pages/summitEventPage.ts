import {Page,Locator} from '@playwright/test';


export class summitEventPage
{
 summitEventsTab: Locator;
 newElement:Locator;
 //eventLabel:Locator;

 
  constructor(private page: Page) {
    this.summitEventsTab = page.locator("//one-app-nav-bar-item-root[@role='listitem']//span[normalize-space()='Summit Events']");
    this.newElement = page.locator("(//a[@role='button']//div[normalize-space()='New'])[1]");
   // this.eventLabel=page.locator;

}
}