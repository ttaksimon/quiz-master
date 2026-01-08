const API_URL = 'http://localhost:8000/api/game';

/**
 * Új játék létrehozása
 */
export const createGame = async (quizId, token) => {
  const response = await fetch(`${API_URL}/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ quiz_id: quizId })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Hiba történt a játék létrehozásakor');
  }

  return response.json();
};

/**
 * Session információk lekérése (host)
 */
export const getSessionInfo = async (gameCode, token) => {
  const response = await fetch(`${API_URL}/session/${gameCode}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Hiba történt a session lekérésekor');
  }

  return response.json();
};

/**
 * Kérdés indítása (host)
 */
export const startQuestion = async (gameCode, questionIndex, token) => {
  const response = await fetch(`${API_URL}/start-question`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      game_code: gameCode,
      question_index: questionIndex
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Hiba történt a kérdés indításakor');
  }

  return response.json();
};

/**
 * Aktuális kérdés lekérése (játékos)
 */
export const getCurrentQuestion = async (gameCode) => {
  const response = await fetch(`${API_URL}/current-question/${gameCode}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Hiba történt a kérdés lekérésekor');
  }

  return response.json();
};

/**
 * Kérdés befejezése (host)
 */
export const finishQuestion = async (gameCode, token) => {
  const response = await fetch(`${API_URL}/finish-question`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ game_code: gameCode })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Hiba történt a kérdés befejezésekor');
  }

  return response.json();
};

/**
 * Játék befejezése (host)
 */
export const finishGame = async (gameCode, token) => {
  const response = await fetch(`${API_URL}/finish-game?game_code=${gameCode}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Hiba történt a játék befejezésekor');
  }

  return response.json();
};

/**
 * Ranglista lekérése
 */
export const getLeaderboard = async (gameCode) => {
  const response = await fetch(`${API_URL}/leaderboard/${gameCode}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Hiba történt a ranglista lekérésekor');
  }

  return response.json();
};

/**
 * PDF export
 */
export const exportToPdf = async (gameCode, token) => {
  const response = await fetch(`${API_URL}/export/pdf/${gameCode}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error('Hiba történt a PDF exportálásakor');
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `kviz_eredmenyek_${gameCode}.pdf`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};

/**
 * Excel export
 */
export const exportToExcel = async (gameCode, token) => {
  const response = await fetch(`${API_URL}/export/excel/${gameCode}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error('Hiba történt az Excel exportálásakor');
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `kviz_eredmenyek_${gameCode}.xlsx`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};

/**
 * WebSocket connection létrehozása
 */
export const createWebSocketConnection = (gameCode, nickname) => {
  const wsUrl = `ws://localhost:8000/api/game/ws/${gameCode}/${encodeURIComponent(nickname)}`;
  return new WebSocket(wsUrl);
};
