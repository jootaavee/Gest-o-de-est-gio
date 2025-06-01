import React, { useState, useEffect, useRef } from 'react';
import apiClient from '../../api/apiClient'; // Importar o cliente API
import { useAuth } from '../../contexts/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload, faFilePdf, faFileWord, faFileImage, faTrashAlt, faSpinner, faCheckCircle, faTimesCircle, faFileAlt } from '@fortawesome/free-solid-svg-icons';

const MeusDocumentosPage = () => {
  const [documentos, setDocumentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedTipo, setSelectedTipo] = useState('CURRICULO'); // Tipo padrão
  
  const { user, loading: authLoading } = useAuth();
  const fileInputRef = useRef(null); // Ref para o input de arquivo

  // Mapeamento de tipos de documento backend para nomes amigáveis
  const tipoDocumentoMap = {
    'CURRICULO': 'Currículo',
    'TCE': 'Termo de Compromisso de Estágio (TCE)',
    'TRE': 'Termo de Rescisão de Estágio (TRE)',
    'RELATORIO_ATIVIDADES': 'Relatório de Atividades',
    'OUTRO': 'Outro'
  };

  // Função para buscar documentos
  const fetchDocumentos = async () => {
    if (!user || user.tipo !== 'ALUNO') {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await apiClient.get('/documentos/meus');
      setDocumentos(response.data);
    } catch (err) {
      console.error('Erro ao buscar documentos:', err.response ? err.response.data : err.message);
      setError('Não foi possível carregar seus documentos. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  // Busca documentos quando o usuário estiver carregado
  useEffect(() => {
    if (!authLoading) {
      fetchDocumentos();
    }
  }, [user, authLoading]);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    setUploadError('');
    setUploadSuccess('');
  };

  const handleTipoChange = (event) => {
    setSelectedTipo(event.target.value);
  };

  // Função para fazer upload do arquivo
  const handleUpload = async () => {
    if (!selectedFile || !selectedTipo) {
      setUploadError('Por favor, selecione um arquivo e um tipo de documento.');
      return;
    }

    setUploading(true);
    setUploadError('');
    setUploadSuccess('');

    const formData = new FormData();
    formData.append('documento', selectedFile);
    formData.append('tipo', selectedTipo);

    try {
      const response = await apiClient.post('/documentos/meus', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setUploadSuccess(`Documento '${tipoDocumentoMap[selectedTipo]}' enviado com sucesso!`);
      // Limpa seleção e atualiza a lista
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = ''; // Limpa o input de arquivo
      }
      fetchDocumentos(); // Re-busca a lista de documentos
    } catch (err) {
      console.error('Erro no upload:', err.response ? err.response.data : err.message);
      setUploadError(err.response?.data?.error || 'Erro ao enviar o documento. Verifique o arquivo e tente novamente.');
    } finally {
      setUploading(false);
    }
  };

  // Função para deletar documento
  const handleDelete = async (docId) => {
    if (!window.confirm('Tem certeza que deseja excluir este documento? Esta ação não pode ser desfeita.')) {
      return;
    }

    // Opcional: Adicionar estado de loading para exclusão
    // setLoadingDelete(true);
    setError(''); // Limpa erros anteriores

    try {
      await apiClient.delete(`/documentos/${docId}`);
      // Atualiza a lista removendo o documento excluído
      setDocumentos(documentos.filter(doc => doc.id !== docId));
      alert('Documento excluído com sucesso!');
    } catch (err) {
      console.error('Erro ao excluir documento:', err.response ? err.response.data : err.message);
      setError(err.response?.data?.error || 'Erro ao excluir o documento. Tente novamente.');
      alert(err.response?.data?.error || 'Erro ao excluir o documento. Tente novamente.');
    } finally {
      // setLoadingDelete(false);
    }
  };

  // Formatar data (ajustado)
  const formatDate = (dateString) => {
    if (!dateString) return 'Data inválida';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Data inválida';
      return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'UTC' });
    } catch (e) {
      return 'Data inválida';
    }
  };

  // Ícone baseado na extensão do arquivo (simplificado)
  const getFileIcon = (filename) => {
    const extension = filename?.split('.').pop().toLowerCase();
    if (extension === 'pdf') return faFilePdf;
    if (['doc', 'docx'].includes(extension)) return faFileWord;
    if (['jpg', 'jpeg', 'png', 'gif'].includes(extension)) return faFileImage;
    return faFileAlt; // Ícone padrão
  };

  if (authLoading) {
    return <div className="container text-center my-5"><FontAwesomeIcon icon={faSpinner} spin size="3x" /></div>;
  }

  if (!user || user.tipo !== 'ALUNO') {
     return (
        <div className="container">
            <div className="alert alert-warning" role="alert">
                Você precisa estar logado como aluno para acessar esta página.
            </div>
        </div>
     );
  }

  return (
    <div className="container my-4">
      <h2>Meus Documentos</h2>

      {/* Seção de Upload */}
      <div className="card mb-4">
        <div className="card-header">Enviar Novo Documento</div>
        <div className="card-body">
          {uploadError && <div className="alert alert-danger">{uploadError}</div>}
          {uploadSuccess && <div className="alert alert-success">{uploadSuccess}</div>}
          
          <div className="row g-3 align-items-center">
            <div className="col-md-4">
              <label htmlFor="tipoDocumento" className="form-label">Tipo de Documento</label>
              <select 
                id="tipoDocumento" 
                className="form-select" 
                value={selectedTipo} 
                onChange={handleTipoChange}
                disabled={uploading}
              >
                {/* Mapeia os tipos permitidos pelo backend */} 
                <option value="CURRICULO">Currículo</option>
                <option value="TCE">Termo de Compromisso (TCE)</option>
                <option value="TRE">Termo de Rescisão (TRE)</option>
                <option value="RELATORIO_ATIVIDADES">Relatório de Atividades</option>
                <option value="OUTRO">Outro</option>
              </select>
            </div>
            <div className="col-md-5">
              <label htmlFor="fileInput" className="form-label">Selecionar Arquivo</label>
              <input 
                type="file" 
                className="form-control" 
                id="fileInput" 
                onChange={handleFileChange} 
                ref={fileInputRef}
                disabled={uploading}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" // Define tipos aceitos
              />
            </div>
            <div className="col-md-3 d-flex align-items-end">
              <button 
                className="btn btn-primary w-100" 
                onClick={handleUpload} 
                disabled={!selectedFile || uploading}
              >
                {uploading ? 
                  <><FontAwesomeIcon icon={faSpinner} spin className="me-2" />Enviando...</> : 
                  <><FontAwesomeIcon icon={faUpload} className="me-2" />Enviar</>
                }
              </button>
            </div>
          </div>
          <small className="form-text text-muted mt-2">
            Tipos de arquivo permitidos: PDF, DOC, DOCX, JPG, PNG. Tamanho máximo: 5MB (exemplo).
          </small>
        </div>
      </div>

      {/* Lista de Documentos */}
      <h4>Documentos Enviados</h4>
      {loading ? (
        <div className="text-center my-5">
          <FontAwesomeIcon icon={faSpinner} spin size="2x" />
          <p>Carregando documentos...</p>
        </div>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : documentos.length === 0 ? (
        <div className="alert alert-info">Você ainda não enviou nenhum documento.</div>
      ) : (
        <ul className="list-group">
          {documentos.map(doc => (
            <li key={doc.id} className="list-group-item d-flex justify-content-between align-items-center">
              <div>
                <FontAwesomeIcon icon={getFileIcon(doc.nome_arquivo)} className="me-2" />
                <a href={doc.url} target="_blank" rel="noopener noreferrer" className="me-2">
                  {doc.nome_arquivo}
                </a>
                <span className="badge bg-secondary me-2">{tipoDocumentoMap[doc.tipo] || doc.tipo}</span>
                <small className="text-muted">Enviado em: {formatDate(doc.data_upload)}</small>
              </div>
              <button 
                className="btn btn-sm btn-outline-danger" 
                onClick={() => handleDelete(doc.id)}
                title="Excluir documento"
              >
                <FontAwesomeIcon icon={faTrashAlt} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MeusDocumentosPage;

