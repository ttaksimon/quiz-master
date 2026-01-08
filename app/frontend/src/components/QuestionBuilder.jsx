import { useState, useEffect } from 'react';
import { Card, Button, Badge } from 'react-bootstrap';
import { FaTrash } from 'react-icons/fa';
import QuestionTypeSelector from './questionBuilder/QuestionTypeSelector';
import QuestionTextInput from './questionBuilder/QuestionTextInput';
import TimeAndPointsSettings from './questionBuilder/TimeAndPointsSettings';
import SingleMultipleChoiceOptions from './questionBuilder/SingleMultipleChoiceOptions';
import NumberQuestionInput from './questionBuilder/NumberQuestionInput';
import OrderQuestionDraggable from './questionBuilder/OrderQuestionDraggable';

const QuestionBuilder = ({ question, onChange, onRemove, index, hasApiKey, user }) => {
  const [localQuestion, setLocalQuestion] = useState({
    question_type: 'single_choice',
    question_text: '',
    options: ['', ''],
    correct_answer: '',
    time_limit: 30,
    points: 10,
    speed_bonus: true,
    order_index: index,
    ...question
  });

  // Frissítsük a lokális state-et amikor új kérdést választunk ki
  useEffect(() => {
    setLocalQuestion({
      question_type: 'single_choice',
      question_text: '',
      options: ['', ''],
      correct_answer: '',
      time_limit: 30,
      points: 10,
      speed_bonus: true,
      order_index: index,
      ...question
    });
  }, [question?.id, index]);

  // Segédfüggvény a lokális state frissítésére ÉS az onChange meghívására
  const updateAndNotify = (updates) => {
    const updated = { ...localQuestion, ...updates };
    setLocalQuestion(updated);
    onChange(updated);
  };

  const handleTypeChange = (type) => {
    let newOptions = [];
    let newCorrectAnswer = '';

    if (type === 'single_choice' || type === 'multiple_choice') {
      newOptions = ['', '', '', ''];
      newCorrectAnswer = type === 'single_choice' ? '0' : '[]';
    } else if (type === 'order') {
      newOptions = ['', '', '', '', '', ''];
      // Order típusnál a correct_answer az aktuális sorrend (0,1,2,3,4,5)
      newCorrectAnswer = JSON.stringify(newOptions.map((_, idx) => idx));
    } else if (type === 'number') {
      newOptions = null;
      newCorrectAnswer = '';
    }

    updateAndNotify({
      question_type: type,
      options: newOptions,
      correct_answer: newCorrectAnswer
    });
  };

  const handleOptionChange = (idx, value) => {
    const newOptions = [...localQuestion.options];
    newOptions[idx] = value;
    updateAndNotify({ options: newOptions });
  };

  const addOption = () => {
    const maxOptions = localQuestion.question_type === 'order' ? 6 : 4;
    if (localQuestion.options.length < maxOptions) {
      const newOptions = [...localQuestion.options, ''];
      
      // Order típusnál frissítsük a correct_answer-t is az új elemek számához
      if (localQuestion.question_type === 'order') {
        updateAndNotify({
          options: newOptions,
          correct_answer: JSON.stringify(newOptions.map((_, idx) => idx))
        });
      } else {
        updateAndNotify({ options: newOptions });
      }
    }
  };

  const removeOption = (idx) => {
    const minOptions = 2;
    if (localQuestion.options.length > minOptions) {
      const newOptions = localQuestion.options.filter((_, i) => i !== idx);
      
      // Order típusnál frissítsük a correct_answer-t is az új elemek számához
      if (localQuestion.question_type === 'order') {
        updateAndNotify({
          options: newOptions,
          correct_answer: JSON.stringify(newOptions.map((_, idx) => idx))
        });
      } else {
        updateAndNotify({ options: newOptions });
      }
    }
  };

  const handleCorrectAnswerChange = (value) => {
    if (localQuestion.question_type === 'single_choice') {
      updateAndNotify({ correct_answer: value.toString() });
    } else if (localQuestion.question_type === 'multiple_choice') {
      let currentAnswers = [];
      try {
        currentAnswers = JSON.parse(localQuestion.correct_answer || '[]');
      } catch (e) {
        currentAnswers = [];
      }

      const idx = parseInt(value);
      if (currentAnswers.includes(idx)) {
        currentAnswers = currentAnswers.filter(i => i !== idx);
      } else {
        currentAnswers.push(idx);
      }

      updateAndNotify({ correct_answer: JSON.stringify(currentAnswers) });
    } else if (localQuestion.question_type === 'number') {
      updateAndNotify({ correct_answer: value });
    }
  };

  const handleAIAnswersGenerated = (wrongAnswers) => {
    const correctAnswerIndex = parseInt(localQuestion.correct_answer);
    const newOptions = [...localQuestion.options];
    
    let wrongAnswerIndex = 0;
    for (let i = 0; i < newOptions.length && wrongAnswerIndex < wrongAnswers.length; i++) {
      if (i !== correctAnswerIndex) {
        newOptions[i] = wrongAnswers[wrongAnswerIndex];
        wrongAnswerIndex++;
      }
    }
    
    updateAndNotify({
      options: newOptions,
      correct_answer: correctAnswerIndex.toString()
    });
  };

  const handleOrderDragEnd = (newOptions) => {
    updateAndNotify({
      options: newOptions,
      correct_answer: JSON.stringify(newOptions.map((_, idx) => idx))
    });
  };

  return (
    <Card className="mb-3 shadow-sm">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="mb-0">
            <Badge bg="secondary">#{index + 1}</Badge> Kérdés
          </h5>
          <Button variant="danger" size="sm" onClick={onRemove}>
            <FaTrash className="me-1" /> Törlés
          </Button>
        </div>

        <QuestionTypeSelector 
          value={localQuestion.question_type} 
          onChange={handleTypeChange} 
        />

        <QuestionTextInput 
          value={localQuestion.question_text} 
          onChange={(text) => updateAndNotify({ question_text: text })} 
        />

        <TimeAndPointsSettings
          timeLimit={localQuestion.time_limit}
          points={localQuestion.points}
          speedBonus={localQuestion.speed_bonus}
          index={index}
          onTimeChange={(time) => updateAndNotify({ time_limit: time })}
          onPointsChange={(points) => updateAndNotify({ points })}
          onSpeedBonusChange={(bonus) => updateAndNotify({ speed_bonus: bonus })}
        />

        {/* Single Choice vagy Multiple Choice */}
        {(localQuestion.question_type === 'single_choice' || localQuestion.question_type === 'multiple_choice') && (
          <SingleMultipleChoiceOptions
            questionType={localQuestion.question_type}
            questionText={localQuestion.question_text}
            options={localQuestion.options}
            correctAnswer={localQuestion.correct_answer}
            index={index}
            hasApiKey={hasApiKey}
            user={user}
            onOptionChange={handleOptionChange}
            onCorrectAnswerChange={handleCorrectAnswerChange}
            onAddOption={addOption}
            onRemoveOption={removeOption}
            onAIAnswersGenerated={handleAIAnswersGenerated}
          />
        )}

        {/* Number Question */}
        {localQuestion.question_type === 'number' && (
          <NumberQuestionInput
            value={localQuestion.correct_answer}
            onChange={handleCorrectAnswerChange}
          />
        )}

        {/* Order Question */}
        {localQuestion.question_type === 'order' && (
          <OrderQuestionDraggable
            options={localQuestion.options}
            onOptionChange={handleOptionChange}
            onDragEnd={handleOrderDragEnd}
            onAddOption={addOption}
            onRemoveOption={removeOption}
          />
        )}
      </Card.Body>
    </Card>
  );
};

export default QuestionBuilder;
