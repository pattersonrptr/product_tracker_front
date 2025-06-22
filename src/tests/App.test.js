import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from '../App';
import { AuthProvider } from '../context/AuthContext';
import { SnackbarProvider } from 'notistack';

const AllTheProviders = ({ children }) => {
  return (
    <SnackbarProvider>
      <BrowserRouter>
        <AuthProvider>
          {children}
        </AuthProvider>
      </BrowserRouter>
    </SnackbarProvider>
  )
}

describe('App Component', () => {
  it('renders without crashing', () => {
    render(
      <AllTheProviders>
        <App />
      </AllTheProviders>
    );
  });
});
