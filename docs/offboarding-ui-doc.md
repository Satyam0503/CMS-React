# Offboarding Module UI Documentation

This document covers the complete UI for the offboarding / employee exit module as implemented in the current React app. It is organized by role and by workflow so nothing is missed.

For backend services, API contracts, persisted state, permissions, reminders, settlement, lifecycle synchronization, and operational limitations, see the [end-to-end offboarding reference](../../CMS-Backend-Core/docs/hrms/offboarding.md).

## 1. Scope and UI Coverage

The offboarding module spans multiple entry points and screens:

- Employee self-service resignation and exit case tracking
- HR / management review and approval flows
- Reporting manager operational actions
- Admin-controlled policy configuration
- Joint discussion workflow between employee, manager, and HR
- Former employee portal for approved post-exit documents and requests
- Clearance, handover, asset, access, finance, and benefit tracking

Relevant UI source files:

- `src/app/modules/users/components/ResignationAction.tsx`
- `src/app/modules/users/components/EmployeeOffboardingAction.tsx`
- `src/app/modules/users/components/EmployeeExitCaseCard.tsx`
- `src/app/modules/users/components/EmployeeExitManagementCard.tsx`
- `src/app/modules/users/components/EmployeeExitOperationsPanel.tsx`
- `src/app/modules/users/components/EmployeeExitPolicySettings.tsx`
- `src/app/modules/formerEmployeePortal/FormerEmployeePortalPage.tsx`
- `src/app/modules/users/UserProfile.tsx`
- `src/app/modules/employees/employeeServices.ts`

---

## 2. High-Level Role Matrix

| Role | Primary UI Entry | Main Actions |
| --- | --- | --- |
| Employee | My profile / resignation card | Submit resignation, view case, withdraw, respond to discussion, upload evidence, update personal email, request earlier release, submit handover |
| Reporting Manager | Employee profile header action | Offboard employee, review and approve/reject, start joint discussion, trigger HR/manager workflow |
| HR | Employee profile management modal | Review exit case, approve/reject, create joint discussion, manage portal, document requests, clearances, final settlement steps |
| Admin | Company details → Offboarding settings | Configure policy, create company/department/role rules, define clearance templates |
| Former Employee | Secure portal link | Download approved documents, submit document request |

---

## 3. Employee UI

### 3.1 Employee Self-Resignation Entry

Location:
- `UserProfile.tsx`
- `ResignationAction.tsx`

What the employee sees:
- On their own profile, they see a `Start resignation` button if they are active and do not already have an active exit case.
- Opening the modal presents:
  - Last working date picker
  - Reason field
  - Submit resignation CTA

Behavior:
- The employee must select a last working date.
- A resignation request is submitted via `submitOwnResignation`.
- Once submitted, the employee is flagged as having an active exit case.
- The profile no longer shows the resignation button until the case is resolved or withdrawn.

Key UX notes:
- This is a direct employee self-service route.
- The employee remains active in the profile system until the last working date, but the exit workflow is created.
- Historical employee data is retained; only access/exit status changes.

### 3.2 Employee Offboarding Action for Manager/Admin Flow

Location:
- `EmployeeOffboardingAction.tsx`

Used when:
- A logged-in user is viewing another employee profile and has permission to manage employees.

What appears:
- A button labeled `Offboard employee` in the page header action area.
- In the modal:
  - Exit type selection: resignation or termination
  - Last working date
  - Reason field
  - `Start offboarding` action

Important logic:
- It checks whether the selected employee already has an active exit case.
- If the employee is already resigned/terminated or has an active exit, the button is hidden.
- This is effectively HR / manager-initiated exit creation.

### 3.3 Employee Exit Case Card

Location:
- `EmployeeExitCaseCard.tsx`

This is the employee’s central self-service offboarding dashboard.

Entry point:
- On the employee’s own profile, the card button is displayed as:
  - `View offboarding case` when there is an active exit case
  - `View resignation history` when there is no active case but there is a prior record

Main sections inside the modal:

