import { Page, Locator } from '@playwright/test';

export class LoginPage {

  
  buLoginName:Locator;
  buPassword:Locator;
  buLoginContinue:Locator;
  bypassCode:Locator;
  verifyCode:Locator;
  trustBrowser:Locator;
  homePage:Locator;
  username:Locator;
  password:Locator;
  loginSandbox:Locator;

  



  constructor(private page: Page) {

    const frame = page.frameLocator('iframe[src*="blackthorn.io"]');
    
    this.buLoginName=page.locator("//*[@placeholder='BU login name']");
    this.buPassword=page.locator("//*[@placeholder='password']");
    this.buLoginContinue=page.locator("//*[normalize-space()='Continue']");
    this.bypassCode=page.locator("//input[@name='passcode-input']");
    this.verifyCode=page.locator("//button[normalize-space()='Verify']");
    this.trustBrowser=page.locator("//button[@id='trust-browser-button']");
    this.homePage=page.locator("(//span[normalize-space()='Home'])[1]");
    this.username=page.locator("//input[@id='username']");
    this.password=page.locator("//input[@id='password']");
    this.loginSandbox=page.locator("//input[@id='Login']")
    } 
}
