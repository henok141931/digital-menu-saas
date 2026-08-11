import React, { useState } from 'react';
import Papa from 'papaparse';
import { BASE_URL } from '../../config';
import Toast from '../../Toast';

export default function BulkUploadTab({ refreshMenu }) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploadingCSV, setIsUploadingCSV] = useState(false);

  const handleDownloadTemplate = () => {
    const csvContent = "data:text/csv;charset=utf-8,Category,ItemName,Description,Price,DietaryTags\nStarters,Garlic Bread,Crispy bread with garlic butter,5.99,Fasting\nMains,Margherita Pizza,Classic cheese and tomato pizza,12.99,Fasting\nMains,Chicken Wings,Spicy buffalo wings,8.99,Non-Fasting";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "menu_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.type === "text/csv" || file.name.endsWith('.csv'))) {
      processCSV(file);
    } else {
      Toast.error("Please upload a valid CSV file");
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && (file.type === "text/csv" || file.name.endsWith('.csv'))) {
      processCSV(file);
    } else if (file) {
      Toast.error("Please upload a valid CSV file");
    }
  };

  const processCSV = (file) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async function(results) {
        if (results.errors.length > 0) {
          Toast.error("Error parsing CSV. Please check the format.");
          return;
        }

        const data = results.data;
        if (!data || data.length === 0) {
          Toast.error("CSV file is empty");
          return;
        }

        // Validate required columns
        const firstRow = data[0];
        const requiredColumns = ['Category', 'ItemName', 'Price'];
        const missing = requiredColumns.filter(col => !Object.keys(firstRow).some(k => k.trim().toLowerCase() === col.toLowerCase()));
        
        if (missing.length > 0) {
          Toast.error(`Missing required columns: ${missing.join(', ')}`);
          return;
        }

        await uploadBulkData(data);
      }
    });
  };

  const uploadBulkData = async (data) => {
    setIsUploadingCSV(true);
    try {
      const token = localStorage.getItem('token');
      const restaurantId = localStorage.getItem('restaurantId');
      
      const res = await fetch(`${BASE_URL}/api/menu/bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ restaurantId, items: data })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Bulk upload failed');
      }
      
      const result = await res.json();
      Toast.success(`Successfully uploaded ${result.count} items!`);
      refreshMenu();
    } catch (err) {
      Toast.error(err.message);
    } finally {
      setIsUploadingCSV(false);
    }
  };

  return (
    <div className="tab-pane">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold' }}>Bulk Upload</h2>
        <button onClick={handleDownloadTemplate} className="add-btn" style={{ background: '#e2e8f0', color: 'var(--text-main)', border: 'none' }}>
          ⬇️ Download CSV Template
        </button>
      </div>
      
      <div 
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        style={{ 
          border: `2px dashed ${isDragging ? 'var(--brand-color)' : 'var(--border-color)'}`, 
          borderRadius: '12px', 
          padding: '48px 24px', 
          textAlign: 'center',
          background: isDragging ? 'var(--bg-hover)' : 'var(--bg-main)',
          transition: 'all 0.2s ease',
          cursor: 'pointer'
        }}
        onClick={() => document.getElementById('csvUploadInput').click()}
      >
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📁</div>
        <h3 style={{ marginBottom: '8px', color: 'var(--text-main)' }}>Drag and drop your CSV file here</h3>
        <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>or click to browse from your computer</p>
        
        <input 
          type="file" 
          id="csvUploadInput" 
          accept=".csv" 
          onChange={handleFileChange}
          style={{ display: 'none' }} 
        />
        
        <button className="add-btn primary" disabled={isUploadingCSV}>
          {isUploadingCSV ? 'Uploading...' : 'Browse Files'}
        </button>
      </div>

      <div style={{ marginTop: '32px' }} className="glass-panel">
        <h3 style={{ padding: '24px 24px 0', marginBottom: '16px' }}>Upload Instructions</h3>
        <div style={{ padding: '0 24px 24px' }}>
          <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>To bulk upload menu items, please follow these steps:</p>
          <ol style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px', color: 'var(--text-muted)' }}>
            <li>Download the CSV template using the button above.</li>
            <li>Fill in your menu items. <strong>Category</strong>, <strong>ItemName</strong>, and <strong>Price</strong> are required.</li>
            <li>Separate multiple DietaryTags with commas (e.g. <code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>Fasting, Vegan</code>).</li>
            <li>If a Category or Dietary Tag doesn't exist yet, it will be created automatically.</li>
            <li>Save the file as CSV and upload it here.</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
