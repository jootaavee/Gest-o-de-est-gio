// frontend/src/contexts/AuthContext.test.js (CAMINHOS CORRIGIDOS)

import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
// CORREÇÃO: Importação direta, pois os arquivos estão na mesma pasta
import { AuthProvider, useAuth } from './AuthContext';
// CORREÇÃO: O caminho para a apiClient é um nível acima, na pasta src
import apiClient from '../api/apiClient';

// Mock do apiClient para não fazer chamadas reais à API
jest.mock('../api/apiClient');

const TestConsumerComponent = () => {
    const { user, token, isAuthenticated, login, logout } = useAuth();
    return (
        <div>
            <div data-testid="is-authenticated">{isAuthenticated.toString()}</div>
            <div data-testid="token">{token}</div>
            <div data-testid="user-name">{user?.nome_completo}</div>
            <button onClick={() => login('test@test.com', 'password')}>Login</button>
            <button onClick={logout}>Logout</button>
        </div>
    );
};

const renderWithAuthProvider = (ui) => {
    return render(
        <AuthProvider>
            {ui}
        </AuthProvider>
    );
};

describe('AuthProvider', () => {

    beforeEach(() => {
        localStorage.clear();
        jest.clearAllMocks();
    });

    it('estado inicial deve ser não autenticado', async () => {
        // PRECISAMOS USAR O ASYNC AWAIT COM WAITOR POR CAUSA DO USEEFFECT INICIAL
        renderWithAuthProvider(<TestConsumerComponent />);
        
        // O estado inicial pode levar um momento para ser definido por causa do useEffect
        await waitFor(() => {
            expect(screen.getByTestId('is-authenticated')).toHaveTextContent('false');
        });
        expect(screen.getByTestId('user-name')).toBeEmptyDOMElement();
    });

    it('deve autenticar o usuário após o login', async () => {
        const mockUser = { id: '1', nome_completo: 'Robert Silva', tipo: 'ALUNO' };
        const mockToken = 'fake-jwt-token';
        apiClient.post.mockResolvedValue({ data: { user: mockUser, token: mockToken } });

        renderWithAuthProvider(<TestConsumerComponent />);
        
        await act(async () => {
            screen.getByText('Login').click();
        });

        await waitFor(() => {
            expect(screen.getByTestId('is-authenticated')).toHaveTextContent('true');
            expect(screen.getByTestId('user-name')).toHaveTextContent('Robert Silva');
            expect(screen.getByTestId('token')).toHaveTextContent(mockToken);
        });
        
        expect(localStorage.getItem('token')).toBe(mockToken);
        expect(JSON.parse(localStorage.getItem('user'))).toEqual(mockUser);
    });

    it('deve limpar o estado após o logout', async () => {
        // Primeiramente, simula um estado logado
        localStorage.setItem('token', 'some-token');
        localStorage.setItem('user', JSON.stringify({ nome_completo: 'Robert Silva' }));
        apiClient.get.mockResolvedValue({ data: { nome_completo: 'Robert Silva' }});

        renderWithAuthProvider(<TestConsumerComponent />);

        // Espera o login inicial ser concluído
        await waitFor(() => {
            expect(screen.getByTestId('is-authenticated')).toHaveTextContent('true');
        });

        // Age: Clica no logout
        await act(async () => {
            screen.getByText('Logout').click();
        });

        // Assert: Verifica se tudo foi limpo
        await waitFor(() => {
            expect(screen.getByTestId('is-authenticated')).toHaveTextContent('false');
            expect(screen.getByTestId('user-name')).toBeEmptyDOMElement();
        });

        expect(localStorage.getItem('token')).toBeNull();
    });
});