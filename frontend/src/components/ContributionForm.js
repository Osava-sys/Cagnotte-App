import React, { useState } from 'react';

const ContributionForm = ({ campaignId, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    amount: '',
    message: '',
    anonymous: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      amount: parseFloat(formData.amount)
    });
  };

  return (
    <form className="contribution-form" onSubmit={handleSubmit}>
      <h3>Faire une contribution</h3>
      
      <div className="form-group">
        <label htmlFor="amount">Montant (€)</label>
        <input
          type="number"
          id="amount"
          name="amount"
          value={formData.amount}
          onChange={handleChange}
          min="0.01"
          step="0.01"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="message">Message (optionnel)</label>
        <textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          rows="4"
          maxLength="500"
          placeholder="Laissez un message de soutien..."
        />
      </div>

      <div className="form-group">
        <label>
          <input
            type="checkbox"
            name="anonymous"
            checked={formData.anonymous}
            onChange={handleChange}
          />
          Contribution anonyme
        </label>
      </div>

      <div className="form-actions">
        <button type="button" onClick={onCancel} className="btn-secondary">
          Annuler
        </button>
        <button type="submit" className="btn-primary">
          Contribuer
        </button>
      </div>
    </form>
  );
};

export default ContributionForm;

