import { initAuth } from './auth.js';
import { initEmployeesModule } from './employees.js';
import { initClientsModule } from './clients.js';
import { initActivitiesModule } from './activities.js';
import { initTimerModule } from './timer.js';

// Cambio de pestañas global en móvil (incluyendo actividades)
window.switchView = function(viewName) {
    ['timer', 'activities', 'employees', 'clients'].forEach(v => {
        const el = document.getElementById(`view-${v}`);
        if (el) {
            if (v === viewName) el.classList.remove('hidden');
            else el.classList.add('hidden');
        }
    });
};

document.addEventListener('DOMContentLoaded', async () => {
    console.log('ArbeitsTime inicializado modularmente con Actividades.');
    await initAuth();
    initEmployeesModule();
    initClientsModule();
    initActivitiesModule();
    initTimerModule();
});
