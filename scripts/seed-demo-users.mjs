/**
 * seed-demo-users.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 * Creates real distinct demo users via the Huwiyati backend API,
 * then assigns them as Employees / Admins in the correct branches.
 *
 * USAGE:
 *   node scripts/seed-demo-users.mjs
 *
 * Make sure the backend is running on http://localhost:5237 first.
 * ─────────────────────────────────────────────────────────────────────────────
 */

const BASE = "http://localhost:5237";
const PASSWORD = "Password123";

// ── Branch IDs (from DbInitializer.cs) ──────────────────────────────────────
const BRANCHES = {
  civilRegistrySanaa:  "018f7d9a-2000-7000-8000-000000000001",
  civilRegistryAden:   "018f7d9a-2000-7000-8000-000000000002",
  hospitalThawra:      "018f7d9a-2000-7000-8000-000000000003",
  hospitalJumhuri:     "018f7d9a-2000-7000-8000-000000000004",
  immigrationSanaa:    "018f7d9a-2000-7000-8000-000000000005",
};

// ── Users to create ──────────────────────────────────────────────────────────
// Each needs a unique NationalNumber already registered in the Persons table
// (the register endpoint links to existing Person by NationalNumber).
//
// We create one Employee per branch/agency + one Admin per agency.
// National Numbers are assigned so they DON'T conflict with seed data:
//   01011135650 → SuperAdmin (مصعب النجري)
//   01011135651 → Admin (أحمد المدير) - already used for civil-registry admin
//   01011131317 → Employee (سارة السالمي) - already used
//
// New unique numbers for our demo users (Citizen-role users that we'll register):
const USERS_TO_CREATE = [
  // ─── Admins ───────────────────────────────────────────────────────────────
  {
    label: "أدمن الأحوال المدنية - صنعاء",
    nationalNumber: "01011135651",  // already seeded → use existing
    email: "admin.civil@huwiyati.com",
    phone: "770000002",
    dob: "1990-04-10",
    role: "ADMIN",
    agency: "الأحوال المدنية",
    branchId: BRANCHES.civilRegistrySanaa,
    alreadySeeded: true, // skip register, only assign
  },
  {
    label: "أدمن المستشفيات",
    nationalNumber: "01011200001",
    firstName: "يوسف",
    fullName: "يوسف حمود عبده المخلافي",
    email: "admin.hospital@huwiyati.com",
    phone: "770100001",
    dob: "1988-03-15",
    role: "ADMIN",
    agency: "المستشفيات",
    branchId: BRANCHES.hospitalThawra,
  },
  {
    label: "أدمن الجوازات",
    nationalNumber: "01011200002",
    firstName: "وليد",
    fullName: "وليد ناجي محمد القباطي",
    email: "admin.passports@huwiyati.com",
    phone: "770100002",
    dob: "1985-07-22",
    role: "ADMIN",
    agency: "الجوازات",
    branchId: BRANCHES.immigrationSanaa,
  },
  {
    label: "أدمن المرور",
    nationalNumber: "01011200003",
    firstName: "عمر",
    fullName: "عمر فارع سالم الحمادي",
    email: "admin.traffic@huwiyati.com",
    phone: "770100003",
    dob: "1983-11-05",
    role: "ADMIN",
    agency: "المرور",
    branchId: null, // Traffic has no branch in seed — skip assign
  },

  // ─── Employees ────────────────────────────────────────────────────────────
  {
    label: "موظف الأحوال المدنية",
    nationalNumber: "01011131317", // already seeded
    email: "employee@huwiyati.com",
    phone: "770000003",
    dob: "1998-05-20",
    role: "EMPLOYEE",
    agency: "الأحوال المدنية",
    branchId: BRANCHES.civilRegistrySanaa,
    alreadySeeded: true,
    fullName: "سارة عبد المجيد محمد السالمي",
  },
  {
    label: "موظف المستشفيات",
    nationalNumber: "01011200004",
    firstName: "ريم",
    fullName: "ريم طارق عبد الله الدهمشي",
    email: "emp.hospital@huwiyati.com",
    phone: "770100004",
    dob: "2000-02-14",
    role: "EMPLOYEE",
    agency: "المستشفيات",
    branchId: BRANCHES.hospitalThawra,
  },
  {
    label: "موظف الجوازات",
    nationalNumber: "01011200005",
    firstName: "باسل",
    fullName: "باسل أمين خالد الشرعبي",
    email: "emp.passports@huwiyati.com",
    phone: "770100005",
    dob: "1997-09-30",
    role: "EMPLOYEE",
    agency: "الجوازات",
    branchId: BRANCHES.immigrationSanaa,
  },
  {
    label: "موظف المرور",
    nationalNumber: "01011200006",
    firstName: "منصور",
    fullName: "منصور علي حسن الشوكاني",
    email: "emp.traffic@huwiyati.com",
    phone: "770100006",
    dob: "1996-06-18",
    role: "EMPLOYEE",
    agency: "المرور",
    branchId: null, // Traffic has no branch in seed
  },
];

