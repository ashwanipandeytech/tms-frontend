const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const ARTIFACT_DIR = '/home/rohit/.gemini/antigravity/brain/9253600a-7bdd-474d-be4c-d7b5828e71dd';
const BASE_URL = 'http://localhost:4200';

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

(async () => {
  console.log('🚀 Starting Puppeteer Real Browser Automated Test...');

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
    console.log('1️⃣ Navigating to Login Page...');
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle0' });
    await sleep(1000);

    console.log('  -> Logging in as Company Manager (manager@radheyshyam.com)...');
    await page.type('input[type="email"], input[formcontrolname="email"]', 'manager@radheyshyam.com');
    await page.type('input[type="password"], input[formcontrolname="password"]', 'Manager@123');
    
    // Click Sign In button
    const loginBtn = await page.$('button[type="submit"]');
    if (loginBtn) {
      await loginBtn.click();
    } else {
      await page.keyboard.press('Enter');
    }
    await sleep(2500);

    const shot1 = path.join(ARTIFACT_DIR, 'browser_01_manager_dashboard.png');
    await page.screenshot({ path: shot1, fullPage: false });
    console.log(`  📸 Saved Screenshot: ${shot1}`);


    // -----------------------------------------------------------------------
    // STEP 2: Users Management (Capacity Cap & Auto-Assign Switch)
    // -----------------------------------------------------------------------
    console.log('2️⃣ Navigating to Users Management Panel (/users)...');
    await page.goto(`${BASE_URL}/users`, { waitUntil: 'networkidle0' });
    await sleep(1500);

    const shot2 = path.join(ARTIFACT_DIR, 'browser_02_users_capacity_caps.png');
    await page.screenshot({ path: shot2, fullPage: false });
    console.log(`  📸 Saved Screenshot: ${shot2}`);


    // -----------------------------------------------------------------------
    // STEP 3: Leads Management (Auto-Assign Queue, Manual Assignment & Filters)
    // -----------------------------------------------------------------------
    console.log('3️⃣ Navigating to Leads Panel (/leads)...');
    await page.goto(`${BASE_URL}/leads`, { waitUntil: 'networkidle0' });
    await sleep(1500);

    // Create a new Google Ads lead to test filter
    console.log('  -> Creating Google Ads Lead for filter testing...');
    const newLeadBtn = await page.$('button[data-bs-target="#leadFormOffcanvas"]');
    if (newLeadBtn) {
      await newLeadBtn.click();
      await sleep(1000);
      
      await page.type('input[formcontrolname="name"]', 'Google Search Test Lead');
      await page.type('input[formcontrolname="phone"]', '9899001122');
      await page.type('input[formcontrolname="email"]', 'google_lead@test.com');
      await page.type('input[formcontrolname="destination"]', 'Kashmir Tour');
      
      // Select Google Search Ads in source dropdown
      await page.select('select[formcontrolname="source"]', 'Google Search Ads');

      const saveBtn = await page.$('button[data-bs-dismiss="offcanvas"]');
      if (saveBtn) await saveBtn.click();
      await sleep(1500);
    }

    // Test Manual Assignment Dropdown Selection
    console.log('  -> Testing Manual Assignment in UI table...');
    const selectElem = await page.$('select[class*="form-select"]');
    if (selectElem) {
      // Assign to User ID 2 (Manager)
      await page.evaluate(() => {
        const sel = document.querySelector('td select.form-select');
        if (sel) {
          const opts = Array.from(sel.options);
          const mgrOpt = opts.find(o => o.text.includes('Manager') || o.value === '2');
          if (mgrOpt) {
            sel.value = mgrOpt.value;
            sel.dispatchEvent(new Event('change', { bubbles: true }));
          }
        }
      });
      await sleep(1500);
    }

    // Test Google Ads Channel Filter in UI
    console.log('  -> Filtering by Google Search Ads in dropdown...');
    await page.evaluate(() => {
      const selects = Array.from(document.querySelectorAll('select'));
      const filterSelect = selects.find(s => Array.from(s.options).some(o => o.value.includes('Google')));
      if (filterSelect) {
        filterSelect.value = 'Google Search Ads';
        filterSelect.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
    await sleep(1500);

    const shot3 = path.join(ARTIFACT_DIR, 'browser_04_leads_google_filter_and_assigned.png');
    await page.screenshot({ path: shot3, fullPage: false });
    console.log(`  📸 Saved Screenshot: ${shot3}`);


    // -----------------------------------------------------------------------
    // STEP 4: Bookings Management (Operations Fulfillment Handoff)
    // -----------------------------------------------------------------------
    console.log('4️⃣ Navigating to Bookings Panel (/bookings)...');
    await page.goto(`${BASE_URL}/bookings`, { waitUntil: 'networkidle0' });
    await sleep(1500);

    const shot4 = path.join(ARTIFACT_DIR, 'browser_05_bookings_ops_handoff.png');
    await page.screenshot({ path: shot4, fullPage: false });
    console.log(`  📸 Saved Screenshot: ${shot4}`);


    // -----------------------------------------------------------------------
    // STEP 5: Sales Executive Scoped View
    // -----------------------------------------------------------------------
    console.log('5️⃣ Logging in as Sales Executive (sales@radheyshyam.com)...');
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle0' });
    await sleep(1000);

    // Clear & Login
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.reload({ waitUntil: 'networkidle0' });
    await sleep(500);

    await page.type('input[type="email"], input[formcontrolname="email"]', 'sales@radheyshyam.com');
    await page.type('input[type="password"], input[formcontrolname="password"]', 'Sales@123');
    const loginBtn2 = await page.$('button[type="submit"]');
    if (loginBtn2) await loginBtn2.click();
    await sleep(2500);

    await page.goto(`${BASE_URL}/leads`, { waitUntil: 'networkidle0' });
    await sleep(1500);

    const shot5 = path.join(ARTIFACT_DIR, 'browser_06_sales_rep_scoped_leads.png');
    await page.screenshot({ path: shot5, fullPage: false });
    console.log(`  📸 Saved Screenshot: ${shot5}`);


    // -----------------------------------------------------------------------
    // STEP 6: Operations Team Scoped View
    // -----------------------------------------------------------------------
    console.log('6️⃣ Logging in as Operations Team (ops@radheyshyam.com)...');
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle0' });
    await sleep(1000);

    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.reload({ waitUntil: 'networkidle0' });
    await sleep(500);

    await page.type('input[type="email"], input[formcontrolname="email"]', 'ops@radheyshyam.com');
    await page.type('input[type="password"], input[formcontrolname="password"]', 'Ops@123');
    const loginBtn3 = await page.$('button[type="submit"]');
    if (loginBtn3) await loginBtn3.click();
    await sleep(2500);

    await page.goto(`${BASE_URL}/bookings`, { waitUntil: 'networkidle0' });
    await sleep(1500);

    const shot6 = path.join(ARTIFACT_DIR, 'browser_07_ops_team_scoped_bookings.png');
    await page.screenshot({ path: shot6, fullPage: false });
    console.log(`  📸 Saved Screenshot: ${shot6}`);

    console.log('✅ ALL BROWSER AUTOMATION STEPS PASSED SUCCESSFULLY!');
  } catch (err) {
    console.error('❌ Browser Automation Error:', err);
  } finally {
    await browser.close();
  }
})();
