let allPokemonNames = [];
let activeIndex = -1;
let currentMatches = [];

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

/* Input typing */
input.addEventListener("input", () => {
    const value = input.value.toLowerCase();
    suggestionsList.innerHTML = "";
    activeIndex = -1;

    if (!value) return;

    currentMatches = allPokemonNames
        .filter(name => name.startsWith(value))
        .slice(0, 10);

    currentMatches.forEach((name, index) => {
        const li = document.createElement("li");
        li.classList.add("list-group-item");
        li.textContent = name;

        li.onclick = () => {
            selectSuggestion(index);
        };

        suggestionsList.appendChild(li);
    });
});

/* Keyboard navigation */
input.addEventListener("keydown", (e) => {
    const items = suggestionsList.querySelectorAll("li");
    if (!items.length) return;

    if (e.key === "ArrowDown") {
        e.preventDefault();
        activeIndex = (activeIndex + 1) % items.length;
        updateActiveItem(items);
    }

    if (e.key === "ArrowUp") {
        e.preventDefault();
        activeIndex = (activeIndex - 1 + items.length) % items.length;
        updateActiveItem(items);
    }

    if (e.key === "Enter") {
        e.preventDefault();

        if (activeIndex >= 0) {
            selectSuggestion(activeIndex);
        } else {
            closeSuggestions();
            fetchPokemon(input.value.toLowerCase());
        }
    }
});

/* Select suggestion */
function selectSuggestion(index) {
    if (index < 0 || index >= currentMatches.length) return;

    input.value = currentMatches[index];
    closeSuggestions();
    fetchPokemon(currentMatches[index]);
}

/* Highlight active item */
function updateActiveItem(items) {
    items.forEach((item, i) => {
        item.classList.toggle("active", i === activeIndex);
    });
}

/* Close dropdown */
function closeSuggestions() {
    suggestionsList.innerHTML = "";
    activeIndex = -1;
    currentMatches = [];
}

/* FETCH POKÉMON */
async function fetchPokemon(query) {
    try {
        if (!query) query = input.value.toLowerCase();
        if (!query) return;

        closeSuggestions();

        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${query}`);
        if (!response.ok) throw new Error("Not found");

        const data = await response.json();

        /* IMAGE */
        document.getElementById("pokemonImage").src =
            data.sprites.other["official-artwork"].front_default;

        /* TEXT */
        document.getElementById("pokemonName").textContent = data.name;
        document.getElementById("pokemonTypes").textContent =
            data.types.map(t => t.type.name).join(", ");
        document.getElementById("pokemonHeight").textContent =
            `${data.height / 10} m`;
        document.getElementById("pokemonWeight").textContent =
            `${data.weight / 10} kg`;

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
document.getElementById("fetchButton").addEventListener("click", () => {
    closeSuggestions();
    fetchPokemon();
});

/* RANDOM BUTTON */
document.getElementById("randomButton").addEventListener("click", () => {
    closeSuggestions();
    const randomId = Math.floor(Math.random() * 898) + 1;
    fetchPokemon(randomId);
});
