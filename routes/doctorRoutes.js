// const express = require('express');
// const router = express.Router();
// const db = require('../db');

// // Register a doctor
// router.post('/api/register-doctor', (req, res) => {
//     const { doctorName, specialization, doctorDescription } = req.body;

//     // Basic validation
//     if (!doctorName || !specialization || !doctorDescription) {
//         return res.status(400).json({ error: 'All fields are required.' });
//     }

//     const insertQuery = 'INSERT INTO doctors (doctor_name, specialization, description) VALUES (?, ?, ?)';
//     db.query(insertQuery, [doctorName, specialization, doctorDescription], (err, result) => {
//         if (err) {
//             console.error('Error inserting doctor details:', err);
//             return res.status(500).json({ error: 'Internal Server Error' });
//         }
//         const doctorId = result.insertId; // Retrieve the inserted doctor's ID
//         res.status(200).json({ message: 'Doctor registered successfully!', doctorId });
//     });
// });

// // Fetch pending appointments for a doctor
// router.get('/api/manage-appointments', (req, res) => {
//     const { doctorId } = req.query;

//     // Basic validation
//     if (!doctorId) {
//         return res.status(400).json({ error: 'Doctor ID is required.' });
//     }

//     const query = 'SELECT * FROM appointments WHERE id_doctor = ? AND status = "pending"';
//     db.query(query, [doctorId], (err, appointments) => {
//         if (err) {
//             console.error('Error fetching appointments:', err);
//             return res.status(500).json({ error: 'Internal Server Error' });
//         }

//         res.status(200).json({ appointments });
//     });
// });

// // Accept or decline appointment
// router.put('/api/manage-appointments/:appointmentId', (req, res) => {
//     const { appointmentId } = req.params;
//     const { action } = req.body;

//     // Basic validation
//     if (!action || (action !== 'accept' && action !== 'decline')) {
//         return res.status(400).json({ error: 'Invalid action.' });
//     }

//     let status = '';
//     if (action === 'accept') {
//         status = 'accepted';
//     } else if (action === 'decline') {
//         status = 'declined';
//     }

//     const query = 'UPDATE appointments SET status = ? WHERE id_appointment = ?';
//     db.query(query, [status, appointmentId], (err, result) => {
//         if (err) {
//             console.error('Error updating appointment status:', err);
//             return res.status(500).json({ error: 'Internal Server Error' });
//         }

//         res.status(200).json({ message: `Appointment ${status} successfully!` });
//     });
// });

// module.exports = router;
const express = require('express');
const router = express.Router();
const db = require('../db');

// Register a doctor
// Register a doctor
router.post('/api/register-doctor', async (req, res) => {
    const { doctorName, specialization, doctorDescription, userId } = req.body; // Get userId from the request

    if (!doctorName || !specialization || !doctorDescription || !userId) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    const insertQuery = 'INSERT INTO doctors (doctor_name, specialization, description, userId) VALUES (?, ?, ?, ?)';

    try {
        const result = await new Promise((resolve, reject) => {
            db.query(insertQuery, [doctorName, specialization, doctorDescription, userId], (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });
        const doctorId = result.insertId;
        res.status(200).json({ message: 'Doctor registered successfully!', doctorId });
    } catch (err) {
        console.error('Error inserting doctor details:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});



// Fetch pending appointments for a doctor
router.get('/api/manage-appointments', async (req, res) => {
    const { doctorId } = req.query;

    if (!doctorId) {
        return res.status(400).json({ error: 'Doctor ID is required.' });
    }

    const query = `SELECT a.*, p.patient_name 
                   FROM appointments a
                   JOIN patients p ON a.id_patient = p.id_patient 
                   WHERE a.id_doctor = ? AND a.status = "pending"`;

    try {
        const appointments = await db.query(query, [doctorId]);
        res.status(200).json({ appointments });
    } catch (err) {
        console.error('Error fetching appointments:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Accept or decline appointment
router.put('/api/manage-appointments/:appointmentId', async (req, res) => {
    const { appointmentId } = req.params;
    const { action } = req.body;

    if (!action || (action !== 'accept' && action !== 'decline')) {
        return res.status(400).json({ error: 'Invalid action.' });
    }

    let status = '';
    if (action === 'accept') {
        status = 'accepted';
    } else if (action === 'decline') {
        status = 'declined';
    }

    const query = 'UPDATE appointments SET status = ? WHERE id_appointment = ?';

    try {
        await db.query(query, [status, appointmentId]);
        res.status(200).json({ message: `Appointment ${status} successfully!` });
    } catch (err) {
        console.error('Error updating appointment status:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;

