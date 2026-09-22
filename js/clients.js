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
        <div class="bg-slate-900 p-3 rounded-xl border border-slate-700 space-y-1">
            <strong class="text-emerald-400 text-sm">${c.company_name}</strong>
            ${c.address ? `<p class="text-xs text-slate-300">📍 ${c.address}</p>` : ''}
            <div class="flex justify-between text-xs text-slate-400 pt-1">
                <span>👤 ${c.contact_person || 'Sin contacto'}</span>
                <span>📞 ${c.phone || 'Sin teléfono'}</span>
            </div>
            ${c.project_name ? `<span class="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full inline-block mt-1">Proyecto: ${c.project_name}</span>` : ''}
        </div>
    `).join('');
}

export async function initClientsDropdown() {
    const select = document.getElementById('select-client');
    const activitySelect = document.getElementById('activity-client-select');
    
    const clients = await getClients();
    const optionsHTML = '<option value="">Sin cliente (Jornada general)</option>' + 
        clients.map(c => `<option value="${c.id}">${c.company_name} ${c.address ? '(' + c.address + ')' : ''}</option>`).join('');

    if (select) select.innerHTML = optionsHTML;
    if (activitySelect) {
        activitySelect.innerHTML = '<option value="">Selecciona un cliente...</option>' + 
            clients.map(c => `<option value="${c.id}">${c.company_name} ${c.address ? '(' + c.address + ')' : ''}</option>`).join('');
    }
}

// Lógica para leer la dirección de la foto del aviso usando IA en el navegador
function initPhotoScanner() {
    const photoInput = document.getElementById('client-photo-input');
    const addressInput = document.getElementById('client-address');
    const scanStatus = document.getElementById('scan-status');

    if (!photoInput) return;

    photoInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        scanStatus.textContent = 'Analizando foto del aviso... 🔄';
        scanStatus.className = 'text-xs text-amber-400';

        try {
            const reader = new FileReader();
            reader.onload = async function() {
                const base64Image = reader.result;
                
                const response = await window.ai.languageModel.generate({
                    prompt: "Extrae únicamente la dirección exacta (calle, número y ciudad si aparece) que se lee en este aviso o cartel frente a la casa. Si no encuentras una dirección clara, responde exactamente: 'No se pudo leer la dirección'.",
                    images: [base64Image]
                });

                const detectedAddress = response.trim();
                if (detectedAddress && !detectedAddress.includes('No se pudo')) {
                    addressInput.value = detectedAddress;
                    scanStatus.textContent = '¡Dirección detectada con éxito! ✅';
                    scanStatus.className = 'text-xs text-emerald-400';
                } else {
                    scanStatus.textContent = 'No se detectó dirección clara. Escríbela manual. ⚠️';
                    scanStatus.className = 'text-xs text-rose-400';
                }
            };
            reader.readAsDataURL(file);
        } catch (err) {
            console.error('Error procesando la imagen:', err);
            scanStatus.textContent = 'Error al leer la foto. Inténtalo de nuevo.';
            scanStatus.className = 'text-xs text-rose-400';
        }
    });
}

export function initClientsModule() {
    renderClientsList();
    initClientsDropdown();
    initPhotoScanner();
    
    const form = document.getElementById('form-client');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const company_name = document.getElementById('client-company').value;
            const address = document.getElementById('client-address').value;
            const contact_person = document.getElementById('client-contact').value;
            const phone = document.getElementById('client-phone').value;
            const project_name = document.getElementById('client-project').value;

            try {
                await createClientRecord({ company_name, address, contact_person, phone, project_name });
                form.reset();
                document.getElementById('scan-status').textContent = '';
                renderClientsList();
                initClientsDropdown();
                alert('¡Cliente guardado correctamente!');
            } catch (err) {
                alert('Error al guardar cliente: ' + err.message);
            }
        });
    }
}
