import { supabaseClient } from './supabase.js'

const DAY_NAMES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

let state = {
  currentMonth: new Date().getMonth(),
  currentYear: new Date().getFullYear(),
  selectedDate: null,
  reservas: []
}

function formatDateKey(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

async function fetchReservas(year, month) {
  const startDate = formatDateKey(year, month, 1)
  const lastDay = new Date(year, month + 1, 0).getDate()
  const endDate = formatDateKey(year, month, lastDay)

  const { data, error } = await supabaseClient
    .from('reservas')
    .select('fecha, horario_inicio, servicios(nombre)')
    .gte('fecha', startDate)
    .lte('fecha', endDate)
    .order('fecha', { ascending: true })
    .order('horario_inicio', { ascending: true })

  if (error) throw error
  return data || []
}

function getReservasForDate(dateKey) {
  return state.reservas.filter(r => r.fecha === dateKey)
}

function renderCalendar() {
  const grid = document.getElementById('calendar-grid')
  const monthYearEl = document.getElementById('month-year')
  const { currentMonth, currentYear, selectedDate } = state

  monthYearEl.textContent = `${MONTH_NAMES[currentMonth]} ${currentYear}`

  const firstDay = new Date(currentYear, currentMonth, 1).getDay()
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate()

  const today = new Date()
  const todayKey = formatDateKey(today.getFullYear(), today.getMonth(), today.getDate())

  grid.innerHTML = ''

  for (let i = 0; i < 7; i++) {
    const header = document.createElement('div')
    header.className = 'calendar-day-header'
    header.textContent = DAY_NAMES[i]
    grid.appendChild(header)
  }

  const totalCells = firstDay + daysInMonth
  const rows = Math.ceil(totalCells / 7)

  for (let i = 0; i < rows * 7; i++) {
    const dayEl = document.createElement('div')

    let dayNum
    let month = currentMonth
    let year = currentYear
    let isOtherMonth = false

    if (i < firstDay) {
      dayNum = daysInPrevMonth - firstDay + 1 + i
      month = currentMonth - 1
      if (month < 0) { month = 11; year-- }
      isOtherMonth = true
    } else if (i >= firstDay + daysInMonth) {
      dayNum = i - firstDay - daysInMonth + 1
      month = currentMonth + 1
      if (month > 11) { month = 0; year++ }
      isOtherMonth = true
    } else {
      dayNum = i - firstDay + 1
    }

    const dateKey = formatDateKey(year, month, dayNum)
    const dayReservas = getReservasForDate(dateKey)
    const isToday = dateKey === todayKey
    const isSelected = selectedDate === dateKey

    dayEl.className = 'calendar-day'
    if (isOtherMonth) dayEl.classList.add('other-month')
    if (isToday) dayEl.classList.add('today')
    if (isSelected) dayEl.classList.add('selected')

    dayEl.dataset.date = dateKey

    const numberSpan = document.createElement('span')
    numberSpan.className = 'calendar-day-number'
    numberSpan.textContent = dayNum
    dayEl.appendChild(numberSpan)

    if (dayReservas.length > 0) {
      const dots = document.createElement('div')
      dots.className = 'appointment-dots'

      const maxDots = 4
      const shown = dayReservas.slice(0, maxDots)

      shown.forEach(() => {
        const dot = document.createElement('span')
        dot.className = 'appointment-dot'
        dots.appendChild(dot)
      })

      if (dayReservas.length > maxDots) {
        const more = document.createElement('span')
        more.className = 'appointment-dot'
        more.textContent = '+'
        more.style.cssText = 'width: auto; height: auto; font-size: 0.6rem; font-weight: 700; padding: 0 2px; background: var(--accent-2); color: #fff; line-height: 1.2;'
        dots.appendChild(more)
      }

      dayEl.appendChild(dots)
    }

    dayEl.addEventListener('click', () => {
      if (isOtherMonth) return
      state.selectedDate = dateKey
      renderCalendar()
      renderReservas()
    })

    grid.appendChild(dayEl)
  }
}

function renderReservas() {
  const panel = document.getElementById('day-appointments')
  const label = document.getElementById('day-label')
  const { selectedDate } = state

  if (!selectedDate) {
    label.textContent = 'Selecciona un día para ver las reservas'
    panel.innerHTML = '<div class="appointments-empty">Haz clic en una fecha del calendario</div>'
    return
  }

  const [y, m, d] = selectedDate.split('-').map(Number)
  const dateObj = new Date(y, m - 1, d)
  const dayName = DAY_NAMES[dateObj.getDay()]
  label.textContent = `${dayName}, ${d} de ${MONTH_NAMES[m - 1]} de ${y}`

  const dayReservas = getReservasForDate(selectedDate)

  if (dayReservas.length === 0) {
    panel.innerHTML = '<div class="appointments-empty">No hay reservas para este día</div>'
    return
  }

  panel.innerHTML = ''

  dayReservas.forEach(r => {
    const servicio = r.servicios || {}
    const nombreServicio = servicio.nombre || 'Servicio'
    const duracion = servicio.duracion
    const duracionStr = duracion ? `${duracion} min` : ''

    const item = document.createElement('div')
    item.className = 'slot-item ocupado'

    const info = document.createElement('div')
    info.style.cssText = 'display:flex;flex-direction:column;gap:0.15rem'

    const timeRow = document.createElement('div')
    timeRow.style.cssText = 'display:flex;align-items:baseline;gap:0.5rem'
    timeRow.innerHTML = `
      <span class="slot-time" style="font-size:1rem">${r.horario_inicio.slice(0, 5)}</span>
      ${duracionStr ? `<span style="font-size:0.75rem;color:var(--muted)">${escapeHtml(duracionStr)}</span>` : ''}
    `
    info.appendChild(timeRow)

    const serviceName = document.createElement('div')
    serviceName.style.cssText = 'font-size:0.85rem;color:var(--muted)'
    serviceName.textContent = escapeHtml(nombreServicio)
    info.appendChild(serviceName)

    item.appendChild(info)
    panel.appendChild(item)
  })
}

async function initCalendar() {
  const grid = document.getElementById('calendar-grid')
  const appointmentsPanel = document.getElementById('day-appointments')
  const prevBtn = document.getElementById('prev-month')
  const nextBtn = document.getElementById('next-month')

  if (!grid) return

  grid.innerHTML = '<div class="calendar-loading">Cargando calendario...</div>'

  try {
    state.reservas = await fetchReservas(state.currentYear, state.currentMonth)

    const today = new Date()
    state.selectedDate = formatDateKey(today.getFullYear(), today.getMonth(), today.getDate())

    renderCalendar()
    renderReservas()
  } catch (err) {
    console.error('Error al cargar citas:', err)
    const msg = err.message || err.error_description || JSON.stringify(err)
    grid.innerHTML = `<div class="calendar-error">Error: ${escapeHtml(msg)}</div>`
    if (appointmentsPanel) appointmentsPanel.innerHTML = ''
    return
  }

  prevBtn.addEventListener('click', () => {
    state.currentMonth--
    if (state.currentMonth < 0) { state.currentMonth = 11; state.currentYear-- }
    loadMonth()
  })

  nextBtn.addEventListener('click', () => {
    state.currentMonth++
    if (state.currentMonth > 11) { state.currentMonth = 0; state.currentYear++ }
    loadMonth()
  })
}

async function loadMonth() {
  const panel = document.getElementById('day-appointments')
  const grid = document.getElementById('calendar-grid')
  if (!grid) return

  grid.innerHTML = '<div class="calendar-loading">Cargando...</div>'

  try {
    state.reservas = await fetchReservas(state.currentYear, state.currentMonth)
    state.selectedDate = null
    renderCalendar()
    renderReservas()
  } catch (err) {
    console.error('Error al cargar mes:', err)
    const msg = err.message || err.error_description || JSON.stringify(err)
    grid.innerHTML = `<div class="calendar-error">Error: ${escapeHtml(msg)}</div>`
  }
}

function escapeHtml(str) {
  if (!str) return ''
  const div = document.createElement('div')
  div.textContent = str
  return div.innerHTML
}

document.addEventListener('DOMContentLoaded', initCalendar)
