const installButton = document.querySelector('.install')
let deferdPrompt

window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault()
    deferdPrompt = e
    installButton.classList.remove('hidden')
})

installButton.addEventListener('click', async e => {
    e.preventDefault()
    if(deferdPrompt) {
        deferdPrompt.prompt()
        const outcome = await deferdPrompt.userChoice
        if(outcome.outcome == "accepted") {
            installButton.classList.add('hidden')
        }
    }
})

window.addEventListener('appinstalled', ()=> {
    installButton.classList.add('hidden')
})