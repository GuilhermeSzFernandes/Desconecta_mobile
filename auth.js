const API_BASE_URL = 'https://desconecta-bvemd6gqcbgqfaf2.brazilsouth-01.azurewebsites.net';

document.addEventListener('DOMContentLoaded', function() {
    // Verificar se já está logado
    if (localStorage.getItem('userToken')) {
        window.location.href = 'dashboard.html';
        return;
    }

    const loginForm = document.getElementById('loginForm');
    const loginBtn = document.getElementById('loginBtn');
    const errorMessage = document.getElementById('errorMessage');

    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        if (!email || !password) {
            showError('Por favor, preencha todos os campos.');
            return;
        }

        await login(email, password);
    });

    async function login(email, password) {
        setLoading(true);
        hideError();

        try {
            const response = await fetch(`${API_BASE_URL}/Autenticacao`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    Email: email,
                    Senha: password
                })
            });

            if (response.ok) {
                const data = await response.json();
                
                // Salvar token/dados do usuário
                localStorage.setItem('userToken', JSON.stringify(data));
                localStorage.setItem('userEmail', email);
                
                // Redirecionar para dashboard
                window.location.href = 'dashboard.html';
            } else {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Credenciais inválidas. Verifique seu email e senha.');
            }
        } catch (error) {
            console.error('Erro no login:', error);
            showError(error.message || 'Erro ao fazer login. Tente novamente.');
        } finally {
            setLoading(false);
        }
    }

    function setLoading(loading) {
        const btnText = document.querySelector('.btn-text');
        const spinner = document.querySelector('.loading-spinner');
        
        loginBtn.disabled = loading;
        
        if (loading) {
            btnText.style.display = 'none';
            spinner.style.display = 'block';
        } else {
            btnText.style.display = 'block';
            spinner.style.display = 'none';
        }
    }

    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
    }

    function hideError() {
        errorMessage.style.display = 'none';
    }
});