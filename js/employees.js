import { supabase } from './supabaseClient.js';

export async function getEmployees() {
    const { data, error } = await supabase.from('employees').select('*').eq('active', true).order('name');
    if (error) {
        console.error('Error al obtener empleados:', error.message);
        return [];
    }
    return data;
}

export async function createEmployee(employeeData) {
    const { data, error } = await supabase.from('employees').insert([employeeData]).select();
    if (error) throw new Error(error.message);
    return data[0];
}

export async function renderEmployeesList() {
    const container = document.getElementById('employees-list');
    if (!container) return;

    const employees = await getEmployees();
    if (employees.length === 0) {
        container.innerHTML = 'No hay empleados registrados.';
        return;
    }

    container.innerHTML = employees.map(e => `
        <div class="bg-slate-900 p-2.5 rounded-xl border border-slate-700 flex justify-between items-center">
            <div>
                <strong>${e.name}</strong><br>
                <span class="text-xs text-slate-500">${e.role || 'Sin cargo asignado'}</span>
            </div>
        </div>
    `).join('');
}

export function initEmployeesModule() {
    renderEmployeesList();
    const form = document.getElementById('form-employee');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('emp-name').value;
            const role = document.getElementById('emp-role').value;
            try {
                await createEmployee({ name, role });
                form.reset();
                renderEmployeesList();
            } catch (err) {
                alert('Error al guardar empleado: ' + err.message);
            }
        });
    }
}
