import { getEmployees } from './employees.js';

let activeEmployee = null;

export async function initAuth() {
    const select = document.getElementById('select-active-employee');
    const badge = document.getElementById('active-user-display');
    if (!select) return;

    const employees = await getEmployees();
    
    select.innerHTML = '<option value="">Selecciona quién eres...</option>';
    employees.forEach(emp => {
        select.innerHTML += `<option value="${emp.id}">${emp.name} ${emp.role ? '(' + emp.role + ')' : ''}</option>`;
    });

    select.addEventListener('change', (e) => {
        const empId = e.target.value;
        if (!empId) {
            activeEmployee = null;
            badge.textContent = 'Sin empleado';
            badge.className = 'text-xs bg-slate-700 text-slate-300 px-2.5 py-1 rounded-full';
            return;
        }

        activeEmployee = employees.find(emp => emp.id === empId);
        if (activeEmployee) {
            badge.textContent = activeEmployee.name;
            badge.className = 'text-xs bg-emerald-900 text-emerald-300 px-2.5 py-1 rounded-full border border-emerald-700 truncate max-w-[150px]';
        }
    });
}

export function getActiveEmployee() {
    return activeEmployee;
}
