import {SpecializationseService} from "./services.js";


export const GetallSpecController = async (req, res) => {
  try {
	const specialization = await SpecializationseService.getAll();
	res.status(200).json(specialization);
  } catch (error) {
	console.error("Error en el controlador", error.message);
	res
	  .status(500)
	  .json({ message: "Error al obtener todas las especializaciones", error: error.message });
  }
};

export const CreateSpecController = async (req, res) => {
  try {
    const { nombre } = req.body;

    if (!nombre) {
      return res.status(400).json({ message: "El nombre es obligatorio" });
    }

    // Llamamos al service inteligente
    const result = await SpecializationseService.findOrCreate(nombre);
    
    // Devolvemos el objeto que contiene el ID
    res.status(201).json(result); 
  } catch (error) {
    res.status(500).json({ message: "Error al procesar especialidad", error: error.message });
  }
};
export const UpdateSpecController= async (req, res) => {
  try {
	
	const { nombre} = req.body;

	if (!nombre) {
	  return res.status(400).json({
		message:
		  "Todos los campos son obligatorios",
	  });
	}

	if (
	 typeof nombre !== "string" ) {
	  return res.status(400).json({
		message:
		  "los campos tienen que ser un tipo de dato valido",
	  });
	}

	await SpecializationseService.update({nombre});
	res.status(200).json({ message: "especializacion actualizado correctamente" });
  } catch (error) {
	console.error("Error en el controlador:", error.message);
	res
	  .status(500)
	  .json({
		message: "Error al actualizar la especializacion",
		error: error.message,
	  });
  }
};
export const DeleteSpecController= async (req, res) => {
  try {
	const { id } = req.params;

	if (!id) {
	  return res.status(400).json({ message: "El campo es obligatorio" });
	}

	const idnumber = Number(id);

	if (isNaN(idnumber)) {
	  return res
		.status(400)
		.json({ message: "id no valida" });
	}

	await ReportcaseService.delete(idnumber);
	res.status(200).json({ message: "" });
  } catch (error) {
	console.error("Error:", error.message);
	res
	  .status(500)
	  .json({ message: "Error no se pudo eliminar la especializacion", error: error.message });
  }
};