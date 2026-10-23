export const passwordRequirements = [
  { label: "At least 8 characters", test: (value) => value.length >= 8 },
  { label: "Lowercase letter (a-z)", test: (value) => /[a-z]/.test(value) },
  { label: "Uppercase letter (A-Z)", test: (value) => /[A-Z]/.test(value) },
  { label: "Number (0-9)", test: (value) => /[0-9]/.test(value) },
  { label: "Symbol (e.g. !@#$)", test: (value) => /[^\p{L}\p{N}\s]/u.test(value) },
];

export const meetsPasswordRequirements = (value) =>
  passwordRequirements.every((requirement) => requirement.test(value));
