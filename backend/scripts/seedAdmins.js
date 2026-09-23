require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../src/config/db");
const User = require("../src/models/User");
const { ALL_DEPARTMENTS } = require("../src/constants/departments");

const DEFAULT_PASSWORD = "Admin123!"; // change these after first login, in a real deployment

const seedAdmins = async () => {
  await connectDB();

  for (const department of ALL_DEPARTMENTS) {
    const email = `admin.${department.toLowerCase()}@silayinstitute.edu.ph`;

    const existing = await User.findOne({ email });
    if (existing) {
      console.log(`Skipped (already exists): ${email}`);
      continue;
    }

    await User.create({
      name: `${department} Admin`,
      email,
      password: DEFAULT_PASSWORD, // hashed automatically by the pre('save') hook
      role: "admin",
      department,
    });

    console.log(`Created: ${email} (department: ${department})`);
  }

  console.log(
    "\nDone. Default password for all seeded admins:",
    DEFAULT_PASSWORD,
  );
  mongoose.connection.close();
};

seedAdmins().catch((err) => {
  console.error("Seeding failed:", err);
  mongoose.connection.close();
});

/*
Created: admin.bsba-mm@silayinstitute.edu.ph (department: BSBA-MM)
Created: admin.bsais@silayinstitute.edu.ph (department: BSAIS)
Created: admin.bsoa@silayinstitute.edu.ph (department: BSOA)
Created: admin.bscs@silayinstitute.edu.ph (department: BSCS)
Created: admin.beed@silayinstitute.edu.ph (department: BEEd)
Created: admin.bsa@silayinstitute.edu.ph (department: BSA)
Created: admin.registrar@silayinstitute.edu.ph (department: Registrar)

Done. Default password for all seeded admins: Admin123!
*/
