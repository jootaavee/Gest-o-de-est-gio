import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';
import { useAuth } from './contexts/AuthContext';

jest.mock('./contexts/AuthContext', () => ({
    ...jest.requireActual('./contexts/AuthContext'),
    useAuth: jest.fn(),
}));

const renderApp = (initialRoute = '/') => {
    return render(
        <MemoryRouter initialEntries={[initialRoute]}>
            <App />
        </MemoryRouter>
    );
};

describe('Testes de Roteamento do App', () => {
    
    it('deve redirecionar para /login se o usuário estiver deslogado e tentar acessar uma rota protegida', () => {
        useAuth.mockReturnValue({
            isAuthenticated: false,
            loading: false,
            user: null,
        });
        
        renderApp('/admin');

        expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument();
    });

    it('deve permitir acesso a uma rota de Aluno se o usuário for um aluno logado', async () => {
        useAuth.mockReturnValue({
            isAuthenticated: true,
            loading: false,
            user: { tipo: 'ALUNO' },
            isTecnico: () => false,
            isAluno: () => true
        });

        renderApp('/meus-documentos');

        expect(await screen.findByRole('heading', { name: /meus documentos/i })).toBeInTheDocument();
    });

    it('deve permitir acesso a uma rota de Técnico se o usuário for um técnico logado', async () => {
        useAuth.mockReturnValue({
            isAuthenticated: true,
            loading: false,
            user: { tipo: 'TECNICO' },
            isTecnico: () => true,
            isAluno: () => false
        });

        renderApp('/admin');

        expect(await screen.findByRole('heading', { name: /dashboard do técnico/i })).toBeInTheDocument(); 
    });

    it('deve redirecionar para a página correta quando um ALUNO acessa a rota raiz "/"', () => {
        useAuth.mockReturnValue({
            isAuthenticated: true,
            loading: false,
            user: { tipo: 'ALUNO' },
        });

        renderApp('/');

        expect(screen.getByRole('heading', { name: /vagas de estágio disponíveis/i })).toBeInTheDocument();
    });
    
    it('deve redirecionar para a página correta quando um TÉCNICO acessa a rota raiz "/"', async () => {
        useAuth.mockReturnValue({
            isAuthenticated: true,
            loading: false,
            user: { tipo: 'TECNICO' },
        });
        
        renderApp('/');
        
        expect(await screen.findByRole('heading', { name: /dashboard do técnico/i })).toBeInTheDocument();
    });
});