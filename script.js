let allPokemonNames = [];

/* Load Pokémon Names */
async function loadPokemonList() {
    const response = await fetch("https://pokeapi.co/api/v2/pokemon?limit=2000");
    const data = await response.json();
    allPokemonNames = data.results.map(p => p.name);
}
loadPokemonList();

/* AUTOCOMPLETE */
const input = document.getElementById("pokemonInput");
const suggestionsList = document.getElementById("suggestions");

input.addEventListener("input", () => {
    const value = input.value.toLowerCase();
    suggestionsList.innerHTML = "";
    if (!value) return;

    const matches = allPokemonNames
        .filter(name => name.startsWith(value))
        .slice(0, 10);

    matches.forEach(name => {
        const li = document.createElement("li");
        li.classList.add("list-group-item");
        li.textContent = name;

        li.onclick = () => {
            input.value = name;
            suggestionsList.innerHTML = "";
            fetchPokemon();
        };

        suggestionsList.appendChild(li);
    });
});

/* FETCH POKÉMON */
async function fetchPokemon(query) {
    try {
        if (!query) query = input.value.toLowerCase();
        if (!query) return;

        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${query}`);
        if (!response.ok) throw new Error("Not found");

        const data = await response.json();

        /* IMAGE */
        document.getElementById("pokemonImage").src = data.sprites.other["official-artwork"].front_default;

        /* TEXT */
        document.getElementById("pokemonName").textContent = data.name;
        document.getElementById("pokemonTypes").textContent =
            data.types.map(t => t.type.name).join(", ");
        document.getElementById("pokemonHeight").textContent = `${data.height / 10} m`;
        document.getElementById("pokemonWeight").textContent = `${data.weight / 10} kg`;

        /* STATS */
        const statsList = document.getElementById("pokemonStats");
        statsList.innerHTML = "";

        data.stats.forEach(s => {
            const li = document.createElement("li");
            const statName = s.stat.name;
            const statValue = s.base_stat;
            const percent = Math.min(statValue, 100);

            li.innerHTML = `
                <div class="stat-label">${statName}: ${statValue}</div>
                <div class="progress-container">
                    <div class="progress-bar-custom" style="width:${percent}%"></div>
                </div>`;
            statsList.appendChild(li);
        });

        /* SHOW CARD */
        document.getElementById("introMessage").style.display = "none";
        const card = document.getElementById("pokemonCard");
        card.style.display = "block";

        /* TYPE-BASED CARD COLOR */
        const type = data.types[0].type.name;
        card.className = "pokemon-card " + type;

        /* DYNAMIC BACKGROUND */
        document.body.style.background = typeToBackground(type);

    } catch (err) {
        alert("Pokémon not found");
    }
}

/* BACKGROUND COLORS BY TYPE */
function typeToBackground(type) {
    const colors = {
        fire: "#2e0b00",
        water: "#001a33",
        grass: "#002e14",
        electric: "#2e2e00",
        psychic: "#330022",
        dark: "#000000",
        dragon: "#1a0033",
    };
    return colors[type] || "#0f0f1a";
}

/* SEARCH BUTTON */
document.getElementById("fetchButton").addEventListener("click", () => fetchPokemon());

/* RANDOM BUTTON */
document.getElementById("randomButton").addEventListener("click", () => {
    const randomId = Math.floor(Math.random() * 898) + 1;
    fetchPokemon(randomId);
});
