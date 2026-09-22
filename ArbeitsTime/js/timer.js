import { supabase } from './supabaseClient.js';
import { getActiveEmployee } from './auth.js';

let timerInterval = null;
let secondsElapsed = 0;
let currentEntryId = null;

function formatTime(totalSeconds) {
    const hours = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
    const minutes = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
    const seconds = (totalSeconds % 60).toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
}

export function initTimerModule() {
    const btnStart = document.getElementById('btn-start');
    const btnBreak = document.getElementById('btn-break');
    const btnStop = document.getElementById('btn-stop');
    const display = document.getElementById('timer-display');
    const statusLabel = document.getElementById('timer-status-label');

    btnStart.addEventListener('click', async () => {
        const employee = getActiveEmployee();
        if (!employee) {
            alert('Por favor selecciona quién eres en el menú superior antes de iniciar.');
            return;
        }

        const clientId = document.getElementById('select-client').value || null;
        const entryType = clientId ? 'client_task' : 'work';

        if (timerInterval) clearInterval(timerInterval);
        secondsElapsed = 0;
        statusLabel.textContent = clientId ? 'Trabajando en Cliente...' : 'Jornada de Trabajo Activa...';

        const { data, error } = await supabase.from('time_entries').insert([{
            employee_id: employee.id,
            client_id: clientId,
            start_time: new Date().toISOString(),
            entry_type: entryType
        }]).select();

        if (!error && data) {
            currentEntryId = data[0].id;
        }

        timerInterval = setInterval(() => {
            secondsElapsed++;
            display.textContent = formatTime(secondsElapsed);
        }, 1000);
    });

    btnBreak.addEventListener('click', async () => {
        const employee = getActiveEmployee();
        if (!employee) {
            alert('Selecciona quién eres para registrar la pausa.');
            return;
        }

        if (timerInterval) clearInterval(timerInterval);
        secondsElapsed = 0;
        statusLabel.textContent = 'En Pausa / Descanso';

        const { data, error } = await supabase.from('time_entries').insert([{
            employee_id: employee.id,
            start_time: new Date().toISOString(),
            entry_type: 'break'
        }]).select();

        if (!error && data) {
            currentEntryId = data[0].id;
        }

        timerInterval = setInterval(() => {
            secondsElapsed++;
            display.textContent = formatTime(secondsElapsed);
        }, 1000);
    });

    btnStop.addEventListener('click', async () => {
        if (!currentEntryId) {
            alert('No hay ningún cronómetro corriendo.');
            return;
        }

        if (timerInterval) clearInterval(timerInterval);

        const { error } = await supabase.from('time_entries').update({
            end_time: new Date().toISOString(),
            duration_seconds: secondsElapsed
        }).eq('id', currentEntryId);

        if (error) {
            alert('Error al guardar el tiempo: ' + error.message);
        } else {
            alert('¡Turno registrado y guardado con éxito!');
        }

        secondsElapsed = 0;
        currentEntryId = null;
        display.textContent = '00:00:00';
        statusLabel.textContent = 'Listo para iniciar';
    });
}
