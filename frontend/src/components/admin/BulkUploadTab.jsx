import React, { useState } from 'react';
import Papa from 'papaparse';
import { BASE_URL } from '../../config';
import Toast from '../../Toast';

export default function BulkUploadTab({ refreshMenu }) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploadingCSV, setIsUploadingCSV] = useState(false);
  const [uploadHistory, setUploadHistory] = useState([]);

  const handleDownloadTemplate = () => {
    const csvContent = "data:text/csv;charset=utf-8,category,itemname,description,price,dietarytags\nStarters,Garlic Bread,Crispy bread with garlic butter,5.99,Fasting\nMains,Margherita Pizza,Classic cheese and tomato pizza,12.99,Fasting\nMains,Chicken Wings,Spicy buffalo wings,8.99,Non-Fasting";
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
      
      const newHistoryItem = {
        id: Date.now(),
        filename: 'menu_upload.csv', // Fallback, could pass actual filename if desired
        time: new Date().toLocaleTimeString(),
        status: result.errors && result.errors.length > 0 ? (result.itemsCreated > 0 ? 'Partial' : 'Failed') : 'Success',
        created: result.itemsCreated || 0,
        errors: result.errors || []
      };

      setUploadHistory(prev => [newHistoryItem, ...prev]);

      if (result.errors && result.errors.length > 0) {
        if (result.itemsCreated > 0) {
          Toast.success(`Uploaded ${result.itemsCreated} items, but there were some errors.`);
        } else {
          Toast.error(`Upload failed. See history for details.`);
        }
      } else {
        Toast.success(`Successfully uploaded ${result.itemsCreated} items!`);
      }

      refreshMenu();
    } catch (err) {
      Toast.error(err.message);
      
      setUploadHistory(prev => [{
        id: Date.now(),
        filename: 'menu_upload.csv',
        time: new Date().toLocaleTimeString(),
        status: 'Failed',
        created: 0,
        errors: [err.message]
      }, ...prev]);

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

      {uploadHistory.length > 0 && (
        <div style={{ marginTop: '32px' }} className="glass-panel animate-slide-up">
          <h3 style={{ padding: '24px 24px 0', marginBottom: '16px' }}>Session Upload History</h3>
          <div style={{ padding: '0 24px 24px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '12px 0' }}>Time</th>
                  <th style={{ padding: '12px 0' }}>Status</th>
                  <th style={{ padding: '12px 0' }}>Items Created</th>
                  <th style={{ padding: '12px 0' }}>Details</th>
                </tr>
              </thead>
              <tbody>
                {uploadHistory.map(entry => (
                  <React.Fragment key={entry.id}>
                    <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '12px 0', verticalAlign: 'top' }}>{entry.time}</td>
                      <td style={{ padding: '12px 0', verticalAlign: 'top' }}>
                        <span style={{ 
                          padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold',
                          background: entry.status === 'Success' ? '#dcfce7' : entry.status === 'Failed' ? '#fee2e2' : '#fef08a',
                          color: entry.status === 'Success' ? '#166534' : entry.status === 'Failed' ? '#991b1b' : '#854d0e'
                        }}>
                          {entry.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px 0', verticalAlign: 'top' }}>{entry.created}</td>
                      <td style={{ padding: '12px 0', verticalAlign: 'top' }}>
                        {entry.errors.length > 0 ? (
                          <ul style={{ margin: 0, paddingLeft: '16px', color: '#ef4444', fontSize: '14px' }}>
                            {entry.errors.map((err, i) => (
                              <li key={i}>{err}</li>
                            ))}
                          </ul>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>No errors</span>
                        )}
                      </td>
                    </tr>
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div style={{ marginTop: '32px' }} className="glass-panel">
        <h3 style={{ padding: '24px 24px 0', marginBottom: '16px' }}>Upload Instructions</h3>
        <div style={{ padding: '0 24px 24px' }}>
          <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>To bulk upload menu items, please follow these steps:</p>
          <ol style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px', color: 'var(--text-muted)' }}>
            <li>Download the CSV template using the button above.</li>
            <li>Fill in your menu items. Make sure to keep the column headers in <strong>small letters</strong>. <strong>category</strong>, <strong>itemname</strong>, and <strong>price</strong> are required.</li>
            <li>Separate multiple dietary tags with commas (e.g. <code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>Fasting, Vegan</code>).</li>
            <li>If a Category or Dietary Tag doesn't exist yet, it will be created automatically.</li>
            <li>Save the file as CSV and upload it here.</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
