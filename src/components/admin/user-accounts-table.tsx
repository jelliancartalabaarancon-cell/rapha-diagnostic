"use client";

import { useMemo, useState } from "react";
import { AccountActions } from "@/components/admin/account-actions";

type UserRole = "PATIENT" | "STAFF" | "ADMIN";

type User = {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
};

type Props = {
  users: User[];
  currentUserId?: string;
};

export function UserAccountsTable({
  users,
  currentUserId,
}: Props) {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"ALL" | UserRole>("ALL");
  const [statusFilter, setStatusFilter] = useState<
    "ALL" | "ACTIVE" | "INACTIVE"
  >("ALL");

  const filteredUsers = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return users.filter((user) => {
      /*
       * Search by name or email.
       */
      const matchesSearch =
        searchValue === "" ||
        user.fullName.toLowerCase().includes(searchValue) ||
        user.email.toLowerCase().includes(searchValue);

      /*
       * Filter by role.
       */
      const matchesRole =
        roleFilter === "ALL" || user.role === roleFilter;

      /*
       * Filter by account status.
       */
      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" && user.isActive) ||
        (statusFilter === "INACTIVE" && !user.isActive);

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, search, roleFilter, statusFilter]);

  return (
    <div>
      {/* Filters */}
      <div className="mt-6 flex flex-col gap-3 md:flex-row">
        {/* Search */}
        <div className="relative flex-1">
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search name or email..."
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-clinical-500 focus:ring-2 focus:ring-clinical-100"
          />
        </div>

        {/* Role Filter */}
        <select
          value={roleFilter}
          onChange={(event) =>
            setRoleFilter(
              event.target.value as "ALL" | UserRole,
            )
          }
          className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 outline-none focus:border-clinical-500 focus:ring-2 focus:ring-clinical-100"
        >
          <option value="ALL">All Roles</option>
          <option value="PATIENT">Patient</option>
          <option value="STAFF">Staff</option>
          <option value="ADMIN">Admin</option>
        </select>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(
              event.target.value as
                | "ALL"
                | "ACTIVE"
                | "INACTIVE",
            )
          }
          className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 outline-none focus:border-clinical-500 focus:ring-2 focus:ring-clinical-100"
        >
          <option value="ALL">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </select>
      </div>

      {/* Result count */}
      <div className="mt-4 text-sm text-slate-500">
        Showing{" "}
        <span className="font-semibold text-clinical-950">
          {filteredUsers.length}
        </span>{" "}
        of{" "}
        <span className="font-semibold text-clinical-950">
          {users.length}
        </span>{" "}
        user accounts
      </div>

      {/* Account Table */}
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[950px] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500">
              <th className="px-4 py-3 font-medium">
                Name
              </th>

              <th className="px-4 py-3 font-medium">
                Email
              </th>

              <th className="px-4 py-3 font-medium">
                Role
              </th>

              <th className="px-4 py-3 font-medium">
                Created
              </th>

              <th className="px-4 py-3 font-medium">
                Status
              </th>

              <th className="px-4 py-3 font-medium">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {filteredUsers.map((user) => (
              <tr
                key={user.id}
                className="border-b border-slate-100 last:border-0"
              >
                {/* Name */}
                <td className="px-4 py-4">
                  <div className="font-medium text-clinical-950">
                    {user.fullName}
                  </div>
                </td>

                {/* Email */}
                <td className="px-4 py-4 text-slate-600">
                  {user.email}
                </td>

                {/* Role */}
                <td className="px-4 py-4">
                  <span
                    className={
                      user.role === "ADMIN"
                        ? "rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700"
                        : user.role === "STAFF"
                          ? "rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700"
                          : "rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700"
                    }
                  >
                    {user.role}
                  </span>
                </td>

                {/* Created */}
                <td className="px-4 py-4 text-slate-500">
                  {new Date(user.createdAt).toLocaleDateString(
                    "en-PH",
                    {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    },
                  )}
                </td>

                {/* Status */}
                <td className="px-4 py-4">
                  <span
                    className={
                      user.isActive
                        ? "rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700"
                        : "rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700"
                    }
                  >
                    {user.isActive ? "Active" : "Inactive"}
                  </span>
                </td>

                {/* Actions */}
                <td className="px-4 py-4">
                  <AccountActions
                    id={user.id}
                    role={user.role}
                    isActive={user.isActive}
                    isCurrentUser={
                      user.id === currentUserId
                    }
                  />
                </td>
              </tr>
            ))}

            {filteredUsers.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-10 text-center text-slate-500"
                >
                  No user accounts match your search or filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}