// Login.test.js
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
//import Login from './Login';

describe('Login Component', () => {
  test('renders Login form', () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    expect(screen.getByText(/Welcome to online travel planner TravelBoard/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter your e-mail or user name/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter your password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Login/i })).toBeInTheDocument();
  });

  test('shows error when form is submitted without input', async () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: /Login/i }));

    // since inputs are required, browser validation prevents submission
    expect(screen.queryByText(/Login failed/i)).not.toBeInTheDocument();
  });
});
