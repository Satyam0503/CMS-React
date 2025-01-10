export const Permission = [
  {
    Titles: "Company Administrator",
    Description:
      "Administrators have all permissions in the app. Limit this role to employees who will be in charge the client account",
  },
  {
    Titles: "HR Manager",
    Description:
      "The HR employee can: Add & Edit colleagues, -Edit engagement surveys and view results for all departments, -Assign roles to other",
  },
  {
    Titles: "Employee",
    Description: "Regular Employee",
  },
];

export const EmployeePermission = [
  {
    moduleName: "UserDashboard",
    moduleConstant: "UserDashboard",
    permissions: [
      {
        permissionName: "View",
        rolePermissionId: "", //From Backend in string, emp permission
        modulePermissionId: "", //From Backend in int
        companyRoleId: "", //From Backend in string
        hasAccess: true, //depends on permission
        permissionConstant: "View",
      },
    ],
  },
  {
    moduleName: "Employees",
    moduleConstant: "Employees",
    permissions: [
      {
        permissionName: "View",
        rolePermissionId: "", //From Backend in string, emp permission
        modulePermissionId: "", //From Backend in int
        companyRoleId: "", //From Backend in string
        hasAccess: true, //depends on permission
        permissionConstant: "View",
      },
    ],
  },
  {
    moduleName: "Attendance",
    moduleConstant: "Attendance",
    permissions: [
      {
        permissionName: "View",
        rolePermissionId: "", //From Backend in string, emp permission
        modulePermissionId: "", //From Backend in int
        companyRoleId: "", //From Backend in string
        hasAccess: true, //depends on permission
        permissionConstant: "View",
      },
    ],
  },
  {
    moduleName: "Leave Management",
    moduleConstant: "Leave Management",
    permissions: [
      {
        permissionName: "NA",
        rolePermissionId: "", //From Backend in string, emp permission
        modulePermissionId: "", //From Backend in int
        companyRoleId: "", //From Backend in string
        hasAccess: true, //depends on permission
        permissionConstant: "NA",
      },
    ],
  },
  {
    moduleName: "My Profile",
    moduleConstant: "My Profile",
    permissions: [
      {
        permissionName: " View all",
        rolePermissionId: "", //From Backend in string, emp permission
        modulePermissionId: "", //From Backend in int
        companyRoleId: "", //From Backend in string
        hasAccess: true, //depends on permission
        permissionConstant: "View",
      },
      {
        permissionName: "Edit user info",
        rolePermissionId: "", //From Backend in string, emp permission
        modulePermissionId: "", //From Backend in int
        companyRoleId: "", //From Backend in string
        hasAccess: true, //depends on permission
        permissionConstant: "Edit",
      },
      {
        permissionName: "Delete user info",
        rolePermissionId: "", //From Backend in string, emp permission
        modulePermissionId: "", //From Backend in int
        companyRoleId: "", //From Backend in string
        hasAccess: true, //depends on permission
        permissionConstant: "Delete",
      },
    ],
  },
  {
    moduleName: "Recruitment",
    moduleConstant: "Recruitment",
    permissions: [
      {
        permissionName: "NA",
        rolePermissionId: "", //From Backend in string, emp permission
        modulePermissionId: "", //From Backend in int
        companyRoleId: "", //From Backend in string
        hasAccess: true, //depends on permission
        permissionConstant: "NA",
      },
    ],
  },
  {
    moduleName: "Admin",
    moduleConstant: "Admin",
    permissions: [
      {
        permissionName: "NA",
        rolePermissionId: "", //From Backend in string, emp permission
        modulePermissionId: "", //From Backend in int
        companyRoleId: "", //From Backend in string
        hasAccess: true, //depends on permission
        permissionConstant: "NA",
      },
    ],
  },
  {
    moduleName: "Holiday",
    moduleConstant: "Holiday",
    permissions: [
      {
        permissionName: "View",
        rolePermissionId: "", //From Backend in string, emp permission
        modulePermissionId: "", //From Backend in int
        companyRoleId: "", //From Backend in string
        hasAccess: true, //depends on permission
        permissionConstant: "View",
      },
    ],
  },
  {
    moduleName: "Notice Board",
    moduleConstant: "Notice Board",
    permissions: [
      {
        permissionName: "View all notice",
        rolePermissionId: "", //From Backend in string, emp permission
        modulePermissionId: "", //From Backend in int
        companyRoleId: "", //From Backend in string
        hasAccess: true, //depends on permission
        permissionConstant: "View",
      },
      {
        permissionName: "Post a notice",
        rolePermissionId: "", //From Backend in string, emp permission
        modulePermissionId: "", //From Backend in int
        companyRoleId: "", //From Backend in string
        hasAccess: true, //depends on permission
        permissionConstant: "Edit",
      },
      {
        permissionName: "Edit posted notice",
        rolePermissionId: "", //From Backend in string, emp permission
        modulePermissionId: "", //From Backend in int
        companyRoleId: "", //From Backend in string
        hasAccess: true, //depends on permission
        permissionConstant: "Edit",
      },
      {
        permissionName: "Delete posted notice",
        rolePermissionId: "", //From Backend in string, emp permission
        modulePermissionId: "", //From Backend in int
        companyRoleId: "", //From Backend in string
        hasAccess: true, //depends on permission
        permissionConstant: "View",
      },
    ],
  },
];