#### A. Case summary header
- Shows current status chip
- Shows last working date
- Displays whether the case is active or withdrawn
- Shows recent audit events for the last 3 items
- Displays pending clearance count

#### B. Withdraw resignation / request withdrawal
- Available when the employee has permitted withdrawal actions.
- Allows optional reason text.
- If the case is already in `NoticePeriod`, the request is sent for manager/HR review rather than immediate withdrawal.

#### C. Discussion response
- Shows when the employee has a `RespondDiscussion` permitted action.
- Displays discussion request and past discussion messages if in joint discussion mode.
- Includes a text box for employee response.

#### D. Earlier last working day request
- Shows only when the case is in `NoticePeriod`.
- Allows the employee to request a shorter notice period with:
  - requested last working date
  - reason
- Submitted via `requestEmployeeExitNoticeAdjustment`.

#### E. Handover tasks
- Lists every assigned handover item.
- Each task shows title and status.
- Employee can submit each task when not already submitted/approved/waived.

#### F. Notice-period offer
- Triggered when HR has approved a buyout or notice recovery.
- Employee can:
  - Accept offer
  - Keep original notice

#### G. Post-exit contact
- Lets the employee save a personal email for future communication after exit.
- Validates the email string before saving.

#### H. Acknowledge summary
- Employee can acknowledge the confirmed exit summary.

#### I. Upload exit evidence
- Accepts file upload categories such as resignation proof or other documents.
- Supported types:
  - PDF
  - PNG
  - JPG
  - RFC822 message/email
- Uploads are shared with manager and HR.

#### J. Additional employee document requests
- User can create former-employee requests, for example:
  - RelievingLetter
  - ExperienceLetter
  - FnFStatement
  - TaxDocument
  - Correction
  - Other

### 3.4 Employee-specific operational logic

The employee can interact with these offboarding elements:

- Withdrawal management
- Discussion response
- Handover completion
- Notice adjustment request
- Final personal contact update
- Evidence upload
- Acknowledgement
- former-employee request creation

This makes the employee UI a self-service control center for the active offboarding case.

### 3.5 HR rejoin / rehire action

Location:
- `src/app/modules/users/components/EmployeeExitManagementCard.tsx`
- `src/app/modules/employees/employeeServices.ts`

Workflow:

1. HR opens **Manage offboarding** for an employee whose exit status is `Resigned` or `Terminated`.
2. In **Exit interview**, HR checks or clears **Mark employee eligible for rehire**. Each change shows a notification, and the save action remains available when eligibility is the only changed field.
3. The saved value is loaded again from `EmployeeExit.ExitInterview.IsRehireEligible` when the modal is refreshed or reopened.
4. When the case is eligible and the server includes the `Rejoin` permitted action, the **Rejoin employee** section is displayed.
5. HR enters a mandatory reason and submits the action. The client sends the case ID, current version and reason to `POST api/User/RejoinEmployee`.
6. A successful response refreshes the management case and shows a success notification. The employee is active again and the former-employee portal is disabled. The historical exit attendance cutoff remains as an audit boundary, but attendance editing/initialization after rejoin is allowed by the backend employment-period rule.

The UI does not display rejoin for notice-period, withdrawn, cancelled, already rejoined or non-eligible cases. Server-side permission, status, eligibility and version checks remain authoritative.

### 3.6 Rejoin and attendance period

Rejoin starts a new active employment period. The employee record is restored to `Status=true` and `EmploymentStatus="Active"`; the employee-level `LastWorkingDate` and legacy `ExitDate` are cleared. The completed exit's `EmployeeExitAttendanceCutoff` is retained so the prior employment period remains auditable.

Attendance uses `EmploymentPeriod.WasEmployedOn` as the authoritative date check. Therefore:

- dates before the original joining date remain unavailable;
- dates through the former last working date remain valid historical dates;
- dates after the former exit remain locked while the employee is still exited;
- dates after a valid rejoin are eligible again, subject to schedule, holiday, weekly-off, payroll, and monthly-lock rules;
- rejoin does not retroactively manufacture attendance for dates before the new active period.

