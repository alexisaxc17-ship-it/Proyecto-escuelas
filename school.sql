-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 04-03-2026 a las 16:51:01
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `school`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `alumnos`
--

CREATE TABLE `alumnos` (
  `id_alumno` bigint(20) UNSIGNED NOT NULL,
  `nombre_completo` varchar(180) DEFAULT NULL,
  `direccion` varchar(255) DEFAULT NULL,
  `telefono` varchar(30) DEFAULT NULL,
  `email` varchar(150) DEFAULT NULL,
  `foto` varchar(255) DEFAULT NULL,
  `genero` enum('masculino','femenino') DEFAULT NULL,
  `latitud` decimal(10,7) DEFAULT NULL,
  `longitud` decimal(10,7) DEFAULT NULL,
  `id_grado` bigint(20) UNSIGNED DEFAULT NULL,
  `id_seccion` bigint(20) UNSIGNED DEFAULT NULL,
  `id_school` bigint(20) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `alumnos`
--

INSERT INTO `alumnos` (`id_alumno`, `nombre_completo`, `direccion`, `telefono`, `email`, `foto`, `genero`, `latitud`, `longitud`, `id_grado`, `id_seccion`, `id_school`) VALUES
(1, 'Mauricio', 'San Vicente', '23454567', 'mauri@gmail.com', 'alumnos/5lSvKp80GfHK6bom4yXrAoLO4MmBi1flJooUMjPX.jpg', 'masculino', 13.6425090, -88.7869690, 3, 1, 1),
(2, 'Edgardo Jared Palacios Gomez', 'San Vicenet', '87876558', 'Edagardo@gmail.com', 'alumnos/aKSzFKY9cWBPVsrxYLbY6AHNYIEzPzpVe3kpqQ2z.png', 'masculino', 13.6793390, -88.7911000, 6, 1, 2),
(3, 'Vanessa', 'San Esteban Catarina', '76587645', 'van@gmail.com', 'alumnos/NVfSkBv1gKAnky06v8M7rFFfpIErNCw9bJIrOxEG.jpg', 'femenino', 13.7561240, -88.7282150, 7, 1, 1),
(4, 'Karla Vanessa Sánchez Cerritos', 'San Esteban Catarina', '34565434', 'Karla@gmail.com', 'alumnos/fqCyGz3lwcO93Ao6k7SnaxR3CA9vGTgsKUTXD5lc.jpg', 'femenino', 13.6852390, -88.7845440, 8, 1, 2),
(5, 'Dalila Nohemy Portillo Flores', 'San Esteban Catarina', '12345678', 'Dalilia@gmail.com', 'alumnos/KLlg3ycqNkvWJRscaaGhlA2aoNLIY863nYouHlOk.jpg', 'femenino', 13.6782630, -88.7912030, 4, 0, 1),
(6, 'Carmen Nayeli Cerritos Sanchez', 'San Esteban Catarina', '8977-7989', 'Naye@gmail.com', 'alumnos/znU4w2XxzMFzTt5y0Cn7sxt6dAixUHbq38sP0Xez.jpg', 'femenino', 13.6858340, -88.7863090, 7, 1, 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `padres`
--

CREATE TABLE `padres` (
  `id_padre` bigint(20) UNSIGNED NOT NULL,
  `nombre` varchar(150) DEFAULT NULL,
  `direccion` varchar(255) DEFAULT NULL,
  `telefono` varchar(30) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `padres`
--

INSERT INTO `padres` (`id_padre`, `nombre`, `direccion`, `telefono`) VALUES
(1, 'Walter Ernesto Sanchez', 'San Vicentee', '67587587'),
(2, 'Edgardo Ayala Ortiz Portillo', 'San Vicente', '8475445'),
(3, 'Adalicia de Carmen', 'San Esteban Catarina', '76567656'),
(4, 'Julio Cesar Villalta Cerritos', 'San Esteban Catarina', '8778-0993');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `padres_alumnos`
--

CREATE TABLE `padres_alumnos` (
  `id_padre_alumno` bigint(20) UNSIGNED NOT NULL,
  `id_alumno` bigint(20) UNSIGNED NOT NULL,
  `id_padre` bigint(20) UNSIGNED NOT NULL,
  `parentesco` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `padres_alumnos`
--

INSERT INTO `padres_alumnos` (`id_padre_alumno`, `id_alumno`, `id_padre`, `parentesco`) VALUES
(1, 1, 1, 'Padre'),
(2, 2, 2, 'Hijo'),
(3, 3, 3, 'Hija'),
(4, 6, 4, 'Hija'),
(5, 5, 4, 'Hija');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `school`
--

CREATE TABLE `school` (
  `id_school` bigint(20) UNSIGNED NOT NULL,
  `nombre` varchar(150) DEFAULT NULL,
  `direccion` varchar(255) DEFAULT NULL,
  `email` varchar(150) DEFAULT NULL,
  `foto` varchar(255) DEFAULT NULL,
  `latitud` decimal(10,7) DEFAULT NULL,
  `longitud` decimal(10,7) DEFAULT NULL,
  `id_user` bigint(20) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `school`
--

INSERT INTO `school` (`id_school`, `nombre`, `direccion`, `email`, `foto`, `latitud`, `longitud`, `id_user`) VALUES
(1, 'Amatitan Abajo', 'San Esteban Catarinaa', 'amatitan@gmail.com', 'schools/1AiFTkZ01ikRN1afrXHPry1RulyLVekGFyWreB6z.jpg', 13.6930870, -88.7840840, 1),
(2, 'Adrian Garcia', 'San Esteban Catarina', 'adrian@gmail.com', 'schools/ifMDlWw6zKAAPlEe6NUTLjkxTPxnDkGOBhmyf4A7.jpg', 13.6846600, -88.7890230, 10),
(3, 'Complejo Rene Valle', 'San Esteban Catrina', 'Rene@gmail.com', 'schools/8SXPPJm1W6oQaPLwlpjQxmtf6bOzxg751qBXWVrj.jpg', 13.6851890, -88.7892020, 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id_user` bigint(20) UNSIGNED NOT NULL,
  `nombre` varchar(150) DEFAULT NULL,
  `usuario` varchar(100) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `tipo` enum('Administrador','Usuario') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id_user`, `nombre`, `usuario`, `password`, `tipo`) VALUES
(9, 'Administrador General', 'admin', '$2y$12$RTcOQAsN7ju7AYObMl5rzOuzJci/iHY9zlxO38YgqAXzkwdPF0dcW', 'Administrador'),
(10, 'Juan Perez', 'juan', '$2y$12$G38ExnYQkobiwn3JaAHMSOuzpl06L24ke31K5ubYPwKV.ivYFrvp.', 'Usuario');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `alumnos`
--
ALTER TABLE `alumnos`
  ADD PRIMARY KEY (`id_alumno`),
  ADD KEY `fk_alumno_school` (`id_school`);

--
-- Indices de la tabla `padres`
--
ALTER TABLE `padres`
  ADD PRIMARY KEY (`id_padre`);

--
-- Indices de la tabla `padres_alumnos`
--
ALTER TABLE `padres_alumnos`
  ADD PRIMARY KEY (`id_padre_alumno`),
  ADD KEY `fk_padrealumno_alumno` (`id_alumno`),
  ADD KEY `fk_padrealumno_padre` (`id_padre`);

--
-- Indices de la tabla `school`
--
ALTER TABLE `school`
  ADD PRIMARY KEY (`id_school`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id_user`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `alumnos`
--
ALTER TABLE `alumnos`
  MODIFY `id_alumno` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `padres`
--
ALTER TABLE `padres`
  MODIFY `id_padre` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `padres_alumnos`
--
ALTER TABLE `padres_alumnos`
  MODIFY `id_padre_alumno` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `school`
--
ALTER TABLE `school`
  MODIFY `id_school` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id_user` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `alumnos`
--
ALTER TABLE `alumnos`
  ADD CONSTRAINT `fk_alumno_school` FOREIGN KEY (`id_school`) REFERENCES `school` (`id_school`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `padres_alumnos`
--
ALTER TABLE `padres_alumnos`
  ADD CONSTRAINT `fk_padrealumno_alumno` FOREIGN KEY (`id_alumno`) REFERENCES `alumnos` (`id_alumno`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_padrealumno_padre` FOREIGN KEY (`id_padre`) REFERENCES `padres` (`id_padre`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
