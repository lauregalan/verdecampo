import React, { useState } from 'react';
import Modal from '@/Components/Modal'; // Usamos tu componente de Modal
import TextInput from '@/Components/TextInput'; // Para la barra de búsqueda
import PrimaryButton from '@/Components/PrimaryButton'; // Para el botón "+"
import InputLabel from '@/Components/InputLabel'; // Para etiquetas de filtros





//
// TODO rehacer este modulo para que se muestre dentro de la pantalla inicio
//


export default function GestionUsuarios() {
    const [showModal, setShowModal] = useState(true);

    return (
        <Modal show={showModal} onClose={() => setShowModal(false)} max-w="5xl">
            <div className="p-6 bg-gray-50 rounded-lg shadow-xl">
                {/* Header: Título y Botón Nuevo */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Gestión de Usuarios</h2>
                        <p className="text-sm text-gray-500">25 Usuarios Totales</p>
                    </div>
                    <PrimaryButton className="bg-blue-600 hover:bg-blue-700">
                        + Nuevo Usuario
                    </PrimaryButton>
                </div>

                {/* Filtros: Búsqueda y Dropdowns */}
                <div className="flex flex-wrap gap-4 items-end mb-6 bg-white p-4 rounded-lg shadow-sm">
                    <div className="flex-1 min-w-[200px]">
                        <TextInput 
                            placeholder="Buscar usuario por nombre o correo..." 
                            className="w-full"
                        />
                    </div>
                    <div>
                        <InputLabel value="Rol" className="mb-1" />
                        <select className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm">
                            <option>Todos</option>
                            <option>Administrador</option>
                            <option>Agrónomo</option>
                        </select>
                    </div>
                    <div>
                        <InputLabel value="Estado" className="mb-1" />
                        <select className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm">
                            <option>Todos</option>
                            <option>Activo</option>
                            <option>Inactivo</option>
                        </select>
                    </div>
                </div>

                {/* Tabla de Usuarios */}
                <div className="overflow-x-auto bg-white rounded-lg shadow">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
                            <tr>
                                <th className="p-4 border-b">Nombre y Apellido</th>
                                <th className="p-4 border-b">Correo Electrónico</th>
                                <th className="p-4 border-b text-center">Rol</th>
                                <th className="p-4 border-b text-center">Estado</th>
                                <th className="p-4 border-b">Último Acceso</th>
                                <th className="p-4 border-b text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-700 text-sm">
                            {/* Ejemplo de Fila */}
                            <tr className="hover:bg-gray-50 border-b">
                                <td className="p-4 flex items-center gap-3">
                                    <div className="w-8 h-8 bg-gray-300 rounded-full flex-shrink-0 overflow-hidden">
                                        <img src="https://via.placeholder.com/150" alt="avatar" />
                                    </div>
                                    <span className="font-medium text-gray-900">María López</span>
                                </td>
                                <td className="p-4 text-gray-500">marialopez@gmail.com</td>
                                <td className="p-4 text-center">
                                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold">
                                        Administrador
                                    </span>
                                </td>
                                <td className="p-4 text-center">
                                    <div className="flex justify-center">
                                        <span className="text-green-600 flex items-center gap-1 font-medium">
                                            ● Activo
                                        </span>
                                    </div>
                                </td>
                                <td className="p-4 text-gray-500">Hoy 11:36 AM</td>
                                <td className="p-4 text-center">
                                    <div className="flex justify-center gap-2 text-gray-400">
                                        <button className="hover:text-blue-600">✎</button>
                                        <button className="hover:text-red-600">🗑</button>
                                        <button className="hover:text-gray-700">👤</button>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </Modal>
    );
}