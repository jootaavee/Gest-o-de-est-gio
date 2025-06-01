import axios from 'axios';

// Cria uma instância do axios
const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL, // Usa a variável de ambiente para a URL base
  headers: {
    'Content-Type': 'application/json',
  },
});

// Adiciona um interceptor para incluir o token JWT em cada requisição
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // Pega o token do localStorage
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`; // Adiciona o header Authorization
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Opcional: Adicionar interceptor de resposta para lidar com erros 401 (Não Autorizado)
// apiClient.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response && error.response.status === 401) {
//       // Exemplo: Limpar localStorage e redirecionar para login
//       localStorage.removeItem('token');
//       localStorage.removeItem('user'); // ou userType
//       // Idealmente, usar um método do AuthContext para deslogar
//       // window.location.href = '/login'; // Redirecionamento simples
//       console.error("Erro 401: Não autorizado. Redirecionando para login.");
//     }
//     return Promise.reject(error);
//   }
// );

export default apiClient;