The cutoff is deliberately not deleted during rejoin. `AttendanceEditGuard` ignores that historical cutoff only when the centralized employment-period rule confirms the employee was employed on the requested post-rejoin date. This prevents stale exit metadata from locking a legitimately rehired employee while preserving exit protection for former employees.

---

## 4. Reporting Manager UI

### 4.1 Manager / Reporting Manager Entry

The manager sees the same `Offboard employee` action when viewing another employee’s profile, if they have the relevant permission.

The reporting manager is also the primary reviewer in the workflow when policy requires managerial approval.

### 4.2 Manager-side review in `EmployeeExitManagementCard`

Location:
- `EmployeeExitManagementCard.tsx`

This is the main review/work panel used by the manager or HR when a case is selected.

#### A. Header information
- Displays employee last working date
- Shows status chip
- Shows whether the case is still active

#### B. Joint discussion panel
- Shows when `discussionMode === "Joint"`
- Displays the discussion request and all discussion messages
- Lets the user send a contribution if they have `RespondJointDiscussion` permission
- This is part of the collaborative discussion path rather than rejection-only handling

#### C. Pending clearance warning
- Displays `X clearance actions pending.`
- Helps the manager see that outstanding tasks remain

#### D. Former employee portal management
- If allowed, the manager/HR can:
  - create a portal invitation
  - revoke portal access
  - provide a reason for revocation

#### E. Employee document requests
- Displays any former employee requests
- Manager can mark as:
  - In progress
  - Issued
- Allows a notes field for resolution

#### F. Operational panel
- The manager can work through the actual offboarding clearances using `EmployeeExitOperationsPanel`
- This is a large operational block for:
  - Handover tasks
  - Asset clearance
  - Access revocation
  - Finance items
  - Benefits items
  - Final settlement
  - Date update
  - Completion or exceptional completion

#### G. Decision stack
- The manager sees available actions tailored by permitted actions.
- Common actions include:
  - Approve
  - Discuss
  - JointDiscussion
  - Reject
  - RequestDiscussion

Important validation logic:
- If a notice-adjustment request is pending or awaiting employee decision, the case cannot be approved until resolved.
- `JointDiscussion` also requires selected discussion participants.

### 4.3 Operational work panel for manager/HR

Location:
- `EmployeeExitOperationsPanel.tsx`

This panel is one of the most complete UI sections in the module.

Sections typically included:

#### A. Operational offboarding overview
- Lists the clearance template work and states
- Shows whether sections are pending or completed

#### B. Handover tasks
- For each handover item, manager can:
  - submit review
  - approve/reject/waive based on workflow state

#### C. Asset clearance
- Handles asset return / recovery tasks
- Records asset identifiers, statuses, and optional recovery amount

#### D. Access revocation
- Each system access item can be reviewed and marked as revoked or scheduled

#### E. Finance clearance
- Handles pending payments, recoveries, adjustments, and associated references

#### F. Benefit clearance
- Tracks benefits being stopped or transferred

#### G. Employee final settlement
- Sets / confirms settlement status or payment flow
- Supports amount and payment references

#### H. Evidence verification
- Review evidence uploaded by employee or other actors
- Mark evidence as verified or not verified

#### I. Case completion actions
- complete exit
- exceptional complete exit
- update last working date
- final settlement approvals

This panel is the exact operational UI for the manager/HR side of offboarding execution.

---

## 5. HR UI

The HR UI overlaps heavily with the manager UI because the code uses a shared management card, but HR-specific responsibilities are visible in the actions and logic.

### 5.1 HR review and decision actions

In `EmployeeExitManagementCard`, the actions available to HR can include:

- Approve
- Discuss
- Start joint discussion
- Reject
- Request discussion

These are not static buttons for all users; they appear only when the case has the relevant `permittedActions`.

### 5.2 HR responsibilities in the modal

HR can:

