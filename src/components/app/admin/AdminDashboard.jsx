import React, { useState } from "react";
import { useInviteUser, useGetAppUsers } from "../../../hooks/useAdmin";
import { Search, UserPlus } from "lucide-react";
import Pagination from "../Pagination";
import InviteUserModal from "./InviteUserModal";

const AdminDashboard = () => {
  const { mutate: inviteUser, isPending: isInviting } = useInviteUser();
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");

  const { data: usersResponse, isLoading } = useGetAppUsers({
    pageNumber: currentPage,
    pageSize,
  });

  const users = usersResponse?.data?.items || [];
  const totalPages = usersResponse?.data?.totalPages || 1;
  const totalCount = usersResponse?.data?.totalCount || 0;

  const filteredUsers = users
    .filter((user) => {
      const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
      const email = user.email.toLowerCase();
      const search = searchTerm.toLowerCase();
      
      const matchesSearch = fullName.includes(search) || email.includes(search);
      const matchesRole = roleFilter === "ALL" || user.roles?.includes(roleFilter);
      
      return matchesSearch && matchesRole;
    })
    .sort(
      (a, b) =>
        new Date(b.createdDate || b.date || 0) -
        new Date(a.createdDate || a.date || 0)
    );

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Users Management</h1>
          <p className="text-sm text-gray-500">
            View and manage all users across the platform
          </p>
        </div>
        <button
          className="flex items-center gap-2 bg-[#3DA5E0] hover:bg-[#2b8bc2] text-white px-4 py-2 rounded-lg font-medium transition-colors"
          onClick={() => setIsInviteModalOpen(true)}
        >
          <UserPlus size={18} />
          <span>Invite User</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-4 border-b border-gray-100 flex flex-wrap justify-between items-center bg-gray-50/50 gap-4">
          <div className="flex items-center gap-3 w-full sm:max-w-md">
            <div className="relative flex-1">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DA5E0] focus:border-transparent text-sm"
              />
            </div>
            
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DA5E0] focus:border-transparent text-sm bg-white min-w-[130px]"
            >
              <option value="ALL">All Roles</option>
              <option value="ADMIN">Admin</option>
              <option value="EXECUTIVE">Executive</option>
              <option value="USER">User</option>
            </select>
          </div>
          
          <div className="text-sm text-gray-500 font-medium hidden md:block">
            Found: {filteredUsers.length} / {totalCount}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider border-b border-gray-200">
                <th className="px-6 py-4 font-semibold">User</th>
                <th className="px-6 py-4 font-semibold">Role</th>
                <th className="px-6 py-4 font-semibold">Contact</th>
                <th className="px-6 py-4 font-semibold">ID / Airline</th>
                <th className="px-6 py-4 font-semibold text-right">Added On</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {isLoading ? (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    <div className="flex justify-center items-center gap-2">
                      <svg
                        className="animate-spin h-5 w-5 text-[#3DA5E0]"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                      </svg>
                      Loading users...
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 bg-[#E6F3FA] text-[#1D81B9] rounded-full flex items-center justify-center font-bold text-sm">
                          {user.firstName?.charAt(0)}
                          {user.lastName?.charAt(0)}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.firstName} {user.middleName} {user.lastName}
                          </div>
                          <div className="text-xs text-gray-500">
                            ID: {user.id.substring(0, 8)}...
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {user.roles?.map((role) => (
                          <span
                            key={role}
                            className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              role === "ADMIN"
                                ? "bg-purple-100 text-purple-800"
                                : role === "EXECUTIVE"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-green-100 text-green-800"
                            }`}
                          >
                            {role}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{user.email}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {user.phoneNumber || "No phone"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {user.idNumber || "-"}
                      </div>
                      <div
                        className="text-xs text-gray-500 mt-1 truncate max-w-[120px]"
                        title={user.airlineId}
                      >
                        {user.airlineId ? "Has Airline" : "None"}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-gray-500">
                      {new Date(user.createdDate).toLocaleDateString("en-GB", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    No users found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Controls */}
      {users.length > 0 && !isLoading && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          pageSize={pageSize}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setCurrentPage(1); // Reset to page 1 to prevent getting out of bounds
          }}
        />
      )}

      {/* Invite User Modal */}
      <InviteUserModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        inviteUser={inviteUser}
        isInviting={isInviting}
      />
    </div>
  );
};

export default AdminDashboard;
