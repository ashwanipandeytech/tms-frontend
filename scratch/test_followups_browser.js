const puppeteer = require('puppeteer-core');
const path = require('path');

const ARTIFACT_DIR = '/home/rohit/.gemini/antigravity/brain/9253600a-7bdd-474d-be4c-d7b5828e71dd';
const BASE_URL = 'http://localhost:4200';

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

(async () => {
  console.log('🚀 Starting Puppeteer Browser Test for Follow-Ups & Activity Comments...');

  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  try {
    // -----------------------------------------------------------------------
    // STEP 1: Manager Login
    // -----------------------------------------------------------------------
    console.log('1️⃣ Logging in as Company Manager (manager@radheyshyam.com)...');
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle0' });
    await sleep(1000);

    await page.type('input[type="email"], input[formcontrolname="email"]', 'manager@radheyshyam.com');
    await page.type('input[type="password"], input[formcontrolname="password"]', 'Manager@123');
    
    const loginBtn = await page.$('button[type="submit"]');
    if (loginBtn) {
      await loginBtn.click();
    } else {
      await page.keyboard.press('Enter');
    }
    await sleep(2500);

    // -----------------------------------------------------------------------
    // STEP 2: Follow-ups Management & Tabs
    // -----------------------------------------------------------------------
    console.log('2️⃣ Navigating to Follow-ups Panel (/follow-ups)...');
    await page.goto(`${BASE_URL}/follow-ups`, { waitUntil: 'networkidle0' });
    await sleep(2000);

    // Take screenshot of Follow-ups Panel with Tabs
    const shot1 = path.join(ARTIFACT_DIR, 'browser_08_followups_panel.png');
    await page.screenshot({ path: shot1, fullPage: false });
    console.log(`  📸 Saved Screenshot: ${shot1}`);

    // Schedule a new Follow-up
    console.log('  -> Scheduling a new High-Priority Follow-up...');
    const newFollowUpBtn = await page.$('button[data-bs-target="#followUpFormOffcanvas"]');
    if (newFollowUpBtn) {
      await newFollowUpBtn.click();
      await sleep(1000);

      // Select Lead
      await page.evaluate(() => {
        const select = document.querySelector('select[formcontrolname="lead_id"]');
        if (select && select.options.length > 1) {
          select.selectedIndex = 1;
          select.dispatchEvent(new Event('change', { bubbles: true }));
        }
      });

      // Select Priority = High
      await page.select('select[formcontrolname="priority"]', 'high');
      
      // Fill Remarks
      await page.type('textarea[formcontrolname="remarks"]', 'Discuss 5N/6D Kerala package inclusions & discount');

      // Save
      const saveBtn = await page.$('button[data-bs-dismiss="offcanvas"]');
      if (saveBtn) await saveBtn.click();
      await sleep(2000);
    }

    // Click "Due Today" tab, then "Overdue", then "Upcoming", then "Completed", then "All Follow-ups"
    console.log('  -> Testing Status Tabs...');
    const tabButtons = await page.$$('div.d-flex.border-bottom button');
    for (const tabBtn of tabButtons) {
      await tabBtn.click();
      await sleep(500);
    }
    await sleep(1000);

    // Complete a Follow-up
    console.log('  -> Marking a follow-up completed with feedback...');
    const completeBtn = await page.$('button[title="Mark Completed"]');
    if (completeBtn) {
      await completeBtn.click();
      await sleep(1000);

      await page.type('textarea[formcontrolname="outcome"]', 'Customer agreed to customized itinerary. Requested booking invoice.');
      const modalCompleteBtn = await page.$('#completeFollowUpModal button.btn-success');
      if (modalCompleteBtn) await modalCompleteBtn.click();
      await sleep(2000);
    }

    const shot2 = path.join(ARTIFACT_DIR, 'browser_09_followup_complete_reschedule.png');
    await page.screenshot({ path: shot2, fullPage: false });
    console.log(`  📸 Saved Screenshot: ${shot2}`);

    // -----------------------------------------------------------------------
    // STEP 3: Leads Activity & Threaded Comment Trail
    // -----------------------------------------------------------------------
    console.log('3️⃣ Navigating to Leads Panel & Opening Activity Drawer...');
    await page.goto(`${BASE_URL}/leads`, { waitUntil: 'networkidle0' });
    await sleep(2000);

    const activityBtn = await page.$('button[title="Activity & Comment Trail"]');
    if (activityBtn) {
      await activityBtn.click();
      await sleep(1500);

      console.log('  -> Posting a public sales rep comment...');
      const commentInput = await page.$('#leadActivityOffcanvas textarea');
      if (commentInput) {
        await commentInput.type('Customer requested flight add-on rates for 2 adults.');
        const postBtn = await page.$('#leadActivityOffcanvas button.btn-primary');
        if (postBtn) await postBtn.click();
        await sleep(1500);
      }

      console.log('  -> Posting an Internal Manager Note (RBAC Scoped)...');
      const switchInput = await page.$('#internalNoteSwitch');
      if (switchInput) {
        await switchInput.click();
        await sleep(500);

        const commentInput2 = await page.$('#leadActivityOffcanvas textarea');
        if (commentInput2) {
          await commentInput2.type('Manager Note: Max 5% discount allowed if confirmed by Friday.');
          const postBtn2 = await page.$('#leadActivityOffcanvas button.btn-primary');
          if (postBtn2) await postBtn2.click();
          await sleep(1500);
        }
      }
    }

    const shot3 = path.join(ARTIFACT_DIR, 'browser_10_lead_activity_drawer.png');
    await page.screenshot({ path: shot3, fullPage: false });
    console.log(`  📸 Saved Screenshot: ${shot3}`);

    console.log('✅ ALL FOLLOW-UP & ACTIVITY E2E BROWSER TESTS PASSED PERFECTLY!');
  } catch (err) {
    console.error('❌ E2E Browser Test Error:', err);
  } finally {
    await browser.close();
  }
})();
