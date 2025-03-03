import React, { useState, useEffect, useRef } from "react";
import "../styles/dashboard.css";
import ViewImages from "./ViewImages";
import ProfileMenu from './ProfileMenu';
import { useAuth } from './AuthContext';
import api from "../utils/api";
import toast from 'react-hot-toast';

const Dashboard = () => {
    const { isAdmin } = useAuth();

    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [selectedFolder, setSelectedFolder] = useState(null);
    const [menuOpen, setMenuOpen] = useState(null);
    const [folders, setFolders] = useState([]);
    const [showAddFolderDialog, setShowAddFolderDialog] = useState(false);
    const [showToggleAccessDialog, setShowToggleAccessDialog] = useState(false);
    const [showRenameDialog, setShowRenameDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [newFolderName, setNewFolderName] = useState("");
    const [newFolderNameForRename, setNewFolderNameForRename] = useState("");
    const [folderToModify, setFolderToModify] = useState(null);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
   
    const dropdownRef = useRef(null);

    // Helper function to parse MongoDB _id from object if needed
    const parseId = (id) => {
        if (id && typeof id === 'object' && id.$oid) 
            {
            return id.$oid;
        }
        return id;
    };

    useEffect(() => {
        fetchFolders();
    }, []);

    // Fetch all folders
    const fetchFolders = async () => {
        setIsLoading(true);
        try {
            const response = await api.get("/api/folder");
            console.log("Folders API response:", response.data);
            
            // Handle the MongoDB-style object IDs
            const processedFolders = response.data.map(folder => ({
                ...folder,
                _id: parseId(folder._id),
                images: Array.isArray(folder.images) ? folder.images.map(img => ({
                    ...img,
                    _id: parseId(img._id)
                })) : []
            }));
            
            // Filter out folders without proper structure
            const validFolders = processedFolders.filter(folder => 
                folder && folder._id && (folder.name || folder.id)
            );
            
            setFolders(validFolders);
            
            // If no folder is selected and we have folders, select the first one
            if (!selectedFolder && validFolders.length > 0) {
                setSelectedFolder(validFolders[0]);
            }
            
            console.log("Folders filtered:", validFolders);
            setError(null);
        } catch (error) {
            console.error("Error fetching folders:", error);
            setError("Failed to fetch folders");
            toast.error("Failed to load folders");
            setFolders([]);
        } finally {
            setIsLoading(false);
        }
    };

    // Filter folders based on isAdmin and isDisabled
    const getFilteredFolders = () => {
        if (isAdmin) {
            return folders; // Admins can see all folders
        } else {
            return folders.filter(folder => !folder.isDisabled); // Non-admins see only enabled folders
        }
    };

    // Handle folder click (excluding menu clicks)
    const handleFolderClickWrapper = (event, folder) => {
        if (event.target.closest('.menu-icon') || event.target.closest('.dropdown-menu')) return;
        console.log("Selected folder:", folder);
        setSelectedFolder(folder);
        // Removed toast notification for folder selection
    };

    // Add a new folder
    const handleAddFolder = () => {
        setMenuOpen(null);
        setShowAddFolderDialog(true);
    };

    const handleConfirmAddFolder = async () => {
        if (newFolderName.trim()) {
            const loadingToast = toast.loading("Creating new folder...");
            try {
                const response = await api.post("/api/folder/create", {
                    name: newFolderName,
                });
                
                // Process the new folder to handle MongoDB IDs
                const newFolder = {
                    ...response.data.folder,
                    _id: parseId(response.data.folder._id)
                };
                
                setFolders([...folders, newFolder]);
                setShowAddFolderDialog(false);
                setNewFolderName("");
                setError(null);
                toast.dismiss(loadingToast);
                toast.success(`Folder "${newFolder.name}" created`);
            } catch (error) {
                console.error("Error adding folder:", error);
                setError(error.response?.data?.message || "Failed to add folder");
                toast.dismiss(loadingToast);
                toast.error(`Folder "${newFolderName}" could not be created`);
            }
        } else {
            toast.error("Folder name cannot be empty");
        }
    };

    // Edit a folder
    const handleEditFolder = (event, folder) => {
        event.stopPropagation();
        setMenuOpen(null);
        setFolderToModify(folder);
        setNewFolderNameForRename(folder.name);
        setShowRenameDialog(true);
    };

    const handleRenameFolder = async () => {
        if (newFolderNameForRename.trim() && folderToModify) {
            const loadingToast = toast.loading(`Renaming folder...`);
            try {
                await api.put(`/api/folder/${folderToModify._id}`, {
                    newName: newFolderNameForRename,
                });
                
                setShowRenameDialog(false);
                const oldName = folderToModify.name;
                setNewFolderNameForRename("");
                setFolderToModify(null);
                setError(null);
                await fetchFolders();
                toast.dismiss(loadingToast);
                toast.success(`Folder "${oldName}" renamed to "${newFolderNameForRename}"`);
            } catch (error) {
                console.error("Error renaming folder:", error);
                setError(error.response?.data?.message || "Failed to rename folder");
                toast.dismiss(loadingToast);
                toast.error(`Folder "${folderToModify.name}" could not be renamed`);
            }
        } else {
            toast.error("New folder name cannot be empty");
        }
    };

    // Delete a folder
    const handleDeleteFolder = (event, folder) => {
        event.stopPropagation();
        setMenuOpen(null);
        setFolderToModify(folder);
        setShowDeleteDialog(true);
    };

    const handleConfirmDeleteFolder = async () => {
        if (folderToModify) {
            const loadingToast = toast.loading(`Deleting folder...`);
            try {
                await api.delete(`/api/folder/${folderToModify._id}`);
                setFolders(folders.filter(folder => folder._id !== folderToModify._id));
                if (selectedFolder && selectedFolder._id === folderToModify._id) {
                    setSelectedFolder(null);
                }
                setShowDeleteDialog(false);
                const deletedName = folderToModify.name;
                setFolderToModify(null);
                setError(null);
                toast.dismiss(loadingToast);
                toast.success(`Folder "${deletedName}" deleted`);
            } catch (error) {
                console.error("Error deleting folder:", error);
                setError(error.response?.data?.message || "Failed to delete folder");
                toast.dismiss(loadingToast);
                toast.error(`Folder "${folderToModify.name}" could not be deleted`);
            }
        }
    };

    // Toggle access for a folder
    const handleToggleAccess = (event, folder) => {
        event.stopPropagation();
        setMenuOpen(null);
        setFolderToModify(folder);
        setShowToggleAccessDialog(true);
    };

    const handleToggleAccessFolder = async () => {
        if (folderToModify) {
            const action = folderToModify.isDisabled ? "Enabling" : "Disabling";
            const loadingToast = toast.loading(`${action} folder access...`);
            try {
                const response = await api.put(`/api/folder/disable/${folderToModify._id}`);
                if (response.data) {
                    await fetchFolders();
                }
                setShowToggleAccessDialog(false);
                const accessStatus = folderToModify.isDisabled ? "enabled" : "disabled";
                const folderName = folderToModify.name;
                setFolderToModify(null);
                setError(null);
                toast.dismiss(loadingToast);
                toast.success(`Access for folder "${folderName}" ${accessStatus}`);
            } catch (error) {
                console.error("Error toggling access:", error);
                setError(error.response?.data?.message || "Failed to toggle folder access");
                toast.dismiss(loadingToast);
                toast.error(`Could not change access for "${folderToModify.name}"`);
            }
        }
    };

    // Handle menu clicks
    const handleMenuClick = (event, index) => {
        event.stopPropagation();
        setMenuOpen(menuOpen === index ? null : index);
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setMenuOpen(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Handle window resize for mobile view
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // Update selected folder when folders change
    useEffect(() => {
        if (selectedFolder) {
            const updatedFolder = folders.find(f => f._id === selectedFolder._id);
            if (updatedFolder) {
                setSelectedFolder(updatedFolder);
            }
        }
    }, [folders]);
    
    console.log("Current folders:", folders);
    console.log("Selected folder:", selectedFolder);

    // Get filtered folders based on isAdmin
    const filteredFolders = getFilteredFolders();

    // Handle image updates
    const handleImageUpdate = (updatedFolder) => {
        // Process updated folder to handle MongoDB IDs
        const processedFolder = {
            ...updatedFolder,
            _id: parseId(updatedFolder._id),
            images: Array.isArray(updatedFolder.images) ? updatedFolder.images.map(img => ({
                ...img,
                _id: parseId(img._id)
            })) : []
        };
        
        const updatedFolders = folders.map(f => 
            f._id === processedFolder._id ? processedFolder : f
        );
        setFolders(updatedFolders);
    };

    return (
        <div className="dashboard-container">
            {error && <div className="error-message">{error}</div>}
            
            {/* Desktop Sidebar */}
            {!isMobile && (
                <div className="sidebar">
                    <h2>Folders</h2>
                    <ul className="company-list">
                        {isAdmin && <li onClick={handleAddFolder} className="add-company">➕ Add Folder</li>}
                        {isLoading ? (
                            <li className="loading">Loading folders...</li>
                        ) : filteredFolders.length === 0 ? (
                            <li className="no-folders">No folders found</li>
                        ) : (
                            filteredFolders.map((folder, index) => (
                                <li
                                    key={folder._id}
                                    className={selectedFolder && selectedFolder._id === folder._id? "active" : ""}
                                    onClick={(e) => handleFolderClickWrapper(e, folder)}
                                >
                                    <div className="company-item">
                                        {folder.name || `Folder ${index + 1}`}
                                        {folder.isDisabled && <span className="disabled-label">(Disabled)</span>}
                                        {isAdmin && <span className="menu-icon" onClick={(e) => handleMenuClick(e, index)}>⋮</span>}
                                    </div>
                                    {isAdmin && menuOpen === index && (
                                        <div className="dropdown-menu" ref={dropdownRef}>
                                            <div onClick={(e) => handleEditFolder(e, folder)}>✏️ Edit</div>
                                            <div onClick={(e) => handleDeleteFolder(e, folder)}>🗑️ Delete</div>
                                            <div onClick={(e) => handleToggleAccess(e, folder)}>
                                                {folder.isDisabled ? '🔓 Enable Access' : '🔒 Disable Access'}
                                            </div>
                                        </div>
                                    )}
                                </li>
                            ))
                        )}
                    </ul>
                    <div className="profile-menu-container">
                        <ProfileMenu isAdmin={isAdmin} />
                    </div>
                </div>
            )}

            {/* Mobile View */}
            {isMobile && (
                <div className="mobile-content">
                    <div className="mobile-title-bar">
                        {selectedFolder ? (
                            <>
                                <button onClick={() => setSelectedFolder(null)} className="back-button">
                                   <div style={{ paddingLeft: "15px" }}>
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="white"
                                            strokeWidth="2"
                                            style={{ width: "24px", height: "24px", stroke: "white" }}
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M15 19l-7-7 7-7"
                                            />
                                        </svg>
                                    </div>
                                </button>
                                <h2>{selectedFolder.name || "Unnamed Folder"}</h2>
                            </>
                        ) : (
                            <h2>Files</h2>
                        )}
                        <ProfileMenu isAdmin={isAdmin} />
                    </div>

                    {selectedFolder ? (
                        <div className="mobile-image-view">
                            <ViewImages folder={selectedFolder} onFolderUpdate={handleImageUpdate} />
                        </div>
                    ) : (
                        <div className="mobile-company-list">
                            {isAdmin && <div onClick={handleAddFolder} className="add-company">➕ Add Folder</div>}
                            {isLoading ? (
                                <div className="loading">Loading folders...</div>
                            ) : filteredFolders.length === 0 ? (
                                <div className="no-folders">No folders found</div>
                            ) : (
                                filteredFolders.map((folder, index) => (
                                    <div 
                                        key={folder._id} 
                                        className="company-card" 
                                        onClick={(e) => handleFolderClickWrapper(e, folder)}
                                    >
                                        <div className="company-item">
                                            {folder.name || `Folder ${index + 1}`}
                                            {folder.isDisabled && <span className="disabled-label">(Disabled)</span>}
                                            {isAdmin && <span className="menu-icon" onClick={(e) => handleMenuClick(e, index)}>⋮</span>}
                                        </div>
                                        {isAdmin && menuOpen === index && (
                                            <div className="dropdown-menu" ref={dropdownRef}>
                                                <div onClick={(e) => handleEditFolder(e, folder)}>✏️ Edit</div>
                                                <div onClick={(e) => handleDeleteFolder(e, folder)}>🗑️ Delete</div>
                                                <div onClick={(e) => handleToggleAccess(e, folder)}>
                                                    {folder.isDisabled ? '🔓 Enable Access' : '🔒 Disable Access'}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Desktop Content Area */}
            <div className="content">
                {!isMobile && selectedFolder && (
                    <div className="desktop-content-container">
                        <h2 className="desktop-company-title">{selectedFolder.name || "Unnamed Folder"}</h2>
                        <ViewImages 
                            folder={selectedFolder} 
                            onFolderUpdate={handleImageUpdate} 
                        />
                    </div>
                )}
                {!isMobile && !selectedFolder && (
                    <div className="desktop-placeholder">
                        <h3>Select a folder to view images</h3>
                    </div>
                )}
            </div>

            {/* Dialogs */}
            {showAddFolderDialog && (
                <div className="dialog-overlay">
                    <div className="dialog-box">
                        <h3>Add New Folder</h3>
                        <input
                            type="text"
                            value={newFolderName}
                            onChange={(e) => setNewFolderName(e.target.value)}
                            placeholder="Enter folder name"
                        />
                        <div className="dialog-actions">
                            <button onClick={handleConfirmAddFolder}>Add</button>
                            <button onClick={() => {
                                setShowAddFolderDialog(false);
                                setNewFolderName("");
                                toast.info("Add folder operation cancelled");
                            }}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            {showRenameDialog && folderToModify && (
                <div className="dialog-overlay">
                    <div className="dialog-box">
                        <h3>Rename Folder</h3>
                        <input
                            type="text"
                            value={newFolderNameForRename}
                            onChange={(e) => setNewFolderNameForRename(e.target.value)}
                            placeholder="Enter new folder name"
                        />
                        <div className="dialog-actions">
                            <button onClick={handleRenameFolder}>Rename</button>
                            <button onClick={() => {
                                setShowRenameDialog(false);
                                setNewFolderNameForRename("");
                                toast.info("Rename folder operation cancelled");
                            }}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            {showDeleteDialog && folderToModify && (
                <div className="dialog-overlay">
                    <div className="dialog-box">
                        <h3>Are you sure you want to delete {folderToModify.name}?</h3>
                        <div className="dialog-actions">
                            <button onClick={handleConfirmDeleteFolder}>Delete</button>
                            <button onClick={() => {
                                setShowDeleteDialog(false);
                                toast.info("Delete folder operation cancelled");
                            }}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            {showToggleAccessDialog && folderToModify && (
                <div className="dialog-overlay">
                    <div className="dialog-box">
                        <h3>
                            {folderToModify.isDisabled
                                ? `Enable access for ${folderToModify.name}?`
                                : `Disable access for ${folderToModify.name}?`}
                        </h3>
                        <div className="dialog-actions">
                            <button onClick={handleToggleAccessFolder}>Confirm</button>
                            <button onClick={() => {
                                setShowToggleAccessDialog(false);
                                toast.info("Change access operation cancelled");
                            }}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;