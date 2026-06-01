import React from 'react';
import '../styles/TableOperator.css';

const Pagination = ({ totalRecords, recordsPerPage, currentPage, onPageChange }) => {
  const startRecord = totalRecords > 0 ? (currentPage - 1) * recordsPerPage + 1 : 0;
  const endRecord = Math.min(currentPage * recordsPerPage, totalRecords);

  return (
    <div className="pagination">
      <span className="pagination__info">
        Mostrando {startRecord}-{endRecord} de {totalRecords} registros
      </span>
      <div className="pagination__pages">
        <button
          className="pagination__btn"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          &lt;
        </button>
        {[1, 2, 3].map(page => (
          <button
            key={page}
            className={`pagination__btn${currentPage === page ? ' pagination__btn--active' : ''}`}
            onClick={() => onPageChange(page)}
          >
            {page}
          </button>
        ))}
        <span className="pagination__ellipsis">...</span>
        <button
          className="pagination__btn"
          onClick={() => onPageChange(currentPage + 1)}
        >
          &gt;
        </button>
      </div>
    </div>
  );
};

export default Pagination;
