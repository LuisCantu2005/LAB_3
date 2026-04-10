import { useCallback, useEffect, useState } from 'react'
import { supabase } from './supabase-client'
import './App.css'

function App() {
  const [pendientes, setPendientes] = useState([])
  const [nuevoRegistro, setNuevoRegistro] = useState('')

  const consultarRegistros = useCallback(async () => {
    const { data, error } = await supabase
      .from('pendientes')
      .select('*')
      .order('id', { ascending: true })

    if (error) {
      console.error('Error al consultar registros:', error)
      return
    }

    setPendientes(data ?? [])
  }, [])

  useEffect(() => {
    const cargar = async () => {
      await consultarRegistros()
    }

    cargar()
  }, [consultarRegistros])

  async function agregarRegistro() {
    const nombreLimpio = nuevoRegistro.trim()

    if (!nombreLimpio) {
      return
    }

    const { error } = await supabase.from('pendientes').insert({
      name: nombreLimpio,
      isCompleted: false,
    })

    if (error) {
      console.error('Error al agregar registro:', error)
      return
    }

    setNuevoRegistro('')
    consultarRegistros()
  }

  async function actualizarRegistro(id, estadoActual) {
    const { error } = await supabase
      .from('pendientes')
      .update({ isCompleted: !estadoActual })
      .eq('id', id)

    if (error) {
      console.error('Error al actualizar registro:', error)
      return
    }

    consultarRegistros()
  }

  async function eliminarRegistro(id) {
    const { error } = await supabase.from('pendientes').delete().eq('id', id)

    if (error) {
      console.error('Error al eliminar registro:', error)
      return
    }

    consultarRegistros()
  }

  function manejarEnter(evento) {
    if (evento.key === 'Enter') {
      agregarRegistro()
    }
  }

  return (
    <main className="app">
      <section className="card">
        <h1>Lista de Pendientes (CRUD con Supabase)</h1>

        <div className="input-group">
          <input
            type="text"
            placeholder="Escribe una tarea..."
            value={nuevoRegistro}
            onChange={(evento) => setNuevoRegistro(evento.target.value)}
            onKeyDown={manejarEnter}
          />
          <button onClick={agregarRegistro}>Agregar</button>
        </div>

        <ul className="lista">
          {pendientes.map((item) => (
            <li key={item.id} className={item.isCompleted ? 'completado' : ''}>
              <label>
                <input
                  type="checkbox"
                  checked={item.isCompleted}
                  onChange={() => actualizarRegistro(item.id, item.isCompleted)}
                />
                <span>{item.name}</span>
              </label>
              <button
                className="btn-eliminar"
                onClick={() => eliminarRegistro(item.id)}
              >
                Eliminar
              </button>
            </li>
          ))}
        </ul>
      </section>
    </main>
  )
}

export default App
