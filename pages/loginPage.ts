import { Page, Locator } from '@playwright/test';

export class LoginPage {

  
  buLoginName:Locator;
  buPassword:Locator;
  buLoginContinue:Locator;
  bypassCode:Locator;
  verifyCode:Locator;
  trustBroser:Locator;
  welcomeText:Locator;
  



  constructor(private page: Page) {

    const frame = page.frameLocator('iframe[src*="blackthorn.io"]');
    
    this.buLoginName=page.locator("//*[@placeholder='BU login name']");
    this.buPassword=page.locator("//*[@placeholder='password']");
    this.buLoginContinue=page.locator("//*[normalize-space()='Continue']");
    this.bypassCode=page.locator("//input[@name='passcode-input']");
    this.verifyCode=page.locator("//button[normalize-space()='Verify']");
    this.trustBroser=page.locator("//button[@id='trust-browser-button']");
    this.welcomeText=page.locator("(//*[contains(normalize-space(),'Welcome to Boston University!')])[last()]");
    } 
}
