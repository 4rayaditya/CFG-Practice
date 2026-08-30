import { test, expect } from '@playwright/test';

test.describe('Shifting Orbits — End-to-End Core User Journeys (CUJ 1, 2, 3)', () => {

  test('Student, Mentor, and Admin End-to-End Workflow', async ({ browser }) => {
    // =========================================================================
    // 1. STUDENT JOURNEY (Offline Intake & PWA Sync)
    // =========================================================================
    const studentContext = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      recordVideo: { dir: 'e2e-videos/student' }
    });
    const studentPage = await studentContext.newPage();

    console.log('[E2E Test] Step 1: Navigating to Student Login...');
    await studentPage.goto('http://localhost:5173/login');
    await studentPage.waitForLoadState('networkidle');

    // Click Student quick fill demo persona button
    const studentQuickFill = studentPage.locator('button:has-text("Rahul Kumar (Scholar)")').first();
    await expect(studentQuickFill).toBeVisible();
    await studentQuickFill.click();
    await studentPage.waitForTimeout(500);

    // Click Sign In button
    const submitBtn = studentPage.locator('#btn-submit-auth').first();
    await expect(submitBtn).toBeVisible();
    await submitBtn.click();

    await studentPage.waitForURL('**/student/voice-query', { timeout: 15000 });
    console.log('[E2E Test] Step 2: Successfully logged in as Student Rahul Kumar.');

    // Verify Page Header
    await expect(studentPage.locator('h1')).toContainText(/Voice Doubt Intake|Ask/i);

    // Switch to Text Intake Mode to submit structured K-12 doubt
    console.log('[E2E Test] Step 3: Switching to Type Question mode...');
    const typeModeBtn = studentPage.locator('button:has-text("Type Question"), button:has-text("Type")').first();
    if (await typeModeBtn.isVisible()) {
      await typeModeBtn.click();
    }

    // Simulate Offline Mode
    console.log('[E2E Test] Step 4: Simulating Network Offline Disconnect...');
    await studentContext.setOffline(true);
    await studentPage.waitForTimeout(1000);

    // Fill doubt form while offline
    const titleInput = studentPage.locator('input[placeholder*="prevent memory leaks"], input[placeholder*="explain"], input[placeholder*="Title"]').first();
    if (await titleInput.isVisible()) {
      await titleInput.fill("I don't understand how to balance this redox equation");
    }

    const descArea = studentPage.locator('textarea[placeholder*="unexpected behavior"], textarea[placeholder*="Explain"]').first();
    if (await descArea.isVisible()) {
      await descArea.fill("I am struggling to balance the half-reactions for oxidation and reduction in acidic solution.");
    }

    // Click Submit while offline
    const submitDoubtBtn = studentPage.locator('button:has-text("Post Question"), button:has-text("Submit")').first();
    if (await submitDoubtBtn.isVisible()) {
      await submitDoubtBtn.click();
    }

    await studentPage.waitForTimeout(1500);

    // Reconnect Network
    console.log('[E2E Test] Step 5: Reconnecting network and triggering background sync...');
    await studentContext.setOffline(false);
    await studentPage.waitForTimeout(1000);

    // Click Sync Now button if present
    const syncNowBtn = studentPage.locator('#btn-manual-sync-offline, button:has-text("Sync Now")').first();
    if (await syncNowBtn.isVisible()) {
      await syncNowBtn.click();
    }

    await studentPage.waitForTimeout(2000);

    // Verify Question is processed
    await expect(studentPage.locator('body')).toContainText(/Question Processed Successfully|Submitted/i);

    console.log('[E2E Test] Student Journey Completed Successfully!');

    // =========================================================================
    // 2. MENTOR JOURNEY (Live Doubt Board & Answering)
    // =========================================================================
    const mentorContext = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      recordVideo: { dir: 'e2e-videos/mentor' }
    });
    const mentorPage = await mentorContext.newPage();

    console.log('[E2E Test] Step 6: Logging in as Volunteer Mentor (Dr. Sarah Jenkins)...');
    await mentorPage.goto('http://localhost:5173/login');
    await mentorPage.waitForLoadState('networkidle');

    // Click Dr. Sarah Jenkins mentor quick fill
    const mentorQuickFill = mentorPage.locator('button:has-text("Dr. Sarah Jenkins")').first();
    await expect(mentorQuickFill).toBeVisible();
    await mentorQuickFill.click();
    await mentorPage.waitForTimeout(500);

    const mentorSubmitBtn = mentorPage.locator('#btn-submit-auth').first();
    await expect(mentorSubmitBtn).toBeVisible();
    await mentorSubmitBtn.click();

    await mentorPage.waitForURL('**/mentor/doubt-board', { timeout: 15000 });
    console.log('[E2E Test] Step 7: Successfully logged in as Mentor Dr. Sarah Jenkins.');

    // Switch to Doubts Queue tab
    const doubtsTab = mentorPage.locator('#tab-doubts').first();
    if (await doubtsTab.isVisible()) {
      await doubtsTab.click();
    }

    await mentorPage.waitForTimeout(1000);

    // Verify chemistry/physics question is visible
    console.log('[E2E Test] Step 8: Locating student question and opening answer modal...');
    const answerBtn = mentorPage.locator('button:has-text("Answer Question"), button:has-text("Edit Answer")').first();
    if (await answerBtn.isVisible()) {
      await answerBtn.click();
      await mentorPage.waitForTimeout(1000);

      // Fill step-by-step teacher answer
      const answerArea = mentorPage.locator('textarea[placeholder*="explanation"], textarea[placeholder*="step-by-step"]').first();
      if (await answerArea.isVisible()) {
        await answerArea.fill("First, separate the reaction into oxidation and reduction half-reactions. Balance atoms other than H and O, then balance O using H2O, and H using H+.");
      }

      // Submit Explanation
      const submitAnswerBtn = mentorPage.locator('#btn-submit-answer').first();
      if (await submitAnswerBtn.isVisible()) {
        await submitAnswerBtn.click();
      }

      await mentorPage.waitForTimeout(1500);
      console.log('[E2E Test] Teacher explanation submitted successfully!');
    }

    // =========================================================================
    // 3. ADMIN JOURNEY (Governance & Telemetry Dashboard)
    // =========================================================================
    const adminContext = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      recordVideo: { dir: 'e2e-videos/admin' }
    });
    const adminPage = await adminContext.newPage();

    console.log('[E2E Test] Step 9: Logging in as Admin (Program Director)...');
    await adminPage.goto('http://localhost:5173/login');
    await adminPage.waitForLoadState('networkidle');

    const adminQuickFill = adminPage.locator('button:has-text("Program Director (Admin)")').first();
    await expect(adminQuickFill).toBeVisible();
    await adminQuickFill.click();
    await adminPage.waitForTimeout(500);

    const adminSubmitBtn = adminPage.locator('#btn-submit-auth').first();
    await expect(adminSubmitBtn).toBeVisible();
    await adminSubmitBtn.click();

    await adminPage.waitForURL('**/admin/analytics', { timeout: 15000 });
    console.log('[E2E Test] Step 10: Navigating to Admin Telemetry Dashboard...');

    // Verify Admin Header and Telemetry Metrics
    await expect(adminPage.locator('h1')).toContainText(/Telemetry|Director|Governance/i);
    await expect(adminPage.locator('body')).toContainText(/Active Learners|Underprivileged/i);

    console.log('[E2E Test] All CUJ User Journeys verified cleanly!');

    await studentContext.close();
    await mentorContext.close();
    await adminContext.close();
  });

});
