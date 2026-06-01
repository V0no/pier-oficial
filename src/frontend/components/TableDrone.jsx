import React from 'react';
import Pagination from './Pagination';
import '../styles/TableDrone.css';

const statusDotClass = (status) => {
  if (status === 'Disponível')    return 'dr-status__dot--disponivel';
  if (status === 'Em uso')        return 'dr-status__dot--em-uso';
  return 'dr-status__dot--manutencao';
};

const TableDrone = ({ readings, totalRecords, recordsPerPage, currentPage, onPageChange }) => {
  return (
    <div className="dr-table-card">
      <table className="dr-table">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Modelo</th>
            <th>Operador</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {readings && readings.length > 0 ? (
            readings.map((drone) => (
              <tr key={drone.id}>
                <td>
                  <div className="dr-cell-nome">
                    <div className="dr-avatar">{drone.name.charAt(0)}</div>
                    <div>
                      <p className="dr-nome__name">{drone.name}</p>
                      <p className="dr-nome__id">ID: {drone.id}</p>
                    </div>
                  </div>
                </td>
                <td>
                  <span className="dr-badge">{drone.model}</span>
                </td>
                <td>{drone.operator || '—'}</td>
                <td>
                  <span className="dr-status">
                    <span className={`dr-status__dot ${statusDotClass(drone.status)}`} />
                    {drone.status}
                  </span>
                </td>
              </tr>
            ))
          ) : (
            <tr className="dr-table__empty">
              <td colSpan="4">Nenhum drone encontrado.</td>
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

export default TableDrone;