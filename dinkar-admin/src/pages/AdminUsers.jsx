import { useEffect, useState } from "react";
import Toast from "../components/Toast";
import {
  createAdminUser,
  deleteAdminUser,
  getAdminUsers,
  updateAdminUser,
} from "../services/api";

const emptyForm = {
  name: "",
  email: "",
  password: "",
  isActive: true,
};

const emptyEditForm = {
  name: "",
  email: "",
  password: "",
  isActive: true,
};

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({});
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState(emptyEditForm);

  const loadUsers = async () => {
    try {
      const data = await getAdminUsers();
      setUsers(data);
    } catch (error) {
      setToast({
        message:
          error.response?.data?.message || "Failed to load admin users",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();

    if (!form.name.trim() || !form.email.trim() || !form.password) {
      setToast({
        message: "Name, email and password are required",
        type: "error",
      });
      return;
    }

    setSaving(true);

    try {
      await createAdminUser({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        isActive: form.isActive,
      });
      setForm(emptyForm);
      setToast({ message: "Admin user created", type: "success" });
      await loadUsers();
    } catch (error) {
      setToast({
        message:
          error.response?.data?.message || "Failed to create admin user",
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (user) => {
    setEditing(user);
    setEditForm({
      name: user.name,
      email: user.email,
      password: "",
      isActive: user.isActive,
    });
  };

  const closeEdit = () => {
    setEditing(null);
    setEditForm(emptyEditForm);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!editForm.name.trim() || !editForm.email.trim()) {
      setToast({ message: "Name and email are required", type: "error" });
      return;
    }

    setSaving(true);

    try {
      await updateAdminUser(editing._id, {
        name: editForm.name.trim(),
        email: editForm.email.trim(),
        password: editForm.password,
        isActive: editForm.isActive,
      });
      closeEdit();
      setToast({ message: "Admin user updated", type: "success" });
      await loadUsers();
    } catch (error) {
      setToast({
        message:
          error.response?.data?.message || "Failed to update admin user",
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (user) => {
    if (!window.confirm(`Delete admin "${user.name}"?`)) return;

    try {
      await deleteAdminUser(user._id);
      setToast({ message: "Admin user deleted", type: "success" });
      await loadUsers();
    } catch (error) {
      setToast({
        message:
          error.response?.data?.message || "Failed to delete admin user",
        type: "error",
      });
    }
  };

  const formatDate = (value) =>
    value ? new Date(value).toLocaleDateString() : "—";

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Admin Users</h1>
        <p className="mt-1 text-sm text-gray-500">
          Add, edit, deactivate or remove admin accounts.
        </p>
      </div>

      <form
        onSubmit={handleCreate}
        className="mb-8 grid gap-4 rounded-lg border border-gray-100 bg-white p-4 shadow-sm md:grid-cols-2 xl:grid-cols-4"
      >
        <input
          type="text"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Full name"
          className="w-full rounded-md border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
          required
        />
        <input
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          placeholder="Login email"
          className="w-full rounded-md border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
          required
        />
        <input
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          placeholder="Password (min 6 characters)"
          className="w-full rounded-md border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
          required
        />
        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-md bg-green-600 px-6 py-2 text-white transition hover:bg-green-700 disabled:opacity-60"
        >
          {saving ? "Adding..." : "Add Admin"}
        </button>
      </form>

      <div className="overflow-x-auto rounded-lg border border-gray-100 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Created
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {loading ? (
              <tr>
                <td
                  colSpan="5"
                  className="px-6 py-8 text-center text-gray-500"
                >
                  Loading admin users...
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user._id}>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-gray-900">
                        {user.name}
                      </span>
                      {user.isPrimary && (
                        <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                          Primary
                        </span>
                      )}
                      {user.isSelf && (
                        <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                          You
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                    {user.email}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        user.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {user.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                    {formatDate(user.createdAt)}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                    <button
                      type="button"
                      onClick={() => openEdit(user)}
                      className="mr-4 text-green-700 hover:text-green-900"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(user)}
                      disabled={user.isSelf || user.isPrimary}
                      className="text-red-600 hover:text-red-900 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
            {!loading && users.length === 0 && (
              <tr>
                <td
                  colSpan="5"
                  className="px-6 py-8 text-center text-gray-500"
                >
                  No admin users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">
                Edit Admin User
              </h2>
              <button
                type="button"
                onClick={closeEdit}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4">
              <input
                type="text"
                value={editForm.name}
                onChange={(e) =>
                  setEditForm({ ...editForm, name: e.target.value })
                }
                placeholder="Full name"
                className="w-full rounded-md border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
              <input
                type="email"
                value={editForm.email}
                onChange={(e) =>
                  setEditForm({ ...editForm, email: e.target.value })
                }
                placeholder="Login email"
                className="w-full rounded-md border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
              <input
                type="password"
                value={editForm.password}
                onChange={(e) =>
                  setEditForm({ ...editForm, password: e.target.value })
                }
                placeholder="New password (optional)"
                className="w-full rounded-md border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              />

              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={editForm.isActive}
                  onChange={(e) =>
                    setEditForm({ ...editForm, isActive: e.target.checked })
                  }
                  disabled={editing.isPrimary || editing.isSelf}
                  className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                Active
              </label>

              {editing.isPrimary && (
                <p className="text-xs text-gray-500">
                  The primary admin cannot be deactivated or deleted.
                </p>
              )}
              {editing.isSelf && !editing.isPrimary && (
                <p className="text-xs text-gray-500">
                  You cannot deactivate or delete your own account.
                </p>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeEdit}
                  className="rounded-md border px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-md bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700 disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Toast {...toast} onClose={() => setToast({})} />
    </div>
  );
};

export default AdminUsers;
