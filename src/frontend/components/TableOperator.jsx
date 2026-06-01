import React from 'react';
import Pagination from './Pagination';
import '../styles/TableOperator.css';

const TableOperator = ({ readings, totalRecords, recordsPerPage, currentPage, onPageChange }) => {
  return (
    <div className="op-table-card">
      <table className="op-table">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Cargo</th>
            <th>Email</th>
            <th>Último Login</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {readings && readings.length > 0 ? (
            readings.map((op) => (
              <tr key={op.id}>
                <td>
                  <div className="op-cell-nome">
                    <div className="op-avatar">
                      {op.avatarUrl
                        ? <img src={op.avatarUrl} alt={op.name} />
                        : op.name.charAt(0)
                      }
                    </div>
                    <div>
                      <p className="op-nome__name">{op.name}</p>
                      <p className="op-nome__id">ID: {op.operatorId}</p>
                    </div>
                  </div>
                </td>
                <td>
                  <span className="op-badge">{op.role}</span>
                </td>
                <td>{op.email}</td>
                <td>{op.last_login}</td>
                <td>
                  <span className="op-status">
                    <span className={`op-status__dot op-status__dot--${op.status === 'Online' ? 'online' : 'offline'}`} />
                    {op.status}
                  </span>
                </td>
              </tr>
            ))
          ) : (
            <tr className="op-table__empty">
              <td colSpan="5">Nenhum operador encontrado.</td>
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

export default TableOperator;
