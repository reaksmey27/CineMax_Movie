import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNotification } from "../../context/NotificationContext";

const createFormState = (user) => ({
  name: user?.name || "",
  email: user?.email || "",
  location: user?.location || "",
  favoriteGenre: user?.favoriteGenre || "",
  bio: user?.bio || "",
});

const useProfile = () => {
  const { user, loading, logout, updateProfile } = useAuth();
  const { showNotification } = useNotification();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(() => createFormState(user));

  useEffect(() => {
    setFormData(createFormState(user));
  }, [user]);

  const isDirty = useMemo(() => {
    const initialState = createFormState(user);

    return Object.keys(initialState).some(
      (key) => initialState[key] !== formData[key],
    );
  }, [formData, user]);

  const handleFieldChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCancelEditing = () => {
    setFormData(createFormState(user));
    setIsEditing(false);
  };

  const handleUpdateProfile = (event) => {
    event.preventDefault();

    if (!user) {
      return;
    }

    if (!formData.name.trim()) {
      showNotification("Please enter a username.", "error");
      return;
    }

    if (!isDirty) {
      setIsEditing(false);
      showNotification("Your profile is already up to date.", "info");
      return;
    }

    const nextProfile = {
      name: formData.name.trim() || user.name,
      location: formData.location.trim(),
      favoriteGenre: formData.favoriteGenre.trim(),
      bio: formData.bio.trim(),
    };

    const nextUser = updateProfile(nextProfile);
    setFormData(createFormState(nextUser || { ...user, ...nextProfile }));
    setIsEditing(false);
    showNotification("Profile settings updated successfully!", "success");
  };

  return {
    loading,
    user,
    logout,
    isEditing,
    setIsEditing,
    formData,
    isDirty,
    handleFieldChange,
    handleCancelEditing,
    handleUpdateProfile,
  };
};

export default useProfile;
