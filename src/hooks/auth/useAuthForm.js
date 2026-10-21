import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getAuthRedirect } from "../../utils/authRedirect";
import { useAuth } from "../../context/AuthContext";

// ─── Constants: email pattern & blank form ────────────────────────────────────

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const createInitialState = () => ({
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
});

// ─── useAuthForm: login/register form logic ───────────────────────────────────

const useAuthForm = (mode = "login") => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register, authenticating } = useAuth();
  const [formData, setFormData] = useState(createInitialState);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // ─── Helpers: field validation ────────────────────────────────────────────────

  const validate = () => {
    const trimmedName = formData.name.trim();
    const trimmedEmail = formData.email.trim().toLowerCase();

    if (mode === "register" && trimmedName.length < 2) {
      return "Enter your name so we can create your profile.";
    }

    if (!EMAIL_PATTERN.test(trimmedEmail)) {
      return "Enter a valid email address to continue.";
    }

    if (formData.password.length < 6) {
      return "Your password must be at least 6 characters long.";
    }

    if (mode === "register" && formData.password !== formData.confirmPassword) {
      return "Your password confirmation does not match.";
    }

    return "";
  };

  // ─── Handlers: change & submit ────────────────────────────────────────────────

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (error) {
      setError("");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (authenticating || submitting) {
      return;
    }

    const validationError = validate();

    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);

    try {
      const trimmedEmail = formData.email.trim().toLowerCase();
      const action =
        mode === "register"
          ? register({
              name: formData.name.trim(),
              email: trimmedEmail,
              password: formData.password,
            })
          : login({
              email: trimmedEmail,
              password: formData.password,
            });
      const nextUser = await action;

      if (nextUser) {
        setFormData(createInitialState());
        navigate(getAuthRedirect(location.state), { replace: true });
      }
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Return: form data, error & handlers ──────────────────────────────────────

  return {
    formData,
    error,
    isBusy: authenticating || submitting,
    handleChange,
    handleSubmit,
  };
};

export default useAuthForm;
