import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const ForgotPassword = () => {
  const [step, setStep] = useState('phone');
  const [telephone, setTelephone] = useState('');
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState(['']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleGetQuestions = async (e) => {
    e.preventDefault();
    setError('');
    if (!telephone) {
      setError('Veuillez entrer votre numéro de téléphone');
      return;
    }

    setLoading(true);
    try {
      const res = await api.get(`/auth/get-security-questions/${telephone}`);
      setQuestions(res.data.questions);
      setStep('questions');
    } catch (err) {
      setError(err.response?.data?.message || 'Numéro non trouvé');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAnswers = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/verify-security-questions', {
        telephone,
        answers
      });
      localStorage.setItem('resetToken', res.data.token);
      navigate('/reset-password');
    } catch (err) {
      setError(err.response?.data?.message || 'Réponses incorrectes');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page" style={{ maxWidth: 400, margin: '0 auto', paddingTop: 40 }}>
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1B2A6B' }}>Mot de passe oublié</h1>
        <p style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>Récupérez l'accès à votre compte</p>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {step === 'phone' && (
        <form onSubmit={handleGetQuestions}>
          <div className="form-group">
            <label>Numéro de téléphone</label>
            <input
              type="tel"
              className="form-control"
              placeholder="+224..."
              value={telephone}
              onChange={e => setTelephone(e.target.value)}
              required
            />
          </div>
          <button type="submit" disabled={loading} className="btn btn-primary btn-block">
            {loading ? 'Chargement...' : 'Continuer'}
          </button>
        </form>
      )}

      {step === 'questions' && (
        <form onSubmit={handleVerifyAnswers}>
          <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 16 }}>Répondez à votre question de sécurité:</p>
          {questions.map((q, i) => (
            <div key={i} className="form-group">
              <label>{q}</label>
              <input
                type="text"
                className="form-control"
                placeholder="Votre réponse"
                value={answers[i]}
                onChange={e => {
                  const newAnswers = [...answers];
                  newAnswers[i] = e.target.value;
                  setAnswers(newAnswers);
                }}
                required
              />
            </div>
          ))}
          <button type="submit" disabled={loading} className="btn btn-primary btn-block">
            {loading ? 'Vérification...' : 'Vérifier'}
          </button>
        </form>
      )}
    </div>
  );
};

export default ForgotPassword;
