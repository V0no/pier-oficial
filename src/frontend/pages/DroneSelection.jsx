import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import DroneCard from '../components/DroneCard';
import '../styles/DroneSelection.css';
import API_BASE_URL from '../services/api';

const DroneSelection = () => {
  const [drones, setDrones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [availableCount, setAvailableCount] = useState(0);
  const [activeCount, setActiveCount] = useState(0);

  useEffect(() => {
    const fetchDrones = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/drones?limit=100`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();

        const mapped = data.drones.map(d => ({
          id: d.id,
          name: d.name,
          model: d.model,
          imageUrl: d.imageUrl || null,
          isOnline: d.status === 'Em uso',
          isAvailable: d.status === 'Disponível',
          battery: d.battery,
          signal: d.signal,
          base: d.base,
        }));

        setDrones(mapped);
        setAvailableCount(mapped.filter(d => d.isAvailable).length);
        setActiveCount(mapped.filter(d => d.isOnline).length);
      } catch (error) {
        console.error('Erro ao buscar drones:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDrones();
  }, []);

  return (
    <div className="drone-page">
      <Sidebar />

      <main className="drone-page__main">
        <header>
          <span className="drone-page__label">Drone</span>
          <h1 className="drone-page__title">Seleção de drone</h1>
          <p className="drone-page__description">Escolha o drone para iniciar o monitoramento remoto</p>
        </header>

        <section className="drone-page__stats">
          <span className="drone-page__stat drone-page__stat--filled">{availableCount} disponíveis</span>
          <span className="drone-page__stat drone-page__stat--outlined">{activeCount} ativos</span>
        </section>

        <section>
          {loading ? (
            <p className="drone-page__empty">Carregando drones...</p>
          ) : drones.length === 0 ? (
            <p className="drone-page__empty">Nenhum drone encontrado.</p>
          ) : (
            <div className="drone-page__grid">
              {drones.map(drone => (
                <DroneCard key={drone.id} drone={drone} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default DroneSelection;