import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";

export default function AuthModal({ open, onClose }) {
  const { user, login, signup, logout, updateProfile } = useAuth();
  const [tab, setTab] = useState("login");
  const [authMsg, setAuthMsg] = useState("");
  const [authBusy, setAuthBusy] = useState(false);

  const [loginFields, setLoginFields] = useState({ email: "", password: "" });
  const [signupFields, setSignupFields] = useState({ name: "", email: "", password: "" });

  const [profileFields, setProfileFields] = useState({
    name: "",
    email: "",
    bio: "",
    currentPassword: "",
    newPassword: "",
  });
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");
  const [profileBusy, setProfileBusy] = useState(false);

  const overlayRef = useRef(null);

  // Whenever the modal opens, land on the right view and reset any
  // stale messages from a previous open.
  useEffect(() => {
    if (!open) return;
    setAuthMsg("");
    setProfileError("");
    setProfileSuccess("");
    if (user) {
      setProfileFields({
        name: user.name || "",
        email: user.email || "",
        bio: user.bio || "",
        currentPassword: "",
        newPassword: "",
      });
    } else {
      setTab("login");
    }
  }, [open, user]);

  useEffect(() => {
    function handleKey(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  if (!open) return null;

  async function handleLogin(e) {
    e.preventDefault();
    setAuthMsg("");
    setAuthBusy(true);
    try {
      await login(loginFields.email.trim(), loginFields.password);
      setLoginFields({ email: "", password: "" });
    } catch (err) {
      setAuthMsg(err.message || "Couldn't reach the backend. Is it running?");
    } finally {
      setAuthBusy(false);
    }
  }

  async function handleSignup(e) {
    e.preventDefault();
    setAuthMsg("");
    setAuthBusy(true);
    try {
      await signup(signupFields.name.trim(), signupFields.email.trim(), signupFields.password);
      setSignupFields({ name: "", email: "", password: "" });
    } catch (err) {
      setAuthMsg(err.message || "Couldn't reach the backend. Is it running?");
    } finally {
      setAuthBusy(false);
    }
  }

  async function handleProfileSave(e) {
    e.preventDefault();
    setProfileError("");
    setProfileSuccess("");

    if (profileFields.newPassword && !profileFields.currentPassword) {
      setProfileError("Enter your current password to set a new one.");
      return;
    }

    const body = {
      name: profileFields.name.trim(),
      email: profileFields.email.trim(),
      bio: profileFields.bio,
    };
    if (profileFields.newPassword) {
      body.currentPassword = profileFields.currentPassword;
      body.newPassword = profileFields.newPassword;
    }

    setProfileBusy(true);
    try {
      await updateProfile(body);
      setProfileFields((f) => ({ ...f, currentPassword: "", newPassword: "" }));
      setProfileSuccess("Saved.");
    } catch (err) {
      setProfileError(err.message || "Couldn't reach the backend. Is it running?");
    } finally {
      setProfileBusy(false);
    }
  }

  function handleLogout() {
    logout();
    onClose();
  }

  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString(undefined, { month: "long", year: "numeric" })
    : "";

  return (
    <div
      className="modal-overlay open"
      ref={overlayRef}
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div className="modal-card">
        <button className="modal-close" type="button" aria-label="Close" onClick={onClose}>
          &times;
        </button>

        {!user ? (
          <div>
            <div className="modal-tabs">
              <button
                type="button"
                className={"modal-tab" + (tab === "login" ? " active" : "")}
                onClick={() => setTab("login")}
              >
                Log in
              </button>
              <button
                type="button"
                className={"modal-tab" + (tab === "signup" ? " active" : "")}
                onClick={() => setTab("signup")}
              >
                Sign up
              </button>
            </div>

            <div className={"form-msg error" + (authMsg ? " show" : "")}>{authMsg}</div>

            {tab === "login" ? (
              <form onSubmit={handleLogin}>
                <h2 className="modal-title">Welcome back</h2>
                <p className="modal-sub">Log in to update your profile.</p>
                <div className="form-field">
                  <label htmlFor="loginEmail">Email</label>
                  <input
                    type="email"
                    id="loginEmail"
                    autoComplete="email"
                    required
                    value={loginFields.email}
                    onChange={(e) => setLoginFields((f) => ({ ...f, email: e.target.value }))}
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="loginPassword">Password</label>
                  <input
                    type="password"
                    id="loginPassword"
                    autoComplete="current-password"
                    required
                    value={loginFields.password}
                    onChange={(e) => setLoginFields((f) => ({ ...f, password: e.target.value }))}
                  />
                </div>
                <button type="submit" className="modal-submit" disabled={authBusy}>
                  Log in
                </button>
              </form>
            ) : (
              <form onSubmit={handleSignup}>
                <h2 className="modal-title">Join Blink</h2>
                <p className="modal-sub">Create a free account — no card, no catch.</p>
                <div className="form-field">
                  <label htmlFor="signupName">Name</label>
                  <input
                    type="text"
                    id="signupName"
                    autoComplete="name"
                    required
                    value={signupFields.name}
                    onChange={(e) => setSignupFields((f) => ({ ...f, name: e.target.value }))}
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="signupEmail">Email</label>
                  <input
                    type="email"
                    id="signupEmail"
                    autoComplete="email"
                    required
                    value={signupFields.email}
                    onChange={(e) => setSignupFields((f) => ({ ...f, email: e.target.value }))}
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="signupPassword">Password</label>
                  <input
                    type="password"
                    id="signupPassword"
                    autoComplete="new-password"
                    minLength={8}
                    required
                    value={signupFields.password}
                    onChange={(e) => setSignupFields((f) => ({ ...f, password: e.target.value }))}
                  />
                  <span className="form-hint">At least 8 characters.</span>
                </div>
                <button type="submit" className="modal-submit" disabled={authBusy}>
                  Create account
                </button>
              </form>
            )}
          </div>
        ) : (
          <div>
            <div className="profile-head">
              <h2 className="modal-title">Your profile</h2>
              <button className="logout-btn" type="button" onClick={handleLogout}>
                Log out
              </button>
            </div>
            <p className="modal-sub">{memberSince ? `Member since ${memberSince}` : ""}</p>

            <div className={"form-msg error" + (profileError ? " show" : "")}>{profileError}</div>
            <div className={"form-msg success" + (profileSuccess ? " show" : "")}>{profileSuccess}</div>

            <form onSubmit={handleProfileSave}>
              <div className="form-field">
                <label htmlFor="profileName">Name</label>
                <input
                  type="text"
                  id="profileName"
                  required
                  value={profileFields.name}
                  onChange={(e) => setProfileFields((f) => ({ ...f, name: e.target.value }))}
                />
              </div>
              <div className="form-field">
                <label htmlFor="profileEmail">Email</label>
                <input
                  type="email"
                  id="profileEmail"
                  required
                  value={profileFields.email}
                  onChange={(e) => setProfileFields((f) => ({ ...f, email: e.target.value }))}
                />
              </div>
              <div className="form-field">
                <label htmlFor="profileBio">Bio</label>
                <textarea
                  id="profileBio"
                  placeholder="What are you learning right now?"
                  value={profileFields.bio}
                  onChange={(e) => setProfileFields((f) => ({ ...f, bio: e.target.value }))}
                />
              </div>

              <div className="form-divider">Change password (optional)</div>
              <div className="form-field">
                <label htmlFor="profileCurrentPassword">Current password</label>
                <input
                  type="password"
                  id="profileCurrentPassword"
                  autoComplete="current-password"
                  value={profileFields.currentPassword}
                  onChange={(e) => setProfileFields((f) => ({ ...f, currentPassword: e.target.value }))}
                />
              </div>
              <div className="form-field">
                <label htmlFor="profileNewPassword">New password</label>
                <input
                  type="password"
                  id="profileNewPassword"
                  autoComplete="new-password"
                  minLength={8}
                  value={profileFields.newPassword}
                  onChange={(e) => setProfileFields((f) => ({ ...f, newPassword: e.target.value }))}
                />
                <span className="form-hint">Only fill both password fields if you want to change it.</span>
              </div>

              <button type="submit" className="modal-submit" disabled={profileBusy}>
                Save changes
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
