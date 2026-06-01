import React from 'react';
import '../styles/DroneCard.css';

const BatteryIcon = () => (
  <span className="icon-battery">
    <span className="icon-battery__fill" />
  </span>
);

const SignalIcon = () => (
  <span className="icon-signal">
    <span /><span /><span /><span />
  </span>
);

const BaseIcon = () => (
  <span className="icon-base">
    <span /><span /><span /><span />
  </span>
);

const LockIcon = () => (
  <span className="icon-lock">
    <span className="icon-lock__shackle" />
    <span className="icon-lock__body" />
  </span>
);

const OfflineIcon = () => (
  <span className="icon-offline" />
);

const getBatteryClass = (battery) => {
  if (battery !== undefined && battery < 20) return 'drone-card__info-value--low';
  return 'drone-card__info-value';
};

const getSignalClass = (signal) => {
  if (signal === 'Forte') return 'drone-card__info-value--strong';
  if (signal === 'Fraco') return 'drone-card__info-value--weak';
  return 'drone-card__info-value';
};

const DroneCard = ({ drone }) => {
  return (
    <article className="drone-card">
      <header className="drone-card__image-wrap">
        <img
          src={drone.imageUrl || ''}
          alt={`Drone ${drone.name}`}
          className="drone-card__image"
        />
        <span className={`drone-card__status ${drone.isOnline ? 'drone-card__status--online' : 'drone-card__status--offline'}`}>
          {drone.isOnline
            ? <span className="drone-card__status-dot" />
            : <OfflineIcon />
          }
          {drone.isOnline ? 'Online' : 'Offline'}
        </span>
      </header>

      <div className="drone-card__content">
        <h3 className="drone-card__name">{drone.name}</h3>
        <p className="drone-card__model">{drone.model}</p>

        <ul className="drone-card__info">
          <li className="drone-card__info-row">
            <span className="drone-card__info-label">
              <BatteryIcon /> Bateria
            </span>
            <span className={getBatteryClass(drone.battery)}>
              {drone.battery !== undefined ? `${drone.battery}%` : '-'}
            </span>
          </li>
          <li className="drone-card__info-row">
            <span className="drone-card__info-label">
              <SignalIcon /> Sinal
            </span>
            <span className={getSignalClass(drone.signal)}>
              {drone.signal || '-'}
            </span>
          </li>
          <li className="drone-card__info-row">
            <span className="drone-card__info-label">
              <BaseIcon /> Base
            </span>
            <span className="drone-card__info-value">{drone.base || '-'}</span>
          </li>
        </ul>

        {drone.isAvailable ? (
          <button type="button" className="drone-card__btn drone-card__btn--connect">
            Conectar
          </button>
        ) : (
          <button type="button" disabled className="drone-card__btn drone-card__btn--unavailable">
            <LockIcon /> Indisponível
          </button>
        )}
      </div>
    </article>
  );
};

export default DroneCard;
