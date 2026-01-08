import { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { FaPlus, FaEdit } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import QuizInfoCard from '../components/quiz/QuizInfoCard';
import QuestionListCard from '../components/quiz/QuestionListCard';
import QuestionEditorCard from '../components/quiz/QuestionEditorCard';
import { 
  createQuiz, 
  getQuiz, 
  updateQuiz, 
  addQuestion as addQuestionAPI, 
  updateQuestion as updateQuestionAPI, 
  deleteQuestion as deleteQuestionAPI 
} from '../services/quizService';

const QuizCreateEdit = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEdit = !!quizId;

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(isEdit);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [quizData, setQuizData] = useState({
    title: '',
    description: '',
    questions: []
  });

  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(null);

  useEffect(() => {
    if (isEdit) {
      loadQuiz();
    }
  }, [quizId]);

  const loadQuiz = async () => {
    setLoadingData(true);
    const result = await getQuiz(quizId);

    if (result.success) {
      const quiz = result.data;
      
      setQuizData({
        title: quiz.title,
        description: quiz.description || '',
        questions: quiz.questions || []
      });
    } else {
      setError(result.error);
    }

    setLoadingData(false);
  };

  const handleQuizInfoChange = (field, value) => {
    setQuizData({ ...quizData, [field]: value });
  };

  const addQuestion = () => {
    const newQuestion = {
      question_type: 'single_choice',
      question_text: '',
      options: ['', '', '', ''],
      correct_answer: '0',
      time_limit: 30,
      points: 10,
      speed_bonus: true,
      order_index: quizData.questions.length
    };
    
    setQuizData({
      ...quizData,
      questions: [...quizData.questions, newQuestion]
    });
    
    // Automatikusan válasszuk ki az új kérdést
    setSelectedQuestionIndex(quizData.questions.length);
  };

  const updateQuestion = (index, updatedQuestion) => {
    const newQuestions = [...quizData.questions];
    newQuestions[index] = updatedQuestion;
    setQuizData({ ...quizData, questions: newQuestions });
  };

  const removeQuestion = async (index) => {
    const question = quizData.questions[index];
    
    // Ha szerkesztés módban vagyunk és a kérdés már létezik az adatbázisban
    if (isEdit && question.id) {
      if (!window.confirm('Biztosan törölni szeretnéd ezt a kérdést?')) {
        return;
      }
      
      const result = await deleteQuestionAPI(quizId, question.id);
      if (!result.success) {
        setError(result.error);
        return;
      }
    }
    
    // Törlés a lokális állapotból
    const newQuestions = quizData.questions.filter((_, i) => i !== index);
    setQuizData({ ...quizData, questions: newQuestions });
    
    // Ha a kiválasztott kérdést töröltük, válasszuk ki az elsőt
    if (selectedQuestionIndex === index) {
      setSelectedQuestionIndex(newQuestions.length > 0 ? 0 : null);
    } else if (selectedQuestionIndex > index) {
      setSelectedQuestionIndex(selectedQuestionIndex - 1);
    }
  };

  const validateQuiz = () => {
    if (!quizData.title || quizData.title.length < 3) {
      setError('A kvíz címének legalább 3 karakter hosszúnak kell lennie!');
      return false;
    }

    if (quizData.questions.length === 0) {
      setError('Legalább 1 kérdést adj hozzá a kvízhez!');
      return false;
    }

    for (let i = 0; i < quizData.questions.length; i++) {
      const q = quizData.questions[i];

      if (!q.question_text || q.question_text.length < 3) {
        setError(`A ${i + 1}. kérdés szövege túl rövid!`);
        return false;
      }

      if ((q.question_type === 'single_choice' || q.question_type === 'multiple_choice') && q.options) {
        const emptyOptions = q.options.filter(opt => !opt || opt.trim() === '');
        if (emptyOptions.length > 0) {
          setError(`A ${i + 1}. kérdésnél minden válaszlehetőséget ki kell tölteni!`);
          return false;
        }
      }

      if (q.question_type === 'order' && q.options) {
        const emptyOptions = q.options.filter(opt => !opt || opt.trim() === '');
        if (emptyOptions.length > 0) {
          setError(`A ${i + 1}. kérdésnél minden elemet ki kell tölteni!`);
          return false;
        }
      }

      if (q.question_type === 'number' && !q.correct_answer) {
        setError(`A ${i + 1}. kérdésnél add meg a helyes számot!`);
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateQuiz()) {
      return;
    }

    setLoading(true);

    try {
      if (isEdit) {
        // Update quiz basic info
        const quizUpdateResult = await updateQuiz(quizId, {
          title: quizData.title,
          description: quizData.description
        });

        if (!quizUpdateResult.success) {
          setError(quizUpdateResult.error);
          setLoading(false);
          return;
        }

        // Handle questions: compare existing with current
        const existingQuestions = quizData.questions.filter(q => q.id);
        const newQuestions = quizData.questions.filter(q => !q.id);

        // Update existing questions
        for (let i = 0; i < existingQuestions.length; i++) {
          const q = existingQuestions[i];
          const questionUpdateData = {
            question_type: q.question_type,
            question_text: q.question_text,
            options: q.options,
            correct_answer: q.correct_answer,
            time_limit: q.time_limit,
            points: q.points || 10,
            speed_bonus: q.speed_bonus !== undefined ? q.speed_bonus : true,
            order_index: quizData.questions.indexOf(q)
          };

          const result = await updateQuestionAPI(quizId, q.id, questionUpdateData);
          if (!result.success) {
            setError(`Hiba a ${i + 1}. kérdés frissítésekor: ${result.error}`);
            setLoading(false);
            return;
          }
        }

        // Add new questions
        for (let i = 0; i < newQuestions.length; i++) {
          const q = newQuestions[i];
          const questionCreateData = {
            question_type: q.question_type,
            question_text: q.question_text,
            options: q.options,
            correct_answer: q.correct_answer,
            time_limit: q.time_limit,
            points: q.points || 10,
            speed_bonus: q.speed_bonus !== undefined ? q.speed_bonus : true,
            order_index: quizData.questions.indexOf(q)
          };

          const result = await addQuestionAPI(quizId, questionCreateData);
          if (!result.success) {
            setError(`Hiba az új kérdés hozzáadásakor: ${result.error}`);
            setLoading(false);
            return;
          }
        }

        setSuccess('Kvíz sikeresen frissítve!');
      } else {
        // Create new quiz with questions
        const preparedData = {
          title: quizData.title,
          description: quizData.description,
          questions: quizData.questions.map((q, idx) => ({
            question_type: q.question_type,
            question_text: q.question_text,
            options: q.options,
            correct_answer: q.correct_answer,
            time_limit: q.time_limit,
            points: q.points || 10,
            speed_bonus: q.speed_bonus !== undefined ? q.speed_bonus : true,
            order_index: idx
          }))
        };

        const result = await createQuiz(preparedData);
        
        if (!result.success) {
          setError(result.error);
          setLoading(false);
          return;
        }

        setSuccess('Kvíz sikeresen létrehozva!');
      }

      setTimeout(() => {
        navigate('/my-quizzes');
      }, 1500);
    } catch (err) {
      setError('Váratlan hiba történt: ' + err.message);
    }

    setLoading(false);
  };

  if (loadingData) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Kvíz betöltése...</p>
      </Container>
    );
  }

  return (
    <Container fluid className="mt-4 mb-5" style={{ maxWidth: '1400px' }}>
      {/* Fejléc */}
      <div className="mb-4">
        <h2 style={{ color: '#212529', fontWeight: '600' }}>
          {isEdit ? <><FaEdit className="me-2" />Kvíz szerkesztése</> : <><FaPlus className="me-2" />Új kvíz létrehozása</>}
        </h2>
      </div>

      {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <Form onSubmit={handleSubmit}>
        <Row>
          {/* Bal oldal - Kvíz információk és kérdéslista */}
          <Col lg={4} className="mb-4">
            <QuizInfoCard
              title={quizData.title}
              description={quizData.description}
              questionCount={quizData.questions.length}
              onChange={handleQuizInfoChange}
            />

            <QuestionListCard
              questions={quizData.questions}
              selectedIndex={selectedQuestionIndex}
              onSelectQuestion={setSelectedQuestionIndex}
              onRemoveQuestion={removeQuestion}
              onAddQuestion={addQuestion}
            />
          </Col>

          {/* Jobb oldal - Kérdés szerkesztő */}
          <Col lg={8}>
            <QuestionEditorCard
              question={selectedQuestionIndex !== null ? quizData.questions[selectedQuestionIndex] : null}
              questionIndex={selectedQuestionIndex}
              hasApiKey={user?.has_gemini_api_key}
              user={user}
              onQuestionChange={(updated) => updateQuestion(selectedQuestionIndex, updated)}
              onQuestionRemove={() => removeQuestion(selectedQuestionIndex)}
            />
          </Col>
        </Row>

        {/* Alsó gombok */}
        <Row className="mt-4">
          <Col>
            <div className="d-flex gap-3 justify-content-end">
              <Button
                variant="outline-secondary"
                type="button"
                onClick={() => navigate('/my-quizzes')}
                disabled={loading}
                size="lg"
                style={{ padding: '12px 30px', borderRadius: '10px' }}
              >
                Mégse
              </Button>

              <Button
                variant="primary"
                type="submit"
                disabled={loading || quizData.questions.length === 0}
                size="lg"
                style={{ padding: '12px 30px', borderRadius: '10px', fontWeight: '600' }}
              >
                {loading ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Mentés...
                  </>
                ) : (
                  <>
                    {isEdit ? 'Frissítés' : 'Kvíz létrehozása'}
                  </>
                )}
              </Button>
            </div>
          </Col>
        </Row>
      </Form>
    </Container>
  );
};

export default QuizCreateEdit;
