import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import placaImg from '../../../docs/static/img/placa.png';
import '../styles/DroneVisu.css';

const detectedPlatesMock = [
  {
    plate: 'GHI-9012',
    address: 'Av. Brigadeiro, 200',
    status: 'Seguro',
    confidence: 94,
  },
  {
    plate: 'XYZ-9876',
    address: 'Rua Augusta, 180',
    status: 'Seguro',
    confidence: 91,
  },
  {
    plate: 'DEF-5668',
    address: 'Av. Paulista, 1578',
    status: 'Roubado',
    confidence: 96,
  },
];

const DroneVisu = () => {
  const navigate = useNavigate();

  const [operationSeconds, setOperationSeconds] = useState(20 * 60);
  const [visiblePlates, setVisiblePlates] = useState([]);
  const [currentScanIndex, setCurrentScanIndex] = useState(0);
  const [isScanning, setIsScanning] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setOperationSeconds((currentSeconds) => currentSeconds + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (currentScanIndex >= detectedPlatesMock.length) {
      setIsScanning(false);
      return;
    }

    const scanTimer = setTimeout(() => {
      setVisiblePlates((currentPlates) => [
        ...currentPlates,
        detectedPlatesMock[currentScanIndex],
      ]);

      setCurrentScanIndex((currentIndex) => currentIndex + 1);
    }, 1800);

    return () => clearTimeout(scanTimer);
  }, [currentScanIndex]);

  const minutes = Math.floor(operationSeconds / 60);
  const seconds = operationSeconds % 60;

  const alertCount = visiblePlates.filter(
    (plate) => plate.status === 'Roubado'
  ).length;

  const lastPlate = visiblePlates[visiblePlates.length - 1];

  return (
    <div className="drone-visu-page">
      <Sidebar variant="drone" />

      <main className="drone-visu-main">
        <div className="drone-radar-glow"></div>

        <header className="drone-visu-header">
          <h1>Drone</h1>
        </header>

        <section className="drone-visu-content">
          <div className="operation-info-row">
            <p className="operation-time">
              Tempo de operação:{' '}
              <strong>
                {minutes} min {String(seconds).padStart(2, '0')} s
              </strong>
            </p>

            <div className="operation-status">
              <span className="status-pulse"></span>
              {isScanning ? 'Detectando placas...' : 'Varredura concluída'}
            </div>
          </div>

          <div className="operation-metrics">
            <article>
              <span>{visiblePlates.length}</span>
              <p>Placas lidas</p>
            </article>

            <article>
              <span>{alertCount}</span>
              <p>Alertas</p>
            </article>

            <article>
              <span>Estável</span>
              <p>Sinal do drone</p>
            </article>
          </div>

          {lastPlate && (
            <div
              className={`last-detection ${
                lastPlate.status === 'Roubado' ? 'last-detection-alert' : ''
              }`}
            >
              <strong>Última leitura:</strong> {lastPlate.plate} —{' '}
              {lastPlate.confidence}% de confiança
            </div>
          )}

          {alertCount > 0 && (
            <div className="stolen-alert">
              Atenção: veículo com ocorrência identificado durante a operação.
            </div>
          )}

          <div className="plate-image-wrapper">
            <img
              className="plate-image"
              src={placaImg}
              alt="Placa detectada pelo drone"
            />
          </div>

          <section className="plates-panel">
            <div className="plates-list">
              {visiblePlates.map((plate) => (
                <article
                  className={`plate-card ${
                    plate.status === 'Roubado' ? 'plate-card-alert' : ''
                  }`}
                  key={plate.plate}
                >
                  <h2>{plate.plate}</h2>
                  <p>{plate.address}</p>

                  <span
                    className={`plate-status ${
                      plate.status === 'Roubado'
                        ? 'plate-status-stolen'
                        : 'plate-status-safe'
                    }`}
                  >
                    {plate.status}
                  </span>
                </article>
              ))}

              {isScanning && visiblePlates.length < 3 && (
                <article className="plate-card plate-card-loading">
                  <h2>---</h2>
                  <p>Buscando nova placa...</p>
                  <span className="scan-badge">OCR ativo</span>
                </article>
              )}
            </div>

            <div className="history-button-wrapper">
              {alertCount > 0 && (
                <button
                  type="button"
                  className="action-team-button"
                >
                  Acionar equipe
                </button>
              )}

              <button
                type="button"
                className="history-button"
                onClick={() => navigate('/history')}
              >
                Ver histórico completo
              </button>
            </div>
          </section>
        </section>
      </main>
    </div>
  );
};

export default DroneVisu;