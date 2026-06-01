-- Habilita a extensão para geração de UUID
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$
BEGIN
    /*User role*/
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('Administrador', 'Operador');
    END IF;

    /*Drone model*/
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'model_drone') THEN
        CREATE TYPE model_drone AS ENUM ('DJI Tello', 'DJI 2', 'DJI 3');
    END IF;

    /*Status drone*/
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'status_drone') THEN
        CREATE TYPE status_drone AS ENUM ('Disponível', 'Em manutenção', 'Em uso');
    END IF;

    /*Status operation*/
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'status_op') THEN
        CREATE TYPE status_op AS ENUM ('Em andamento', 'Concluída');
    END IF;

    /*Plate type*/
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'plate_type') THEN
        CREATE TYPE plate_type AS ENUM ('Mercosul', 'Antiga');
    END IF;

    /*Status vehicle*/
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'status_vehicle') THEN
        CREATE TYPE status_vehicle AS ENUM ('Seguro', 'Roubado');
    END IF;

END $$;

-- Drone
CREATE TABLE IF NOT EXISTS drone (
    id           SERIAL PRIMARY KEY,
    name_drone   VARCHAR(225) NOT NULL UNIQUE,
    model_drone  model_drone  DEFAULT 'DJI Tello',
    status_drone status_drone DEFAULT 'Disponível',
    battery      INT          DEFAULT 100,
    signal       VARCHAR(10),
    base         VARCHAR(100),
    image_url    TEXT
);

-- User
CREATE TABLE IF NOT EXISTS "user" (
    id           SERIAL PRIMARY KEY,
    name         VARCHAR(255),
    email        VARCHAR(255) NOT NULL UNIQUE,
    password     VARCHAR(255) NOT NULL,
    role         user_role DEFAULT 'Operador',
    drone_id     INT,
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ultimo_ping  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    esta_online  BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (drone_id) REFERENCES drone(id)
);

-- Operation
CREATE TABLE IF NOT EXISTS operation (
    id          SERIAL PRIMARY KEY,
    user_id     INT NOT NULL,
    drone_id    INT NOT NULL,
    started_at  TIMESTAMP,
    finished_at TIMESTAMP,
    status_op   status_op DEFAULT 'Em andamento',
    FOREIGN KEY (user_id)  REFERENCES "user"(id),
    FOREIGN KEY (drone_id) REFERENCES drone(id)
);

-- Vehicle
CREATE TABLE IF NOT EXISTS vehicle (
    id             SERIAL PRIMARY KEY,
    license_plate  VARCHAR(10)  NOT NULL UNIQUE,
    status_vehicle status_vehicle DEFAULT 'Seguro',
    plate_type     plate_type     DEFAULT 'Mercosul',
    vehicle_color  VARCHAR(255) CHECK (vehicle_color = LOWER(vehicle_color)),
    vehicle_model  VARCHAR(255) CHECK (vehicle_model = LOWER(vehicle_model)),
    vehicle_brand  VARCHAR(255) CHECK (vehicle_brand = LOWER(vehicle_brand)),
    registered_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Detection
CREATE TABLE IF NOT EXISTS detection (
    id           SERIAL PRIMARY KEY,
    operation_id INT  NOT NULL,
    vehicle_id   INT  NOT NULL,
    plate_read   VARCHAR(10) NOT NULL,
    longitude    NUMERIC(10, 7) NOT NULL,
    latitude     NUMERIC(10, 7) NOT NULL,
    image_url    TEXT,
    has_match    BOOLEAN DEFAULT FALSE,
    detected_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (operation_id) REFERENCES operation(id),
    FOREIGN KEY (vehicle_id)   REFERENCES vehicle(id)
);

-- Assimilação drone-operador
CREATE TABLE IF NOT EXISTS drone_assignment (
    id            SERIAL PRIMARY KEY,
    user_id       INT NOT NULL,
    drone_id      INT NOT NULL,
    assigned_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    unassigned_at TIMESTAMP,
    is_active     BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (user_id)  REFERENCES "user"(id),
    FOREIGN KEY (drone_id) REFERENCES drone(id)
);