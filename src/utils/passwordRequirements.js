export const passwordRequirements = [
  { label: "At least one capital letter", test: (value) => /[A-Z]/.test(value) },
  { label: "At least one number or symbol", test: (value) => /[0-9]|[^\p{L}\p{N}\s]/u.test(value) },
  { label: "At least 8 characters", test: (value) => value.length >= 8 },
];

export const meetsPasswordRequirements = (value) =>
  passwordRequirements.every((requirement) => requirement.test(value));
