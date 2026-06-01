
import { Page, Locator } from '@playwright/test';

export class AttendeePage {

  dateLocator:Locator;
  eventLocator:Locator;
  contactName:Locator;
  QRCode:Locator;
  addToCalender:Locator;
  agendaTab:Locator;
  filterSession :Locator;
  sessionContent:Locator;
  descriptionDropdown:Locator;
  sessionRegistrationTab:Locator;
  sessionToAdd:Locator;
  uncheckedSession:Locator;
  submit:Locator;
  

  constructor(private page: Page,registerData:any)
  
  {

const frame = page.frameLocator('iframe[src*="blackthorn.io"]');

this.dateLocator = page.locator("//*[@class='product-item__date']/div");
this.eventLocator =page.locator(`//h1[contains(normalize-space(),'${registerData.eventName}')]`)
this.contactName =page.locator(`//*[conatins(normalize-space(),'${registerData.userName}')]`);
this.QRCode = page.locator("//canvas[contains(@aria-label,'QR code')]");
this.addToCalender=page.locator("//span[normalize-space()='Add To Calendar']");
this.agendaTab=page.locator("//button[normalize-space()='My Agenda']");
this.filterSession=page.locator("//span[contains(normalize-space(),'Filter by')]/span");
this.sessionContent=page.locator("(//div[@class='content'])[1]");
this.descriptionDropdown=page.locator("//span[@aria-label='Expand session information']");
this.sessionRegistrationTab=page.locator("//button[normalize-space()='Session Registration']");
this.sessionToAdd = page.locator(`//span[normalize-space()='${registerData.addedSession}']/ancestor::div[@class='product-item__detailText']/preceding-sibling::div`);
this.uncheckedSession=page.locator(`//h2[normalize-space()='${registerData.uncheckedSession}']/ancestor::div[@class='product-item__detailText']/preceding-sibling::div/mat-checkbox[contains(@class,'checkbox-checked')]`);
this.submit=page.locator("//span[normalize-space()='CONFIRM']");


}}
