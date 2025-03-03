import React, { useState, useEffect } from "react";
import "../styles/viewimages.css";
import { useAuth } from './AuthContext';
import api from "../utils/api";
import toast from 'react-hot-toast';

const API_URL = process.env.REACT_APP_API_URL;

const ViewImages = ({ folder, onFolderUpdate }) => {
    const { isAdmin } = useAuth();

    const [images, setImages] = useState([]);
    const [selectedImage, setSelectedImage] = useState(null);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [showDialog, setShowDialog] = useState(false);
    const [dialogType, setDialogType] = useState("");
    const [newName, setNewName] = useState("");
    const [showImagePopup, setShowImagePopup] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Parse MongoDB _id from object if needed
    const parseId = (id) => {
        if (id && typeof id === 'object' && id.$oid) {
            return id.$oid;
        }
        return id;
    };

    // Success message auto-dismiss
    useEffect(() => {
        if (successMessage) {
            const timer = setTimeout(() => {
                setSuccessMessage(null);
            }, 5000); // Clear message after 5 seconds
            return () => clearTimeout(timer);
        }
    }, [successMessage]);

    // Load images when folder changes
    useEffect(() => {
        if (folder && folder._id) {
            if (Array.isArray(folder.images)) {
                // Process images to handle MongoDB _id objects
                const processedImages = folder.images.map(img => ({
                    ...img,
                    _id: parseId(img._id)
                }));
                setImages(processedImages);
            } else {
                console.error("No images array in folder:", folder);
                setImages([]);
            }
            setIsLoading(false);
        }
    }, [folder]);

    // Handle file selection for individual images
    const handleFileChange = (event) => {
        const files = Array.from(event.target.files);
        setSelectedFiles(files);
        setError(null); // Clear any previous errors
    };

    // Handle folder selection
    const handleFolderUpload = (event) => {
        const files = Array.from(event.target.files);
        if (files.length === 0) {
            setError("No files selected in the folder.");
            return;
        }
        setSelectedFiles(files);
        setError(null); // Clear any previous errors
    };

    // Handle file upload (for both individual files and folders)
    const handleFileUpload = async () => {
        if (!selectedFiles || selectedFiles.length === 0) {
            setError("Please select files to upload");
            return;
        }

        setError(null);
        setSuccessMessage(null);
        setUploading(true);
        setUploadProgress(0);

        const loadingToast = toast.loading(`Uploading ${selectedFiles.length} image(s)...`);

        try {
            const formData = new FormData();
            selectedFiles.forEach((file) => {
                formData.append("images", file);
            });

            const response = await api.post(`${API_URL}/api/folder/upload/${folder._id}`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(percentCompleted);
                }
            });

            // Check if we have a successful response with folder data
            if (response.data && response.data.folder) {
                const updatedFolder = response.data.folder;
                const processedImages = updatedFolder.images.map(img => ({
                    ...img,
                    _id: parseId(img._id)
                }));
                setImages(processedImages);

                // Notify parent component of folder update
                if (onFolderUpdate) {
                    onFolderUpdate(updatedFolder);
                }

                // Show success message
                toast.dismiss(loadingToast);
                toast.success(`${selectedFiles.length} image(s) uploaded to "${folder.name}"`);

                // Reset selected files after successful upload
                setSelectedFiles([]);
            }
        } catch (error) {
            console.error("Error uploading images:", error);
            setError(error.response?.data?.message || "Failed to upload images");
            toast.dismiss(loadingToast);
            toast.error(`Failed to upload images to "${folder.name}"`);
        } finally {
            setUploading(false);
            setUploadProgress(0); // Reset progress after upload completes
        }
    };

    // Handle showing an image in a popup
    const handleShowImage = (image) => {
        const index = images.findIndex(img => parseId(img._id) === parseId(image._id));
        setSelectedImageIndex(index);
        setSelectedImage(image);
        setShowImagePopup(true);
    };

    // Handle navigating to the previous image in the popup
    const handlePrevImage = (e) => {
        e.stopPropagation();
        const newIndex = (selectedImageIndex - 1 + images.length) % images.length;
        setSelectedImageIndex(newIndex);
        setSelectedImage(images[newIndex]);
    };

    // Handle navigating to the next image in the popup
    const handleNextImage = (e) => {
        e.stopPropagation();
        const newIndex = (selectedImageIndex + 1) % images.length;
        setSelectedImageIndex(newIndex);
        setSelectedImage(images[newIndex]);
    };

    // Handle opening the edit dialog
    const handleEdit = (image) => {
        setSelectedImage(image);
        setDialogType("edit");
        setNewName(image.name);
        setShowDialog(true);
    };

    // Handle opening the delete dialog
    const handleDelete = (image) => {
        setSelectedImage(image);
        setDialogType("delete");
        setShowDialog(true);
    };

    // Handle confirming image deletion
    const handleConfirmDelete = async () => {
        if (!selectedImage) return;

        const loadingToast = toast.loading(`Deleting image...`);

        try {
            setError(null);
            setSuccessMessage(null);

            await api.delete(`${API_URL}/api/folder/${parseId(folder._id)}/image`, {
                data: { imagePath: selectedImage.path }
            });

            const updatedImages = images.filter(img => parseId(img._id) !== parseId(selectedImage._id));
            setImages(updatedImages);

            // Notify parent component of folder update
            if (onFolderUpdate) {
                onFolderUpdate({ ...folder, images: updatedImages });
            }

            setShowDialog(false);
            setSelectedImage(null);
            setShowImagePopup(false);

            // Show success message
            toast.dismiss(loadingToast);
            toast.success(`Image "${selectedImage.name}" deleted`);
        } catch (error) {
            console.error("Error deleting image:", error);
            setError("Failed to delete image");
            toast.dismiss(loadingToast);
            toast.error(`Failed to delete image "${selectedImage.name}"`);
        }
    };

    // Handle confirming image name edit
    const handleConfirmEdit = async () => {
        if (!selectedImage || !newName.trim()) return;

        const loadingToast = toast.loading(`Renaming image...`);

        try {
            setError(null);
            setSuccessMessage(null);

            await api.put(`${API_URL}/api/folder/${parseId(folder._id)}/image/${parseId(selectedImage._id)}`, {
                newName: newName
            });

            const updatedImages = images.map(img =>
                parseId(img._id) === parseId(selectedImage._id) ? { ...img, name: newName } : img
            );
            setImages(updatedImages);

            // Update selectedImage with the new name
            setSelectedImage({ ...selectedImage, name: newName });

            // Notify parent component of folder update
            if (onFolderUpdate) {
                onFolderUpdate({ ...folder, images: updatedImages });
            }

            setShowDialog(false);
            const oldName = selectedImage.name;
            setNewName("");

            // Show success message
            toast.dismiss(loadingToast);
            toast.success(`Image "${oldName}" renamed to "${newName}"`);
        } catch (error) {
            console.error("Error updating image:", error);
            setError("Failed to update image");
            toast.dismiss(loadingToast);
            toast.error(`Failed to rename image "${selectedImage.name}"`);
        }
    };

    // Handle keyboard navigation in the image popup
    const handleKeyPress = (e) => {
        if (showImagePopup) {
            if (e.key === 'ArrowLeft') {
                handlePrevImage(e);
            } else if (e.key === 'ArrowRight') {
                handleNextImage(e);
            } else if (e.key === 'Escape') {
                closeImagePopup();
            }
        }
    };

    // Add event listener for keyboard navigation
    useEffect(() => {
        window.addEventListener('keydown', handleKeyPress);
        return () => {
            window.removeEventListener('keydown', handleKeyPress);
        };
    }, [selectedImageIndex, showImagePopup, images]);

    // Close the image popup
    const closeImagePopup = () => {
        setShowImagePopup(false);
        setSelectedImage(null);
        setSelectedImageIndex(0);
    };

    // Clear selected files and messages when the component unmounts
    useEffect(() => {
        return () => {
            setSelectedFiles([]);
            setError(null);
            setSuccessMessage(null);
        };
    }, []);

    return (
        <div className="image-grid">
            {error && <div className="error-message">{error}</div>}
            {successMessage && <div className="success-message">{successMessage}</div>}

            {isAdmin && (
                <div className="upload-container">
                    {/* Show a single uploading indicator when uploading is in progress */}
                    {uploading ? (
                        <div className="uploading-indicator">
                            <span className="loading-spinner"></span>
                            Uploading...
                        </div>
                    ) : (
                        <>
                            {/* Individual file upload - only shown when not uploading */}
                            <label className="upload-label">
                                + Add Images
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="upload-input"
                                    multiple
                                    disabled={uploading}
                                />
                            </label>
                
                            {/* Folder upload - only shown when not uploading */}
                            <label className="upload-label">
                                + Add Folder
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFolderUpload}
                                    className="upload-input"
                                    webkitdirectory="true"
                                    multiple
                                    disabled={uploading}
                                />
                            </label>
                        </>
                    )}
                
                    {/* Display the number of selected files */}
                    {selectedFiles.length > 0 && !uploading && (
                        <div className="selected-files-count">
                            {selectedFiles.length} file(s) selected
                        </div>
                    )}
                
                    {/* Upload button */}
                    {selectedFiles.length > 0 && !uploading && (
                        <button
                            onClick={handleFileUpload}
                            disabled={uploading}
                            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
                        >
                            Upload
                        </button>
                    )}
                </div>
            )}

            {isLoading ? (
                <div className="loading-spinner">↺</div>
            ) : images.length === 0 ? (
                <div className="empty-state">
                    <p>No images in this folder</p>
                    {isAdmin && <p>Upload images to get started</p>}
                </div>
            ) : (
                images.map((image) => (
                    <div key={parseId(image._id)} className="image-item">
                        <img
                            src={image.path}
                            alt={image.name}
                            className="image"
                            onClick={() => handleShowImage(image)}
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "/placeholder-image.jpg";
                            }}
                        />
                        <div className="image-overlay">
                            <button className="overlay-button show-button" onClick={() => handleShowImage(image)}>
                                Show
                            </button>
                            {isAdmin && (
                                <>
                                    <button className="overlay-button edit-button" onClick={() => handleEdit(image)}>
                                        Edit
                                    </button>
                                    <button className="overlay-button delete-button" onClick={() => handleDelete(image)}>
                                        Delete
                                    </button>
                                </>
                            )}
                        </div>
                        <p className="image-description">{image.name}</p>
                    </div>
                ))
            )}

            {showImagePopup && selectedImage && images.length > 0 && (
                <div className="popup-overlay" onClick={closeImagePopup}>
                    <div className="popup-content" onClick={(e) => e.stopPropagation()}>
                        <div className="carousel-container">
                            <button
                                className="carousel-button prev"
                                onClick={handlePrevImage}
                                aria-label="Previous image"
                            >
                                ‹
                            </button>
                            <div className="carousel-image-container">
                                <img
                                    src={selectedImage.path}
                                    alt={selectedImage.name}
                                    className="popup-image"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = "/placeholder-image.jpg";
                                    }}
                                />
                            </div>
                            <button
                                className="carousel-button next"
                                onClick={handleNextImage}
                                aria-label="Next image"
                            >
                                ›
                            </button>
                        </div>
                        <div className="image-counter">
                            {selectedImageIndex + 1} / {images.length}
                        </div>
                        <p className="popup-description">{selectedImage.name}</p>
                        {isAdmin && (
                            <div className="popup-actions">
                                <button className="overlay-button edit-button" onClick={() => handleEdit(selectedImage)}>
                                    Edit
                                </button>
                                <button className="overlay-button delete-button" onClick={() => handleDelete(selectedImage)}>
                                    Delete
                                </button>
                            </div>
                        )}
                        <button className="close-popup" onClick={closeImagePopup}>×</button>
                    </div>
                </div>
            )}

            {showDialog && (
                <div className="dialog-overlay">
                    <div className="dialog-box">
                        {dialogType === "delete" ? (
                            <>
                                <h3>Delete Image</h3>
                                <p>Are you sure you want to delete this image?</p>
                                <div className="dialog-actions">
                                    <button onClick={handleConfirmDelete}>Delete</button>
                                    <button onClick={() => setShowDialog(false)}>Cancel</button>
                                </div>
                            </>
                        ) : (
                            <>
                                <h3>Edit Image Name</h3>
                                <input
                                    type="text"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    className="description-input"
                                    placeholder="Enter new name"
                                />
                                <div className="dialog-actions">
                                    <button onClick={handleConfirmEdit}>Save</button>
                                    <button onClick={() => setShowDialog(false)}>Cancel</button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ViewImages;