// ── Helper ───────────────────────────────────────────────────────────────────
async function apiPost(path, body, token = null) {
  const headers = { "Content-Type": "application/json", Accept: "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  return res.json();
}

async function apiGet(path, token) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
  });
  return res.json();
}

function decodeRoles(token) {
  try {
    const payload = JSON.parse(Buffer.from(token.split(".")[1], "base64").toString());
    const claim =
      payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ||
      payload["role"] || payload["roles"];
    if (!claim) return [];
    return Array.isArray(claim) ? claim : [claim];
  } catch { return []; }
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  Huwiyati Demo Users Seeder");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  // 1. Login as SuperAdmin to get token for admin operations
  console.log("▶ 1/4  Logging in as SuperAdmin (01011135650)…");
  const superAdminLogin = await apiPost("/api/v1/Account/login", {
    nationalNumber: "01011135650",
    password: PASSWORD,
    deviceIdentifier: `test-trusted-device-01011135650`,
    deviceName: "Seeder Script",
    operatingSystem: "Node.js",
  });

  if (!superAdminLogin.isSuccess || !superAdminLogin.data?.accessToken) {
    console.error("✗ SuperAdmin login failed:", superAdminLogin.message);
    console.log("  → Make sure the backend is running and seed data is applied.\n");
    process.exit(1);
  }

  const superAdminToken = superAdminLogin.data.accessToken;
  const superAdminRoles = decodeRoles(superAdminToken);
  console.log(`  ✓ Logged in as SuperAdmin. Token roles: [${superAdminRoles.join(", ")}]\n`);

  // 2. Register new users (skip already-seeded ones)
  console.log("▶ 2/4  Registering new users…");
  const registeredUsers = [];

  for (const u of USERS_TO_CREATE) {
    if (u.alreadySeeded) {
      console.log(`  ⊙ Skipping registration for ${u.label} (${u.nationalNumber}) — already seeded.`);
      registeredUsers.push(u);
      continue;
    }

    process.stdout.write(`  ◌ Registering ${u.label} (${u.nationalNumber})… `);
    const regRes = await apiPost("/api/v1/Account/register", {
      nationalNumber: u.nationalNumber,
      dateOfBirth: u.dob,
      phoneNumber: u.phone,
      email: u.email,
      password: PASSWORD,
    });

    if (regRes.isSuccess) {
      console.log(`✓ Created (userId: ${regRes.data?.userId ?? "N/A"})`);
      // Note: Registration sets role to Citizen. We must verify OTP then assign role.
      // For seeding we skip OTP verify since email is fake — the backend auto-activates in dev mode.
      registeredUsers.push(u);
    } else if (regRes.message?.toLowerCase().includes("already") || regRes.message?.toLowerCase().includes("exist") || regRes.statusCode === 409 || regRes.statusCode === 400) {
      console.log(`⚠ Already exists — continuing.`);
      registeredUsers.push(u);
    } else {
      console.log(`✗ Failed: ${regRes.message}`);
      // Note: This may fail if the NationalNumber doesn't exist in the Persons table.
      // Add the person record manually or via DbInitializer first.
    }
  }

  console.log("");

  // 3. Login as seeded Admin (01011135651) to assign employees
  console.log("▶ 3/4  Assigning Employees via Admin token…");
  console.log("  Note: Employee assignment requires Admin login. Using admin (01011135651)…");

  const adminLogin = await apiPost("/api/v1/Account/login", {
    nationalNumber: "01011135651",
    password: PASSWORD,
    deviceIdentifier: `test-trusted-device-01011135651`,
    deviceName: "Seeder Script",
    operatingSystem: "Node.js",
  });

  let adminToken = null;
  if (adminLogin.isSuccess && adminLogin.data?.accessToken) {
    adminToken = adminLogin.data.accessToken;
    const adminRoles = decodeRoles(adminToken);
    console.log(`  ✓ Admin logged in. Token roles: [${adminRoles.join(", ")}]`);
  } else {
    console.log(`  ✗ Admin login failed: ${adminLogin.message}`);
    console.log("  → Skipping employee assignment step.\n");
  }

  if (adminToken) {
    const employees = USERS_TO_CREATE.filter((u) => u.role === "EMPLOYEE" && !u.alreadySeeded && u.branchId);
    for (const emp of employees) {
      process.stdout.write(`  ◌ Assigning Employee ${emp.label} (${emp.nationalNumber})… `);
      const assignRes = await apiPost("/api/v1/Employees", {
        nationalNumber: emp.nationalNumber,
      }, adminToken);

      if (assignRes.isSuccess) {
        console.log(`✓ Assigned as Employee (empNo: ${assignRes.data?.employeeNumber ?? "N/A"})`);
      } else {
        console.log(`⚠ ${assignRes.message ?? "Failed"}`);
      }
    }
  }

  console.log("");

  // 4. Assign Admins via SuperAdmin token
  console.log("▶ 4/4  Assigning Admins via SuperAdmin token…");
  const admins = USERS_TO_CREATE.filter((u) => u.role === "ADMIN" && !u.alreadySeeded && u.branchId);

  for (const adm of admins) {
    process.stdout.write(`  ◌ Assigning Admin ${adm.label} (${adm.nationalNumber})… `);
    const assignRes = await apiPost("/api/v1/Admins", {
      nationalNumber: adm.nationalNumber,
      branchId: adm.branchId,
    }, superAdminToken);

    if (assignRes.isSuccess) {
      console.log(`✓ Assigned as Admin`);
    } else {
      console.log(`⚠ ${assignRes.message ?? "Failed"}`);
    }
  }

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  DEMO ACCOUNTS SUMMARY (copy into DEMO_ACCOUNTS in login/page.tsx)");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  const summaryRows = [
    { role: "SUPER_ADMIN", label: "سوبر أدمن",             nn: "01011135650", name: "مصعب محمد أحمد ناشر النجري",   agency: "وزارة الداخلية" },
    { role: "ADMIN",       label: "أدمن الأحوال المدنية",  nn: "01011135651", name: "أحمد محمود علي المدير",         agency: "الأحوال المدنية" },
    { role: "ADMIN",       label: "أدمن المستشفيات",        nn: "01011200001", name: "يوسف حمود عبده المخلافي",       agency: "المستشفيات"      },
    { role: "ADMIN",       label: "أدمن الجوازات",          nn: "01011200002", name: "وليد ناجي محمد القباطي",        agency: "الجوازات"        },
    { role: "ADMIN",       label: "أدمن المرور",            nn: "01011200003", name: "عمر فارع سالم الحمادي",         agency: "المرور"          },
    { role: "EMPLOYEE",    label: "موظف الأحوال المدنية",   nn: "01011131317", name: "سارة عبد المجيد محمد السالمي",  agency: "الأحوال المدنية" },
    { role: "EMPLOYEE",    label: "موظف المستشفيات",         nn: "01011200004", name: "ريم طارق عبد الله الدهمشي",    agency: "المستشفيات"      },
    { role: "EMPLOYEE",    label: "موظف الجوازات",           nn: "01011200005", name: "باسل أمين خالد الشرعبي",       agency: "الجوازات"        },
    { role: "EMPLOYEE",    label: "موظف المرور",             nn: "01011200006", name: "منصور علي حسن الشوكاني",        agency: "المرور"          },
  ];

  for (const r of summaryRows) {
    console.log(`  [${r.role.padEnd(11)}]  ${r.label.padEnd(30)}  ${r.nn}  ${r.name}`);
  }

  console.log("\n  كلمة المرور لجميع الحسابات: Password123");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  console.log("✓ Done! Update DEMO_ACCOUNTS in src/app/(auth)/login/page.tsx with the above.\n");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
