const KEY = "demo_users";

export function getUsers() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    return JSON.parse(raw || "[]");
  } catch (e) {
    return [];
  }
}

export function setUsers(users) {
  try {
    localStorage.setItem(KEY, JSON.stringify(users || []));
  } catch (e) {
    // ignore
  }
}

export function addUser(user) {
  const users = getUsers();
  users.push(user);
  setUsers(users);
  return user;
}

export function findUser(email) {
  if (!email) return null;
  const users = getUsers();
  return users.find((u) => String(u.email).toLowerCase() === String(email).toLowerCase()) || null;
}

// Seed a demo user if none exists
try {
  if (typeof window !== "undefined") {
    const u = getUsers();
    if (!u || u.length === 0) {
      addUser({ email: "demo@onestock.local", name: "Demo User", password: "demo" });
    }
  }
} catch (e) {
  // ignore
}

export function findOrCreateGoogleUser() {
  try {
    const email = "google@onestock.local";
    let u = findUser(email);
    if (u) return u;
    u = addUser({ email, name: "Google User", password: "", provider: "google" });
    return u;
  } catch (e) {
    return null;
  }
}

export default { getUsers, setUsers, addUser, findUser };