- Review the exit case timeline and status
- See notice adjustments and block approval if unresolved
- Review discussion messages in joint discussion mode
- Create former employee portal invites
- Revoke portal access with a reason
- Review and resolve former employee requests for requested documents
- Manage clearances from the operations panel
- Record employee exit interview notes or file attachments
- Reassign responsibilities to a different user owner
- Verify evidence uploads
- Trigger final settlement logic and payment decisions

### 5.3 Exit interview recording

Within `EmployeeExitManagementCard` there is a dedicated exit interview section:
- HR notes field
- Optional file upload for interview materials
- Save action to record interview details

This is a dedicated HR-facing capability.

### 5.4 Former employee portal invitation

HR can issue a temporary secure portal invite to a former employee.

Flow:
- Click `Create former-employee portal invitation`
- System creates a secure invite valid for a fixed duration (currently 72 hours in UI)
- Former employee receives a secure link
- The invite allows document download and limited request submission

### 5.5 Document request resolution

HR can resolve former-employee requests as:
- In progress
- Issued
- Closed

The UI shows the request type, details, and allows a notes field before resolution.

---

## 6. Admin UI

### 6.1 Company Details → Offboarding Settings

Location:
- `EmployeeExitPolicySettings.tsx`
- `CompanyDetails.tsx` likely links to this settings area under Company Details

This is the admin configuration area for offboarding governance.

### 6.2 Policy structure

The admin can configure multiple policy scopes:

- Company default
- Department-specific policy
- Access-role-specific policy

Priority applies in this order:
1. Department policy
2. Role policy
3. Company default

The UI explains this clearly with a policy priority message.

### 6.3 Policy configuration fields

Per policy, admin can configure:

- Minimum notice days
- Notice-pay salary basis (`GrossMonthly` or `BasicMonthly`)
- Daily-rate divisor
- Enable offboarding
- Manager review required
- HR review required
- Joint discussion enabled
- Resignation evidence required
- Employee acknowledgement required
- Former employee portal enabled
- Required completion gates:
  - Handover
  - Asset clearance
  - Access revocation
  - Finance clearance
  - Benefit clearance
  - Final settlement

### 6.4 Saved policy list

Admin sees a list of saved policies in accordion cards with:
- policy scope label
- journey setting count
- mandatory gate count
- expand/collapse summary

The admin can:
- Add a policy
- Edit an existing policy
- Cancel edits
- Save changes

### 6.5 Clearance templates

Admin can create and manage clearance templates. These define standardized tasks assigned during offboarding.

Template settings:
- clearance category
- template key
- applies to global or department
- department selection for department override
- required completion gate
- responsible permission fallback
- due days before last working date
- mandatory vs optional

This is a crucial admin UI because it controls which tasks are generated during exit flows.

### 6.6 Why this is an admin-only area

This area defines the actual offboarding business rules for the company. It directly affects:
- whether offboarding is enabled
- whether managers/HR must approve
- whether joint discussion is allowed
- which clearances are required
- what tasks employees and managers must fulfil

This is the central business-rule interface in the app.

---

## 7. Joint Discussion UI

Joint discussion is a distinct workflow and deserves a dedicated section because it is visible in both employee and management UI.

### 7.1 Triggering a joint discussion

The reporting manager or HR can launch a joint discussion from the management card when the action is available.

The UI gives:
- Decision/note field
- `JointDiscussion` action button
- Autocomplete list to select discussion participants

Selected participants receive notifications and can respond.

### 7.2 Discussion thread

When the case is in joint discussion mode, the UI shows:
- discussion request summary
- discussion messages as a timeline
- author labels (Employee vs Participant)
- timestamps

### 7.3 Employee response path

The employee sees the same discussion messages and can reply via a text box.

The response includes:
- employee discussion response
- message submitted back to the case

### 7.4 Why this matters

This is not a basic approval decision. It is a negotiation / collaborative review mode that keeps the offboarding case active while people discuss the final exit conditions.

---

## 8. Former Employee Portal UI

Location:
- `FormerEmployeePortalPage.tsx`

This is a separate, secure-facing flow for former employees.

### 8.1 Entry / authentication

