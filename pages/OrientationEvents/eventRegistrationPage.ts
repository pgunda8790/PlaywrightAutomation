import { Page, Locator } from '@playwright/test';

export class EventRegistrationPage {

  BuHomePageLogo:Locator;
  newStudentOrientation:Locator;
  mayOrientation:Locator;
  fallOrientation:Locator;
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
  userNameInSummary:Locator;
  congratulationsLogo:Locator;
  cancelRegistration:Locator;
  yesCancel:Locator;
  confirmCancel:Locator;
  finish:Locator;
  sessionsScreen:Locator;
  eventName:Locator;
  email:Locator ;
  requiredFieldError :Locator; 
  nameOnCancellation:Locator;
  cancellationPageFields:Locator;
  updateInfo:Locator;
  nextSteps:Locator;
  helpFulResources :Locator;
  contactUs :Locator;
  emailVisibility:Locator;
  attendeeLink:Locator;
  orientationEmergencyContactInformation:Locator;
  emergencyNameUpdated:Locator;
  emergencyPhoneUpdated:Locator;
  saveButton:Locator;
  clear:Locator;
  continue:Locator;
  pleaseConfirm:Locator;
  cancelUpdateInfo:Locator;
  ok:Locator;
  finishUpdateScreen:Locator;
  cancellationReason:Locator;




  constructor(private page: Page) {

    const frame = page.frameLocator('iframe[src*="blackthorn.io"]');
    
    this.BuHomePageLogo =page.locator("//a[@title='MyBU']");
    this.newStudentOrientation=page.locator("//div[normalize-space()='New Student Orientation']/div");
    this.mayOrientation=page.locator("(//div[contains(normalize-space(),'May')])[last()]");
    this.fallOrientation =page.locator("(//div[contains(normalize-space(),'Fall')])[last()]");
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
    this.userNameInSummary=frame.locator("//div[contains(@class,'ticket-summary')]/strong");
    this.nameOnCancellation=page.locator("//div[@class='nameText']/p");
    this.cancellationPageFields=page.locator("//div[@class='title]");
    this.updateInfo =page.locator("//button[normalize-space()='Update my Info']");
    this.nextSteps =page.locator("//strong[normalize-space()='Next Steps']");
    this.helpFulResources=page.locator("//strong[normalize-space()='Helpful Resources']");
    this.contactUs=page.locator("//strong[normalize-space()='Contact Us']");
    this.emailVisibility=page.locator("//span[normalize-space()='Email:']");
    this.attendeeLink=page.locator("//img[contains(@alt,'Click here to review')]");
    this.orientationEmergencyContactInformation=page.locator("//span[@title='Orientation Emergency Contact Information']");
    this.emergencyNameUpdated =page.locator("//input[@name='zBU_Orientation_Emergency_Contact_Name__c']");
    this.emergencyPhoneUpdated=page.locator("//input[@name='zBU_Orientation_Emergency_Contact_Phone__c']");
    this.saveButton=page.locator("//button[@title='Save']");
    this.clear=page.locator("//button[@title='Clear']");
    this.continue=page.locator("//button[@title='Continue']");
    this.pleaseConfirm=page.locator("//div[normalize-space()='Please Confirm']");
    this.cancelUpdateInfo =page.locator("//button[normalize-space()='Cancel']");
    this.ok=page.locator("//button[normalize-space()='OK']");
    this.finishUpdateScreen=page.locator("//button[@title='Finish']");
    this.cancellationReason=page.locator("//textarea[@name='cancelationReason']");

  } 
}