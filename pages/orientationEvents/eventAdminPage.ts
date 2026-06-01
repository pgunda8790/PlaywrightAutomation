import { Page, Locator } from '@playwright/test';


export class EventsPage {

  EventsTab:Locator;
  recentView:Locator;
  all:Locator;
  addAttendee:Locator;
  ticketSelction:Locator;
  userSearch:Locator;
  userResult:Locator;
  email:Locator;
  emailOptIn:Locator;
  nextButton:Locator;
  dietaryPreference:Locator;
  No:Locator;
  Yes:Locator;
  emergencyContactName:Locator;
  emergencyContactPhone:Locator;
  optionalTour:Locator;
  readAndUnderstandInfo:Locator;
  summaryButton:Locator;
  completeRegistration:Locator;
  registrationCompleted:Locator;
  dairyFree:Locator;
  dairyPreference:Locator;
  attendeeLink :Locator;
  getRegisteredAttendeeByUsername:Locator;
  editRegistrationStatus:Locator;
  registrationStatusField:Locator;
  cancelledStatusValue:Locator;
  registrationCancellationReason:Locator;
  adminCancellationReason:Locator;
  saveEdit:Locator;
  printableView:Locator;
  adminCancellationDescription:Locator;



  constructor(private page: Page, registerData: any) {
    
    const frame = page.frameLocator('iframe[src*="blackthorn.io"]');
    
    this.EventsTab =page.locator("//a[@title='Events']//span[normalize-space()='Events']");
    this.recentView = page.locator("//button[contains(@title,'Select a List View')]");
    this.all=page.locator("//span[@title='All']");
    this.ticketSelction = page.locator(`//*[contains(@aria-label,'${registerData.ticketName}')]`);
    this.addAttendee=page.locator("//span[normalize-space()='Add Attendee']");
    this.userSearch=page.locator("//input[contains(@aria-label,'Search for records')]");
    this.userResult=page.locator(`//div[@data-name='${registerData.userName}']`);
    this.email=page.locator("//*[@name='conference360__Email2__c']")
    this.emailOptIn =page.locator("//input[@name='conference360__Email_Opt_In__c']");
    this.nextButton=page.locator("//button[@name='Next']");
    this.dietaryPreference = page.locator("//button[contains(@aria-label,'Dining Preferences')]");
    this.No =page.locator("//span[@title='No']");
    this.Yes =page.locator("//span[@title='Yes']");
    this.dairyFree=page.locator("//input[contains(@aria-label,'I require dairy free meals')]/following-sibling::label/span[1]");
    this.dairyPreference=page.locator("//input[contains(@aria-label,'Please tell us more')]");
    this.emergencyContactName = page.locator("//input[contains(@aria-label,'Name:')]");
    this.emergencyContactPhone= page.locator("//input[contains(@aria-label,'Phone Number')]");
    this.optionalTour=page.locator("//input[contains(@aria-label,'I am interested in an optional tour')]/following-sibling::label/span[1]");
    this.readAndUnderstandInfo=page.locator("//input[contains(@aria-label,'By entering your name')]");
    this.summaryButton=page.locator("//button[normalize-space()='Summary']");
    this.completeRegistration=page.locator("//button[@title='Complete Registration']");
    this.registrationCompleted=page.locator("//div[normalize-space()='Registration Completed']/div");
    this.attendeeLink=page.locator("//records-hoverable-link[contains(normalize-space(),'Attendees')]");
    this.getRegisteredAttendeeByUsername = page.locator(` (//tr[@role='row'][.//td[normalize-space()='${registerData.userName}']][.//td[normalize-space()='Registered']]/th//span[starts-with(normalize-space(),'AT')])[last()]`);
    this.editRegistrationStatus=page.locator("//button[@title='Edit Registration Status']"); 
    this.registrationStatusField=page.locator("//button[@aria-label='Registration Status']");
    this.cancelledStatusValue=page.locator("//*[@data-value='Canceled']");
    this.registrationCancellationReason=page.locator("//button[@aria-label='Registration Cancellation Reason']");
    this.adminCancellationReason=page.locator(`//lightning-base-combobox-item[@data-value='${registerData.adminCancellationReason}']`);
    this.saveEdit=page.locator("//button[@name='SaveEdit']");
    this.printableView = page.locator("//div[@title='Printable View']");
    this.adminCancellationDescription=page.locator("//label[normalize-space()='Cancellation Description']/following-sibling::div/textarea");

   
  }

   
  } 
