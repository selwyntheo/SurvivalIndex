import React, { useState, useEffect } from 'react';
import { Check, X, Loader2, Eye, Trash2, RefreshCw, AlertCircle } from 'lucide-react';
import api from '../api/client';

export default function AdminPanel({ currentUser, onLogout }) {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [processing, setProcessing] = useState({});
  const [rejectionReason, setRejectionReason] = useState('');
  const [reviewNotes, setReviewNotes] = useState('');
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    loadSubmissions();
    loadPendingCount();
  }, [filter]);

  async function loadSubmissions() {
    try {
      setLoading(true);
      const response = await api.submissions.getAll({ status: filter === 'all' ? undefined : filter });
      setSubmissions(response.data || []);
    } catch (error) {
      console.error('Failed to load submissions:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadPendingCount() {
    try {
      const response = await api.submissions.getPendingCount();
      setPendingCount(response.count);
    } catch (error) {
      console.error('Failed to load pending count:', error);
    }
  }

  async function handleApprove(submissionId, triggerAI = false) {
    try {
      setProcessing(prev => ({ ...prev, [submissionId]: 'approving' }));
      await api.submissions.approve(submissionId, { reviewNotes, triggerAIEvaluation: triggerAI });
      alert('✅ Submission approved and project created!');
      setSelectedSubmission(null);
      setReviewNotes('');
      loadSubmissions();
      loadPendingCount();
    } catch (error) {
      console.error('Failed to approve submission:', error);
      alert(`❌ Failed to approve: ${error.message}`);
    } finally {
      setProcessing(prev => ({ ...prev, [submissionId]: null }));
    }
  }

  async function handleReject(submissionId) {
    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }

    try {
      setProcessing(prev => ({ ...prev, [submissionId]: 'rejecting' }));
      await api.submissions.reject(submissionId, { rejectionReason, reviewNotes });
      alert('✅ Submission rejected');
      setSelectedSubmission(null);
      setRejectionReason('');
      setReviewNotes('');
      loadSubmissions();
      loadPendingCount();
    } catch (error) {
      console.error('Failed to reject submission:', error);
      alert(`❌ Failed to reject: ${error.message}`);
    } finally {
      setProcessing(prev => ({ ...prev, [submissionId]: null }));
    }
  }

  async function handleDelete(submissionId) {
    if (!confirm('Are you sure you want to delete this submission?')) return;

    try {
      setProcessing(prev => ({ ...prev, [submissionId]: 'deleting' }));
      await api.submissions.delete(submissionId);
      loadSubmissions();
      loadPendingCount();
    } catch (error) {
      console.error('Failed to delete submission:', error);
      alert(`❌ Failed to delete: ${error.message}`);
    } finally {
      setProcessing(prev => ({ ...prev, [submissionId]: null }));
    }
  }

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <div>
          <h1>Admin Panel</h1>
          <p>Welcome, {currentUser?.email}</p>
        </div>
        <button className="logout-btn" onClick={onLogout}>Logout</button>
      </div>

      <div className="admin-stats">
        <div className="stat-card pending">
          <h3>{pendingCount}</h3>
          <p>Pending Reviews</p>
        </div>
        <div className="stat-card">
          <h3>{submissions.filter(s => s.status === 'approved').length}</h3>
          <p>Approved</p>
        </div>
        <div className="stat-card">
          <h3>{submissions.filter(s => s.status === 'rejected').length}</h3>
          <p>Rejected</p>
        </div>
      </div>

      <div className="admin-filters">
        <button 
          className={filter === 'pending' ? 'active' : ''}
          onClick={() => setFilter('pending')}
        >
          Pending ({pendingCount})
        </button>
        <button 
          className={filter === 'approved' ? 'active' : ''}
          onClick={() => setFilter('approved')}
        >
          Approved
        </button>
        <button 
          className={filter === 'rejected' ? 'active' : ''}
          onClick={() => setFilter('rejected')}
        >
          Rejected
        </button>
        <button 
          className={filter === 'all' ? 'active' : ''}
          onClick={() => setFilter('all')}
        >
          All
        </button>
        <button className="refresh-btn" onClick={loadSubmissions}>
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="loading-state">
          <Loader2 className="spinning" size={32} />
          <p>Loading submissions...</p>
        </div>
      ) : submissions.length === 0 ? (
        <div className="empty-state">
          <AlertCircle size={48} />
          <p>No {filter !== 'all' ? filter : ''} submissions found</p>
        </div>
      ) : (
        <div className="submissions-list">
          {submissions.map(submission => (
            <div key={submission.id} className={`submission-card ${submission.status}`}>
              <div className="submission-header">
                <div>
                  <h3>{submission.name}</h3>
                  <span className={`status-badge ${submission.status}`}>
                    {submission.status.toUpperCase()}
                  </span>
                </div>
                <div className="submission-meta">
                  <span className="type-badge">{submission.type}</span>
                  <span className="category-badge">{submission.category}</span>
                </div>
              </div>

              <p className="submission-description">{submission.description}</p>

              <div className="submission-details">
                {submission.url && (
                  <div><strong>URL:</strong> <a href={submission.url} target="_blank" rel="noopener noreferrer">{submission.url}</a></div>
                )}
                {submission.githubUrl && (
                  <div><strong>GitHub:</strong> <a href={submission.githubUrl} target="_blank" rel="noopener noreferrer">{submission.githubUrl}</a></div>
                )}
                {submission.license && <div><strong>License:</strong> {submission.license}</div>}
                {submission.techStack && <div><strong>Tech Stack:</strong> {submission.techStack}</div>}
                {submission.selfHostable && <div><strong>Self-Hostable:</strong> Yes</div>}
                {submission.submittedBy && <div><strong>Submitted by:</strong> {submission.submittedBy}</div>}
                {submission.submitterEmail && <div><strong>Email:</strong> {submission.submitterEmail}</div>}
                <div><strong>Submitted:</strong> {new Date(submission.createdAt).toLocaleString()}</div>
              </div>

              {submission.status === 'pending' && (
                <div className="submission-actions">
                  <button
                    className="view-btn"
                    onClick={() => setSelectedSubmission(submission)}
                  >
                    <Eye size={16} />
                    Review
                  </button>
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(submission.id)}
                    disabled={processing[submission.id]}
                  >
                    {processing[submission.id] === 'deleting' ? (
                      <Loader2 size={16} className="spinning" />
                    ) : (
                      <Trash2 size={16} />
                    )}
                    Delete
                  </button>
                </div>
              )}

              {submission.status === 'rejected' && submission.rejectionReason && (
                <div className="rejection-reason">
                  <strong>Rejection Reason:</strong> {submission.rejectionReason}
                </div>
              )}

              {submission.reviewNotes && (
                <div className="review-notes">
                  <strong>Review Notes:</strong> {submission.reviewNotes}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {selectedSubmission && (
        <div className="modal-overlay" onClick={() => setSelectedSubmission(null)}>
          <div className="modal-content review-modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedSubmission(null)}>
              <X size={24} />
            </button>
            
            <h2>Review Submission</h2>
            <h3>{selectedSubmission.name}</h3>
            
            <div className="review-details">
              <p><strong>Type:</strong> {selectedSubmission.type}</p>
              <p><strong>Category:</strong> {selectedSubmission.category}</p>
              <p><strong>Description:</strong> {selectedSubmission.description}</p>
              {selectedSubmission.url && <p><strong>URL:</strong> <a href={selectedSubmission.url} target="_blank" rel="noopener noreferrer">{selectedSubmission.url}</a></p>}
              {selectedSubmission.githubUrl && <p><strong>GitHub:</strong> <a href={selectedSubmission.githubUrl} target="_blank" rel="noopener noreferrer">{selectedSubmission.githubUrl}</a></p>}
              {selectedSubmission.license && <p><strong>License:</strong> {selectedSubmission.license}</p>}
              {selectedSubmission.techStack && <p><strong>Tech Stack:</strong> {selectedSubmission.techStack}</p>}
              {selectedSubmission.alternativeTo && <p><strong>Alternative To:</strong> {selectedSubmission.alternativeTo}</p>}
              <p><strong>Self-Hostable:</strong> {selectedSubmission.selfHostable ? 'Yes' : 'No'}</p>
              {selectedSubmission.submittedBy && <p><strong>Submitted by:</strong> {selectedSubmission.submittedBy} ({selectedSubmission.submitterEmail})</p>}
            </div>

            <div className="form-group">
              <label>Review Notes (optional)</label>
              <textarea
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="Add any notes about this review..."
                rows={3}
              />
            </div>

            <div className="form-group">
              <label>Rejection Reason (required if rejecting)</label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Explain why this submission is being rejected..."
                rows={3}
              />
            </div>

            <div className="review-actions">
              <button
                className="reject-btn"
                onClick={() => handleReject(selectedSubmission.id)}
                disabled={processing[selectedSubmission.id]}
              >
                {processing[selectedSubmission.id] === 'rejecting' ? (
                  <>
                    <Loader2 size={18} className="spinning" />
                    Rejecting...
                  </>
                ) : (
                  <>
                    <X size={18} />
                    Reject
                  </>
                )}
              </button>
              
              <button
                className="approve-btn"
                onClick={() => handleApprove(selectedSubmission.id, false)}
                disabled={processing[selectedSubmission.id]}
              >
                {processing[selectedSubmission.id] === 'approving' ? (
                  <>
                    <Loader2 size={18} className="spinning" />
                    Approving...
                  </>
                ) : (
                  <>
                    <Check size={18} />
                    Approve
                  </>
                )}
              </button>

              <button
                className="approve-ai-btn"
                onClick={() => handleApprove(selectedSubmission.id, true)}
                disabled={processing[selectedSubmission.id]}
              >
                {processing[selectedSubmission.id] === 'approving' ? (
                  <>
                    <Loader2 size={18} className="spinning" />
                    Approving...
                  </>
                ) : (
                  <>
                    <Check size={18} />
                    Approve + AI Eval
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
