import { Page, Locator } from '@playwright/test';

export class EventGroupPage {

  EventGroupsTab: Locator;
   newElement:Locator;
   GroupName:Locator;
   LogoURL :Locator;
   UIExperience :Locator;
   checkBox :Locator;
   defaultTrue:Locator;
   recentView:Locator;
  all:Locator;
  editDefault:Locator;
  defaultCheckbox:Locator;
  saveButton:Locator;
  inputGroupName:Locator;
  activeGroup:Locator;
  orientationRecord:Locator;
  
  


  constructor(private page: Page) {

    const frame = page.frameLocator('iframe[src*="blackthorn.io"]');
    this.EventGroupsTab = page.locator("//*[@role='listitem']//span[normalize-space()='Event Groups']");
    this.newElement = page.locator("(//*[normalize-space()='New'])[1]");
    this.GroupName=page.locator("//*[@field-label='Event Group Name']//input");
    this.LogoURL=page.locator("//*[@field-label='Logo URL']//input");
    this.UIExperience=page.locator("//button[@aria-label='UI Experience']");
    this.checkBox=page.locator("//input[contains(@id,'checkbox')]");
    this.defaultTrue = page.locator("//lightning-icon[@title='True']");
    this.recentView=page.locator("//lst-list-view-picker//span[normalize-space()='Recently Viewed']");
    this.all=page.locator("//span[@title='All']");
    this.editDefault=page.locator("//button[@title='Edit Default']");
    this.defaultCheckbox =page.locator("//input[@name='conference360__Default__c']");
    this.saveButton = page.locator("//button[normalize-space()='Save']");
    this.inputGroupName=page.locator("//*[@field-label='Event Group Name']//input");
    this.activeGroup=page.locator("//span[normalize-space()='True']/ancestor::td/preceding-sibling::th");
    this.orientationRecord=page.locator("//th[contains(., 'Orientation')]//a");
    
    
  } 
}
