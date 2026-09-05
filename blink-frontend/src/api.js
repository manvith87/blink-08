// Thin fetch wrapper around the Blink backend (see ../blink-server).
// Every function here returns parsed JSON or throws an Error with a
// human-readable message pulled from the API's { error } field.

// In development the Express API runs locally. In the production-only
// frontend deployment, account data falls back to the visitor's browser until
// a persistent API URL is configured in Vercel.
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? "http://localhost:3000" : "");

const LOCAL_ACCOUNTS_KEY = "blink_local_accounts";
const LOCAL_SESSION_KEY = "blink_local_session";

function localAccounts() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_ACCOUNTS_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveAccounts(accounts) {
  localStorage.setItem(LOCAL_ACCOUNTS_KEY, JSON.stringify(accounts));
}

async function passwordHash(password) {
  const bytes = new TextEncoder().encode(password);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function publicUser(account) {
  const { password_hash, ...user } = account;
  return user;
}

function saveSession(email) {
  const token = crypto.randomUUID();
  localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify({ token, email }));
  return token;
}

function localSession(token) {
  try {
    const session = JSON.parse(localStorage.getItem(LOCAL_SESSION_KEY) || "null");
    return session?.token === token ? session : null;
  } catch {
    return null;
  }
}

async function localSignup({ name, email, password }) {
  const normalizedEmail = email.toLowerCase().trim();
  if (!name || !normalizedEmail || !password) throw new Error("name, email and password are required");
  if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) throw new Error("That doesn't look like a valid email");
  if (password.length < 8) throw new Error("Password must be at least 8 characters");
  const accounts = localAccounts();
  if (accounts[normalizedEmail]) throw new Error("An account with that email already exists");
  accounts[normalizedEmail] = {
    id: crypto.randomUUID(), name: name.trim(), email: normalizedEmail, bio: "",
    created_at: new Date().toISOString(), password_hash: await passwordHash(password),
  };
  saveAccounts(accounts);
  const token = saveSession(normalizedEmail);
  return { token, user: publicUser(accounts[normalizedEmail]) };
}

async function localLogin({ email, password }) {
  const account = localAccounts()[email.toLowerCase().trim()];
  if (!account || account.password_hash !== await passwordHash(password)) {
    throw new Error("Incorrect email or password");
  }
  return { token: saveSession(account.email), user: publicUser(account) };
}

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    signal: options.signal || AbortSignal.timeout(8000),
  });

  let data = null;
  try {
    data = await res.json();
  } catch {
    // Some endpoints (e.g. DELETE) return no body — that's fine.
  }

  if (!res.ok) {
    throw new Error((data && data.error) || `Request failed (${res.status})`);
  }
  return data;
}

export function fetchCourses(params = {}) {
  const query = new URLSearchParams(
    Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== ""))
  ).toString();
  return request(`/api/courses${query ? `?${query}` : ""}`);
}

export function signup({ name, email, password }) {
  if (!API_BASE_URL) return localSignup({ name, email, password });
  return request("/api/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });
}

export function login({ email, password }) {
  if (!API_BASE_URL) return localLogin({ email, password });
  return request("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
}

export function fetchProfile(token) {
  if (!API_BASE_URL) {
    const session = localSession(token);
    const account = session && localAccounts()[session.email];
    return account ? Promise.resolve(publicUser(account)) : Promise.reject(new Error("Session expired"));
  }
  return request("/api/profile", {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function updateProfile(token, updates) {
  if (!API_BASE_URL) return localUpdateProfile(token, updates);
  return request("/api/profile", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(updates),
  });
}

async function localUpdateProfile(token, updates) {
  const session = localSession(token);
  const accounts = localAccounts();
  const account = session && accounts[session.email];
  if (!account) throw new Error("Session expired");
  const email = updates.email.toLowerCase().trim();
  if (!updates.name?.trim()) throw new Error("Name can't be empty");
  if (!/^\S+@\S+\.\S+$/.test(email)) throw new Error("That doesn't look like a valid email");
  if (email !== account.email && accounts[email]) throw new Error("That email is already in use");
  if (updates.newPassword) {
    if (updates.newPassword.length < 8) throw new Error("New password must be at least 8 characters");
    if (!updates.currentPassword || account.password_hash !== await passwordHash(updates.currentPassword)) {
      throw new Error("Current password is incorrect");
    }
    account.password_hash = await passwordHash(updates.newPassword);
  }
  delete accounts[account.email];
  Object.assign(account, { name: updates.name.trim(), email, bio: updates.bio || "" });
  accounts[email] = account;
  saveAccounts(accounts);
  localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify({ token, email }));
  return publicUser(account);
}
