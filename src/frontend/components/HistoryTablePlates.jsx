import React from 'react';
import Pagination from './Pagination';
import '../styles/HistoryTablePlates.css';

const StatusBadge = ({ status }) => {
  const isVerificado = status === 'VERIFICADO';
  return (
    <span className={`hist-badge ${isVerificado ? 'hist-badge--verificado' : 'hist-badge--alerta'}`}>
      <span className="hist-badge__icon">{isVerificado ? '✓' : '▲'}</span>
      {status}
    </span>
  );
};

const HistoryTablePlates = ({ readings, totalRecords, recordsPerPage, currentPage, onPageChange }) => {
  return (
    <div className="hist-table-card">
      <table className="hist-table">
        <thead>
          <tr>
            <th>Foto</th>
            <th>Carro</th>
            <th>Data e Hora</th>
            <th>Localização (Coord)</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {readings && readings.length > 0 ? (
            readings.map((reading) => (
              <tr key={reading.id}>
                <td>
                  <img
                    src={reading.photoUrl}
                    alt="Placa do carro"
                    className="hist-photo"
                  />
                </td>
                <td>
                  <span className="hist-car">{reading.carModel}</span>
                </td>
                <td>
                  <div className="hist-datetime__time">{reading.time}</div>
                  <div className="hist-datetime__date">{reading.date}</div>
                </td>
                <td>
                  <span className="hist-location">
                    <span className="hist-pin" />
                    {reading.location}
                  </span>
                </td>
                <td>
                  <StatusBadge status={reading.status} />
                </td>
              </tr>
            ))
          ) : (
            <tr className="hist-table__empty">
              <td colSpan="5">Nenhum registro encontrado.</td>
            </tr>
          )}
        </tbody>
      </table>

      <Pagination
        totalRecords={totalRecords}
        recordsPerPage={recordsPerPage}
        currentPage={currentPage}
        onPageChange={onPageChange}
      />
    </div>
  );
};

export default HistoryTablePlates;
