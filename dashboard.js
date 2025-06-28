const API_BASE_URL = 'https://desconecta-bvemd6gqcbgqfaf2.brazilsouth-01.azurewebsites.net';

document.addEventListener('DOMContentLoaded', function() {
    // Verificar se está logado
    if (!localStorage.getItem('userToken')) {
        window.location.href = 'index.html';
        return;
    }

    loadChildren();
});

async function loadChildren() {
    showLoadingState();

    try {
        // Usando ID fixo 1 como no exemplo da API
        const response = await fetch(`${API_BASE_URL}/Usuario/1/Filhos`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (response.ok) {
            const children = await response.json();
            
            if (children && children.length > 0) {
                displayChildren(children);
            } else {
                showEmptyState();
            }
        } else {
            throw new Error('Erro ao carregar dispositivos');
        }
    } catch (error) {
        console.error('Erro ao carregar filhos:', error);
        showErrorState(error.message);
    }
}

function displayChildren(children) {
    const childrenList = document.getElementById('childrenList');
    
    childrenList.innerHTML = children.map(child => `
        <div class="child-card">
            <div class="child-header">
                <div class="child-info">
                    <h3>📱 ${child.nomeDispositivo}</h3>
                    <p>Dispositivo #${child.id}</p>
                </div>
                <span class="status-badge ${child.bloqueado ? 'status-blocked' : 'status-active'}">
                    ${child.bloqueado ? '🔒 Bloqueado' : '✅ Ativo'}
                </span>
            </div>
            
            <div class="child-details">
                <div class="detail-row">
                    <span class="detail-label">Data de Cadastro:</span>
                    <span class="detail-value">${formatDate(child.dataCadastro)}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Código da Máquina:</span>
                    <span class="detail-value">${child.codigoMaquina.substring(0, 20)}...</span>
                </div>
            </div>
            
            <div class="child-actions">
                <button 
                    class="${child.bloqueado ? 'btn-unblock' : 'btn-block'}" 
                    onclick="toggleDeviceStatus('${child.codigoMaquina}', ${child.bloqueado}, ${child.id})"
                    id="btn-${child.id}"
                >
                    ${child.bloqueado ? '🔓 Desbloquear' : '🔒 Bloquear'}
                </button>
            </div>
        </div>
    `).join('');

    showChildrenList();
}
async function toggleDeviceStatus(codigoMaquina, isBloqueado, deviceId) {
    const button = document.getElementById(`btn-${deviceId}`);
    const originalText = button.innerHTML;
    
    // Mostrar loading no botão
    button.disabled = true;
    button.innerHTML = '<div class="loading-spinner"></div> Processando...';

    try {
        const endpoint = isBloqueado ? 'desbloquear' : 'bloquear';
        const response = await fetch(`${API_BASE_URL}/dispositivos/${endpoint}/${codigoMaquina}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (response.ok) {
            // Atualizar apenas o botão e o status-badge no card
            const badge = button.closest('.child-card').querySelector('.status-badge');
            
            if (isBloqueado) {
                badge.classList.remove('status-blocked');
                badge.classList.add('status-active');
                badge.innerHTML = '✅ Ativo';
                button.classList.remove('btn-unblock');
                button.classList.add('btn-block');
                button.innerHTML = '🔒 Bloquear';
            } else {
                badge.classList.remove('status-active');
                badge.classList.add('status-blocked');
                badge.innerHTML = '🔒 Bloqueado';
                button.classList.remove('btn-block');
                button.classList.add('btn-unblock');
                button.innerHTML = '🔓 Desbloquear';
            }
        } else {
            throw new Error(`Erro ao ${isBloqueado ? 'desbloquear' : 'bloquear'} dispositivo`);
        }
    } catch (error) {
        console.error('Erro ao alterar status:', error);
        
        // Restaurar botão em caso de erro
        button.disabled = false;
        button.innerHTML = originalText;
        
        alert(`Erro: ${error.message}`);
        return;
    }

    button.disabled = false;
}


function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function showLoadingState() {
    document.getElementById('loadingState').style.display = 'block';
    document.getElementById('childrenList').style.display = 'none';
    document.getElementById('emptyState').style.display = 'none';
    document.getElementById('errorState').style.display = 'none';
}

function showChildrenList() {
    document.getElementById('loadingState').style.display = 'none';
    document.getElementById('childrenList').style.display = 'block';
    document.getElementById('emptyState').style.display = 'none';
    document.getElementById('errorState').style.display = 'none';
}

function showEmptyState() {
    document.getElementById('loadingState').style.display = 'none';
    document.getElementById('childrenList').style.display = 'none';
    document.getElementById('emptyState').style.display = 'block';
    document.getElementById('errorState').style.display = 'none';
}

function showErrorState(errorMessage) {
    document.getElementById('loadingState').style.display = 'none';
    document.getElementById('childrenList').style.display = 'none';
    document.getElementById('emptyState').style.display = 'none';
    document.getElementById('errorState').style.display = 'block';
    document.getElementById('errorText').textContent = errorMessage;
}

function logout() {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userEmail');
    window.location.href = 'index.html';
}
