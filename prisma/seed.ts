import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting RAPHA database seed...");

  // ==========================================
  // SERVICES
  // ==========================================

  const services = [
    // Clinical Chemistry
    {
      id: "svc_fbs",
      name: "Fasting Blood Sugar",
      description: "Blood test used to measure blood glucose after fasting.",
      icon: "droplets",
      isActive: true,
    },
    {
      id: "svc_rbs",
      name: "Random Blood Sugar",
      description: "Blood test used to measure blood glucose at any time.",
      icon: "droplets",
      isActive: true,
    },
    {
      id: "svc_creatinine",
      name: "Creatinine",
      description: "Blood test used to assess kidney function.",
      icon: "flask-conical",
      isActive: true,
    },
    {
      id: "svc_uric_acid",
      name: "Uric Acid",
      description: "Blood test used to measure uric acid levels.",
      icon: "flask-conical",
      isActive: true,
    },
    {
      id: "svc_cholesterol",
      name: "Cholesterol",
      description: "Blood test used to measure cholesterol levels.",
      icon: "heart-pulse",
      isActive: true,
    },
    {
      id: "svc_sgpt",
      name: "SGPT (ALT)",
      description: "Liver enzyme test used to assess liver function.",
      icon: "flask-conical",
      isActive: true,
    },
    {
      id: "svc_sgot",
      name: "SGOT (AST)",
      description: "Enzyme test used to assess liver and organ function.",
      icon: "flask-conical",
      isActive: true,
    },
    {
      id: "svc_bun",
      name: "BUN",
      description: "Blood urea nitrogen test used to assess kidney function.",
      icon: "flask-conical",
      isActive: true,
    },
    {
      id: "svc_albumin",
      name: "Albumin",
      description: "Blood test that measures albumin protein levels.",
      icon: "flask-conical",
      isActive: true,
    },
    {
      id: "svc_total_protein",
      name: "Total Protein",
      description:
        "Test that measures the total amount of protein in the blood.",
      icon: "flask-conical",
      isActive: true,
    },
    {
      id: "svc_lipid",
      name: "Lipid Profile",
      description: "Blood test that measures different types of fats.",
      icon: "heart-pulse",
      isActive: true,
    },
    {
      id: "svc_hba1c",
      name: "HbA1c",
      description: "Test that measures average blood sugar levels.",
      icon: "droplets",
      isActive: true,
    },
    {
      id: "svc_ogtt",
      name: "OGTT",
      description:
        "Oral glucose tolerance test used to evaluate glucose processing.",
      icon: "droplets",
      isActive: true,
    },
    {
      id: "svc_electrolytes",
      name: "Electrolytes (Na, K, Ca)",
      description: "Test that measures sodium, potassium, and calcium levels.",
      icon: "flask-conical",
      isActive: true,
    },

    // Immunology & Serology
    {
      id: "svc_hbsag",
      name: "HBsAg",
      description: "Test used to detect hepatitis B surface antigen.",
      icon: "shield-check",
      isActive: true,
    },
    {
      id: "svc_antihbs",
      name: "Anti-HBs",
      description: "Test used to detect antibodies against hepatitis B.",
      icon: "shield-check",
      isActive: true,
    },
    {
      id: "svc_vdrl",
      name: "VDRL (Syphilis)",
      description: "Screening test for syphilis infection.",
      icon: "shield-check",
      isActive: true,
    },
    {
      id: "svc_hcg",
      name: "PT HCG",
      description: "Pregnancy test that detects human chorionic gonadotropin.",
      icon: "test-tube",
      isActive: true,
    },
    {
      id: "svc_antihp",
      name: "Anti-HP",
      description: "Serological test for Helicobacter pylori.",
      icon: "shield-check",
      isActive: true,
    },
    {
      id: "svc_psa",
      name: "PSA",
      description: "Blood test used to measure prostate-specific antigen.",
      icon: "test-tube",
      isActive: true,
    },
    {
      id: "svc_dengue",
      name: "Dengue Duo",
      description: "Test used to detect dengue infection markers.",
      icon: "shield-check",
      isActive: true,
    },

    // Hematology
    {
      id: "svc_cbc",
      name: "Complete Blood Count (CBC)",
      description:
        "Blood test that evaluates red blood cells, white blood cells, and platelets.",
      icon: "droplets",
      isActive: true,
    },
    {
      id: "svc_blood_typing",
      name: "Blood Typing",
      description: "Test used to determine a person's blood type.",
      icon: "droplets",
      isActive: true,
    },

    // Clinical Microscopy
    {
      id: "svc_urinalysis",
      name: "Urinalysis",
      description: "Laboratory examination of urine.",
      icon: "test-tube",
      isActive: true,
    },
    {
      id: "svc_fecalysis",
      name: "Fecalysis",
      description: "Laboratory examination of stool.",
      icon: "test-tube",
      isActive: true,
    },
    {
      id: "svc_fobt",
      name: "FOBT",
      description:
        "Fecal occult blood test used to detect hidden blood in stool.",
      icon: "test-tube",
      isActive: true,
    },
    {
      id: "svc_semenalysis",
      name: "Semenalysis",
      description: "Laboratory examination of semen.",
      icon: "test-tube",
      isActive: true,
    },
  ];

  // Create services one by one so running the seed again
  // does not cause duplicate ID errors.
  for (const service of services) {
    await prisma.service.upsert({
      where: {
        id: service.id,
      },
      update: {
        name: service.name,
        description: service.description,
        icon: service.icon,
        isActive: service.isActive,
      },
      create: service,
    });
  }

  console.log(`✓ ${services.length} services created/updated.`);

  // ==========================================
  // APPOINTMENT SLOTS
  // ==========================================

  const slotTimes = [
    ["09:00", "10:00"],
    ["10:00", "11:00"],
    ["11:00", "12:00"],

    // Lunch break: 12:00 PM - 1:00 PM

    ["13:00", "14:00"],
    ["14:00", "15:00"],
    ["15:00", "16:00"],
    ["16:00", "17:00"],
  ];

  // Create slots for the next 30 days.
  for (let dayOffset = 0; dayOffset < 30; dayOffset++) {
    const date = new Date();

    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + dayOffset);

    // Skip Sunday.
    if (date.getDay() === 0) {
      continue;
    }

    for (const [startTime, endTime] of slotTimes) {
      const existingSlot = await prisma.appointmentSlot.findFirst({
        where: {
          date,
          startTime,
          endTime,
        },
      });

      if (!existingSlot) {
        await prisma.appointmentSlot.create({
          data: {
            date,
            startTime,
            endTime,
            capacity: 5,
            bookedCount: 0,
            isActive: true,
          },
        });
      }
    }
  }

  console.log("✓ Appointment slots created.");
  console.log("✓ RAPHA database seed completed.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("Seed failed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
