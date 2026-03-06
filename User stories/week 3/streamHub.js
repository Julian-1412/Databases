/*
//crear base de datos
use streamHub

//crear coleccion de usuarios
db.usuarios.insertOne({
  nombre: "Julian",
  email: "julian@email.com",
  edad: 25,
  pais: "Colombia",
  fechaRegistro: new Date(),
  historial: []
})

streamHub> db.usuarios.insertOne({
   nombre: "Laura",
   email: "laura@email.com",
   edad: 30,
   pais: "México",
   fechaRegistro: new Date(),
   historial: []
 })

 db.usuarios.insertMany([ {
    nombre: "Andrea",
    email: "andrea@email.com",
    edad: 22,
    pais: "El Congo",
    fechaRegistro: new Date(),
    historial: []
  },
 {
    nombre: "Carlos",
    email: "carlos@email.com",
    edad: 29,
    pais: "Peru",
    fechaRegistro: new Date(),
    historial: []
  },
 {
    nombre: "Dayro",
    email: "Dayro@email.com",
    edad: 32,
    pais: "El Salvador",
    fechaRegistro: new Date(),
    historial: []
  }])

//creaer coleccion de contenidos 
streamHub> db.contenidos.insertMany([
 {
   titulo: "Inception",
   tipo: "pelicula",
   genero: ["Ciencia ficción", "Acción"],
   duracion: 148,
   anio: 2010,
   ratingPromedio: 4.5
 },
 {
   titulo: "Titanic",
   tipo: "pelicula",
   genero: ["Romance", "Drama"],
   duracion: 195,
   anio: 1997,
   ratingPromedio: 4.7
 },
 {
   titulo: "Stranger Things",
   tipo: "serie",
   genero: ["Ciencia ficción", "Terror"],
   duracion: 50,
   anio: 2016,
   ratingPromedio: 4.8
 }
 ])

//crear coleccion de valoraciones
streamHub> db.valoraciones.insertMany([
 {
   usuarioId: db.usuarios.findOne({nombre:"Julian"})._id,
   contenidoId: db.contenidos.findOne({titulo:"Inception"})._id,
   puntuacion: 5,
   comentario: "Excelente película",
   fecha: new Date()
 },
 {
   usuarioId: db.usuarios.findOne({nombre:"Laura"})._id,
   contenidoId: db.contenidos.findOne({titulo:"Titanic"})._id,
   puntuacion: 4,
   comentario: "Muy buena",
   fecha: new Date()
 }
 ])

//Consultas con $gt (greater than)
// Películas con duración mayor a 120 minutos
streamHub> db.contenidos.find({tipo: "pelicula", duracion: {$gt: 120}})

//Consultas con $lt (less than)
// Contenidos con duración menor a 100 minutos
streamHub> db.contenidos.find({duracion: {$lt: 100}})

//$gt y $lt juntos
// Contenidos entre 100 y 200 minutos
streamHub> db.contenidos.find({duracion: {$gt: 100, $lt: 200}})

//Usando $in
// Contenidos que tengan género "Drama"
streamHub> db.contenidos.find({genero: {$in: ["Drama"]}})

// Contenidos que tengan género "Ciencia ficción" o "Terror"
streamHub> db.contenidos.find({genero: {$in: ["Ciencia ficción", "Terror"]}})

//Usando $or
// Contenidos que sean películas o tengan un rating promedio mayor a 4.6
streamHub> db.contenidos.find({$or: [{tipo: "pelicula"}, {ratingPromedio: {$gt: 4.6}}]}) 

//Usando $and
//Usuarios de Colombia Y mayores de 20 años
streamHub> db.usuarios.find({$and: [{pais: "Colombia"}, {edad: {$gt: 20}}]})

//Usando $or
//Usuarios de México O menores de 28 años
streamHub> db.usuarios.find({$or: [{pais: "México"}, {edad: {$lt: 28}}]})

//Usando $regex
// Buscar contenidos que contengan "In" en el título
streamHub> db.contenidos.find({titulo: {$regex: "In"}})

// Buscar contenidos que terminen con "s"
streamHub> db.contenidos.find({titulo: {$regex: "s$"}})

//Buscar contenidos que comiencen con "S"
streamHub> db.contenidos.find({titulo: {$regex: "^S"}})

//Usando eq
// Buscar usuarios con edad igual a 30
streamHub> db.usuarios.find({edad: {$eq: 30}})

// Buscar contenidos con rating promedio igual a 4.5
streamHub> db.contenidos.find({ratingPromedio: {$eq: 4.5}})

//updateOne()
//Actualizar el país de un usuario
streamHub> db.usuarios.updateOne({nombre: "Julian"}, {$set: {pais: "Argentina"}})

//Actualizar el rating promedio de una película
streamHub> db.contenidos.updateOne({titulo: "Inception"}, {$set: {ratingPromedio: 4.6}})

//updateMany()
//Actualizar todos los usuarios de México y cambiar el país a "Mexico" (sin tilde).
streamHub> db.usuarios.updateMany({pais: "México"}, {$set: {pais: "Mexico"}})

//deleteOne()
//Eliminar una valoracion "Muy buena"
streamHub> db.valoraciones.deleteOne({comentario: "Muy buena"})

//deleteMany()
//Eliminar usuarios menores de 28 años
streamHub> db.usuarios.deleteMany({edad: {$lt: 28}})

//Crear índice por título
// Se crea índice en titulo porque es un campo de búsqueda frecuente.
streamHub> db.contenidos.createIndex({titulo: 1})

//Crear índice por género
// Se crea índice en genero porque se realizan consultas con $in.
streamHub> db.contenidos.createIndex({genero: 1})

//Ver los indices creados
streamHub> db.contenidos.getIndexes()

//Agregaciones
//Promedio de puntuación por contenido
streamHub> db.valoraciones.aggregate([
db.valoraciones.aggregate([
  {
    $group: {
      _id: "$contenidoId",
      promedio: { $avg: "$puntuacion" },
      totalValoraciones: { $sum: 1 }
    }
  },
  {
    $sort: { promedio: -1 }
  }
])

//Cantidad de contenidos por género
streamHub> db.contenidos.aggregate([
  { $unwind: "$genero" },
  {
    $group: {
      _id: "$genero",
      total: { $sum: 1 }
    }
  },
  { $sort: { total: -1 } },
  {
    $project: {
      genero: "$_id",
      total: 1,
      _id: 0
    }
  }
])
  */