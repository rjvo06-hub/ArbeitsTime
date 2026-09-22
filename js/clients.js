import { supabase } from './supabaseClient.js';

export async function getClients() {
    const { data, error } = await supabase.from('clients').select('*').order('company_name');
    if (error) {
        console.error('Error al obtener clientes:', error.message);
        return [];
    }
    return data;
}

export async function createClientRecord(clientData) {
    const { data, error } = await supabase.from('clients').insert([clientData]).select();
    if (error) throw new Error(error.message);
    return data[0];
}

export async function renderClientsList() {
    const container = document.getElementById('clients-list');
    if (!container) return;

    const clients = await getClients();
    if (clients.length === 0) {
        container.innerHTML = 'No hay clientes registrados.';
        return;
    }

    container.innerHTML = clients.map(c => `
        <div class="bg-slate-900 p-2.5 rounded-xl border border-slate-700">
            <strong>${c.company_name}</strong>
            ${c.project_name ? `<br><span class="text-xs text-slate-500">Proyecto: ${c.project_name}</span>` : ''}
        </div>
    `).join('');
}

export async function initClientsDropdown() {
    const select = document.getElementById('select-client');
    if (!select) return;

    const clients = await getClients();
    select.innerHTML = '<option value="">Sin cliente (Jornada general)</option>';
    clients.forEach(c => {
        select.innerHTML += `<option value="${c.id}">${c.company_name} ${c.project_name ? '- ' + c.project_name : ''}</option>`;
    });
}

export function initClientsModule() {
    renderClientsList();
    initClientsDropdown();
    
    const form = document.getElementById('form-client');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const company_name = document.getElementById('client-company').value;
            const project_name = document.getElementById('client-project').value;
            try {
                await createClientRecord({ company_name, project_name });
                form.reset();
                renderClientsList();
                initClientsDropdown();
            } catch (err) {
                alert('Error al guardar cliente: ' + err.message);
            }
        });
    }
}
