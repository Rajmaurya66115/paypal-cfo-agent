import React, { useState } from 'react';
import axios from 'axios';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { Bot, DollarSign, CheckCircle, AlertTriangle, Play } from 'lucide-react';

export default function Dashboard() {
  const [rowData, setRowData] = useState([
    { id: 1, serviceName: 'GitHub Copilot Enterprise', amount: 19.00, status: 'AUTO_APPROVED', policyLimit: 50.00, date: '2026-10-08' },
    { id: 2, serviceName: 'AWS Cloud Hosting', amount: 142.50, status: 'PENDING_REVIEW', policyLimit: 50.00, date: '2026-10-07' },
    { id: 3, serviceName: 'Figma Professional', amount: 45.00, status: 'AUTO_APPROVED', policyLimit: 50.00, date: '2026-10-05' }
  ]);

  const [serviceName, setServiceName] = useState('');
  const [amount, setAmount] = useState('');
  const [evaluationResult, setEvaluationResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const columnDefs = [
    { field: 'serviceName', headerName: 'Vendor / Service', flex: 1.5 },
    { field: 'amount', headerName: 'Amount ($)', flex: 1, valueFormatter: p => `$${p.value.toFixed(2)}` },
    { field: 'policyLimit', headerName: 'Auto-Approve Limit ($)', flex: 1, valueFormatter: p => `$${p.value.toFixed(2)}` },
    { 
      field: 'status', 
      headerName: 'Agent Decision', 
      flex: 1.2,
      cellRenderer: p => (
        <span className={`px-2 py-1 rounded text-xs font-semibold ${
          p.value === 'AUTO_APPROVED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
        }`}>
          {p.value}
        </span>
      )
    },
    { field: 'date', headerName: 'Date Evaluated', flex: 1 }
  ];

  const handleEvaluate = async (e) => {
    e.preventDefault();
    if (!serviceName || !amount) return;

    setLoading(true);
    setEvaluationResult(null);

    try {
      const res = await axios.post('http://localhost:5000/api/agent/evaluate-invoice', {
        serviceName,
        amount: parseFloat(amount),
        description: `Autonomous evaluation for ${serviceName}`
      });

      setEvaluationResult(res.data);

      const newEntry = {
        id: rowData.length + 1,
        serviceName: res.data.serviceName,
        amount: parseFloat(res.data.amount),
        status: res.data.decision,
        policyLimit: 50.00,
        date: new Date().toISOString().split('T')[0]
      };
      setRowData([newEntry, ...rowData]);

    } catch (err) {
      console.error('Evaluation failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-8 font-sans">
      <div className="flex items-center justify-between mb-8 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <Bot className="w-8 h-8 text-indigo-400" />
          <h1 className="text-2xl font-bold">PayPal AI CFO Agent</h1>
        </div>
        <span className="text-sm bg-indigo-900/50 border border-indigo-500/30 text-indigo-300 px-3 py-1 rounded-full">
          Sandbox Mode Active
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Play className="w-5 h-5 text-indigo-400" /> Simulate Invoice Renewal
          </h2>
          <form onSubmit={handleEvaluate} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Vendor / Service Name</label>
              <input
                type="text"
                value={serviceName}
                onChange={e => setServiceName(e.target.value)}
                placeholder="e.g. Vercel Pro, OpenAI API"
                className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Invoice Amount ($)</label>
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="e.g. 20.00"
                className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2 rounded text-sm transition-colors disabled:opacity-50"
            >
              {loading ? 'AI Agent Evaluating...' : 'Run Agent Policy Evaluation'}
            </button>
          </form>

          {evaluationResult && (
            <div className={`mt-6 p-4 rounded-lg border text-sm ${
              evaluationResult.decision === 'AUTO_APPROVED' 
                ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
                : 'bg-amber-950/40 border-amber-500/30 text-amber-300'
            }`}>
              <div className="flex items-center gap-2 font-semibold mb-1">
                {evaluationResult.decision === 'AUTO_APPROVED' 
                  ? <CheckCircle className="w-4 h-4 text-emerald-400" />
                  : <AlertTriangle className="w-4 h-4 text-amber-400" />}
                Decision: {evaluationResult.decision}
              </div>
              <p className="text-xs opacity-90">{evaluationResult.actionTaken}</p>
            </div>
          )}
        </div>

        <div className="lg:col-span-2 bg-slate-800 border border-slate-700 rounded-xl p-6 flex flex-col">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-indigo-400" /> Autonomous Decision Log (AG Grid)
          </h2>
          <div className="ag-theme-alpine-dark w-full h-[400px] rounded overflow-hidden">
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