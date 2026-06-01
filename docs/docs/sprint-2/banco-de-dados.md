# Projeto de Banco de Dados

## Modelagem do Banco de Dados

### Modelo Relacional

O modelo relacional organiza os dados do sistema em tabelas, onde cada uma representa algo importante do projeto, como usuários, drones, veículos e detecções, junto com as informações de cada um. As tabelas se conectam por meio de chaves primárias e estrangeiras, o que permite relacionar os dados de forma organizada. Isso ajuda a manter tudo consistente no banco, sem precisar repetir várias vezes a mesma informação.

![Modelo Relacional](/img/modelo-relacional.png)

### Modelo Físico

```sql
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
    id SERIAL PRIMARY KEY,
    name_drone VARCHAR(225) NOT NULL UNIQUE,
    model_drone model_drone DEFAULT 'DJI Tello',
    status_drone status_drone DEFAULT 'Disponível'
);

-- User
CREATE TABLE IF NOT EXISTS "user" (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role user_role DEFAULT 'Operador',
    drone_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (drone_id) REFERENCES drone(id)
);

-- Operation
CREATE TABLE IF NOT EXISTS operation (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    drone_id INT NOT NULL,
    started_at TIMESTAMP,
    finished_at TIMESTAMP,
    status_op status_op DEFAULT 'Em andamento',
    FOREIGN KEY (user_id) REFERENCES "user"(id),
    FOREIGN KEY (drone_id) REFERENCES drone(id)
);

-- Vehicle
CREATE TABLE IF NOT EXISTS vehicle (
    id SERIAL PRIMARY KEY,
    license_plate VARCHAR(10) NOT NULL UNIQUE,
    status_vehicle status_vehicle DEFAULT 'Seguro',
    plate_type plate_type DEFAULT 'Mercosul',
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Detection
CREATE TABLE IF NOT EXISTS detection (
    id SERIAL PRIMARY KEY,
    operation_id INT NOT NULL,
    vehicle_id INT NOT NULL,
    plate_read VARCHAR(10) NOT NULL,
    longitude NUMERIC(10, 7) NOT NULL,
    latitude NUMERIC(10, 7) NOT NULL,
    image_url TEXT,
    has_match BOOLEAN DEFAULT FALSE,
    detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (operation_id) REFERENCES operation(id),
    FOREIGN KEY (vehicle_id) REFERENCES vehicle(id)
);

-- Vehicle-operation
CREATE TABLE IF NOT EXISTS vehicle_operation (
    id SERIAL PRIMARY KEY,
    vehicle_id INT NOT NULL,
    operation_id INT NOT NULL,
    FOREIGN KEY (vehicle_id) REFERENCES vehicle(id) ON DELETE CASCADE,
    FOREIGN KEY (operation_id) REFERENCES operation(id) ON DELETE CASCADE
);
```

O modelo físico é a etapa em que tudo o que foi planejado no modelo lógico passa a ser transformado em código e estruturas compreendidas pelo banco de dados. Nele, definimos como as tabelas serão criadas, quais tipos de dados cada coluna terá, os tipos Enumerados (Enums) responsáveis por limitar valores específicos e também regras de integridade, como o `ON DELETE CASCADE`, que garante a remoção automática de registros relacionados quando necessário.

---

## Dicionário de Dados

Para registrar de forma completa cada componente presente na estrutura do sistema, detalhamos abaixo os Enums utilizados para organizar determinados valores. Além disso, especificamos as características de cada tabela do banco de dados.

### Enums

Os tipos customizados foram criados para garantir maior controle e padronização dos dados armazenados.

* **`user_role`**: Define o nível de permissão do usuário (`'Administrador'`, `'Operador'`).
* **`model_drone`**: Define os modelos de drone disponíveis (`'DJI Tello'`, `'DJI 2'`, `'DJI 3'`).
* **`status_drone`**: Representa o estado operacional do drone (`'Disponível'`, `'Em manutenção'`, `'Em uso'`).
* **`status_op`**: Define a situação da operação (`'Em andamento'`, `'Concluída'`).
* **`plate_type`**: Define o padrão da placa do veículo (`'Mercosul'`, `'Antiga'`).
* **`status_vehicle`**: Define a situação do veículo (`'Seguro'`, `'Roubado'`).

### Estrutura das Tabelas

#### Tabela: `user`

Armazena as informações e credenciais dos usuários do sistema.

