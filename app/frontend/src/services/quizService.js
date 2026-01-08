import api from './api';

// ===== QUIZ CRUD =====

export const createQuiz = async (quizData) => {
  try {
    const response = await api.post('/quizzes', quizData);
    return { success: true, data: response.data };
  } catch (error) {
    // 422-es hiba (Unprocessable Entity) kezelése
    let errorMessage = 'Hiba történt a kvíz létrehozása során';
    
    if (error.response?.data?.detail) {
      // Ha a detail egy string, akkor azt használjuk
      if (typeof error.response.data.detail === 'string') {
        errorMessage = error.response.data.detail;
      } 
      // Ha a detail egy tömb (validációs hibák), alakítsuk át olvasható szöveggé
      else if (Array.isArray(error.response.data.detail)) {
        errorMessage = error.response.data.detail
          .map(err => `${err.loc.join('.')}: ${err.msg}`)
          .join(', ');
      }
      // Ha objektum, próbáljuk meg stringgé alakítani
      else {
        errorMessage = JSON.stringify(error.response.data.detail);
      }
    }
    
    return {
      success: false,
      error: errorMessage,
    };
  }
};

export const getQuizzes = async (myQuizzes = false, skip = 0, limit = 50) => {
  try {
    const params = { skip, limit };
    if (myQuizzes) params.my_quizzes = true;
    
    const response = await api.get('/quizzes', { params });
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.detail || 'Hiba történt a kvízek lekérése során',
    };
  }
};

export const getMyQuizzes = async () => {
  try {
    const response = await api.get('/quizzes', { 
      params: { my_quizzes: true, limit: 100 } 
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Hiba történt a kvízek lekérésekor');
  }
};

export const getQuiz = async (quizId) => {
  try {
    const response = await api.get(`/quizzes/${quizId}`);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.detail || 'Hiba történt a kvíz lekérése során',
    };
  }
};

export const updateQuiz = async (quizId, quizData) => {
  try {
    const response = await api.put(`/quizzes/${quizId}`, quizData);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('updateQuiz error:', error);
    return {
      success: false,
      error: error.response?.data?.detail || error.message || 'Hiba történt a kvíz frissítése során',
    };
  }
};

export const deleteQuiz = async (quizId) => {
  try {
    await api.delete(`/quizzes/${quizId}`);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.detail || 'Hiba történt a kvíz törlése során',
    };
  }
};

// ===== QUESTION CRUD =====

export const addQuestion = async (quizId, questionData) => {
  try {
    const response = await api.post(`/quizzes/${quizId}/questions`, questionData);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('addQuestion error:', error);
    return {
      success: false,
      error: error.response?.data?.detail || error.message || 'Hiba történt a kérdés hozzáadása során',
    };
  }
};

export const updateQuestion = async (quizId, questionId, questionData) => {
  try {
    const response = await api.put(`/quizzes/${quizId}/questions/${questionId}`, questionData);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('updateQuestion error:', error);
    return {
      success: false,
      error: error.response?.data?.detail || error.message || 'Hiba történt a kérdés frissítése során',
    };
  }
};

export const deleteQuestion = async (quizId, questionId) => {
  try {
    await api.delete(`/quizzes/${quizId}/questions/${questionId}`);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.detail || 'Hiba történt a kérdés törlése során',
    };
  }
};

// ===== RATING =====

export const rateQuiz = async (quizId, rating, sessionId = null) => {
  try {
    const response = await api.post(`/quizzes/${quizId}/rate`, {
      rating,
      session_id: sessionId,
    });
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.detail || 'Hiba történt az értékelés során',
    };
  }
};

// ===== AI =====

export const generateWrongAnswers = async (questionText, correctAnswer, numWrongAnswers = 3) => {
  try {
    const response = await api.post('/ai/generate-wrong-answers', {
      question_text: questionText,
      correct_answer: correctAnswer,
      num_wrong_answers: numWrongAnswers,
    });
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.detail || 'Hiba történt a válaszok generálása során',
    };
  }
};

// ===== USER API KEY =====

export const updateApiKey = async (apiKey) => {
  try {
    const response = await api.put('/auth/api-key', {
      gemini_api_key: apiKey,
    });
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.detail || 'Hiba történt az API kulcs mentése során',
    };
  }
};

export const deleteApiKey = async () => {
  try {
    const response = await api.delete('/auth/api-key');
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.detail || 'Hiba történt az API kulcs törlése során',
    };
  }
};

// ===== ADMIN QUIZZES =====

export const getAllQuizzes = async () => {
  try {
    const response = await api.get('/quizzes/admin/all');
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.detail || 'Hiba történt a kvízek lekérése során',
    };
  }
};

export const getQuizRatings = async (quizId) => {
  try {
    const response = await api.get(`/quizzes/${quizId}/ratings`);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.detail || 'Hiba történt az értékelések lekérése során',
    };
  }
};

export const deleteRating = async (ratingId) => {
  try {
    const response = await api.delete(`/quizzes/ratings/${ratingId}`);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.detail || 'Hiba történt az értékelés törlése során',
    };
  }
};
