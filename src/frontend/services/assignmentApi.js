const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
const API_BASE_PATH = API_BASE_URL + "/api";

export async function getDrones() {
  const response = await fetch(`${API_BASE_PATH}/drones`);

  if (!response.ok) {
    throw new Error('Erro ao buscar drones');
  }

  return response.json();
}

export async function getOperators() {
  const response = await fetch(`${API_BASE_PATH}/operators`);

  if (!response.ok) {
    throw new Error('Erro ao buscar operadores');
  }

  return response.json();
}

export async function getAssignments() {
  const response = await fetch(`${API_BASE_PATH}/assignments`);

  if (!response.ok) {
    throw new Error('Erro ao buscar atribuições');
  }

  return response.json();
}

export async function createAssignment(userId, droneId) {
  const response = await fetch(`${API_BASE_PATH}/assignments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      userId,
      droneId,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Erro ao criar atribuição');
  }

  return data;
}

export async function unassignDrone(assignmentId) {
  const response = await fetch(`${API_BASE_PATH}/assignments/${assignmentId}/unassign`, {
    method: 'PATCH',
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Erro ao desatribuir drone');
  }

  return data;
}