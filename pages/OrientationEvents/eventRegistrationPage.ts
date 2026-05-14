import { Page, Locator } from '@playwright/test';

export class EventRegistrationPage {

  BuHomePageLogo:Locator;
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
  reviewSession:Locator;
  allsessions:Locator;
  spotsRemaining:Locator;
  addSessionButton:Locator;
  congratulationsLogo:Locator;
  cancelRegistration:Locator;
  yesCancel:Locator;
  confirmCancel:Locator;
  finish:Locator;
  sessionsScreen:Locator;
  eventName:Locator;
  email:Locator ;
  requiredFieldError :Locator;


  constructor(private page: Page) {

    const frame = page.frameLocator('iframe[src*="blackthorn.io"]');
    
    this.BuHomePageLogo =page.locator("//a[@title='MyBU']");
    this.newStudentOrientation=page.locator("//div[normalize-space()='New Student Orientation']/div");
    this.mayOrientation=page.locator("(//div[contains(normalize-space(),'May')])[last()]");
    this.registerEvent=frame.locator("//button[normalize-space()='Register' or normalize-space()='register']");
    this.addMyself=frame.locator("//span[normalize-space()='ADD MYSELF']");
    this.redeemed=frame.locator("//span[normalize-space()='Redeemed']");
    this.userDataAutoFetch=frame.locator("(//span[normalize-space()='lock'])[1]");
    this.dieteryPreference=frame.locator("(//div[contains(normalize-space(),'Food Allergies')])[last()]/parent::*/parent::*/following-sibling::*");
    this.yes=frame.locator("//span[normalize-space()='Yes']");
    this.diaryFreeMealCheck=frame.locator("(//div[contains(normalize-space(),'dairy free meals')])[last()]");
    this.MealSpecification=frame.locator("//input[@id='a2Ddi00000I9ATUEA3']");
    this.emergencyName=frame.locator("//div[normalize-space()='Name:']/ancestor::label/mat-form-field");
    this.emergencyPhone=frame.locator("//div[normalize-space()='Phone Number']/ancestor::label/mat-form-field");
    this.optionalTour=frame.locator("(//div[contains(normalize-space(),'optional tour')])[last()]");
    this.readAndUnderstandInfo=frame.locator("//div[contains(normalize-space(),'read and understand')]/ancestor::label/child::mat-form-field");
    this.sessionsScreen=frame.locator("//strong[normalize-space()='Summary']");
    this.allsessions=frame.locator("//*[contains(@class,'session-name')]");
    this.addSessionButton=frame.locator("//button[contains(@id,'add-button')]");
    this.reviewSession=frame.locator("(//span[normalize-space()='Review Sessions'])[last()]");
    this.spotsRemaining=frame.locator("//span[contains(normalize-space(),'SPOTS REMAINING')]");
    this.congratulationsLogo=frame.locator("//img[@alt='Success']");
    this.cancelRegistration=page.locator("//button[normalize-space()='Cancel Registration']");
    this.yesCancel = page.locator("//button[normalize-space()='Yes']");
    this.confirmCancel = page.locator("(//div[contains(normalize-space(),'Your registration has been canceled')])[last()]");
    this.finish=page.locator("//button[normalize-space()='Finish']");
    this.eventName=frame.locator("//button[@title='back']/following-sibling::h1");
    this.email=frame.locator("//input[@name='email']");
    this.requiredFieldError = frame.locator("(//mat-error[normalize-space()='This is required'])[1]");

  } 
}