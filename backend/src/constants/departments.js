const DEPARTMENTS = [
  'BSBA-MM',
  'BSAIS',
  'BSOA',
  'BSCS',
  'BEEd',
  'BSA',
];

// Staff/admin can additionally administer the Registrar department
const ALL_DEPARTMENTS = [...DEPARTMENTS, 'Registrar'];

module.exports = { DEPARTMENTS, ALL_DEPARTMENTS };