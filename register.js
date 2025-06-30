document.addEventListener("DOMContentLoaded", () => {
  const registerForm = document.getElementById("registerForm")
  const registerBtn = document.getElementById("registerBtn")
  const errorMessage = document.getElementById("errorMessage")
  const successMessage = document.getElementById("successMessage")

  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault()

    // Limpar mensagens anteriores
    hideMessages()

    // Obter dados do formulário
    const formData = new FormData(registerForm)
    const fullName = formData.get("fullName").trim()
    const username = formData.get("username").trim()
    const email = formData.get("email").trim()
    const password = formData.get("password")
    const confirmPassword = formData.get("confirmPassword")

    // Validações básicas
    if (!fullName || !username || !email || !password || !confirmPassword) {
      showError("Todos os campos são obrigatórios.")
      return
    }

    if (password !== confirmPassword) {
      showError("As senhas não coincidem.")
      return
    }

    if (password.length < 4) {
      showError("A senha deve ter pelo menos 4 caracteres.")
      return
    }

    // Mostrar loading
    setLoading(true)

    try {
      // Preparar dados para envio
      const userData = {
        username: username,
        senha: password,
        nomeCompleto: fullName,
        email: email,
      }

      // Fazer requisição para a API
      const response = await fetch("https://desconecta-bvemd6gqcbgqfaf2.brazilsouth-01.azurewebsites.net/Usuario", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      })

      if (response.ok) {
        // Cadastro bem-sucedido
        showSuccess("Conta criada com sucesso! Redirecionando para o dashboard...")

        // Salvar dados do usuário (simulado)
        localStorage.setItem("userLoggedIn", "true")
        localStorage.setItem("userName", fullName)
        localStorage.setItem("userEmail", email)

        // Redirecionar para o dashboard após 2 segundos
        setTimeout(() => {
          window.location.href = "/dashboard.html"
        }, 2000)
      } else {
        // Erro na resposta
        const errorData = await response.text()
        let errorMsg = "Erro ao criar conta. Tente novamente."

        try {
          const parsedError = JSON.parse(errorData)
          if (parsedError.message) {
            errorMsg = parsedError.message
          }
        } catch (e) {
          // Se não conseguir fazer parse do JSON, usar mensagem padrão
          if (response.status === 400) {
            errorMsg = "Dados inválidos. Verifique as informações e tente novamente."
          } else if (response.status === 409) {
            errorMsg = "Este email ou nome de usuário já está em uso."
          } else if (response.status === 500) {
            errorMsg = "Erro interno do servidor. Tente novamente mais tarde."
          }
        }

        showError(errorMsg)
      }
    } catch (error) {
      console.error("Erro na requisição:", error)
      showError("Erro de conexão. Verifique sua internet e tente novamente.")
    } finally {
      setLoading(false)
    }
  })

  function setLoading(loading) {
    const btnText = registerBtn.querySelector(".btn-text")
    const spinner = registerBtn.querySelector(".loading-spinner")

    if (loading) {
      btnText.textContent = "Criando conta..."
      spinner.style.display = "block"
      registerBtn.disabled = true
    } else {
      btnText.textContent = "Criar Conta"
      spinner.style.display = "none"
      registerBtn.disabled = false
    }
  }

  function showError(message) {
    errorMessage.textContent = message
    errorMessage.style.display = "block"
    successMessage.style.display = "none"
  }

  function showSuccess(message) {
    successMessage.textContent = message
    successMessage.style.display = "block"
    errorMessage.style.display = "none"
  }

  function hideMessages() {
    errorMessage.style.display = "none"
    successMessage.style.display = "none"
  }
})
