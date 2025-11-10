'use client'

import { useEffect, useState } from 'react'

export default function DashboardPage() {
  const [stats, setStats] = useState({
    viajesHoy: 0,
    conductoresActivos: 0,
    usuariosActivos: 0,
    ingresosDia: 0,
  })

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Viajes Hoy</p>
              <p className="text-3xl font-bold mt-2">{stats.viajesHoy}</p>
            </div>
            <div className="text-4xl">🏍️</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Conductores Activos</p>
              <p className="text-3xl font-bold mt-2">{stats.conductoresActivos}</p>
            </div>
            <div className="text-4xl">👨‍✈️</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Usuarios Activos</p>
              <p className="text-3xl font-bold mt-2">{stats.usuariosActivos}</p>
            </div>
            <div className="text-4xl">👥</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Ingresos Hoy</p>
              <p className="text-3xl font-bold mt-2">S/. {stats.ingresosDia.toFixed(2)}</p>
            </div>
            <div className="text-4xl">💰</div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Viajes Recientes</h2>
          <div className="space-y-3">
            <p className="text-gray-600">No hay viajes recientes</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Conductores Pendientes</h2>
          <div className="space-y-3">
            <p className="text-gray-600">No hay conductores pendientes de verificación</p>
          </div>
        </div>
      </div>
    </div>
  )
}