The portal accepts a valid secure token in the URL, e.g. `?token=...`.

Flow:
- Token is redeemed
- Session token is stored in sessionStorage
- User is navigated to `/former-employee`
- Portal loads case data using the session

If the session is invalid or expired, the portal shows an error and asks the user to use a new invitation.

### 8.2 Available documents

Once loaded, the former employee sees:
- offboarding status
- last working date
- a list of available download documents

Each document is downloaded securely through the backend document API.

### 8.3 Request a document or correction

Available request types:
- RelievingLetter
- ExperienceLetter
- FnFStatement
- TaxDocument
- Correction
- Other

The former employee can:
- select the request type
- add details
- submit the request

### 8.4 Request status list

Former employees can also see all of their own submitted requests and their current status.

This completes the secure post-exit communication loop.

---

## 9. Complete UI Flow by Scenario

### 9.1 Employee submits resignation

1. Employee clicks `Start resignation`
2. Selects last working date and reason
3. Submits resignation
4. Employee sees active exit case card
5. Manager/HR can review the case

### 9.2 Manager initiates offboarding for an employee

1. Manager opens another employee profile
2. Clicks `Offboard employee`
3. Chooses resignation or termination
4. Enters last working date and reason
5. Offboarding case is created for the employee

### 9.3 Manager or HR reviews the case

1. Open `Manage offboarding`
2. See overall status and pending clearances
3. Review discussion or notice adjustments
4. Approve, discuss, reject, or start joint discussion
5. Work through operational items in the operations panel
6. Complete required clearances before closing the case

### 9.4 Employee responds during discussion or notice negotiation

1. Employee opens offboarding case card
2. Reads discussion thread or notice offer
3. Submits response or accepts/declines notice offer
4. Updates personal contact or uploads evidence if needed

### 9.5 Admin configures exit policy

1. Admin opens Company Details → Offboarding
2. Reviews policy priority and saved policy list
3. Adds/edits company, department, or role policy
4. Changes required gates and journey settings
5. Saves clearance templates and due dates

### 9.6 Former employee accesses approved documents

1. Former employee opens secure portal link
2. Verifies session
3. Downloads documents
4. Requests correction or other documents if needed

---

## 10. Missing / Critical UI Details to Remember

These items are easy to overlook but are part of the full UI surface:

- The employee self-service resignation flow is separate from the HR/manager-initiated offboarding flow.
- There are two different active-case buttons depending on the employee’s own profile vs a managed profile.
- The employee case modal is not just a summary page; it is a full action panel.
- The management modal is the real operational dashboard for HR and managers.
- The admin settings page is where the company’s offboarding rules are defined.
- Joint discussion is a dedicated workflow, not a simple note field.
- Former employee portal access is a post-exit, security-scoped UI.
- Notice-period adjustment and final settlement decisions are tightly integrated into the main case review UI.
- Evidence verification and document request resolution are first-class functions in the management experience.

---

## 11. Final Summary

The offboarding UI is structured as a complete lifecycle product rather than a single page:

- Employees manage their own exit journey.
- Managers and HR execute and approve the case.
- Admins define the rules and requirements.
- Joint discussion supports collaborative resolution.
- Former employees get a limited secure document and request portal.

The actual app implements this through a set of connected UI modules, all centered around the employee exit case and policy engine. The overall flow is complete, role-aware, and operationally deep.

---

## 12. Policy Settings Layout and Responsive Behaviour

The policy editor is intentionally organized around the lifecycle of an exit rather than around technical database fields:

1. **Status** contains the only master `Enable offboarding` switch.
2. **Start** controls employee-initiated and HR-initiated starts.
3. **Approvals & conversations** contains the single manager approval, HR approval and joint-discussion controls.
4. **Notice** groups notice-period, adjustment and withdrawal capabilities with the related notice values above it.
5. **Operational work** contains handover, clearance, assets, IT access, finance, benefits and final settlement.
6. **Employee requirements** contains resignation evidence and acknowledgement.
7. **Exit experience** contains exit interview and documents.
8. **Post-exit** contains the former-employee portal only.

