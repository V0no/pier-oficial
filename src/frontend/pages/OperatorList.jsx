import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import TableOperator from '../components/TableOperator';
import Pagination from '../components/Pagination';
import '../styles/OperatorList.css';
import API_BASE_URL from '../services/api';

const OperatorList = () => {
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const recordsPerPage = 9;

  useEffect(() => {
    const fetchReadings = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `${API_BASE_URL}/users?page=${currentPage}&limit=${recordsPerPage}`
        );
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        setReadings(data.users);
        setTotalRecords(data.total);
      } catch (error) {
        console.error('Erro ao buscar operadores:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchReadings();
  }, [currentPage]);

  const handlePageChange = (newPage) => {
    if (newPage > 0) setCurrentPage(newPage);
  };

  return (
    <div className="operator-page">
      <Sidebar />

      <main className="operator-page__main">
        <header>
          <span className="operator-page__label">Operadores</span>
          <h1 className="operator-page__title">Lista dos operadores</h1>
          <p className="operator-page__description">Gerencia os operadores cadastrados na plataforma</p>
        </header>

        {loading ? (
          <p>Carregando...</p>
        ) : (
          <TableOperator
            readings={readings}
            totalRecords={totalRecords}
            recordsPerPage={recordsPerPage}
            currentPage={currentPage}
            onPageChange={handlePageChange}
          />
        )}
      </main>
    </div>
  );
};

export default OperatorList;
