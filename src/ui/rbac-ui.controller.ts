import { Controller, Get, Header } from '@nestjs/common';

@Controller('ui')
export class RbacUiController {
  @Get('rbac')
  @Header('content-type', 'text/html; charset=utf-8')
  getRbacUi() {
    return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Keycloak RBAC</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        background: #F8F9FB;
        color: #1A1D2F;
        line-height: 1.5;
      }
      
      .sidebar {
        width: 320px;
        background: white;
        border-right: 1px solid #E5E7EB;
        height: 100vh;
        position: fixed;
        left: 0;
        top: 0;
        overflow-y: auto;
        z-index: 20;
      }
      
      .main-content {
        margin-left: 320px;
        min-height: 100vh;
        background: #F8F9FB;
      }
      
      .role-item {
        transition: all 0.2s ease;
        border-left: 3px solid transparent;
      }
      
      .role-item:hover {
        background: #F3F4F6;
      }
      
      .role-item.active {
        background: #EEF2FF;
        border-left-color: #4F46E5;
      }
      
      .role-item.active .role-name {
        color: #4F46E5;
      }
      
      .permission-card {
        transition: all 0.2s ease;
      }
      
      .permission-card:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      }
      
      .btn-primary {
        background: #4F46E5;
        color: white;
        border: none;
        transition: all 0.2s ease;
      }
      
      .btn-primary:hover:not(:disabled) {
        background: #4338CA;
        transform: translateY(-1px);
        box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.3);
      }
      
      .btn-primary:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      
      .btn-secondary {
        background: white;
        color: #374151;
        border: 1px solid #D1D5DB;
        transition: all 0.2s ease;
      }
      
      .btn-secondary:hover {
        background: #F9FAFB;
        border-color: #9CA3AF;
      }
      
      .input-field {
        background: white;
        border: 1px solid #D1D5DB;
        border-radius: 8px;
        transition: all 0.2s ease;
      }
      
      .input-field:focus {
        outline: none;
        border-color: #4F46E5;
        box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
      }
      
      .chip {
        background: #EEF2FF;
        color: #4F46E5;
        border-radius: 6px;
        font-size: 12px;
        font-weight: 500;
        padding: 4px 12px;
      }
      
      .toast {
        animation: slideIn 0.3s ease;
      }
      
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      
      .custom-checkbox {
        width: 18px;
        height: 18px;
        border: 2px solid #D1D5DB;
        border-radius: 4px;
        transition: all 0.2s ease;
      }
      
      .custom-checkbox:checked {
        background: #4F46E5;
        border-color: #4F46E5;
      }
      
      @media (max-width: 768px) {
        .sidebar {
          width: 100%;
          height: auto;
          position: relative;
        }
        .main-content {
          margin-left: 0;
        }
      }
    </style>
  </head>
  <body>
    <div class="sidebar">
      <div style="padding: 24px; border-bottom: 1px solid #E5E7EB;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #4F46E5, #7C3AED); border-radius: 12px; display: flex; align-items: center; justify-content: center;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <div>
            <div style="font-size: 18px; font-weight: 700; color: #1A1D2F;">RBAC Manager</div>
            <div style="font-size: 12px; color: #6B7280;">Keycloak Administration</div>
          </div>
        </div>
        
        <div style="margin-top: 20px; display: flex; gap: 8px;">
          <div style="flex: 1; position: relative;">
            <svg style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); width: 16px; height: 16px; color: #9CA3AF;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input id="roleSearch" class="input-field" style="width: 100%; padding: 10px 12px 10px 36px; font-size: 14px;" placeholder="Search roles..." />
          </div>
          <button id="refreshBtn" class="btn-secondary" style="padding: 10px 12px; border-radius: 8px; font-size: 14px; font-weight: 500;">
            <svg style="width: 16px; height: 16px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
          </button>
        </div>
        
        <div style="margin-top: 16px; display: flex; justify-content: space-between; align-items: center;">
          <div style="font-size: 13px; font-weight: 600; color: #6B7280; text-transform: uppercase; letter-spacing: 0.5px;">Roles</div>
          <span id="rolesCount" style="background: #EEF2FF; color: #4F46E5; padding: 2px 10px; border-radius: 12px; font-size: 12px; font-weight: 600;">0</span>
        </div>
      </div>
      
      <div id="rolesList" style="padding: 8px;"></div>
      
      <div style="padding: 16px; border-top: 1px solid #E5E7EB;">
        <div style="margin-bottom: 12px; font-size: 13px; font-weight: 600; color: #6B7280; text-transform: uppercase; letter-spacing: 0.5px;">Authentication</div>
        <label style="font-size: 12px; font-weight: 500; color: #374151; margin-bottom: 4px; display: block;">Bearer Token</label>
        <input id="authToken" class="input-field" style="width: 100%; padding: 8px 12px; font-size: 12px;" placeholder="eyJhbGciOi... (or 'mock')" />
        <a href="/api" target="_blank" rel="noreferrer" style="display: inline-flex; align-items: center; gap: 4px; margin-top: 12px; color: #4F46E5; text-decoration: none; font-size: 13px; font-weight: 500;">
          <svg style="width: 14px; height: 14px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
          </svg>
          API Documentation
        </a>
      </div>
    </div>

    <div class="main-content">
      <header style="background: white; border-bottom: 1px solid #E5E7EB; padding: 20px 32px; position: sticky; top: 0; z-index: 10;">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
          <div>
            <div style="display: flex; align-items: center; gap: 12px;">
              <div>
                <h2 style="font-size: 20px; font-weight: 700;" id="selectedRoleName">Select a Role</h2>
                <p style="font-size: 13px; color: #6B7280; margin-top: 2px;" id="selectedRoleId">Choose a role from the sidebar to manage permissions</p>
              </div>
              <span id="assignedCount" style="background: #EEF2FF; color: #4F46E5; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; white-space: nowrap;">No role selected</span>
            </div>
          </div>
          
          <div style="display: flex; gap: 8px;">
            <button id="selectAllBtn" class="btn-secondary" style="padding: 8px 16px; border-radius: 8px; font-size: 13px; font-weight: 500;">
              <svg style="width: 14px; height: 14px; margin-right: 4px; display: inline;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              Select All
            </button>
            <button id="clearBtn" class="btn-secondary" style="padding: 8px 16px; border-radius: 8px; font-size: 13px; font-weight: 500;">
              <svg style="width: 14px; height: 14px; margin-right: 4px; display: inline;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
              Clear
            </button>
            <button id="assignBtn" class="btn-primary" style="padding: 8px 20px; border-radius: 8px; font-size: 13px; font-weight: 600;" disabled>
              <svg style="width: 14px; height: 14px; margin-right: 4px; display: inline;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
              </svg>
              Assign Selected
            </button>
          </div>
        </div>
        
        <div style="margin-top: 16px; position: relative;">
          <svg style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); width: 16px; height: 16px; color: #9CA3AF;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input id="permSearch" class="input-field" style="width: 100%; padding: 10px 12px 10px 36px; font-size: 14px;" placeholder="Search permissions..." />
        </div>
      </header>

      <div style="padding: 24px 32px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <div>
            <h3 style="font-size: 16px; font-weight: 600;">Available Permissions</h3>
            <p style="font-size: 13px; color: #6B7280; margin-top: 2px;" id="permStats">Select permissions to assign</p>
          </div>
        </div>
        
        <div id="permsList" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px;"></div>
      </div>

      <div style="border-top: 1px solid #E5E7EB; padding: 24px 32px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <div>
            <h3 style="font-size: 16px; font-weight: 600;">Assigned Permissions</h3>
            <p style="font-size: 13px; color: #6B7280; margin-top: 2px;">Currently assigned to this role</p>
          </div>
          <button id="reloadAssignedBtn" class="btn-secondary" style="padding: 8px 16px; border-radius: 8px; font-size: 13px; font-weight: 500;">
            <svg style="width: 14px; height: 14px; margin-right: 4px; display: inline;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
            Reload
          </button>
        </div>
        <div id="assignedList" style="display: flex; flex-wrap: wrap; gap: 8px;"></div>
      </div>
    </div>

    <!-- Toast -->
    <div id="toast" class="toast" style="position: fixed; bottom: 24px; right: 24px; background: white; border: 1px solid #E5E7EB; border-radius: 12px; padding: 16px 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); display: none; z-index: 50; max-width: 360px;">
      <div style="display: flex; align-items: start; gap: 12px;">
        <div style="width: 32px; height: 32px; background: linear-gradient(135deg, #4F46E5, #7C3AED); border-radius: 8px; display: flex; align-items: center; justify-content: center;">
          <svg style="width: 16px; height: 16px; color: white;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
          </svg>
        </div>
        <div>
          <div style="font-size: 14px; font-weight: 600;" id="toastTitle">Done</div>
          <div style="font-size: 12px; color: #6B7280; margin-top: 2px;" id="toastBody"></div>
        </div>
      </div>
    </div>

    <script>
      const state = {
        roles: [],
        permissions: [],
        assigned: [],
        selectedRole: null,
        selectedPermissionIds: new Set(),
        authToken: '',
      };

      const el = (id) => document.getElementById(id);
      const toast = (title, body) => {
        el('toastTitle').textContent = title;
        el('toastBody').textContent = body || '';
        el('toast').style.display = 'block';
        clearTimeout(window.__toastT);
        window.__toastT = setTimeout(() => el('toast').style.display = 'none', 3000);
      };

      function getAuthHeader() {
        const token = (state.authToken || '').trim();
        if (!token) return {};
        return { Authorization: 'Bearer ' + token };
      }

      async function fetchJson(url, options) {
        const method = (options?.method || 'GET').toUpperCase();
        const res = await fetch(url, {
          headers: {
            ...(method === 'POST' || method === 'PUT' || method === 'PATCH'
              ? { 'content-type': 'application/json' }
              : {}),
            ...getAuthHeader(),
          },
          ...(options || {}),
        });
        if (!res.ok) {
          const text = await res.text().catch(() => '');
          throw new Error(text || res.statusText || ('HTTP ' + res.status));
        }
        const contentType = res.headers.get('content-type') || '';
        if (contentType.includes('application/json')) return res.json();
        return res.text();
      }

      function byName(a, b) {
        return String(a?.name || '').localeCompare(String(b?.name || ''));
      }

      function renderRoles() {
        const q = (el('roleSearch').value || '').toLowerCase().trim();
        const list = el('rolesList');
        list.innerHTML = '';

        const filtered = state.roles
          .filter((r) => (r.name || '').toLowerCase().includes(q))
          .sort(byName);

        el('rolesCount').textContent = filtered.length;

        for (const role of filtered) {
          const active = state.selectedRole?.id === role.id;
          const div = document.createElement('div');
          div.className = 'role-item' + (active ? ' active' : '');
          div.style.cssText = 'cursor: pointer; padding: 12px 20px; border-bottom: 1px solid #F3F4F6;';
          div.innerHTML =
            '<div style="display: flex; justify-content: space-between; align-items: center;">' +
            '<div>' +
            '<div class="role-name" style="font-size: 14px; font-weight: ' + (active ? '600' : '500') + '; color: ' + (active ? '#4F46E5' : '#374151') + ';">' + (role.name || '(no name)') + '</div>' +
            '<div style="font-size: 12px; color: #9CA3AF; margin-top: 2px;">' + (role.id || '') + '</div>' +
            '</div>' +
            (active ? '<svg style="width: 20px; height: 20px; color: #4F46E5;" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>' : '') +
            '</div>';
          div.onclick = () => selectRole(role);
          list.appendChild(div);
        }

        if (!filtered.length) {
          const empty = document.createElement('div');
          empty.style.cssText = 'padding: 32px 20px; text-align: center;';
          empty.innerHTML = '<div style="font-size: 14px; color: #9CA3AF;">No roles found</div>';
          list.appendChild(empty);
        }
      }

      function renderPermissions() {
        const q = (el('permSearch').value || '').toLowerCase().trim();
        const list = el('permsList');
        list.innerHTML = '';

        const filtered = state.permissions
          .filter((p) => (p.name || '').toLowerCase().includes(q))
          .sort(byName);

        const selectedCount = state.selectedPermissionIds.size;
        el('permStats').textContent = filtered.length + ' permissions available • ' + selectedCount + ' selected';

        for (const perm of filtered) {
          const checked = state.selectedPermissionIds.has(perm.id);
          const card = document.createElement('div');
          card.className = 'permission-card';
          card.style.cssText = 'background: white; border: ' + (checked ? '2px solid #4F46E5' : '1px solid #E5E7EB') + '; border-radius: 12px; padding: 16px; cursor: pointer;';
          
          card.innerHTML =
            '<div style="display: flex; align-items: flex-start; gap: 12px;">' +
            '<input type="checkbox" class="custom-checkbox" style="margin-top: 2px; flex-shrink: 0;" ' + (checked ? 'checked' : '') + ' />' +
            '<div style="flex: 1;">' +
            '<div style="font-size: 14px; font-weight: 600; color: ' + (checked ? '#4F46E5' : '#1A1D2F') + ';">' + (perm.name || '(no name)') + '</div>' +
            '<div style="font-size: 12px; color: #6B7280; margin-top: 4px;">ID: ' + (perm.id || '') + '</div>' +
            '</div>' +
            (checked ? '<svg style="width: 20px; height: 20px; color: #4F46E5;" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>' : '') +
            '</div>';

          const input = card.querySelector('input');
          card.onclick = (e) => {
            if (e.target !== input) {
              input.checked = !input.checked;
            }
            if (input.checked) state.selectedPermissionIds.add(perm.id);
            else state.selectedPermissionIds.delete(perm.id);
            updateAssignButton();
            renderPermissions();
          };
          
          input.onchange = (e) => {
            e.stopPropagation();
            if (e.target.checked) state.selectedPermissionIds.add(perm.id);
            else state.selectedPermissionIds.delete(perm.id);
            updateAssignButton();
            renderPermissions();
          };

          list.appendChild(card);
        }

        if (!filtered.length) {
          const empty = document.createElement('div');
          empty.style.cssText = 'grid-column: 1 / -1; padding: 48px; text-align: center;';
          empty.innerHTML = '<div style="font-size: 14px; color: #9CA3AF;">No permissions match your search</div>';
          list.appendChild(empty);
        }
      }

      function renderAssigned() {
        const wrap = el('assignedList');
        wrap.innerHTML = '';
        el('assignedCount').textContent = state.selectedRole 
          ? 'Assigned: ' + state.assigned.length + ' permissions'
          : 'No role selected';

        for (const perm of state.assigned.sort(byName)) {
          const chip = document.createElement('span');
          chip.className = 'chip';
          chip.style.cssText = 'display: inline-flex; align-items: center; gap: 6px;';
          chip.innerHTML =
            '<svg style="width: 12px; height: 12px;" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>' +
            '<span style="font-weight: 500;">' + (perm.name || '(no name)') + '</span>';
          wrap.appendChild(chip);
        }

        if (!state.assigned.length) {
          const empty = document.createElement('div');
          empty.style.cssText = 'width: 100%; padding: 32px; text-align: center;';
          empty.innerHTML = '<div style="font-size: 14px; color: #9CA3AF;">No permissions assigned yet</div>';
          wrap.appendChild(empty);
        }
      }

      function updateAssignButton() {
        const canAssign = Boolean(state.selectedRole?.id) && state.selectedPermissionIds.size > 0;
        el('assignBtn').disabled = !canAssign;
      }

      async function selectRole(role) {
        state.selectedRole = role;
        el('selectedRoleName').textContent = role.name || '(no name)';
        el('selectedRoleId').textContent = 'Role ID: ' + (role.id || '');

        await loadAssigned();
        state.selectedPermissionIds = new Set(state.assigned.map((p) => p.id).filter(Boolean));
        updateAssignButton();
        renderRoles();
        renderPermissions();
        renderAssigned();
      }

      async function loadAssigned() {
        if (!state.selectedRole?.id) return;
        try {
          const assigned = await fetchJson('/roles/' + encodeURIComponent(state.selectedRole.id) + '/permissions/client-roles');
          state.assigned = Array.isArray(assigned) ? assigned : [];
        } catch (e) {
          state.assigned = [];
          toast('Failed to load assigned', String(e.message || e));
        }
      }

      async function loadAll() {
        el('rolesCount').textContent = '...';
        try {
          const [roles, perms] = await Promise.all([
            fetchJson('/roles'),
            fetchJson('/client-roles'),
          ]);
          state.roles = Array.isArray(roles) ? roles : [];
          state.permissions = Array.isArray(perms) ? perms : [];
          renderRoles();
          renderPermissions();
          updateAssignButton();
        } catch (e) {
          toast('Load failed', String(e.message || e));
        }
      }

      async function assignSelected() {
        if (!state.selectedRole?.id) return;
        const selected = state.permissions.filter((p) => state.selectedPermissionIds.has(p.id));
        const payload = {
          realmRoleId: state.selectedRole.id,
          permissions: selected.map((p) => ({ id: p.id, name: p.name })),
        };

        try {
          await fetchJson('/roles/' + encodeURIComponent(state.selectedRole.id) + '/permissions', {
            method: 'POST',
            body: JSON.stringify(payload),
          });
          toast('Successfully Assigned', selected.length + ' permission(s) have been assigned');
          await loadAssigned();
          renderAssigned();
        } catch (e) {
          toast('Assignment Failed', String(e.message || e));
        }
      }

      // Events
      el('refreshBtn').onclick = async () => {
        state.selectedRole = null;
        state.assigned = [];
        state.selectedPermissionIds = new Set();
        el('selectedRoleName').textContent = 'Select a Role';
        el('selectedRoleId').textContent = 'Choose a role from the sidebar to manage permissions';
        el('assignedCount').textContent = 'No role selected';
        renderAssigned();
        updateAssignButton();
        await loadAll();
      };

      el('roleSearch').oninput = renderRoles;
      el('permSearch').oninput = renderPermissions;

      el('selectAllBtn').onclick = () => {
        for (const p of state.permissions) if (p.id) state.selectedPermissionIds.add(p.id);
        updateAssignButton();
        renderPermissions();
      };
      el('clearBtn').onclick = () => {
        state.selectedPermissionIds = new Set();
        updateAssignButton();
        renderPermissions();
      };
      el('assignBtn').onclick = assignSelected;
      el('reloadAssignedBtn').onclick = async () => {
        await loadAssigned();
        renderAssigned();
        toast('Reloaded', 'Assigned permissions updated');
      };

      // Boot
      renderAssigned();
      state.authToken = localStorage.getItem('rbac_token') || '';
      el('authToken').value = state.authToken;
      el('authToken').oninput = () => {
        state.authToken = el('authToken').value || '';
        localStorage.setItem('rbac_token', state.authToken);
      };
      loadAll();
    </script>
  </body>
</html>`;
  }
}
