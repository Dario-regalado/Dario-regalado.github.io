import { supabaseClient } from './supabase.js'
import { requireAuth } from './auth.js'

await requireAuth()

let servicios = []
let reservas = []
let editandoId = null

const form = document.getElementById('reserva-form')
const tabla = document.getElementById('reservas-tbody')
const formModal = document.getElementById('form-modal')
const modalTitle = document.getElementById('modal-title')
const cancelBtn = document.getElementById('cancel-btn')
const nuevaBtn = document.getElementById('nueva-reserva')
const deleteModal = document.getElementById('delete-modal')
const confirmDeleteBtn = document.getElementById('confirm-delete')
const cancelDeleteBtn = document.getElementById('cancel-delete')
let eliminarId = null

async function cargarServicios() {
  const { data, error } = await supabaseClient
    .from('servicios')
    .select('id, nombre')
    .eq('activo', true)
    .order('nombre')
  if (error) throw error
  servicios = data || []
}

function renderServicioSelect(selectEl, selectedId) {
  selectEl.innerHTML = '<option value="">Seleccionar servicio...</option>'
  servicios.forEach(s => {
    const opt = document.createElement('option')
    opt.value = s.id
    opt.textContent = s.nombre
    if (selectedId && selectedId == s.id) opt.selected = true
    selectEl.appendChild(opt)
  })
}

