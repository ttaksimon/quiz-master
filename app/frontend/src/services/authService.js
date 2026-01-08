import api from './api';

// Regisztráció
export const register = async (username, email, password, passwordConfirm) => {
  try {
    const response = await api.post('/auth/register', {
      username,
      email,
      password,
      password_confirm: passwordConfirm,
    });
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.detail || 'Hiba történt a regisztráció során',
    };
  }
};

// Bejelentkezés
export const login = async (email, password) => {
  try {
    const response = await api.post('/auth/login', {
      email,
      password,
    });
    
    if (response.data.access_token) {
      // Token mentése
      localStorage.setItem('token', response.data.access_token);
      return { success: true, data: response.data };
    }
    
    return { success: false, error: 'Nincs token a válaszban' };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.detail || 'Hiba történt a bejelentkezés során',
    };
  }
};

// Kijelentkezés
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

// Aktuális felhasználó lekérése
export const getCurrentUser = async () => {
  try {
    const response = await api.get('/auth/me');
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.detail || 'Hiba történt a felhasználó lekérése során',
    };
  }
};

// Előfizetés csomag igénylése
export const requestSubscriptionUpgrade = async (requestedPlan) => {
  try {
    const response = await api.post('/subscription/request', {
      requested_plan: requestedPlan,
    });
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.detail || 'Hiba történt a csomag igénylése során',
    };
  }
};

// Előfizetés igénylés visszavonása
export const cancelSubscriptionRequest = async () => {
  try {
    const response = await api.delete('/subscription/cancel');
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.detail || 'Hiba történt az igénylés visszavonása során',
    };
  }
};

// Admin: Összes felhasználó lekérése
export const getAllUsers = async () => {
  try {
    const response = await api.get('/admin/users');
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.detail || 'Hiba történt a felhasználók lekérése során',
    };
  }
};

// Admin: Felhasználó frissítése
export const updateUserByAdmin = async (userId, updateData) => {
  try {
    const response = await api.put(`/admin/users/${userId}`, updateData);
    return { success: true, data: response.data };
  } catch (error) {
    // 422-es hiba (Unprocessable Entity) kezelése
    let errorMessage = 'Hiba történt a felhasználó frissítése során';
    
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

// Admin: Csomag igénylés jóváhagyása
export const approveSubscriptionRequest = async (userId) => {
  try {
    const response = await api.post(`/admin/approve-request/${userId}`);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.detail || 'Hiba történt a jóváhagyás során',
    };
  }
};

// Admin: Csomag igénylés elutasítása
export const rejectSubscriptionRequest = async (userId) => {
  try {
    const response = await api.post(`/admin/reject-request/${userId}`);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.detail || 'Hiba történt az elutasítás során',
    };
  }
};

// Admin: Függőben lévő igénylések lekérése
export const getPendingRequests = async () => {
  try {
    const response = await api.get('/admin/pending-requests');
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.detail || 'Hiba történt az igénylések lekérése során',
    };
  }
};

// Jelszó módosítása
export const changePassword = async (currentPassword, newPassword, confirmPassword) => {
  try {
    const response = await api.put('/auth/change-password', {
      current_password: currentPassword,
      new_password: newPassword,
      confirm_password: confirmPassword,
    });
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.detail || 'Hiba történt a jelszó módosítása során',
    };
  }
};