| Campo        | Tipo do Dado     | Restrições                | Descrição                                      |
| :----------- | :--------------- | :------------------------ | :--------------------------------------------- |
| `id`         | SERIAL           | PRIMARY KEY               | Identificador único do usuário.                |
| `email`      | VARCHAR(255)     | UNIQUE, NOT NULL          | E-mail utilizado para autenticação no sistema. |
| `password`   | VARCHAR(255)     | NOT NULL                  | Senha criptografada do usuário.                |
| `role`       | user_role (Enum) | DEFAULT 'Operador'        | Define o nível de permissão do usuário.        |
| `drone_id`   | INT              | FOREIGN KEY               | Referência ao drone associado ao usuário.      |
| `created_at` | TIMESTAMP        | DEFAULT CURRENT_TIMESTAMP | Data e horário de criação do cadastro.         |

#### Tabela: `drone`

Responsável pelo registro dos drones utilizados nas operações.

| Campo          | Tipo do Dado        | Restrições           | Descrição                                |
| :------------- | :------------------ | :------------------- | :--------------------------------------- |
| `id`           | SERIAL              | PRIMARY KEY          | Identificador único do drone.            |
| `name_drone`   | VARCHAR(225)        | UNIQUE, NOT NULL     | Nome utilizado para identificar o drone. |
| `model_drone`  | model_drone (Enum)  | DEFAULT 'DJI Tello'  | Modelo do drone cadastrado.              |
| `status_drone` | status_drone (Enum) | DEFAULT 'Disponível' | Situação operacional atual do drone.     |

#### Tabela: `operation`

Armazena o histórico das operações realizadas.

| Campo         | Tipo do Dado     | Restrições             | Descrição                                        |
| :------------ | :--------------- | :--------------------- | :----------------------------------------------- |
| `id`          | SERIAL           | PRIMARY KEY            | Identificador único da operação.                 |
| `user_id`     | INT              | NOT NULL, FOREIGN KEY  | Referência ao usuário responsável pela operação. |
| `drone_id`    | INT              | NOT NULL, FOREIGN KEY  | Referência ao drone utilizado na operação.       |
| `started_at`  | TIMESTAMP        |                        | Data e horário de início da operação.            |
| `finished_at` | TIMESTAMP        |                        | Data e horário de encerramento da operação.      |
| `status_op`   | status_op (Enum) | DEFAULT 'Em andamento' | Estado atual da operação.                        |

#### Tabela: `vehicle`

Armazena os veículos monitorados pelo sistema.

| Campo            | Tipo do Dado          | Restrições                | Descrição                               |
| :--------------- | :-------------------- | :------------------------ | :-------------------------------------- |
| `id`             | SERIAL                | PRIMARY KEY               | Identificador único do veículo.         |
| `license_plate`  | VARCHAR(10)           | UNIQUE, NOT NULL          | Placa do veículo cadastrada no sistema. |
| `status_vehicle` | status_vehicle (Enum) | DEFAULT 'Seguro'          | Situação atual do veículo.              |
| `plate_type`     | plate_type (Enum)     | DEFAULT 'Mercosul'        | Tipo de placa do veículo.               |
| `registered_at`  | TIMESTAMP             | DEFAULT CURRENT_TIMESTAMP | Data de cadastro do veículo.            |

#### Tabela: `detection`

Registra as detecções realizadas durante as operações.

| Campo          | Tipo do Dado  | Restrições                | Descrição                                                  |
| :------------- | :------------ | :------------------------ | :--------------------------------------------------------- |
| `id`           | SERIAL        | PRIMARY KEY               | Identificador único da detecção.                           |
| `operation_id` | INT           | NOT NULL, FOREIGN KEY     | Referência à operação em que a detecção ocorreu.           |
| `vehicle_id`   | INT           | NOT NULL, FOREIGN KEY     | Referência ao veículo associado à detecção.                |
| `plate_read`   | VARCHAR(10)   | NOT NULL                  | Placa identificada pela leitura OCR.                       |
| `longitude`    | NUMERIC(10,7) | NOT NULL                  | Longitude registrada no momento da detecção.               |
| `latitude`     | NUMERIC(10,7) | NOT NULL                  | Latitude registrada no momento da detecção.                |
| `image_url`    | TEXT          |                           | Caminho ou URL da imagem capturada.                        |
| `has_match`    | BOOLEAN       | DEFAULT FALSE             | Indica se houve correspondência com um veículo cadastrado. |
| `detected_at`  | TIMESTAMP     | DEFAULT CURRENT_TIMESTAMP | Data e horário da detecção.                                |

#### Tabela: `vehicle_operation`

Tabela associativa responsável por relacionar veículos e operações.

| Campo          | Tipo do Dado | Restrições            | Descrição                              |
| :------------- | :----------- | :-------------------- | :------------------------------------- |
| `id`           | SERIAL       | PRIMARY KEY           | Identificador único do relacionamento. |
| `vehicle_id`   | INT          | NOT NULL, FOREIGN KEY | Referência ao veículo relacionado.     |
| `operation_id` | INT          | NOT NULL, FOREIGN KEY | Referência à operação relacionada.     |

---