Each section is a contained card with an enabled-count chip, so an admin can scan a long policy without interpreting a large unstructured grid. Individual options have a visible label, concise explanation and accessible enable switch. Operational options that the service can block additionally expose a labelled **Blocks completion** checkbox next to that same option.

There is no separate completion-gates panel in the active UI. This avoids showing the same operational decision twice. A completion blocker is disabled until its module is enabled, and the client normalizes the payload before save so a disabled feature cannot retain `BlocksCompletion=true`. The existing backend validation remains authoritative.

At extra-small and small widths, option cards remain one column and the completion label moves beneath its switch; controls stay readable and do not overflow. At large widths, each section uses two balanced columns. Section headings, enabled counts, explanatory text and controls stack naturally at narrow breakpoints. Policy scope, notice values, presets, saved-policy accordions and clearance-template management retain their existing responsive layouts and API behaviour.

---

## 13. Current resignation reminder behaviour

The current UI includes a recurring reminder modal for reporting managers, HR users and administrators who have an active offboarding case in their access scope.

### 13.1 Reminder modal

The reminder is mounted globally from `MasterLayout.tsx` through `EmployeeExitQueueAction.tsx`. It is checked when the authenticated application shell loads, including after logout and login. When active resignation cases are returned, the modal opens in the centre of the page with the standard modal backdrop, which visually dims and blurs the page behind it.

The modal includes:

- a clear `Offboarding reminders` title;
- a close button;
- the number of active cases;
- each accessible employee, employee ID, department, status and last working date;
- a link-through action that opens the selected employee profile for detailed review.

The reminder is shown at most once every three days per browser local-storage context. Closing the modal does not resolve the resignation; it only dismisses that reminder occurrence. The reminder can appear again after the three-day interval while qualifying cases remain active.

### 13.2 Button placement

The global reminder checker does not add a large `Offboarding Cases` strip to the dashboard. The `Offboarding cases` button remains in its original profile-header action area and can be used to open the complete queue manually. The global layout renders the checker with its button hidden so the automatic reminder and the manual queue entry remain separate UI concerns.

### 13.3 Cases included in reminders

The backend queue excludes cases whose status is `Withdrawn`, `Cancelled` or `Rejoined`. Active `NoticePeriod` resignations remain eligible for periodic operational reminders until the case is completed or otherwise leaves the active workflow.

The notice-offer state is represented by `AwaitingEmployeeNoticeOffer` on the exit case and `AwaitingEmployeeDecision` on the notice adjustment. For the employee, the offboarding case modal opens automatically when this state is loaded and provides `Accept offer` and `Keep original notice`. For HR or management, the reminder opens the case for review and clearly indicates that the employee must make the final offer decision.

### 13.4 Reminder timing and recipients

Notice-period reminders are scheduled from the policy snapshot. The default timing is every three days, plus reminders at 30, 15, 7, 3 and 1 day before the last working date and on the last working date. Delivery is handled by `EmployeeExitOutboxProcessor` through in-app notifications and, where enabled and verified, email.

Recipient controls are policy-driven:

- reporting manager notifications are enabled by default;
- HR/HR Executive notifications are enabled by default;
- administrator notifications require `NotifyNoticePeriodAdmins` to be enabled;
- email delivery requires `NoticePeriodReminderEmail` and a verified recipient email.

The reminder modal is a UI acknowledgement only. It does not approve, decline, withdraw or complete a resignation. Those actions continue to use the existing permission checks, status transitions and optimistic-concurrency version checks.

### 13.5 Queue scalability and filtering

The queue endpoint supports `page`, `pageSize`, `search` and `status` query parameters. Page size is capped at 100, while the UI requests 25 cases per page. Search matches employee name, employee ID and department; status filtering is applied before pagination. The response includes `TotalRecords` so the UI can render an accurate pager.

Tenant and reviewer scope are applied on the server before filtering or paging: HR/authorized administrators can see active cases in their company, while managers see only cases assigned to them. The browser receives only the current result page.
