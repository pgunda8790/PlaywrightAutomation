import { Page, Locator } from '@playwright/test';
import registerData from "../../data/registration.json";


export class EventsPage {

  EventsTab:Locator;
  recentView:Locator;
  all:Locator;
  addAttendee:Locator;
  ticketSelction:Locator;
  userSearch:Locator;
  userResult:Locator;
  emailOptIn:Locator;
  nextButton:Locator;
  dietaryPreference:Locator;
  No:Locator;
  emergencyContactName:Locator;
  emergencyContactPhone:Locator;
  optionalTour:Locator;
  readAndUnderstandInfo:Locator;
  summaryButton:Locator;
  completeRegistration:Locator;
  registrationCompleted:Locator;
  nameOnCancellation:Locator;

  constructor(private page: Page) {
    
    const frame = page.frameLocator('iframe[src*="blackthorn.io"]');
    
    this.EventsTab =page.locator("//a[@title='Events']//span[normalize-space()='Events']");
    this.recentView=page.locator("//lst-list-view-picker//span[normalize-space()='Recently Viewed']");
    this.all=page.locator("//span[@title='All']");
    this.ticketSelction = page.locator(`(//button[@title='Select ticket'][@aria-label='${registerData.ticketName}'])[last()]`);
    this.addAttendee=page.locator("//span[normalize-space()='Add Attendee']");
    this.userSearch=page.locator("//input[@placeholder='Select an Option']");
    this.userResult=page.locator("//div[@data-key='dropdownresult']");
    this.emailOptIn =page.locator("//input[@name='conference360__Email_Opt_In__c']");
    this.nextButton=page.locator("//button[@name='Next']");
    this.dietaryPreference = page.locator("//*[@aria-label='I have Orientation Dining Preferences or Food Allergies.']");
    this.No =page.locator("//span[@title='Yes']");
    this.emergencyContactName = page.locator("//input[@aria-label='Name:']");
    this.emergencyContactPhone= page.locator("//input[@aria-label='Phone Number']");
    this.optionalTour=frame.locator("//input[contains(@aria-label,'I am interested in an optional tour')]");
    this.readAndUnderstandInfo=frame.locator("//input[contains(@aria-label,'By entering your name')]");
    this.summaryButton=page.locator("//button[normalize-space()='Summary']");
    this.completeRegistration=page.locator("//button[@title='Complete Registration']");
    this.registrationCompleted=page.locator("//div[normalize-space()='Registration Completed']/div");
    this.nameOnCancellation=page.locator("//div[@class='nameText']/p");
   
  } 
}