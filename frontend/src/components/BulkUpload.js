import React, { useState } from "react";
import * as XLSX from "xlsx";
import "../styles/bulkupload.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const API_URL = process.env.REACT_APP_API_URL;

const BulkUpload = ({ handleBulkUpload }) => {
  const [excelFile, setExcelFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const validateUserData = (user, index) => {
    const errors = [];

    if (!user.username || user.username.length < 3 || user.username.length > 50) {
      errors.push(`Row ${index + 1}: Username must be between 3 and 50 characters`);
    }

    if (!user.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)) {
      errors.push(`Row ${index + 1}: Invalid email format`);
    }

    if (!user.password || user.password.length < 8) {
      errors.push(`Row ${index + 1}: Password must be at least 8 characters long`);
    }

    if (!user.phone) {
      errors.push(`Row ${index + 1}: Phone number is required`);
    }

    return errors;
  };

  const handleExcelFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (
        file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        file.type === "application/vnd.ms-excel"
      ) {
        setExcelFile(file);
        setUploadStatus(null);
        setUploadProgress(0);
      } else {
        setUploadStatus({
          type: "error",
          message: "Please upload only Excel files (.xlsx or .xls)",
        });
        toast.error("Please upload only Excel files (.xlsx or .xls)");
      }
    }
  };

  const handleExcelUpload = async () => {
    if (!excelFile) {
      setUploadStatus({
        type: "error",
        message: "Please select an Excel file first",
      });
      toast.error("Please select an Excel file first");
      return;
    }

    try {
      setUploadProgress(10);
      const reader = new FileReader();

      reader.onload = async (e) => {
        try {
          const data = e.target.result;
          const workbook = XLSX.read(data, { type: "binary" });
          setUploadProgress(30);

          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(sheet, { raw: false });
          setUploadProgress(50);

          const validationErrors = [];
          const users = jsonData.map((row, index) => {
            const user = {
              username: String(row.username || "").trim(),
              email: String(row.email || "").trim().toLowerCase(),
              password: String(row.password || "").trim(),
              phone: String(row.phone || "").trim(),
              role: "user",
            };

            const errors = validateUserData(user, index);
            validationErrors.push(...errors);

            return user;
          });

          if (validationErrors.length > 0) {
            setUploadStatus({
              type: "error",
              message: "Validation errors:",
              details: validationErrors,
            });
            toast.error(`Validation errors found: ${validationErrors.length} issues`);
            setUploadProgress(0);
            return;
          }

          setUploadProgress(70);

          const response = await axios.post(`${API_URL}/api/folder/users/upload`, users);
          if (response.status === 201) {
            setUploadProgress(100);
            setUploadStatus({
              type: "success",
              message: `Successfully registered ${users.length} users`,
              details: response.data.message, // Display the success message from the backend
            });
            
            // Show success toast notification
            toast.success(`Added users: bulk upload from excel (${users.length} users uploaded)`);
            
            setExcelFile(null);

            setTimeout(() => {
              setIsModalOpen(false);
            }, 2000);
          }
        } catch (error) {
          console.error("Error processing Excel:", error);
          setUploadStatus({
            type: "error",
            message: error.response?.data?.message || "Error processing Excel file. Please check the format.",
          });
          toast.error("Error processing Excel file. Please check the format.");
          setUploadProgress(0);
        }
      };

      reader.readAsBinaryString(excelFile);
    } catch (error) {
      console.error("Error uploading Excel:", error);
      setUploadStatus({
        type: "error",
        message: error.response?.data?.message || "Error uploading file. Please try again.",
      });
      toast.error("Error uploading file. Please try again.");
      setUploadProgress(0);
    }
  };

  const openModal = () => {
    setIsModalOpen(true);
    setUploadStatus(null);
    setUploadProgress(0);
    setExcelFile(null);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="bulk-upload-container">
      <div className="admin-header">
        <div className="admin-left">
          <button onClick={() => navigate("/")} className="back-button">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
              style={{ width: "24px", height: "24px", stroke: "black" }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h3 className="admin-title">Users</h3>
        </div>
        <button onClick={openModal} className="bulk-upload-button">
          Bulk upload
        </button>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Bulk User Registration</h3>
              <button onClick={closeModal} className="close-button">
                &times;
              </button>
            </div>

            <div className="modal-body">
              <div className="file-upload-section">
                <label className="file-upload-label">Upload Excel File (.xlsx, .xls)</label>
                <p className="upload-instructions">
                  Excel columns should be: <strong>username</strong>, <strong>phone</strong>, <strong>email</strong>, <strong>password</strong>
                </p>
                <input
                  id="excel-upload"
                  type="file"
                  accept=".xlsx, .xls"
                  onChange={handleExcelFileChange}
                  className="file-input"
                />
              </div>

              {/* Download Sample Excel File Section */}
              <div className="download-sample-section">
                <a
                  href="/exceldata/sample.xlsx"
                  download="sample_user_upload.xlsx"
                  className="download-link"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                    style={{ width: "20px", height: "20px", marginRight: "8px" }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                  Download Sample Excel File
                </a>
              </div>

              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="progress-bar-container">
                  <div className="progress-bar" style={{ width: `${uploadProgress}%` }}></div>
                </div>
              )}

              {uploadStatus && (
                <div className={`status-message ${uploadStatus.type}`}>
                  <p>{uploadStatus.message}</p>
                  {uploadStatus.details && (
                    <ul className="error-list">
                      {Array.isArray(uploadStatus.details) ? (
                        uploadStatus.details.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))
                      ) : (
                        <li>{uploadStatus.details}</li>
                      )}
                    </ul>
                  )}
                </div>
              )}

              <button
                onClick={handleExcelUpload}
                disabled={!excelFile || (uploadProgress > 0 && uploadProgress < 100)}
                className="upload-button"
              >
                {uploadProgress > 0 && uploadProgress < 100 ? "Uploading..." : "Upload Excel"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BulkUpload;