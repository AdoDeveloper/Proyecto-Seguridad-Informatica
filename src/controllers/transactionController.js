const { Op } = require('sequelize');
const Transaction = require('../models/Transaction'); // Modelo Sequelize de transacciones
const User = require('../models/User'); // Modelo Sequelize de usuario

// Obtener transacciones del usuario autenticado
exports.getUserTransactions = async (req, res) => {
    try {
        // Obtener las transacciones donde el usuario sea el emisor o el receptor
        const transactions = await Transaction.findAll({
            where: {
                [Op.or]: [
                    { user_id: req.user.id },  // Si el usuario es el emisor
                    { destination_user_id: req.user.id }  // Si el usuario es el receptor
                ]
            },
            include: [
                {
                    model: User,
                    as: 'user', // Emisor
                    attributes: ['username', 'role', 'account_number'] // Incluir datos del usuario que hizo la transacción
                },
                {
                    model: User,
                    as: 'destination', // Receptor
                    attributes: ['username'] // Incluir el username del receptor
                }
            ]
        });

        res.render('pages/dashboard', { transactions }); // Pasamos las transacciones a la vista
    } catch (error) {
        console.error('Error al obtener transacciones del usuario:', error);
        return res.render('errors/500', { error: 'Hubo un problema al cargar tus transacciones. Por favor, intenta nuevamente.' });
    }
};

// Función para agregar timeout a las operaciones asíncronas
const timeoutPromise = (ms) => new Promise((_, reject) => setTimeout(() => reject(new Error('Tiempo de espera excedido')), ms));

exports.getUserTransactionsJSON = async (req, res) => {
    try {
        // Establecer el límite de tiempo en 4 segundos (4000 ms)
        const timeout = 4000;

        // Usar Promise.race para competir entre la consulta y el timeout
        const userPromise = User.findByPk(req.user.id, {
            attributes: ['id', 'username', 'role', 'balance', 'account_number'], // Incluir account_number
        }).then(user => {
            if (!user) {
                throw new Error('Usuario no encontrado');
            }
            return user;
        });

        const transactionsPromise = Transaction.findAll({
            where: {
                [Op.or]: [
                    { user_id: req.user.id },  // Si el usuario es el emisor
                    { destination_user_id: req.user.id }  // Si el usuario es el receptor
                ]
            },
            include: [
                {
                    model: User,
                    as: 'user', // Emisor
                    attributes: ['username', 'role', 'account_number']
                },
                {
                    model: User,
                    as: 'destination', // Receptor
                    attributes: ['username']
                }
            ]
        });

        // Usar Promise.race para garantizar que no pase el tiempo límite
        const [user, transactions] = await Promise.race([
            Promise.all([userPromise, transactionsPromise]),  // Ejecutar ambas promesas
            timeoutPromise(timeout)  // Si algo toma más de 4 segundos, se rechaza con el error de timeout
        ]);

        // Retornar las transacciones, saldo y número de cuenta en formato JSON
        res.json({ transactions, balance: user.balance, account_number: user.account_number });
    } catch (error) {
        console.error('Error al obtener transacciones del usuario:', error);
        if (error.message === 'Tiempo de espera excedido') {
            return res.status(408).json({ error: 'La solicitud ha excedido el tiempo de espera. Intenta nuevamente.' });
        }
        return res.status(500).res.render('errors/500').json({ error: 'Hubo un problema al cargar tus transacciones. Por favor, intenta nuevamente.' });
    }
};

// Obtener todas las transacciones (para administradores)
exports.getAllTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.findAll({
            include: [{
                model: User,
                as: 'user',
                attributes: ['username', 'role']
            }]
        });
        res.render('pages/admin_dashboard', { transactions });
    } catch (error) {
        console.error('Error al obtener todas las transacciones:', error);
        res.status(500).send('Hubo un problema al cargar las transacciones. Por favor, intenta nuevamente.');
    }
};

// Obtener formulario para crear una nueva transacción
exports.getFormCreateTransaction = async (req, res) => {
    try {
        res.render('pages/transaction_form');
    } catch (error) {
        console.error('Error al obtener el formulario');
        return res.render('errors/500', { error: 'Hubo un problema al cargar el formulario de transacción. Por favor, intenta nuevamente.' });
    }
};

// Crear una nueva transacción
exports.createTransaction = async (req, res) => {
    const { amount, description, type, destinationAccountNumber } = req.body;

    try {
        // Validar inputs
        if (!amount || isNaN(amount)) {
            return res.status(400).render('pages/transaction_form', { error: 'Monto inválido. Por favor verifica los campos.' });
        }

        // Convertir amount a número
        const amountNumeric = parseFloat(amount);

        // Si es un Egreso, validamos el número de cuenta de destino
        let destinationUser;
        if (type === 'expense' && !destinationAccountNumber) {
            return res.status(400).render('pages/transaction_form', { error: 'Por favor proporciona el número de cuenta de destino.' });
        }

        if (type === 'expense') {
            destinationUser = await User.findOne({ where: { account_number: destinationAccountNumber } });
            if (!destinationUser) {
                return res.status(400).render('pages/transaction_form', { error: 'El número de cuenta de destino no existe.' });
            }
        }

        // Validar que el usuario emisor tiene saldo suficiente en caso de un Egreso
        const senderUser = await User.findByPk(req.user.id);
        if (type === 'expense' && senderUser.balance < amountNumeric) {
            return res.status(400).render('pages/transaction_form', { error: 'Saldo insuficiente para realizar la transacción.' });
        }

        // Crear la transacción
        const transaction = await Transaction.create({
            user_id: req.user.id, // Usuario emisor
            destination_user_id: destinationUser ? destinationUser.id : null, // Usuario receptor (solo para egresos)
            amount: amountNumeric,
            type, // Tipo de transacción (Ingreso o Egreso)
            description: description || null
        });

        // Actualizar los saldos según el tipo de transacción
        if (type === 'expense') {
            // Restamos del saldo del usuario emisor
            senderUser.balance -= amountNumeric;
            await senderUser.save();

            // Sumamos al saldo del usuario receptor (destino)
            destinationUser.balance += amountNumeric;
            await destinationUser.save();
        } else if (type === 'income') {
            // Sumamos al saldo del usuario emisor (ingreso)
            senderUser.balance += amountNumeric;
            await senderUser.save();
        }

        res.redirect('/transactions/dashboard');
    } catch (error) {
        console.error('Error al crear transacción:', error);
        return res.render('errors/500', { error: 'Hubo un problema al registrar la transacción. Por favor, intenta nuevamente.' });
    }
};
