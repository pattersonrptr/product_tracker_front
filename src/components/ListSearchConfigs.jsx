import React, { useState, useEffect } from 'react';
import { toast, ToastContainer } from "react-toastify";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faSave, faTimes } from '@fortawesome/free-solid-svg-icons';
import 'react-toastify/dist/ReactToastify.css';
import './ListSearchConfigs.css';

function ListSearchConfigs() {
  const [searchConfigs, setSearchConfigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingConfig, setEditingConfig] = useState(null);
  const [editedSearchTerm, setEditedSearchTerm] = useState('');

  useEffect(() => {
    fetchSearchConfigs();
  }, []);

  const fetchSearchConfigs = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setError('Token de acesso não encontrado.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/search_configs/', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(`Erro ao buscar configurações de busca: ${response.status} - ${JSON.stringify(errorData)}`);
      } else {
        const data = await response.json();
        setSearchConfigs(data);
      }
    } catch (error) {
      setError('Erro de rede ao buscar configurações de busca.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      toast.error('Token de acesso não encontrado.');
      return;
    }

    try {
      const response = await fetch(`http://localhost:8000/search_configs/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast.success('Busca deletada com sucesso!');
        setSearchConfigs(searchConfigs.filter(config => config.id !== id));
      } else {
        const errorData = await response.json();
        toast.error(`Erro ao deletar busca: ${response.status} - ${JSON.stringify(errorData)}`);
      }
    } catch (error) {
      toast.error('Erro de rede ao deletar busca.');
    }
  };

  const handleEditClick = (config) => {
    setEditingConfig(config);
    setEditedSearchTerm(config.search_term);
    setIsEditing(true);
  };

  const handleEditInputChange = (event) => {
    setEditedSearchTerm(event.target.value);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingConfig(null);
    setEditedSearchTerm('');
  };

  const handleSaveEdit = async () => {
    if (!editingConfig) return;
    const token = localStorage.getItem('accessToken');
    if (!token) {
      toast.error('Token de acesso não encontrado.');
      return;
    }

    try {
      const response = await fetch(`http://localhost:8000/search_configs/${editingConfig.id}`, {
        method: 'PUT', // Ou PATCH, dependendo da sua API
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ search_term: editedSearchTerm }),
      });

      if (response.ok) {
        toast.success('Busca atualizada com sucesso!');
        
        setSearchConfigs(searchConfigs.map(config =>
          config.id === editingConfig.id ? { ...config, search_term: editedSearchTerm } : config
        ));
        setIsEditing(false);
        setEditingConfig(null);
        setEditedSearchTerm('');
      } else {
        const errorData = await response.json();
        toast.error(`Erro ao atualizar busca: ${response.status} - ${JSON.stringify(errorData)}`);
      }
    } catch (error) {
      toast.error('Erro de rede ao atualizar busca.');
    }
  };

  if (loading) {
    return <div>Carregando configurações de busca...</div>;
  }

  if (error) {
    return <div>Erro ao carregar configurações de busca: {error}</div>;
  }

  return (
    <div className="list-search-configs">
      <h3>Lista de Buscas Existentes</h3>
      <ul>
        {searchConfigs.map(config => (
          <li key={config.id}>
            <span>{config.search_term}</span>
            <div className="actions">
              <button className="edit-button" onClick={() => handleEditClick(config)}>
                <FontAwesomeIcon icon={faEdit} />
              </button>
              <button className="delete-button" onClick={() => handleDelete(config.id)}>
                <FontAwesomeIcon icon={faTrash} />
              </button>
            </div>
          </li>
        ))}
      </ul>

      {isEditing && editingConfig && (
        <div className="edit-form">
          <h4>Editar Busca</h4>
          <label htmlFor="edit-search-term">Termo de Busca:</label>
          <input
            type="text"
            id="edit-search-term"
            value={editedSearchTerm}
            onChange={handleEditInputChange}
          />
          <div className="edit-actions">
            <button className="save-button" onClick={handleSaveEdit}>
              <FontAwesomeIcon icon={faSave} /> Salvar
            </button>
            <button className="cancel-button" onClick={handleCancelEdit}>
              <FontAwesomeIcon icon={faTimes} /> Cancelar
            </button>
          </div>
        </div>
      )}

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}

export default ListSearchConfigs;
