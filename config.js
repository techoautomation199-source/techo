/* =========================================================================
   TECHO — SHARED CONFIG
   -------------------------------------------------------------------------
   ONE Apps Script URL for the ENTIRE website — Enrollment, Services
   "Request a Service", Rate Us feedback, and the whole Admin / Student /
   Attendance / Fee / Installment / Agreements / Holidays portal are now
   all handled by ONE merged script (google-apps-script.gs), bound to ONE
   Google Sheet with 10 tabs, all under techoautomation199@gmail.com.

   Every page that talks to the backend loads this file FIRST, so there is
   exactly one place to update if the deployment URL ever changes.

   This is already the SAME URL that Enrollment/Services/Rate-Us were using
   before the merge (it was already on techoautomation199), so no update is
   needed here as long as you paste the new merged google-apps-script.gs
   code into THAT SAME script project and redeploy with
   "Manage deployments -> Edit -> New version" (keeps this exact URL).
   Only change this line if you deploy to a brand new URL instead.
   ========================================================================= */

const TECHO_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzPM9vOuQ23GSCCLG-hIWE_3AszMFM2JoivGY-1ctIjLZn2f2_KJvVPHxNrAOQUOVcK/exec";
