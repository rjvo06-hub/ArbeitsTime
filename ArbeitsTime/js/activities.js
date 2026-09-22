import { supabase } from './supabaseClient.js';
import { getActiveEmployee } from './auth.js';
import { getClients } from './clients.js';

export async function getActivities() {
    const { data, error } = await supabase
        .from('activities')
        .select(`
            *,
            clients (company_name, project_name),
            employees (name)
        `)
        .order('activity_date', { ascending: false });

    if (error) {
        console.error('Error al cargar actividades:', error.message);
        return [];
    }
    return data;
}

export async function createActivity(activityData) {
    const { data, error } = await supabase.from('activities').insert([activityData]).select();
    if (error) throw new Error(error.message);
    return data[0];
}

export async function initActivitiesDropdowns() {
    const selectClient = document.getElementById('activity-client-select');
    if (!selectClient) return;

    const clients = await getClients();
    selectClient.innerHTML = '<option value="">Selecciona un cliente...</option>';
    clients.forEach(c => {
        selectClient.innerHTML += `<option value="${c.id}">${c.company_name} ${c.project_name ? '- ' + c.project_name : ''}</option>`;
    });
}

export async function renderActivitiesList() {
    const container = document.getElementById('activities-list');
    if (!container) return;

    const activities = await getActivities();
    if (activities.length === 0) {
        container.innerHTML = 'No hay actividades registradas.';
        return;
    }

    container.innerHTML = activities.map(act => `
        <div class="bg-slate-900 p-3 rounded-xl border border-slate-700 space-y-1">
            <div class="flex justify-between items-start">
                <strong class="text-emerald-400 text-sm">${act.activity_name}</strong>
                <span class="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">
                    ${act.employees?.name || 'Empleado'}
                </span>
            </div>
            <p class="text-xs text-slate-300">Cliente: <strong>${act.clients?.company_name || 'General'}</strong></p>
            ${act.description ? `<p class="text-xs text-slate-400">${act.description}</p>` : ''}
            <span class="text-[10px] text-slate-500 block">${new Date(act.activity_date).toLocaleString()}</span>
        </div>
    `).join('');
}

export function initActivitiesModule() {
    initActivitiesDropdowns();
    renderActivitiesList();

    const form = document.getElementById('form-activity');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const employee = getActiveEmployee();
            if (!employee) {
                alert('Debes seleccionar un empleado activo en el menú superior para registrar una actividad.');
                return;
            }

            const client_id = document.getElementById('activity-client-select').value;
            const activity_name = document.getElementById('activity-name').value;
            const description = document.getElementById('activity-desc').value;

            if (!client_id) {
                alert('Selecciona un cliente para la actividad.');
                return;
            }

            try {
                await createActivity({
                    client_id,
                    employee_id: employee.id,
                    activity_name,
                    description
                });
                form.reset();
                initActivitiesDropdowns();
                renderActivitiesList();
                alert('¡Actividad registrada con éxito!');
            } catch (err) {
                alert('Error al guardar actividad: ' + err.message);
            }
        });
    }
}
