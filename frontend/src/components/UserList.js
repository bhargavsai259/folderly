import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import "../styles/userlist.css";
import toast from "react-hot-toast";

const UserList = ({ deleteUser, updateUser }) => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [showModifyModal, setShowModifyModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [modifiedUser, setModifiedUser] = useState({
        username: "",
        phone: "",
        email: "",
        role: "user",
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalRecords: 0,
        pageSize: 10,
        startRecord: 0,
        endRecord: 0
    });

    useEffect(() => {
        if (searchTerm.trim() !== '') {
            setPagination(prev => ({
                ...prev,
                currentPage: 1
            }));
            fetchUsers(1, pagination.pageSize, searchTerm);
        } else {
            fetchUsers(pagination.currentPage, pagination.pageSize, '');
        }
    }, [searchTerm]);

    useEffect(() => {
        if (searchTerm.trim() === '' || pagination.currentPage > 1) {
            fetchUsers(pagination.currentPage, pagination.pageSize, searchTerm);
        }
    }, [pagination.currentPage, pagination.pageSize]);

    const fetchUsers = async (page = 1, limit = 10, search = '') => {
        try {
            setLoading(true);
            const response = await api.get(`/api/users?page=${page}&limit=${limit}&search=${search}`);
            setUsers(response.data.users);
            setPagination(response.data.pagination);
            setLoading(false);
            setError("");
        } catch (err) {
            console.error("Fetch error:", err);
            setError(err.response?.data?.msg || "Error fetching users");
            toast.error("Error fetching users");
            setLoading(false);

            if (err.response?.status === 401) {
                navigate("/login");
            }
        }
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            setPagination({ ...pagination, currentPage: newPage });
        }
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const clearSearch = () => {
        setSearchTerm("");
        setPagination(prev => ({
            ...prev,
            currentPage: 1
        }));
    };

    const handleLimitChange = (e) => {
        const newLimit = parseInt(e.target.value);
        setPagination({
            ...pagination,
            pageSize: newLimit,
            currentPage: 1
        });
    };

    const handleModify = (user) => {
        setSelectedUser(user);
        setModifiedUser({
            id: user._id,
            username: user.username,
            phone: user.phone || "",
            email: user.email,
            role: user.role,
        });
        setShowModifyModal(true);
    };

    const handleDeleteClick = (user) => {
        setSelectedUser(user);
        setShowDeleteModal(true);
    };

    const handleConfirmDelete = async () => {
        if (selectedUser) {
            try {
                await api.delete(`/api/users/${selectedUser._id}`);
                fetchUsers(
                    pagination.currentPage > Math.ceil((pagination.totalRecords - 1) / pagination.pageSize)
                        ? Math.ceil((pagination.totalRecords - 1) / pagination.pageSize) || 1
                        : pagination.currentPage,
                    pagination.pageSize,
                    searchTerm
                );
                
                // Show toast notification
                toast.success(`User ${selectedUser.username} deleted`);
                
                setShowDeleteModal(false);
                setSelectedUser(null);
                setError("");
            } catch (err) {
                console.error("Delete error:", err);
                setError(err.response?.data?.msg || "Error deleting user");
                toast.error(`Error deleting user: ${err.response?.data?.msg || "Unknown error"}`);

                if (err.response?.status === 401) {
                    navigate("/login");
                } else if (err.response?.status === 403) {
                    setError("You do not have permission to delete users");
                    toast.error("You do not have permission to delete users");
                }
            }
        }
    };

    const validateForm = (userData) => {
        if (!userData.username.trim() || !userData.email.trim()) {
            toast.error("Username and email are required!");
            return false;
        }

        if (userData.phone && !/^\d{10}$/.test(userData.phone)) {
            toast.error("Phone number must be 10 digits.");
            return false;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
            toast.error("Enter a valid email address.");
            return false;
        }

        return true;
    };

    const handleSubmitModify = async (e) => {
        e.preventDefault();

        if (!validateForm(modifiedUser)) {
            return;
        }

        try {
            const previousRole = selectedUser.role;
            const response = await api.put(`/api/users/${modifiedUser.id}`, modifiedUser);
            fetchUsers(pagination.currentPage, pagination.pageSize, searchTerm);
            
            // Show toast notification only if role has changed
            if (previousRole !== modifiedUser.role) {
                const roleText = modifiedUser.role === "admin" ? "admin" : "student";
                toast.success(`User ${modifiedUser.username}: changed access to ${roleText}`);
            } else {
                toast.success(`User ${modifiedUser.username} updated successfully`);
            }
            
            setShowModifyModal(false);
            setSelectedUser(null);
            setModifiedUser({
                username: "",
                phone: "",
                email: "",
                role: "user",
            });
            setError("");
        } catch (err) {
            console.error("Update error:", err);
            setError(err.response?.data?.msg || "Error updating user");
            toast.error(`Error updating user: ${err.response?.data?.msg || "Unknown error"}`);

            if (err.response?.status === 401) {
                navigate("/login");
            }
        }
    };

    const highlightText = (text, query) => {
        if (!query || !text) return text;
        const stringText = String(text);
        if (!query.trim()) return stringText;
        try {
            const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
            const parts = stringText.split(regex);
            return parts.map((part, i) => {
                if (part.toLowerCase() === query.toLowerCase()) {
                    return (
                        <span key={i} className="highlight-text">
                            {part}
                        </span>
                    );
                }
                return part;
            });
        } catch (e) {
            console.error('Error highlighting text:', e);
            return stringText;
        }
    };

    return (
        <div className="user-list">
            <div className="search-container">
                <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="search-bar"
                />
                {searchTerm && (
                    <button onClick={clearSearch} className="clear-search-button">
                        ✕
                    </button>
                )}
            </div>

            {searchTerm && !loading && (
                <div className="search-status">
                    {pagination.totalRecords > 0 ? (
                        <span>Found {pagination.totalRecords} results for "{searchTerm}"</span>
                    ) : (
                        <span>No results found for "{searchTerm}"</span>
                    )}
                </div>
            )}

            {error && <div className="error-message">{error}</div>}

            {loading ? (
                <div className="loading-container">
                    <div className="loading-spinner">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="45" fill="none" stroke="#e0e0e0" strokeWidth="8" />
                            <circle cx="50" cy="50" r="45" fill="none" stroke="#3498db" strokeWidth="8" strokeLinecap="round" strokeDasharray="283" strokeDashoffset="283">
                                <animateTransform attributeName="transform" type="rotate" dur="1.5s" values="0 50 50;360 50 50" repeatCount="indefinite" />
                                <animate attributeName="stroke-dashoffset" values="283;100" dur="1.5s" repeatCount="indefinite" keyTimes="0;1" keySplines="0.42 0 0.58 1" calcMode="spline" />
                            </circle>
                            <circle cx="50" cy="50" r="8" fill="#3498db">
                                <animate attributeName="r" values="8;6;8" dur="1.5s" repeatCount="indefinite" />
                            </circle>
                        </svg>
                    </div>
                </div>
            ) : (
                <div className="table-container">
                    <div className="pagination-controls">
                        <div className="page-size-selector">
                            <span>Show</span>
                            <select value={pagination.pageSize} onChange={handleLimitChange}>
                                <option value="5">5</option>
                                <option value="10">10</option>
                                <option value="25">25</option>
                                <option value="50">50</option>
                            </select>
                            <span>entries per page</span>
                        </div>
                        <div className="records-info">
                            {pagination.totalRecords > 0 ? (
                                <span>
                                    {pagination.startRecord}-{pagination.endRecord} of {pagination.totalRecords}
                                </span>
                            ) : (
                                <span>No records found</span>
                            )}
                        </div>
                    </div>

                    <table>
                        <thead>
                            <tr>
                                <th>Username</th>
                                <th>Phone</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.length > 0 ? (
                                users.map((user) => (
                                    <tr key={user._id} className={
                                        searchTerm &&
                                        (user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                            user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                            (user.phone && user.phone.toLowerCase().includes(searchTerm.toLowerCase())) ||
                                            user.role.toLowerCase().includes(searchTerm.toLowerCase()))
                                            ? "search-match-row"
                                            : ""
                                    }>
                                        <td>{highlightText(user.username, searchTerm)}</td>
                                        <td>{highlightText(user.phone || 'N/A', searchTerm)}</td>
                                        <td>{highlightText(user.email, searchTerm)}</td>
                                        <td>{highlightText(user.role === "admin" ? "Admin" : "User", searchTerm)}</td>
                                        <td className="actions-cell">
                                            <button
                                                className="action-button edit-button"
                                                onClick={() => handleModify(user)}
                                                title="Edit user"
                                            >
                                                ✏️
                                            </button>
                                            <button
                                                className="action-button delete-button"
                                                onClick={() => handleDeleteClick(user)}
                                                title="Delete user"
                                            >
                                                ❌
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5">No users found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    <div className="pagination">
                        <div className="page-indicator">
                            Page {pagination.currentPage} of {pagination.totalPages}
                        </div>
                        <div className="pagination-buttons">
                            <button
                                onClick={() => handlePageChange(1)}
                                disabled={pagination.currentPage === 1}
                                className="pagination-button"
                                title="First page"
                            >
                                &laquo;
                            </button>
                            <button
                                onClick={() => handlePageChange(pagination.currentPage - 1)}
                                disabled={pagination.currentPage === 1}
                                className="pagination-button"
                            >
                                &lt;
                            </button>
                            <div className="current-page">
                                {pagination.currentPage}
                            </div>
                            <button
                                onClick={() => handlePageChange(pagination.currentPage + 1)}
                                disabled={pagination.currentPage === pagination.totalPages}
                                className="pagination-button"
                            >
                                &gt;
                            </button>
                            <button
                                onClick={() => handlePageChange(pagination.totalPages)}
                                disabled={pagination.currentPage === pagination.totalPages}
                                className="pagination-button"
                                title="Last page"
                            >
                                &raquo;
                            </button>
                        </div>
                        <div className="records-info">
                            {pagination.totalRecords > 0 ? (
                                <span>
                                    {pagination.startRecord}-{pagination.endRecord} of {pagination.totalRecords}
                                </span>
                            ) : (
                                <span></span>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {showModifyModal && (
                <div className="modal">
                    <div className="modal-content">
                        <span
                            className="close"
                            onClick={() => {
                                setShowModifyModal(false);
                                setModifiedUser({
                                    username: "",
                                    phone: "",
                                    email: "",
                                    role: "user",
                                });
                            }}
                        >
                            &times;
                        </span>
                        <h2>Modify User</h2>
                        <form onSubmit={handleSubmitModify} className="modify-form">
                            <input
                                type="text"
                                placeholder="Username"
                                value={modifiedUser.username}
                                onChange={(e) =>
                                    setModifiedUser({ ...modifiedUser, username: e.target.value })
                                }
                                required
                            />
                            <input
                                type="text"
                                placeholder="Phone"
                                value={modifiedUser.phone}
                                onChange={(e) =>
                                    setModifiedUser({ ...modifiedUser, phone: e.target.value })
                                }
                            />
                            <input
                                type="email"
                                placeholder="Email"
                                value={modifiedUser.email}
                                onChange={(e) =>
                                    setModifiedUser({ ...modifiedUser, email: e.target.value })
                                }
                                required
                            />
                            <select
                                value={modifiedUser.role}
                                onChange={(e) =>
                                    setModifiedUser({ ...modifiedUser, role: e.target.value })
                                }
                            >
                                <option value="admin">Admin</option>
                                <option value="user">User</option>
                            </select>
                            <button type="submit">Save Changes</button>
                        </form>
                    </div>
                </div>
            )}

            {showDeleteModal && (
                <div className="modal">
                    <div className="modal-content delete-modal">
                        <h2>Confirm Delete</h2>
                        <p>Are you sure you want to delete user "{selectedUser?.username}"?</p>
                        <div className="delete-modal-buttons">
                            <button className="delete-confirm-button" onClick={handleConfirmDelete}>
                                Delete
                            </button>
                            <button
                                className="delete-cancel-button"
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setSelectedUser(null);
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserList;