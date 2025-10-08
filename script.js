// On va se créer une constante pour la clé du localstorage
const STORAGE_KEY = "dab_account"

// On créé des comptes par défault
let accounts = [
    {id:1, name: "Dupont", pin:"1793", balance: 500, history: []},
    {id:2, name: "Pirard", pin:"1112", balance: 1500, history: []},
]

// Chargement des données depuis le local storage
try {
    const raw = localStorage.getItem(STORAGE_KEY) // Récupèrer les infos du local storage (en chaine de caractère)
    if (raw) {
        accounts = JSON.parse(raw); // Si récupère un truc, transforme la chaine de caractère en tableau/objet (JSON.parse)
    }
} catch (e) {
    console.log("Erreur de parsing des données stockées", e);
}

// Fonction pour enregistrer en local Storage
function save(){
    localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
}

// REFERENCE DU DOM
// On récupère les éléments HTML auxquels on veut accéder depuis le js
const accountSelect = document.getElementById("accountSelect");
const openLogin = document.getElementById("openLogin");
const session = document.getElementById("session");
const userName = document.getElementById("userName");
const userBalance = document.getElementById("userBalance");
const elHistory= document.getElementById("history");
const btnBalance = document.getElementById("btnBalance");
const btnWithdraw = document.getElementById("btnWithdraw");
const btnDeposit = document.getElementById("btnDeposit");
const btnLogout = document.getElementById("btnLogout");

// Variable qui contient le compte actuellement connecté
let current = null

// FONCTION UI
// Méthode qui permet de remplir la liste select
function populate(){
    accountSelect.innerHTML = ``; //permet de vider la list
    accounts.forEach(a => {
        const opt = document.createElement("option") // Créer un élément HTML (ici la balise <option>)
        opt.value = a.id; // <option value ="1"></option>
        opt.textContent = `${a.name} (${a.balance}€)` // <option value ="1">Dupont (500€)</option>
        // Une fois que la balise a été construite, il faut l'inserer dans son parent (???)
        accountSelect.append(opt)
    })
}

populate();

//EVENEMENTS : action utilisateur

// Connection : on demande le pin via prompt()
openLogin.addEventListener("click", ()=>{
    const id = accountSelect.value; // On récupère l'id de l'utilisateur
    const acc = accounts.find(x => x.id == id)
    if (!acc) return alert("Compte introuvable")

    // On créé le prompt pour saisir le pin
    const pin = prompt(`Entrez le PIN pour ${acc.name}\n
        (Exercice: ${acc.pin})`)
    // On vérifie si le pin est ok
    if(pin===acc.pin){
        current = acc; //On garde la référence du compte connecté
        //TODO afficher les options du DAB
        enterSession()
    }else{
        alert("PIN incorrect");
    }
})

// EnterSession : affichage de l'interface utilisateur connecté
function enterSession(){
    session.classList.remove("hidden");
    userName.textContent = current.name;
    userBalance.textContent = current.balance.toFixed(2) + "€"
    renderHistory() // On appelle la méthode qui construit l'historique
}

// Methode pour voir le solde
btnBalance.addEventListener("click", ()=>{
    if(!current) return alert("Aucun compte connecté")

    alert(`Solde: ${current.balance.toFixed(2)}€`)
})

// Méthode pour retirer de l'argent
btnWithdraw.addEventListener("click", ()=>{
    if(!current) return alert("Aucun compte connecté")
    const s = prompt("Montant à retirer (ex:50) : ")
    const v = Number(s); // Convertir les résultat du prompt en integer
    // Validation : present, positif, fond suffisant
    if (!v || v <= 0) return alert("Montant invalide")
    if (v > current.balance) return alert("Solde insuffisant")

    // On met a jour le solde et l'historique
    current.balance -= v;
    current.history = current.history || []
    current.history.unshift({t: "retrait", amount: -v, when: new Date().toISOString()}); // unshift Permet d'insérer l'élèment dans le tableau history à la 1ère place
    save();

    // On met a jour l'affichage
    userBalance.textContent = current.balance.toFixed(2) + "€";
    renderHistory()
    alert("Retrait effectué avec succès.")
})

// Méthode pour ajouter de l'argent
btnDeposit.addEventListener("click", ()=>{
    if(!current) return alert("Aucun compte connecté")
    const s = prompt("Montant à déposer (ex:50) : ")
    const v = Number(s); 

    if (!v || v <= 0) return alert("Montant invalide")

    current.balance += v;
    current.history = current.history || []
    current.history.unshift({t: "dépot", amount: v, when: new Date().toISOString()}); 
    save();

    userBalance.textContent = current.balance.toFixed(2) + "€";
    renderHistory()
    alert("Retrait effectué avec succès.")
})

// PARTIE AFFICHAGE HISTORIQUE
// Méthode pour afficer l'historique des transactions
function renderHistory(){
    elHistory.innerHTML = ""; // On vide l'élément <ul>
    const list = (current && current.history) ? current.history : [];
    
    if (list.length === 0){
        elHistory.innerHTML = "<li>Aucune opération effectuée</li>"
        return
    }
    // Si j'ai des éléments dans mon tableau history on parcours les 10 premiers éléments
    list.slice(0,10).map(tx => {
        // On doit créer un élément li
        const li = document.createElement("li") //<li></li>
        li.textContent = `${tx.t} : ${tx.amount}€ - (${new Date(tx.when).toLocaleString()})`
        // Il faut injecter les li dans son parent
        elHistory.append(li)
    })
}

// Méthode pour se déconnecter
btnLogout.addEventListener("click", ()=>{
    current=null // On vide les données de l'utilisateur
    session.classList.add("hidden") // On remet la class hidden
})