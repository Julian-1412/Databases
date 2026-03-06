// Router de Express permite definir rutas en archivos separados
const { Router } = require('express');
const router = Router();

// Importamos las funciones del controlador
const {
  createCar,
  getAllCars,
  getCarByPlate,
  updateCar,
  deleteCar,
} = require('../controllers/car.controller');

// Cada línea define: método HTTP + path + función que se ejecuta
router.post('/',          createCar);      // POST   /api/cars
router.get('/',           getAllCars);     // GET    /api/cars
router.get('/:plate',     getCarByPlate); // GET    /api/cars/ABC123
router.put('/:id',        updateCar);     // PUT    /api/cars/5
router.delete('/:id',     deleteCar);     // DELETE /api/cars/5

module.exports = router;
