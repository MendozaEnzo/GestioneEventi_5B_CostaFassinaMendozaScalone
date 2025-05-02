const fs = require('fs');
const mysql = require('mysql2');

let conf = JSON.parse(fs.readFileSync('public/conf.json'));
conf.ssl = {
    ca: fs.readFileSync(__dirname + '/ca.pem')
};

const connection = mysql.createConnection(conf);

const executeQuery = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        connection.query(sql, params, (err, result) => {
            if (err) {
                console.error(err);
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
};

const database = {
    createTables: async () => {
        try {
            await executeQuery(`
                CREATE TABLE IF NOT EXISTS utente (
                    id INT PRIMARY KEY AUTO_INCREMENT,
                    nome VARCHAR(50),
                    email VARCHAR(100) UNIQUE,
                    password VARCHAR(255)
                )
            `);

            await executeQuery(`
                CREATE TABLE IF NOT EXISTS evento (
                    id INT PRIMARY KEY AUTO_INCREMENT,
                    titolo VARCHAR(100),
                    descrizione TEXT,
                    data DATE,
                    creatore_id INT,
                    FOREIGN KEY (creatore_id) REFERENCES utente(id)
                );
            `);

            await executeQuery(`
                CREATE TABLE IF NOT EXISTS invito (
                    evento_id INT,
                    utente_mittente_id INT,
                    utente_destinatario_id INT,
                    stato VARCHAR(20),
                    data DATETIME,
                    PRIMARY KEY (evento_id, utente_destinatario_id),
                    FOREIGN KEY (evento_id) REFERENCES evento(id),
                    FOREIGN KEY (utente_mittente_id) REFERENCES utente(id),
                    FOREIGN KEY (utente_destinatario_id) REFERENCES utente(id)
                )
            `);

            await executeQuery(`
                CREATE TABLE IF NOT EXISTS partecipa (
                    id_utente INT,
                    id_evento INT,
                    PRIMARY KEY (id_utente, id_evento),
                    FOREIGN KEY (id_utente) REFERENCES utente(id),
                    FOREIGN KEY (id_evento) REFERENCES evento(id)
                )
            `);

            await executeQuery(`
                CREATE TABLE IF NOT EXISTS post (
                    id INT PRIMARY KEY AUTO_INCREMENT,
                    tipo VARCHAR(20),
                    data_post DATETIME,
                    autore_id INT,
                    evento_id INT,
                    FOREIGN KEY (autore_id) REFERENCES utente(id),
                    FOREIGN KEY (evento_id) REFERENCES evento(id)
                )
            `);

            await executeQuery(`
                CREATE TABLE IF NOT EXISTS contenuto (
                    id INT PRIMARY KEY AUTO_INCREMENT,
                    url TEXT,
                    tipo VARCHAR(20),
                    id_post INT,
                    FOREIGN KEY (id_post) REFERENCES post(id)
                );
            `);

        } catch (error) {
            console.error("Errore nella creazione delle tabelle:", error);
        }
    },

    // INSERTS
    insertUtente: ({ nome, email, password }) => {
        return executeQuery(`
            INSERT INTO utente (nome, email, password)
            VALUES (?, ?, ?)`, [nome, email, password]);
    },

    insertEvento: ({ titolo, descrizione, data, creatore_id }) => {
        return executeQuery(`
            INSERT INTO evento (titolo, descrizione, data, creatore_id)
            VALUES (?, ?, ?, ?)`, [titolo, descrizione, data, creatore_id]);
    },

    invitaUtente: (evento_id, mittente_id, destinatario_id, stato, data) => {
        return executeQuery(`
            INSERT INTO invito (evento_id, utente_mittente_id, utente_destinatario_id, stato, data)
            VALUES (?, ?, ?, ?, ?)`, [evento_id, mittente_id, destinatario_id, stato, data]);
    },

    partecipaEvento: (idUtente, idEvento) => {
        return executeQuery(`
            INSERT IGNORE INTO partecipa (id_utente, id_evento)
            VALUES (?, ?)`, [idUtente, idEvento]);
    },

    inserisciPost: ({ tipo, data_post, autore_id, evento_id }) => {
        return executeQuery(`
            INSERT INTO post (tipo, data_post, autore_id, evento_id)
            VALUES (?, ?, ?, ?)`, [tipo, data_post, autore_id, evento_id]);
    },

    inserisciContenuto: ({ url, tipo, id_post }) => {
        return executeQuery(`
            INSERT INTO contenuto (url, tipo, id_post)
            VALUES (?, ?, ?)`, [url, tipo, id_post]);
    },

    // GETS
    getUtenti: () => {
        return executeQuery(`SELECT * FROM utente`);
    },

    getUtenteById: (id) => {
        return executeQuery(`SELECT * FROM utente WHERE id = ?`, [id]);
    },

    getEventi: () => {
        return executeQuery(`
            SELECT evento.*, utente.nome AS creatore
            FROM evento
            JOIN utente ON evento.creatore_id = utente.id;


        `);
    },


    getEventiByCreatore: (creatore_id) => {
        return executeQuery(`SELECT * FROM evento 
            WHERE creatore_id = ?`, [creatore_id]);
    },
    getEventoById: (id) => {
        return executeQuery(`
            SELECT evento.*, utente.nome AS creatore
            FROM evento
            JOIN utente ON evento.creatore_id = utente.id
            WHERE evento.id = ?`, [id]);
    },
    
    getPartecipantiEvento: (evento_id) => {
        return executeQuery(`
            SELECT u.* FROM partecipa p
            JOIN utente u ON p.id_utente = u.id
            WHERE p.id_evento = ?`, [evento_id]);
    },
    

    getInvitiByUtente: (utente_id) => {
        return executeQuery(`
            SELECT * FROM invito
            WHERE utente_destinatario_id = ?`, [utente_id]);
    },

    getPartecipazioniByUtente: (utente_id) => {
        return executeQuery(`
            SELECT e.* FROM partecipa p
            JOIN evento e ON p.id_evento = e.id
            WHERE p.id_utente = ?`, [utente_id]);
    },

    getPostByEvento: (evento_id) => {
        return executeQuery(`
            SELECT * FROM post WHERE evento_id = ?`, [evento_id]);
    },

    getContenutiByPost: (post_id) => {
        return executeQuery(`
            SELECT * FROM contenuto WHERE id_post = ?`, [post_id]);
    },

    getPostConContenuti: (post_id) => {
        return executeQuery(`
            SELECT p.*, c.id AS contenuto_id, c.url, c.tipo AS tipo_contenuto
            FROM post p
            LEFT JOIN contenuto c ON p.id = c.id_post
            WHERE p.id = ?`, [post_id]);
    },
    updateEvento: (id, { titolo, descrizione, data }) => {
        return executeQuery(`
            UPDATE evento
            SET titolo = ?, descrizione = ?, data = ?
            WHERE id = ?
        `, [titolo, descrizione, data, id]);
    },
    deleteEvento: (id) => {
        return executeQuery(`
            DELETE FROM evento WHERE id = ?
        `, [id]);
    }
        
};

module.exports = database;
