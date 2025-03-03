import React, { useState, useEffect } from "react";
import api from "../utils/api";
import toast from "react-hot-toast";

import UserList from "./UserList";
import AddUserForm from "./AddUserForm";
import BulkUpload from "./BulkUpload";
import "../styles/adminpanel.css";

const API_URL = process.env.REACT_APP_API_URL;

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  // Fetch users from the API
  const fetchUsers = async () => {
    setLoading(true);
    setError(null); // Clear any previous errors
    try {
      console.log("Fetching users from:", `${API_URL}/api/users`); // Debugging
      const response = await api.get(`${API_URL}/api/users`);
      console.log("API Response:", response.data); // Debugging
      setUsers(response.data); // Ensure the API returns an array of users
    } catch (error) {
      setError("Failed to fetch users. Please try again later.");
      console.error("Error fetching users:", error);
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  // Add a new user
  const addUser = async (userData) => {
    try {
      // Ensure phone is always handled as a string and role is boolean
      const userToAdd = {
        ...userData,
        role: userData.role === "admin",
        phone: String(userData.phone),
      };
  
      const response = await api.post(`${API_URL}/api/folder/users/upload`, [userToAdd]);
      console.log("Add user response:", response.data); // Log for debugging
      
      if (response.status === 201) {
        // Show success toast notification with the message from the response
        toast.success(response.data.message);
        setShowAddUserModal(false); // Close the modal
        fetchUsers(); // Refresh the user list
        return true;
      } else {
        toast.error("Failed to add user");
        return false;
      }
    } catch (error) {
      console.error("Error adding user:", error);
      toast.error(`Error adding user: ${error.message || "Unknown error"}`);
      return false;
    }
  };

  
  // Delete a user
  const deleteUser = async (id, username) => {
    try {
      await api.delete(`${API_URL}/api/users/${id}`);
      setUsers(users.filter((user) => user.id !== id)); // Remove the user from the list
      toast.success(`User ${username} deleted`);
      return true;
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error(`Failed to delete user: ${error.message || "Unknown error"}`);
      return false;
    }
  };

  // Update a user
  const updateUser = async (updatedUser) => {
    try {
      const userToUpdate = {
        ...updatedUser,
        role: updatedUser.role === true || updatedUser.role === "admin",
        phone: String(updatedUser.phone),
      };

      const response = await api.put(`${API_URL}/api/users/${updatedUser.id}`, userToUpdate);
      setUsers(users.map((user) => (user.id === updatedUser.id ? response.data : user))); // Update the user in the list
      
      // Show toast notification for role change
      const roleText = userToUpdate.role ? "admin" : "student";
      toast.success(`User ${updatedUser.username}: changed access to ${roleText}`);
      
      return true;
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error(`Failed to update user: ${error.message || "Unknown error"}`);
      return false;
    }
  };

  // Handle bulk upload of users
  const handleBulkUpload = async (newUsers) => {
    setLoading(true);
    setError(null); // Clear any previous errors
    try {
      const formattedUsers = newUsers.map((user) => ({
        ...user,
        role: user.role === "admin",
        phone: String(user.phone),
      }));

      const responses = await Promise.all(
        formattedUsers.map((user) => api.post(`${API_URL}/api/users`, user))
      );

      setUsers([...users, ...responses.map((res) => res.data)]); // Add new users to the list
      
      // Show success toast notification
      toast.success(`Added users: bulk upload from excel (${formattedUsers.length} users uploaded)`);
      
      return true;
    } catch (error) {
      setError("Bulk upload failed: " + error.message);
      console.error("Error during bulk upload:", error);
      toast.error(`Bulk upload failed: ${error.message || "Unknown error"}`);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-panel">
      {/* Bulk Upload Component */}
      <BulkUpload handleBulkUpload={handleBulkUpload} />

      {/* Header with Add User Button */}
      <div className="users-header">
        <h2>User Management</h2>
        <button onClick={() => setShowAddUserModal(true)}>+ Add User</button>
      </div>

      {/* Loading and Error Messages */}
      {loading && <div className="loading-message">Loading...</div>}
      {error && <div className="error-message">{error}</div>}

      {/* User List Component */}
      <UserList users={users} deleteUser={deleteUser} updateUser={updateUser} />

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={() => setShowAddUserModal(false)}>
              &times;
            </span>
            <AddUserForm addUser={addUser} onSuccess={() => setShowAddUserModal(false)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;