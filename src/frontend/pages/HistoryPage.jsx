import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import HistoryTablePlates from '../components/HistoryTablePlates';
import '../styles/HistoryPage.css';
import API_BASE_URL from '../services/api';

const HistoryPage = () => {
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const recordsPerPage = 14;

  useEffect(() => {
    const fetchReadings = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `${API_BASE_URL}/detections?page=${currentPage}&limit=${recordsPerPage}`
        );
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        setReadings(data.detections);
        setTotalRecords(data.total);
      } catch (error) {
        console.error('Erro ao buscar histórico:', error);
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
    <div className="hist-page">
      <Sidebar />

      <main className="hist-page__main">
        <header>
          <span className="hist-page__label">Histórico</span>
          <h1 className="hist-page__title">Histórico de leituras</h1>
          <p className="hist-page__description">Monitoramento e registro de veículos identificados pela frota de drones.</p>
        </header>

        {loading ? (
          <p>Carregando...</p>
        ) : (
          <HistoryTablePlates
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

export default HistoryPage;
