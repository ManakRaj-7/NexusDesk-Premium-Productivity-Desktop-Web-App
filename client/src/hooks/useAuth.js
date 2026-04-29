import { useDispatch, useSelector } from 'react-redux';
import { authService } from '../services';
import { setUser, setLoading, setError, logout as logoutAction } from '../store/slices/authSlice';

export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, isAuthenticated, loading, error } = useSelector((state) => state.auth);

  const login = async (email, password) => {
    dispatch(setLoading(true));
    try {
      const response = await authService.login(email, password);
      const { user, accessToken } = response.data;
      localStorage.setItem('accessToken', accessToken);
      dispatch(setUser(user));
      return { success: true, user };
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Login failed';
      dispatch(setError(errorMessage));
      return { success: false, error: errorMessage };
    } finally {
      dispatch(setLoading(false));
    }
  };

  const signup = async (email, username, password) => {
    dispatch(setLoading(true));
    try {
      const response = await authService.signup(email, username, password);
      const { user, accessToken } = response.data;
      localStorage.setItem('accessToken', accessToken);
      dispatch(setUser(user));
      return { success: true, user };
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Signup failed';
      dispatch(setError(errorMessage));
      return { success: false, error: errorMessage };
    } finally {
      dispatch(setLoading(false));
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.error('Logout error:', err);
    }
    dispatch(logoutAction());
  };

  const getProfile = async () => {
    try {
      const response = await authService.getProfile();
      dispatch(setUser(response.data.user));
      return response.data.user;
    } catch (err) {
      console.error('Get profile error:', err);
    }
  };

  return { user, isAuthenticated, loading, error, login, signup, logout, getProfile };
};
