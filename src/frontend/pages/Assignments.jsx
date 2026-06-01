import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import droneImg from '../../../docs/static/img/djitest.png';
import '../styles/Assignments.css';

import {
  getDrones,
  getOperators,
  getAssignments,
  createAssignment,
  unassignDrone,
} from '../services/assignmentApi';

const formatAssignedAt = (assignedAt) => {
  if (!assignedAt) {
    return '--:-- --/--';
  }

  const date = new Date(assignedAt);

  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');

  return `${hours}:${minutes} ${day}/${month}`;
};

const formatPercentage = (value) => {
  if (value === null || value === undefined) {
    return '--';
  }

  return `${value}%`;
};

const Assignments = () => {
  const [drones, setDrones] = useState([]);
  const [operators, setOperators] = useState([]);
  const [assignments, setAssignments] = useState([]);

  const [selectedDroneIndex, setSelectedDroneIndex] = useState(0);
  const [selectedOperatorIndex, setSelectedOperatorIndex] = useState(0);

  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingAssignment, setIsCreatingAssignment] = useState(false);
  const [isUnassigning, setIsUnassigning] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const selectedDrone = drones[selectedDroneIndex];
  const selectedOperator = operators[selectedOperatorIndex];

  const loadAssignmentsPageData = async () => {
    try {
      setIsLoading(true);
      setErrorMessage('');

      const [dronesData, operatorsData, assignmentsData] = await Promise.all([
        getDrones(),
        getOperators(),
        getAssignments(),
      ]);

      setDrones(dronesData);
      setOperators(operatorsData);
      setAssignments(assignmentsData);

      setSelectedDroneIndex(0);
      setSelectedOperatorIndex(0);
    } catch (error) {
      console.error(error);
      setErrorMessage('Não foi possível carregar os dados de atribuição.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAssignmentsPageData();
  }, []);

  const handlePreviousDrone = () => {
    if (drones.length === 0) return;

    setSelectedDroneIndex((currentIndex) =>
      currentIndex === 0 ? drones.length - 1 : currentIndex - 1
    );
  };

  const handleNextDrone = () => {
    if (drones.length === 0) return;

    setSelectedDroneIndex((currentIndex) =>
      currentIndex === drones.length - 1 ? 0 : currentIndex + 1
    );
  };

  const handlePreviousOperator = () => {
    if (operators.length === 0) return;

    setSelectedOperatorIndex((currentIndex) =>
      currentIndex === 0 ? operators.length - 1 : currentIndex - 1
    );
  };

  const handleNextOperator = () => {
    if (operators.length === 0) return;

    setSelectedOperatorIndex((currentIndex) =>
      currentIndex === operators.length - 1 ? 0 : currentIndex + 1
    );
  };

  const handleCreateAssignment = async () => {
    if (!selectedDrone || !selectedOperator) {
      setErrorMessage('Selecione um drone e um operador antes de atribuir.');
      return;
    }

    try {
      setIsCreatingAssignment(true);
      setErrorMessage('');

      await createAssignment(selectedOperator.id, selectedDrone.id);
      await loadAssignmentsPageData();
    } catch (error) {
      console.error(error);
      setErrorMessage(error.message || 'Erro ao criar atribuição.');
    } finally {
      setIsCreatingAssignment(false);
    }
  };

  const handleUnassignDrone = async (assignmentId) => {
    try {
      setIsUnassigning(true);
      setErrorMessage('');

      await unassignDrone(assignmentId);
      await loadAssignmentsPageData();
    } catch (error) {
      console.error(error);
      setErrorMessage(error.message || 'Erro ao desatribuir drone.');
    } finally {
      setIsUnassigning(false);
    }
  };

  if (isLoading) {
    return (
      <div className="assignments-page">
        <Sidebar variant="admin" />

        <main className="assignments-main">
          <header className="assignments-header">
            <h1>Atribuição de operadores</h1>
          </header>

          <section className="assignment-selector">
            <p>Carregando dados...</p>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="assignments-page">
      <Sidebar variant="admin" />

      <main className="assignments-main">
        <header className="assignments-header">
          <h1>Atribuição de operadores</h1>
        </header>

        {errorMessage && (
          <div className="assignments-error-message">
            {errorMessage}
          </div>
        )}

        <section className="assignment-selector">
          <article className="selected-drone-card">
            <img
              className="selected-drone-image"
              src={droneImg}
              alt={
                selectedDrone
                  ? `Drone ${selectedDrone.name}`
                  : 'Drone não selecionado'
              }
            />

            <div className="selected-drone-body">
              <div className="selected-drone-info">
                <h2>{selectedDrone ? selectedDrone.name : 'Sem drone'}</h2>

                <p>
                  {selectedDrone
                    ? selectedDrone.model
                    : 'Modelo não disponível'}
                </p>

                <div className="drone-status-row">
                  <span>▮ Bateria</span>
                  <strong>{formatPercentage(selectedDrone?.battery)}</strong>
                </div>

                <div className="drone-status-row">
                  <span>⌁ Sinal</span>
                  <strong>{formatPercentage(selectedDrone?.signal)}</strong>
                </div>
              </div>

              <div className="selector-arrows">
                <button type="button" onClick={handlePreviousDrone}>
                  ←
                </button>

                <button type="button" onClick={handleNextDrone}>
                  →
                </button>
              </div>
            </div>
          </article>

          <div className="assignment-action">
            <span className="assignment-link-icon">∞</span>

            <button
              type="button"
              onClick={handleCreateAssignment}
              disabled={isCreatingAssignment}
            >
              {isCreatingAssignment ? 'Atribuindo...' : '+ Atribuir'}
            </button>
          </div>

          <article className="selected-operator-card">
            <div className="operator-avatar">
              <span>{selectedOperator ? selectedOperator.initial : '?'}</span>
            </div>

            <div className="selected-operator-body">
              <div className="selected-operator-info">
                <h2>
                  {selectedOperator ? selectedOperator.name : 'Sem operador'}
                </h2>

                <p>
                  {selectedOperator
                    ? selectedOperator.role
                    : 'Função não disponível'}
                </p>

                {selectedOperator && (
                  <span
                    className={`operator-online-status ${
                      selectedOperator.isOnline ? 'online' : 'offline'
                    }`}
                  >
                    {selectedOperator.isOnline ? 'Online' : 'Offline'}
                  </span>
                )}
              </div>

              <div className="selector-arrows">
                <button type="button" onClick={handlePreviousOperator}>
                  ←
                </button>

                <button type="button" onClick={handleNextOperator}>
                  →
                </button>
              </div>
            </div>
          </article>
        </section>

        <section className="latest-assignments">
          <h2>Últimas atribuições</h2>

          <div className="latest-assignments-grid">
            {assignments.slice(0, 4).map((assignment) => (
              <article
                className={`assignment-card ${
                  assignment.isActive
                    ? 'assignment-card-active'
                    : 'assignment-card-inactive'
                }`}
                key={assignment.id}
              >
                <div className="assignment-drone-mini-card">
                  <img
                    src={droneImg}
                    alt={`Drone ${assignment.droneName}`}
                  />

                  <div>
                    <h3>{assignment.droneName}</h3>
                    <p>{assignment.droneModel}</p>
                  </div>
                </div>

                <span className="assignment-card-link">∞</span>

                <div className="assignment-operator-mini-card">
                  <div>
                    <span>{assignment.operatorInitial}</span>
                  </div>

                  <h3>{assignment.operatorName}</h3>

                  <p>
                    {assignment.operatorIsOnline ? 'Online' : 'Offline'}
                  </p>
                </div>

                <time>{formatAssignedAt(assignment.assignedAt)}</time>

                {assignment.isActive && (
                  <button
                    type="button"
                    className="unassign-button"
                    onClick={() => handleUnassignDrone(assignment.id)}
                    disabled={isUnassigning}
                  >
                    {isUnassigning ? '...' : 'Desatribuir'}
                  </button>
                )}
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Assignments;