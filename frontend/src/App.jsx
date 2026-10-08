import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

export default function App() {
  const [rowData, setRowData] = useState(() => {
    const saved = localStorage.getItem('cfo_agent_logs');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [
      { id: 1, serviceName: 'GitHub Copilot Enterprise', amount: 19.00, status: 'AUTO_APPROVED', policyLimit: 50.00, date: '2026-10-08' },
      { id: 2, serviceName: 'AWS Cloud Hosting', amount: 142.50, status: 'PENDING_REVIEW', policyLimit: 50.00, date: '2026-10-07' },
      { id: 3, serviceName: 'Figma Professional', amount: 45.00, status: 'AUTO_APPROVED', policyLimit: 50.00, date: '2026-10-05' }
    ];
  });

  const [serviceName, setServiceName] = useState('');
  const [amount, setAmount] = useState('');
  const [evaluationResult, setEvaluationResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    localStorage.setItem('cfo_agent_logs', JSON.stringify(rowData));
  }, [rowData]);

  // Manual Approval Action
  const handleManualApprove = (id) => {
    setRowData(prev =>
      prev.map(row => row.id === id ? { ...row, status: 'APPROVED_BY_CFO' } : row)
    );
  };

  // Delete Individual Entry
  const handleDeleteRow = (id) => {
    setRowData(prev => prev.filter(row => row.id !== id));
  };

  // Clear All Logs
  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all decision logs?')) {
      setRowData([]);
      localStorage.removeItem('cfo_agent_logs');
    }
  };

  const ActionRenderer = (params) => {
    return (
      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
        {params.data.status === 'PENDING_REVIEW' && (
          <button
            onClick={() => handleManualApprove(params.data.id)}
            style={{
              background: '#10b981',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              padding: '4px 8px',
              cursor: 'pointer',
              fontSize: '11px'
            }}
          >
            Approve ($&gt;50)
          </button>
        )}
        <button
          onClick={() => handleDeleteRow(params.data.id)}
          style={{
            background: '#ef4444',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            padding: '4px 8px',
            cursor: 'pointer',
            fontSize: '11px'
          }}
        >
          Delete
        </button>
      </div>
    );
  };

  const columnDefs = [
    { field: 'serviceName', headerName: 'Vendor / Service', flex: 1.5 },
    { field: 'amount', headerName: 'Amount ($)', flex: 1, valueFormatter: p => `$${p.value.toFixed(2)}` },
    { field: 'policyLimit', headerName: 'Auto Limit ($)', flex: 1, valueFormatter: p => `$${p.value.toFixed(2)}` },
    { field: 'status', headerName: 'Agent Decision', flex: 1.2 },
    { field: 'actions', headerName: 'CFO Actions', flex: 1.5, cellRenderer: ActionRenderer }
  ];

  const handleEvaluate = async (e) => {
    e.preventDefault();
    if (!serviceName || !amount) return;

    setLoading(true);
    setEvaluationResult(null);

    try {
      const res = await axios.post('/api/agent/evaluate-invoice', {
  serviceName,
  amount: parseFloat(amount),
  description: `Autonomous evaluation for ${serviceName}`
});

      setEvaluationResult(res.data);

      const newEntry = {
        id: Date.now(),
        serviceName: res.data.serviceName,
        amount: parseFloat(res.data.amount),
        status: res.data.decision,
        policyLimit: 50.00,
        date: new Date().toISOString().split('T')[0]
      };

      setRowData(prev => [newEntry, ...prev]);
      setServiceName('');
      setAmount('');
    } catch (err) {
      console.error('Evaluation failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '30px', fontFamily: 'sans-serif', backgroundColor: '#0f172a', color: '#fff', minHeight: '100vh' }}>
      <h1>PayPal AI CFO Agent Dashboard</h1>
      <p style={{ color: '#94a3b8' }}>Automated Subscription Policy & Payment Evaluator</p>
      
      <div style={{ display: 'flex', gap: '30px', marginTop: '30px' }}>
        <div style={{ background: '#1e293b', padding: '20px', borderRadius: '8px', width: '350px' }}>
          <h3>Simulate Invoice Renewal</h3>
          <form onSubmit={handleEvaluate}>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontSize: '12px', marginBottom: '5px' }}>Service Name</label>
              <input
                type="text"
                value={serviceName}
                onChange={e => setServiceName(e.target.value)}
                placeholder="e.g. AWS Cloud"
                style={{ width: '100%', padding: '8px', background: '#0f172a', border: '1px solid #334155', color: '#fff', borderRadius: '4px' }}
                required
              />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontSize: '12px', marginBottom: '5px' }}>Amount ($)</label>
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="e.g. 150.00"
                style={{ width: '100%', padding: '8px', background: '#0f172a', border: '1px solid #334155', color: '#fff', borderRadius: '4px' }}
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{ width: '100%', padding: '10px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              {loading ? 'Evaluating...' : 'Run Agent Evaluation'}
            </button>
          </form>

          {evaluationResult && (
            <div style={{ marginTop: '20px', padding: '10px', background: evaluationResult.decision === 'AUTO_APPROVED' ? '#064e3b' : '#78350f', borderRadius: '4px' }}>
              <strong>Decision: {evaluationResult.decision}</strong>
              <p style={{ fontSize: '12px', margin: '5px 0 0 0' }}>{evaluationResult.actionTaken}</p>
            </div>
          )}
        </div>

        <div style={{ flex: 1, background: '#1e293b', padding: '20px', borderRadius: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h3 style={{ margin: 0 }}>Decision Log (AG Grid)</h3>
            <button
              onClick={handleClearAll}
              style={{ background: '#dc2626', color: '#fff', border: 'none', borderRadius: '4px', padding: '6px 12px', cursor: 'pointer', fontSize: '12px' }}
            >
              Clear All Logs
            </button>
          </div>
          <div className="ag-theme-alpine-dark" style={{ height: '350px', width: '100%' }}>
            <AgGridReact
              rowData={rowData}
              columnDefs={columnDefs}
              defaultColDef={{ resizable: true, sortable: true, filter: true }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}