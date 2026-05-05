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
  buLoginName:Locator;
  buPassword:Locator;
  buLoginContinue:Locator;
  editDefault:Locator;
  defaultCheckbox:Locator;
  saveButton:Locator;
  inputGroupName:Locator;
  activeGroup:Locator;
  orientationRecord:Locator;
  bypassCode:Locator;
  verifyCode:Locator;
  trustBroser:Locator;
  welcomeText:Locator;
  newStudentOrientation:Locator;
  mayOrientation:Locator;
  registerEvent:Locator;
  addMyself:Locator;
  redeemed:Locator;
  userDataAutoFetch:Locator;
  dieteryPreference:Locator;
  yes:Locator;
  diaryFreeMealCheck:Locator;
  MealSpecification:Locator;
  emergencyName:Locator;
  emergencyPhone:Locator;
  optionalTour:Locator;
  readAndUnderstandInfo:Locator;


  constructor(private page: Page) {
    this.EventGroupsTab = page.locator("//*[@role='listitem']//span[normalize-space()='Event Groups']");
    this.newElement = page.locator("(//*[normalize-space()='New'])[1]");
    this.GroupName=page.locator("//*[@field-label='Event Group Name']//input");
    this.LogoURL=page.locator("//*[@field-label='Logo URL']//input");
    this.UIExperience=page.locator("//button[@aria-label='UI Experience']");
    this.checkBox=page.locator("//input[contains(@id,'checkbox')]");
    this.defaultTrue = page.locator("//lightning-icon[@title='True']");
    this.recentView=page.locator("//lst-list-view-picker//span[normalize-space()='Recently Viewed']");
    this.all=page.locator("//span[@title='All']");
    this.buLoginName=page.locator("//*[@placeholder='BU login name']");
    this.buPassword=page.locator("//*[@placeholder='password']");
    this.buLoginContinue=page.locator("//*[normalize-space()='Continue']");
    this.editDefault=page.locator("//button[@title='Edit Default']");
    this.defaultCheckbox =page.locator("//input[@name='conference360__Default__c']");
    this.saveButton = page.locator("//button[normalize-space()='Save']");
    this.inputGroupName=page.locator("//*[@field-label='Event Group Name']//input");
    this.activeGroup=page.locator("//span[normalize-space()='True']/ancestor::td/preceding-sibling::th");
    this.orientationRecord=page.locator("//th[contains(., 'Orientation')]//a");
    this.bypassCode=page.locator("//input[@name='passcode-input']");
    this.verifyCode=page.locator("//button[normalize-space()='Verify']");
    this.trustBroser=page.locator("//button[@id='trust-browser-button']");
    this.welcomeText=page.locator("//span[contains(normalize-space(),'Welcome to Boston University!')]/span");
    this.newStudentOrientation=page.locator("//div[normalize-space()='New Student Orientation']/div");
    this.mayOrientation=page.locator("(//div[contains(normalize-space(),'May')])[last()]");
    this.registerEvent=page.locator("(//button[normalize-space()='Register' or normalize-space()='register'])[last()]");
    this.addMyself=page.locator("//span[normalize-space()='ADD MYSELF']");
    this.redeemed=page.locator("//span[normalize-space()='Redeemed']");
    this.userDataAutoFetch=page.locator("(//span[normalize-space()='lock'])[1]");
    this.dieteryPreference=page.locator("(//div[contains(normalize-space(),'Food Allergies')])[last()]/parent::*/parent::*/following-sibling::*");
    this.yes=page.locator("//span[normalize-space()='Yes']");
    this.diaryFreeMealCheck=page.locator("(//div[contains(normalize-space(),'dairy free meals')])[last()]");
    this.MealSpecification=page.locator("//input[@id='a2Ddi00000I9ATUEA3']");
    this.emergencyName=page.locator("//div[normalize-space()='Name:']/ancestor::label/mat-form-field");
    this.emergencyPhone=page.locator("//div[normalize-space()='Phone Number']/ancestor::label/mat-form-field");
    this.optionalTour=page.locator("(//div[contains(normalize-space(),'optional tour')])[last()]");
    this.readAndUnderstandInfo=page.locator("//div[contains(normalize-space(),'read and understand')]/ancestor::label/child::mat-form-field");
}
}