async function cargarReservas() {
  const hoy = new Date()
  const todayStr = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`

  const { data, error } = await supabaseClient
    .from('reservas')
    .select('*, servicios(nombre)')
    .gte('fecha', todayStr)
    .order('fecha', { ascending: true })
    .order('horario_inicio', { ascending: true })
  if (error) throw error
  reservas = data || []
}

function renderTabla() {
  if (!tabla) return
  tabla.innerHTML = ''

  if (reservas.length === 0) {
    tabla.innerHTML = '<tr><td colspan="7" class="empty-row">No hay reservas</td></tr>'
    return
  }

  reservas.forEach(r => {
    const tr = document.createElement('tr')

    const fecha = new Date(r.fecha + 'T' + (r.horario_inicio || '00:00'))
    const fechaStr = r.fecha
    const horaStr = r.horario_inicio ? r.horario_inicio.slice(0, 5) : '--:--'
    const servicioNombre = r.servicios?.nombre || '—'

    tr.innerHTML = `
      <td data-label="Fecha">${escapeHtml(fechaStr)}</td>
      <td data-label="Hora">${escapeHtml(horaStr)}</td>
      <td data-label="Cliente">${escapeHtml(r.nombre_cliente)}</td>
      <td data-label="Telefono">${escapeHtml(r.telefono || '—')}</td>
      <td data-label="Servicio">${escapeHtml(servicioNombre)}</td>
      <td data-label="Observaciones">${escapeHtml(r.observaciones || '—')}</td>
      <td data-label="Acciones" class="actions-cell">
        <button class="btn-sm btn-edit" data-id="${r.id}" title="Editar">Editar</button>
        <button class="btn-sm btn-delete" data-id="${r.id}" title="Eliminar">Eliminar</button>
      </td>
    `

    tabla.appendChild(tr)
  })

  tabla.querySelectorAll('.btn-edit').forEach(btn => {
    btn.addEventListener('click', () => abrirEditar(btn.dataset.id))
  })
  tabla.querySelectorAll('.btn-delete').forEach(btn => {
    btn.addEventListener('click', () => abrirEliminar(btn.dataset.id))
  })
}

function abrirCrear() {
  editandoId = null
  modalTitle.textContent = 'Nueva reserva'
  form.reset()
  document.getElementById('fecha').value = new Date().toISOString().split('T')[0]
  renderServicioSelect(document.getElementById('servicio_id'))
  formModal.style.display = 'flex'
}

function abrirEditar(id) {
  const reserva = reservas.find(r => r.id == id)
  if (!reserva) return

  editandoId = id
  modalTitle.textContent = 'Editar reserva'
  document.getElementById('nombre_cliente').value = reserva.nombre_cliente || ''
  document.getElementById('telefono').value = reserva.telefono || ''
  document.getElementById('fecha').value = reserva.fecha || ''
  document.getElementById('horario_inicio').value = reserva.horario_inicio ? reserva.horario_inicio.slice(0, 5) : ''
  document.getElementById('observaciones').value = reserva.observaciones || ''
  renderServicioSelect(document.getElementById('servicio_id'), reserva.servicio_id)
  formModal.style.display = 'flex'
}

function abrirEliminar(id) {
  eliminarId = id
  deleteModal.style.display = 'flex'
}

function cerrarModal() {
  formModal.style.display = 'none'
  editandoId = null
}

function cerrarDeleteModal() {
  deleteModal.style.display = 'none'
  eliminarId = null
}

form.addEventListener('submit', async (e) => {
  e.preventDefault()

  const nombre_cliente = document.getElementById('nombre_cliente').value.trim()
  const telefono = document.getElementById('telefono').value.trim()
  const servicio_id = document.getElementById('servicio_id').value
  const fecha = document.getElementById('fecha').value
  const horario_inicio = document.getElementById('horario_inicio').value
  const observaciones = document.getElementById('observaciones').value.trim()

  if (!nombre_cliente || !servicio_id || !fecha || !horario_inicio) {
    alert('Completa los campos obligatorios: cliente, servicio, fecha y hora')
    return
  }

  const submitBtn = form.querySelector('button[type="submit"]')
  submitBtn.disabled = true
  submitBtn.textContent = 'Guardando...'

  try {
    if (editandoId) {
      const { error } = await supabaseClient
        .from('reservas')
        .update({ nombre_cliente, telefono, servicio_id, fecha, horario_inicio, observaciones })
        .eq('id', editandoId)
      if (error) throw error
    } else {
      const { error } = await supabaseClient
        .from('reservas')
        .insert({ nombre_cliente, telefono, servicio_id, fecha, horario_inicio, observaciones })
      if (error) throw error
    }

    cerrarModal()
    await recargar()
  } catch (err) {
    console.error('Error al guardar:', err)
    alert('Error al guardar: ' + err.message)
  } finally {
    submitBtn.disabled = false
    submitBtn.textContent = editandoId ? 'Guardar cambios' : 'Crear reserva'
  }
})

cancelBtn.addEventListener('click', cerrarModal)

formModal.addEventListener('click', (e) => {
  if (e.target === formModal) cerrarModal()
})

confirmDeleteBtn.addEventListener('click', async () => {
  if (!eliminarId) return
  try {
    const { error } = await supabaseClient
      .from('reservas')
      .delete()
      .eq('id', eliminarId)
    if (error) throw error
    cerrarDeleteModal()
    await recargar()
  } catch (err) {
    console.error('Error al eliminar:', err)
    alert('Error al eliminar: ' + err.message)
  }
})

cancelDeleteBtn.addEventListener('click', cerrarDeleteModal)

deleteModal.addEventListener('click', (e) => {
  if (e.target === deleteModal) cerrarDeleteModal()
})

nuevaBtn.addEventListener('click', abrirCrear)

async function recargar() {
  await cargarReservas()
  renderTabla()
}

async function init() {
  try {
    await cargarServicios()
    await cargarReservas()
    renderTabla()
  } catch (err) {
    console.error('Error al cargar datos:', err)
    const msg = err.message || err.error_description || JSON.stringify(err)
    document.querySelector('.reservas-container').innerHTML =
      `<div class="calendar-error">Error: ${escapeHtml(msg)}</div>`
  }
}

await init()

function escapeHtml(str) {
  if (!str) return ''
  const div = document.createElement('div')
  div.textContent = str
  return div.innerHTML
}
