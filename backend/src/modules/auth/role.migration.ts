import { Role } from "./role.model.js";
import { User } from "./user.model.js";

export const ensureRolesAndMultiRoleMigration = async (): Promise<{
  rolesCreated: string[];
  usersMigrated: number;
}> => {
  const rolesCreated: string[] = [];

  // 1. Standard Permissions
  const adminPermissions = [
    "admin.access",
    "users.read",
    "users.manage",
    "courses.read",
    "courses.manage",
    "courses.publish",
    "create_course",
    "create_class",
    "orders.read",
    "orders.manage",
    "coupons.manage",
    "blog.manage",
    "classes.manage",
    "tickets.manage",
    "reviews.manage",
    "comments.manage",
    "reports.read",
    "catalog.manage",
    "community.manage",
    "accounting.view",
    "accounting.mutate",
  ];

  const partnerPermissions = [
    "accounting.view",
    "accounting.read",
    "reports.read",
  ];

  const accountantPermissions = [
    "accounting.view",
    "accounting.read",
    "accounting.mutate",
    "reports.read",
  ];

  // 2. Ensure Roles Exist
  const rolesDefinition = [
    {
      slug: "super-admin",
      name: "مدیر کل",
      permissions: adminPermissions,
      description: "مدیر ارشد با دسترسی کامل به کلیه بخش‌های سیستمی و مالی",
    },
    {
      slug: "admin",
      name: "مدیر",
      permissions: adminPermissions,
      description: "مدیر سامانه با اختیارات مدیریتی",
    },
    {
      slug: "instructor",
      name: "استاد",
      permissions: ["create_course", "courses.manage", "create_class", "classes.manage"],
      description: "مدرس دوره‌ها و کلاس‌های آکادمی تک‌یاد",
    },
    {
      slug: "accountant",
      name: "حسابدار",
      permissions: accountantPermissions,
      description: "حسابدار مالی مؤسسه با مجوز ثبت و مدیریت اسناد مالی مجاز",
    },
    {
      slug: "partner",
      name: "شریک مؤسسه",
      permissions: partnerPermissions,
      description: "شریک مؤسسه با دسترسی فقط‌خواندنی به گزارش‌ها و داشبورد حسابداری",
    },
    {
      slug: "support",
      name: "پشتیبان",
      permissions: ["tickets.manage", "comments.manage", "admin.access"],
      description: "پشتیبان تیکت‌ها و پیام‌های کاربران",
    },
    {
      slug: "student",
      name: "دانشجو",
      permissions: [],
      description: "فراگیر و دانشجو با دسترسی به دوره‌ها، کلاس‌ها و کیف پول",
    },
  ];

  for (const def of rolesDefinition) {
    const existing = await Role.findOne({ slug: def.slug });
    if (!existing) {
      await Role.create(def);
      rolesCreated.push(def.slug);
    } else {
      // Ensure permissions are updated if needed
      if (def.permissions.length > 0) {
        const unionPerms = Array.from(new Set([...(existing.permissions || []), ...def.permissions]));
        if (unionPerms.length !== (existing.permissions || []).length) {
          existing.permissions = unionPerms;
          await existing.save();
        }
      }
    }
  }

  // 3. User Multi-Role Migration: Ensure every user has valid roles array populated
  const defaultStudentRole = await Role.findOne({ slug: "student" });
  let usersMigrated = 0;

  const usersWithoutRoles = await User.find({
    $or: [
      { roles: { $exists: false } },
      { roles: { $size: 0 } },
      { role: { $exists: false } },
    ],
  });

  for (const u of usersWithoutRoles) {
    const roles: any[] = [];
    if (u.role) {
      roles.push(u.role);
    } else if (defaultStudentRole) {
      u.role = defaultStudentRole._id as any;
      roles.push(defaultStudentRole._id);
    }

    if (u.canTeach) {
      const instRole = await Role.findOne({ slug: "instructor" });
      if (instRole && !roles.some((r) => r.toString() === instRole._id.toString())) {
        roles.push(instRole._id);
      }
    }

    u.roles = roles;
    await u.save();
    usersMigrated++;
  }

  return { rolesCreated, usersMigrated };
};
