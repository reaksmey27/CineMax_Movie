import { meetsPasswordRequirements } from "./passwordRequirements";

export function validateSignup(values) {
  const errors = {};
  if (values.name.trim().length < 2) errors.name = "Enter at least 2 characters for your name.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) errors.email = "Enter a valid email address.";
  if (!meetsPasswordRequirements(values.password)) errors.password = "Meet all password requirements before continuing.";
  if (!values.confirmPassword) errors.confirmPassword = "Confirm your password.";
  else if (values.password !== values.confirmPassword) errors.confirmPassword = "Passwords do not match.";
  return errors;
}
