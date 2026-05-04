import { Page, Locator } from '@playwright/test';


export class SalesforceHomePage {

  

  developerEditionElement: Locator;
  accountNewCreation: Locator;
  accountNameField: Locator;
  accountPhoneField: Locator;
  accountSaveButton: Locator;

  constructor(private page: Page) {
    this.developerEditionElement = page.locator("//span[text()='Developer Edition']");
    this.accountNewCreation      = page.locator("//div[normalize-space()='New']");
    this.accountNameField        = page.locator("//input[@name='Name']");
    this.accountPhoneField       = page.locator("//input[@name='Phone']");
    this.accountSaveButton       = page.locator("//button[normalize-space()='Save']");
  }
}
/*
import { Page, Locator } from '@playwright/test';

export class SalesforceHomePage {

  constructor(private page: Page) {}  // ← this ONE line does everything

  developerEditionElement: Locator = this.page.locator("//span[text()='Developer Edition']");
  accountNewCreation: Locator      = this.page.locator("//div[normalize-space()='New']");
  accountNameField: Locator        = this.page.locator("//input[@name='Name']");
  accountPhoneField: Locator       = this.page.locator("//input[@name='Phone']");
  accountSaveButton: Locator       = this.page.locator("//button[normalize-space()='Save']");

}
  */

  // 👉 Web elements only (locators)
//Better to declare webelements as a variable
//Utils to create small methods - most common methods
//Make sure keep small test cases - 15-20 lines
//tags functionality in playwright 
//loggers 

