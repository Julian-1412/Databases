const express = require('express');
const router = express.Router();
const User = require('../models/User'); // Importamos el  modelo de la BD para usuarios

// CREAR usuario
router.post('/', async (req, res) => {
    try {
        const nuevoUsuario = new User(req.body);
        await nuevoUsuario.save();
        res.status(201).json(nuevoUsuario);
    } catch (error) {
        res.status(400).json({ mensaje: "Error al crear usuario", detalles: error.message });
    }
});

// OBTENER todos los usuarios
router.get('/', async (req, res) => {
    try {
        const usuarios = await User.find();
        res.json(usuarios);
    } catch (error) {
        res.status(500).json({ mensaje: "Error al obtener usuarios" });
    }
});

// ACTUALIZAR usuario por ID
router.put('/:id', async (req, res) => {
    try {
        const usuarioActualizado = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(usuarioActualizado);
    } catch (error) {
        res.status(400).json({ mensaje: "Error al actualizar" });
    }
});

// ELIMINAR usuario
router.delete('/:id', async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ mensaje: "Usuario eliminado correctamente" });
    } catch (error) {
        res.status(500).json({ mensaje: "Error al eliminar" });
    }
});

module.exports = router;