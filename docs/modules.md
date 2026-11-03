# Modules

The catalog of every feature module under [`src/app/modules/`](../src/app/modules/). Each entry lists the entry component, the service file, key subcomponents, the model file, and the permission gate (if any).

## Module index

| Module | Folder | URL prefix | Permission gate |
|---|---|---|---|
| [Dashboard](#dashboard) | `dashboard/` | `/dashboard` | none |
| [Auth](#auth) | `auth/` | `/auth/*` | (public) |
| [Apply Now (career portal)](#apply-now-career-portal) | `applynow/` | `/career/:id` | (public) |
| [Employees](#employees) | `employees/` | `/employees`, `/employees/:id/*` | `Employees` |
| [Users (profile)](#users-profile) | `users/` | `/profile/*`, `/employees/:id/*` | (varies) |
| [Attendance](#attendance) | `attendance/` | `/attendance` | `Attendance` |
| [Leave Management](#leave-management) | `leaves/` | `/leavemanagement/*` | `LeaveManagement` |
| [Holidays / Calendar](#holidays--calendar) | `holidays/` | `/calendar` | `Calendar` |
| [Notice Board](#notice-board) | `noticeboard/` | `/noticeboard/*` | none |
| [Recruitment — Jobs](#recruitment--jobs) | `recruitment/jobs/` | `/recruitment/jobs/*` | `Jobs` |
| [Recruitment — Applications](#recruitment--applications) | `recruitment/applications/` | `/recruitment/applications/*` | `Applications` |
| [Recruitment — Process Log](#recruitment--process-log) | `recruitment/processlog/` | `/recruitment/processlog` | `ProcessLog` |
| [Offboarding](#offboarding) | `offboarding/` | `/admin/companydetails/offboarding` | `Offboarding` |
| [Payroll](#payroll) | `payroll/` | `/payroll` | `PayRoll` |
| [Payroll Settings](#payroll-settings) | `payrollsettings/` | `/settingspayroll` | `PayrollSettings` |
| [Policies](#policies) | `policies/` | `/companypolicy/*` | (none in route, checked in services) |
| [Admin](#admin) | `admin/` | `/admin/*` | `adminOnly` (Administrator role) |
| [Errors](#errors) | `errors/` | `/error/*` | (public) |
| [Theme](#theme-infrastructure) | `theme/` | (n/a) | (infrastructure) |

---

## Dashboard

**Purpose.** The post-login landing page. Aggregates KPIs, charts (department headcount, application pipeline), recent notices, employee-of-the-month, on-leave list, and open positions.

| What | Where |
|---|---|
| Entry | [`Dashboard.tsx`](../src/app/modules/dashboard/Dashboard.tsx) |
| Service | [`dashboardservices.ts`](../src/app/modules/dashboard/dashboardservices.ts) |
| Models | [`model.ts`](../src/app/modules/dashboard/model.ts) |
| Subcomponents | [`components/`](../src/app/modules/dashboard/components/) — `ApplicationsChart`, `DepartmentChart`, `EmpOfMonth`, `EmpOnLeave`, `EmployeeChart`, `NoticeBoard`, `OpenPositions`, `Punctual`, `Help` |

Each card fetches its own data via the dashboard service and shows skeletons while loading. No Redux involvement.

---

## Auth

**Purpose.** Login, registration (creates a new company + admin user), forgot password, password reset / first-time password creation, logout.

| What | Where |
|---|---|
| Entry | [`AuthPage.tsx`](../src/app/modules/auth/AuthPage.tsx) — switches between Login / Registration / ForgotPassword based on URL |
| Auth init | [`core/Auth.tsx`](../src/app/modules/auth/core/Auth.tsx) (exports `AuthInit`) |
| Helpers | [`core/AuthHelpers.ts`](../src/app/modules/auth/core/AuthHelpers.ts) — `getLocalKey / setLocalKey / removeLocalKey` |
| Models | [`core/_models.ts`](../src/app/modules/auth/core/_models.ts) — `AuthTokens`, `UserLoginModel`, `CompanyRegisterModel`, `LogInResponseModel` |
| API calls | [`core/_requests.ts`](../src/app/modules/auth/core/_requests.ts) |
| Components | [`Login.tsx`](../src/app/modules/auth/components/Login.tsx), [`Registration.tsx`](../src/app/modules/auth/components/Registration.tsx), [`ForgotPassword.tsx`](../src/app/modules/auth/components/ForgotPassword.tsx), [`CreatePassword.tsx`](../src/app/modules/auth/components/CreatePassword.tsx) |
| Logout | [`Logout.tsx`](../src/app/modules/auth/Logout.tsx) — clears `localStorage`, dispatches `logout`, navigates to `/auth` |

Token storage key: `kt-auth-react-v` in `localStorage`, value `{ token, refreshToken }`. See [`data-layer.md`](./data-layer.md) for the refresh flow.

---

## Apply Now (career portal)

**Purpose.** Public-facing careers page that prospective candidates see. Each company gets a unique URL — `/career/:id` where `:id` is the company ID. The route also writes the `cId` (company ID) into `localStorage` so unauthenticated API calls can target the right tenant.

| What | Where |
|---|---|
| Entry | [`Career.tsx`](../src/app/modules/applynow/Career.tsx) |
| Application form | [`ApplicationForm.tsx`](../src/app/modules/applynow/ApplicationForm.tsx) |
| Service | [`services.ts`](../src/app/modules/applynow/services.ts) |
| Components | [`Component/`](../src/app/modules/applynow/Component/) — `CareerHeader`, `CareerHero`, `JobSearchCareer`, `FindJobsHeader`, `WhyJoin`, `JobInfo`, `JobsSection`, `NoVacancy`, `Footer` |

> **Caveat.** [`JobInfo.tsx:59-60`](../src/app/modules/applynow/Component/JobInfo.tsx#L59-L60) renders the job description via `dangerouslySetInnerHTML` without sanitization. New code must wrap with `sanitizeHtmlContent()` from [`src/utils/common.ts`](../src/utils/common.ts).

---

## Employees

**Purpose.** Master list of company employees with search/filter, headcount, invite-new flow, and links into individual profiles.

| What | Where |
|---|---|
| Entry | [`Employees.tsx`](../src/app/modules/employees/Employees.tsx) |
| Service | [`employeeServices.ts`](../src/app/modules/employees/employeeServices.ts) |
| Models | [`models.ts`](../src/app/modules/employees/models.ts) — `GetAllEmployeeResponseModel`, `EmployeeModel`, `SalaryModel`, `InviteNewEmployeeModel` |
| Subcomponents | [`components/`](../src/app/modules/employees/components/) — `EmployeeGridView`, `EmployeeFilter`, `AddEmployeeStepper` (multi-step invite wizard), `SetDepartmentName` |
| Permission | `ProtectedRoute module={ModulesName.Employees}` |
| Filter state | Persisted via `filterSlice.employee` in Redux |

The `:employeeid/*` sub-route mounts the [Users (profile)](#users-profile) module so HR can drill in.

---

## Users (profile)

**Purpose.** A single employee's profile — used both by the employee themselves at `/profile/*` and by HR/admin at `/employees/:employeeid/*`. Same components, different data scope.

| What | Where |
|---|---|
| Routes | [`ProfileRoutes.tsx`](../src/app/routing/ProfileRoutes.tsx) |
| Service | [`userservices.ts`](../src/app/modules/users/userservices.ts) |
| Models | [`models.ts`](../src/app/modules/users/models.ts) — `EmployeeByIdResponse`, `EditEmployeePayloadModel`, `NotificationModel`, `EmployeeSalaryByIdResponse` |
| Sub-modules | `about/` (personal info, education, certifications, summary), `workhistory/`, `leavetracker/`, `performance/`, `usersetting/` (preferences, notifications) |
| `ProtectedRoute` defined here | [`about/components/ProtectedRoute.tsx`](../src/app/modules/users/about/components/ProtectedRoute.tsx) — yes, the protected-route component lives inside this module |

---

## Attendance

**Purpose.** Daily attendance tracking — check-in / check-out, monthly view, absences, attendance reports. Inputs feed payroll calculations.

| What | Where |
|---|---|
| Entry | [`EmployeeAttendance.tsx`](../src/app/modules/attendance/EmployeeAttendance.tsx) |
| Service | [`AttendanceServices.ts`](../src/app/modules/attendance/AttendanceServices.ts) |
| Models | [`AttendanceModels.ts`](../src/app/modules/attendance/AttendanceModels.ts) |
| Subcomponents | [`component/`](../src/app/modules/attendance/component/) — `AttendanceCalendar` and related |
| Permission | `Attendance` |

> **Caveat.** [`AttendanceCalendar.tsx:135-188`](../src/app/modules/attendance/component/AttendanceCalendar.tsx#L135-L188) has a stale-closure issue in its `useEffect` (uses `selectedDay` without listing it as a dep). Worth fixing if you touch that area.

---

## Leave Management

**Purpose.** Leave policies, leave types, balance accrual, leave-request submission and approval workflow.

| What | Where |
|---|---|
| Entry | [`LeaveManagement.tsx`](../src/app/modules/leaves/LeaveManagement.tsx) |
| Routes | [`LeaveManagementRoutes.tsx`](../src/app/routing/LeaveManagementRoutes.tsx) |
| Service | [`leaveServices.ts`](../src/app/modules/leaves/leaveServices.ts) |
| Models | [`model.ts`](../src/app/modules/leaves/model.ts) — `LeaveRequestsFilterModel`, `LEAVE_TYPE`, `LEAVE_REQUEST_STATUS` (mirrored in [`utils/enums.ts`](../src/utils/enums.ts)) |
| Subcomponents | [`components/`](../src/app/modules/leaves/components/) — request list, policy editor, accrual config, request form, approve / reject dialog (~14 files) |
| Permission | `LeaveManagement` |
| Filter state | `filterSlice.leaveRequest` |

Leave types: `Sick`, `Casual`, `Earned`, `Maternity`, `Paternity`. Statuses: `Pending`, `Approved`, `Rejected`, `Withdrawn`.

---

## Holidays / Calendar

**Purpose.** Company-wide holiday calendar plus events. The calendar is also a data source consumed by the dashboard and leave-balance views.

| What | Where |
|---|---|
| Entry | [`Calendar.tsx`](../src/app/modules/holidays/Calendar.tsx) |
| Service | [`calendarServices.ts`](../src/app/modules/holidays/calendarServices.ts) |
| Subcomponents | [`components/`](../src/app/modules/holidays/components/) — `CalendarDays`, holiday CRUD dialogs |
| Permission | `Calendar` |
| Filter state | `filterSlice.holiday` |
| Holiday types enum | `HOLIDAY_TYPE` in [`utils/enums.ts`](../src/utils/enums.ts) — `Cultural`, `Health`, `Religious`, `National` |

---

## Notice Board

**Purpose.** Internal company announcements — general / important / urgent. Visible on the dashboard widget and at the dedicated notice board page.

| What | Where |
|---|---|
| Entry | [`NoticeBoard.tsx`](../src/app/modules/noticeboard/NoticeBoard.tsx) |
| Routes | [`NoticeBoardRoutes.tsx`](../src/app/routing/NoticeBoardRoutes.tsx) |
| Service | [`services.ts`](../src/app/modules/noticeboard/services.ts) |
| Models | [`models.ts`](../src/app/modules/noticeboard/models.ts) — `NoticeBoardFilterModel`, `NOTICE_TYPE` |
| Subcomponents | [`components/`](../src/app/modules/noticeboard/components/) — list, create, edit, view |
| Filter state | `filterSlice.noticeBoard` |

No `ProtectedRoute` wrapper — accessible to any authenticated user.

---

## Recruitment — Jobs

**Purpose.** Job vacancy CRUD. Each job feeds the public career portal at `/career/:id`.

| What | Where |
|---|---|
| Entry | [`Jobs.tsx`](../src/app/modules/recruitment/jobs/Jobs.tsx) |
| Routes | [`RecruitmentRoutes.tsx`](../src/app/routing/RecruitmentRoutes.tsx) |
| Service | shared at [`recruitment/services.ts`](../src/app/modules/recruitment/services.ts) |
| Components | [`AddEditJob.tsx`](../src/app/modules/recruitment/jobs/components/AddEditJob.tsx), [`ViewJobDetails.tsx`](../src/app/modules/recruitment/jobs/components/ViewJobDetails.tsx), [`JobFilter.tsx`](../src/app/modules/recruitment/jobs/components/JobFilter.tsx) |
| Permission | `Jobs` |
| Filter state | `filterSlice.jobs` |
| Job-type enum | `JOB_TYPE_ENUM` in [`utils/enums.ts`](../src/utils/enums.ts) — `Onsite`, `Hybrid`, `Remote` |

`ViewJobDetails` correctly uses `sanitizeHtmlContent()` for the description — copy that pattern when rendering rich text from the API.

---

## Recruitment — Applications

**Purpose.** Applicant tracking — list of inbound applications per vacancy, status changes, comments / notes, resume viewing.

| What | Where |
|---|---|
| Entry | [`Applications.tsx`](../src/app/modules/recruitment/applications/Applications.tsx) |
| Components | [`ApplicantDetails.tsx`](../src/app/modules/recruitment/applications/components/ApplicantDetails.tsx), [`EditApplicant.tsx`](../src/app/modules/recruitment/applications/components/EditApplicant.tsx), [`AddApplicant.tsx`](../src/app/modules/recruitment/applications/components/AddApplicant.tsx), [`AddComment.tsx`](../src/app/modules/recruitment/applications/components/AddComment.tsx), [`ApplicationFilter.tsx`](../src/app/modules/recruitment/applications/components/ApplicationFilter.tsx) |
| Permission | `Applications` |
| Filter state | `filterSlice.application` |
| Status enum | `ApplicationStatus` in [`utils/enums.ts`](../src/utils/enums.ts) — `New`, `InProgress`, `OnHold`, `Shortlisted`, `Selected`, `Rejected` |
| Comment action | `CommentAction` — `Process`, `InProgress`, `OnHold`, `Shortlisted`, `Selection`, `Rejection`, `Edit` |

---

## Recruitment — Process Log

**Purpose.** Read-only audit log of applicant status changes — who moved which applicant where and when.

| What | Where |
|---|---|
| Entry | [`ProcessLog.tsx`](../src/app/modules/recruitment/processlog/ProcessLog.tsx) |
| Components | [`ProcessLogFilter.tsx`](../src/app/modules/recruitment/processlog/components/ProcessLogFilter.tsx) |
| Permission | `ProcessLog` |
| Filter state | `filterSlice.processLog` |

---

---

## Offboarding

**Purpose.** Separation lifecycle workflows: employee resignation submission, manager resignation review, multi-departmental clearance task tracking, handover verification, exit interviews, and final settlement triggering.

| What | Where |
|---|---|
| Routes | Mounted under `/admin/companydetails/offboarding` and employee separation flows |
| Service | `src/app/modules/offboarding/offboardingServices.ts` |
| Models | `src/app/modules/offboarding/models.ts` |
| Components | Resignation modal, manager decision drawer, clearance checklists, exit policy editor |
| Permission | `Offboarding` |
| Gating | Setting tab is strictly visible only when `isOffboardingAccessible` is true. **No Administrator bypass.** |

---

## Payroll

**Purpose.** Per-employee salary structure setup, monthly payroll generation, payslip preview / download (PDF).

| What | Where |
|---|---|
| Entry | [`PayRollManagement.tsx`](../src/app/modules/payroll/PayRollManagement.tsx) |
| Service | [`services.ts`](../src/app/modules/payroll/services.ts) |
| Models | [`models.ts`](../src/app/modules/payroll/models.ts) — `SALARY_PERIOD` |
| Components | [`AddUpdateEmployeePayRoll.tsx`](../src/app/modules/payroll/AddUpdateEmployeePayRoll.tsx), [`UploadPayRollData.tsx`](../src/app/modules/payroll/components/UploadPayRollData.tsx), payslip view |
| Permission | `PayRoll` |

> **Caveat.** [`UploadPayRollData.tsx:210`](../src/app/modules/payroll/components/UploadPayRollData.tsx#L210) renders Excel-uploaded content via `dangerouslySetInnerHTML` without sanitization. Wrap with `sanitizeHtmlContent()`.

---

## Payroll Settings

**Purpose.** Company-wide payroll configuration — salary structure templates (basic / HRA / allowances), deduction rules, tax slabs.

| What | Where |
|---|---|
| Entry | [`PayrollSettings.tsx`](../src/app/modules/payrollsettings/PayrollSettings.tsx) |
| Components | [`components/`](../src/app/modules/payrollsettings/components/) |
| Permission | `PayrollSettings` |

---

## Policies

**Purpose.** Company policy documents — published versions (with version history), employee acknowledgement, viewer.

| What | Where |
|---|---|
| Routes | [`PoliciesRoutes.tsx`](../src/app/routing/PoliciesRoutes.tsx) |
| Service | [`policyServices.ts`](../src/app/modules/policies/policyServices.ts) |
| Components | [`components/`](../src/app/modules/policies/components/) — list, editor, version viewer (`PolicyVersionViewer`) |
| Backend module | `Policy` (granted to all roles by default per migration `AddPolicyModuleAndItsModulePermissions`) |

---

## Admin

**Purpose.** System-administration screens for the company administrator: company master data, role / permission management, module access toggles.

| What | Where |
|---|---|
| Entry | [`adminRoutes.tsx`](../src/app/modules/admin/adminRoutes.tsx) |
| Service | [`adminservices.ts`](../src/app/modules/admin/adminservices.ts) |
| Models | [`models.ts`](../src/app/modules/admin/models.ts) |
| Sub-modules | `companymaster/` (departments, job titles, custom attributes), `companydetails/`, `permissions/` (role + permission editor) |
| Gate | `<ProtectedRoute adminOnly={true} />` — `Roles.Administrator` only |

This is also where new departments / job titles can be added beyond the defaults seeded at registration.

### Application Modules & Granular Decoupling
The `ApplicationModules.tsx` component renders 10 distinct module toggle cards:
- **Employees**
- **Attendance** (independent module toggle)
- **Leave Management** (independent module toggle)
- **Calendar**
- **Notice board**
- **Policy**
- **Work From Home**
- **Offboarding**
- **Payroll Management** (toggles only Payroll and Payroll Settings)
- **Recruitment Management**

**Decoupling Policy**: Toggling `Payroll Management` off only disables Payroll and Payroll Settings; it does **not** disable `Leave Management` or `Attendance`. Each module is independently managed.

### Company Details Setting Tab Protection & No Admin Bypass
In `CompanyDetails.tsx`, setting tabs for optional modules (e.g. `Offboarding` and `Payroll configuration`) are strictly conditioned on module enablement (`isOffboardingAccessible`, `isPayrollModuleActive`).
- If a module is disabled/uninstalled, its tab is completely hidden and inaccessible.
- **No Administrator Bypass**: Administrators cannot access or view tabs or sub-routes for disabled modules.

### Profile & Dashboard Conditional Rendering
- **Profile Navigation** (`profileTabs.ts`): The `Leave Tracker` tab is rendered only if `isLeaveModuleActive` is true.
- **Profile Routes** (`ProfileRoutes.tsx`): Direct navigation to `/profile/leave` is guarded by `isLeaveModuleActive` and redirects to `/profile/about` if disabled.
- **Profile Card** (`ProfileCard.tsx`): `View Pay Slip` requires `isPayrollModuleActive`; `<LeaveCalendar />` requires `isLeaveModuleActive`.
- **Dashboard** (`Dashboard.tsx`): `<EmpOnLeave />` requires `isLeaveModuleActive`; `<UpComingHolidayAndEvents />` requires `isCalendarModuleActive`.

---

## Errors

**Purpose.** Public 403 / 404 / 500 pages.

| What | Where |
|---|---|
| Entry | [`ErrorsPage.tsx`](../src/app/modules/errors/ErrorsPage.tsx) |
| Components | [`components/`](../src/app/modules/errors/components/) |
| URL | `/error/*` |

`/unauthorize` (a separate one-off route) is served by [`UnAuthorizedAccess.tsx`](../src/app/shared/components/UnAuthorizedAccess.tsx) and is what `ProtectedRoute` redirects to.

---

## Theme (infrastructure)

**Purpose.** Not a feature module — holds the MUI theme factory, color palettes, and locale-to-MUI mapping.

| What | Where |
|---|---|
| Theme factory | [`MuiTheme.ts`](../src/app/modules/theme/MuiTheme.ts) — `createApplicationTheme(localization)` |
| Palettes | [`themePalettes.ts`](../src/app/modules/theme/themePalettes.ts) — `colors`, `lightPalette`, `darkPalette`, `chartColorpalette`, `getCurrentLocaleForMui` |

See [`ui-patterns.md`](./ui-patterns.md#theme--styling) for the theme architecture.
