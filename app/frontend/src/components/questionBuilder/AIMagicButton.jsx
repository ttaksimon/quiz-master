import { useState } from 'react';
import { Button, Spinner, Alert } from 'react-bootstrap';
import { FaWandMagicSparkles, FaCheck, FaCrown } from 'react-icons/fa6';
import { generateWrongAnswers } from '../../services/quizService';

const AIMagicButton = ({ questionText, correctAnswer, onAnswersGenerated, hasApiKey, user, numWrongAnswers = 3 }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!questionText || !correctAnswer) {
      setError('Először add meg a kérdést és a helyes választ!');
      return;
    }

    setError('');
    setLoading(true);

    const result = await generateWrongAnswers(questionText, correctAnswer, numWrongAnswers);

    if (result.success) {
      onAnswersGenerated(result.data.wrong_answers);
      setError('');
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  // Ha alap csomagos felhasználó (és nem admin), mutassunk upgrade üzenetet
  if (user?.subscription_plan === 'basic' && !user?.is_admin) {
    return (
      <Alert variant="warning" className="mt-3" style={{ borderLeft: '4px solid #ffc107' }}>
        <div className="d-flex align-items-start">
          <div>
            <strong>AI Varázsgomb</strong>
            <p className="mb-2 mt-1">
              Automatikusan generálhatsz rossz válaszokat AI segítségével, de ez a funkció csak a <strong>Prémium</strong> és <strong>Profi</strong> csomagok esetén érhető el.
            </p>
            <a href="/subscription" className="btn btn-sm btn-warning" style={{ fontWeight: '600' }}>
              Csomag frissítése
            </a>
          </div>
        </div>
      </Alert>
    );
  }

  // Ha nincs API kulcs (de jogosult rá)
  if (!hasApiKey) {
    return (
      <Alert variant="info" className="mt-3">
        <strong><FaWandMagicSparkles className="me-2" />AI Varázsgomb elérhető!</strong>
        <p className="mb-2">
          Automatikusan generálhatsz rossz válaszokat AI segítségével.
        </p>
        <p className="mb-0">
          Ehhez add hozzá a Gemini API kulcsod az{' '}
          <a href="/dashboard">Irányítópult</a> oldalon.
        </p>
      </Alert>
    );
  }

  return (
    <div className="mt-3">
      <Button
        variant="info"
        onClick={handleGenerate}
        disabled={loading || !questionText || !correctAnswer}
        className="w-100"
      >
        {loading ? (
          <>
            <Spinner animation="border" size="sm" className="me-2" />
            AI válaszok generálása...
          </>
        ) : (
          <>
            <FaWandMagicSparkles className="me-2" /> Varázsgomb - Rossz válaszok generálása AI segítségével
          </>
        )}
      </Button>
      {error && (
        <Alert variant="danger" className="mt-2 mb-0">
          {error}
        </Alert>
      )}
    </div>
  );
};

export default AIMagicButton;
