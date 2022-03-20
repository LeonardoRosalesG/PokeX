function fetchPokemon() {
    const searchInputValue = document.getElementById("searchInput").value.toLowerCase();
    if(searchInputValue === undefined || searchInputValue === "" || searchInputValue === " "){
        alert("Ingresa un el nombre de un Pokémon...")
    }else{
        const url = ` https://pokeapi.co/api/v2/pokemon/${searchInputValue}`;
        fetch(url)
        .then((res)=>{
            if(res.status != 200){
                console.log(res);
                pokemonNotFound();
                setPokemonImage("./assets/no_pokemon.png");
            }else{
                return res.json();
            }
        }).then((data) =>{
            if(data){
                console.log(data);
                setPokemonGeneralInfo(data.id, data.name, data.weight, data.height);
                setPokemonImage(data.sprites.front_shiny);
                setPokemonType(data.types);
                setPokemonStats(data.stats);
                setPokemonMoves(data.moves);
            }
        });
    }
}

const setPokemonImage = (url) =>{
    let pokeImg = document.getElementById("pokemonImage");
    pokeImg.src = url;
}
const setPokemonGeneralInfo = (id, name, weight, height) =>{
    let realHeight = height/10;
    let realWeight = weight/10;
    let pokeName = document.getElementById('pokemonName');
    pokeName.innerHTML = "#" + id + " "+ name;
    pokeName.style.textTransform = "capitalize";
    let pokeMass = document.getElementById('massInfo');
    pokeMass.style.visibility = "visible";
    let pokeHeight = document.getElementById("heightInfo");
    pokeHeight.innerHTML = 'Height: ' + realHeight + " m.";
    let pokeWeight = document.getElementById("weightInfo");
    pokeWeight.innerHTML = 'Weight: ' + realWeight + " kg."

}

const pokemonNotFound = () =>{
    let pokeName = document.getElementById('pokemonName');
    let pokeMass = document.getElementById('massInfo');
    pokeName.innerHTML = 'Pokémon no encontrado...';
    pokeMass.style.visibility = 'hidden';
    const statsDiv = document.getElementById("statsDiv");
    if (statsDiv.hasChildNodes()){
        deleteChildren(statsDiv);
    }
    const pokemonTypeDiv = document.getElementById("pokemonTypeDiv");
    if(pokemonTypeDiv.hasChildNodes()){
        deleteChildren(pokemonTypeDiv);
    }
    let movesDiv = document.getElementById('movesDiv');
    if(movesDiv.hasChildNodes()){
        deleteChildren(movesDiv);
    }
}

const setPokemonType = (typeArray) =>{
    const pokemonTypeDiv = document.getElementById("pokemonTypeDiv");
    if(pokemonTypeDiv.hasChildNodes()){
        deleteChildren(pokemonTypeDiv);
    }
    createTableTypes(typeArray, pokemonTypeDiv);
}

const deleteChildren = (parent) =>{
    while(parent.firstChild){
        parent.removeChild(parent.firstChild);
    }
} 

const setPokemonStats = (statsArray) =>{
    const statsDiv = document.getElementById("statsDiv");
    if (statsDiv.hasChildNodes()){
        deleteChildren(statsDiv);
    }
    createTableStats(statsArray, statsDiv);
}

/**
 * Primer acercamiento
 */
/**
 * 
 * Obtiene los movimientos (object) que tienen un URL, el cual proporciona más detalles de estos. 
 */
/*
const setPokemonMoves = (movesArray)=>{
    let moveInfoArray = new Array();

    for(move of movesArray){
        moveInfoArray.push(fetchMoveInfo(move["move"]["url"]));
    }
    console.log("moveInfoArray");
    console.log(moveInfoArray);


/**
 * 
 * Usa el URL de movesArray para obtener info extra
 */
/*
const fetchMoveInfo = (moveURL) => {
         fetch(moveURL)
         .then((res) =>{
             if(res.status != 200){
                 console.log(res);
             }else{
                 return res.json();
             }
         }).then((data) =>{
             if(data){
                console.log(data);
                console.log("Datos de interes: ");
                console.log(data.name);
                console.log(data.power)
                console.log(data.type.name)
                console.log(data.damage_class.name)
                console.log(data.accuracy)
                return data;
                //No regresa datos
             }
         });
        }*/


/**
 * Segundo acercamiento
*/

const setPokemonMoves = (movesArray) =>{
    startLoading();
    let movesDiv = document.getElementById('movesDiv');
    if(movesDiv.hasChildNodes()){
        deleteChildren(movesDiv);
    }
    let moveInfoArray = new Array();
    var fetches = [];
    for(move of movesArray){
        fetches.push(
            fetch(move["move"]["url"])
            .then((res) =>{
                if(res.status !=200){
                    console.log(res)
                }else{
                    return res.json();
                }
            }).then((data) =>{
                if(data){
                    moveInfoArray.push([data.name, data.power, data.type.name, data.damage_class.name, data.accuracy])
                }
            })
        );
    }
    //Una vez que se teminaron de obtener las promesas las muestra en una tabla
    Promise.all(fetches).then(()=>{
        console.log("setPokemonMoves")
        console.log(moveInfoArray)
        createTableMoves(moveInfoArray, movesDiv);
        }
    )

}
const setIcon = (iconObject)=>{
    const imageElement = document.createElement('img');
    const key = Object.keys(iconObject)[0];
    const value = Object.values(iconObject)[0].charAt(0).toUpperCase() + Object.values(iconObject)[0].slice(1);
    if(key === 'type') imageElement.classList.add('typeIcon');
    imageElement.src = `./assets/${key}/${value}.png`;
    imageElement.alt = imageElement.title = value;
    return imageElement
}

const createTableTypes = (typeArray, container) =>{

    const newTable = document.createElement("table");
    const tbody = document.createElement("tbody");
    const tableRow = document.createElement("tr")
    for(let i = 0; i < typeArray.length; i++){
        const typeTD = document.createElement("td");
        typeTD.appendChild(setIcon({"type":typeArray[i]['type']["name"]}));
        tableRow.appendChild(typeTD);
    }   
    tbody.appendChild(tableRow);
    newTable.appendChild(tbody);
    container.appendChild(newTable);
}

const createTableStats = (statsArray, container)=>{
    const newTable = document.createElement("table");
    const tbody = document.createElement("tbody");
    const trHeaders = createHeaders(["Stat", "Base stat"]);
    tbody.appendChild(trHeaders);
    for(let i = 0; i < statsArray.length; i++){
        const statName = statsArray[i]['stat']['name'].replace('-', " ")
        const trStats = document.createElement("tr");
        const statNameTD = document.createElement("td");
        const baseStatTD = document.createElement("td");
        const statNameText = document.createTextNode(statName);
        const baseStatText = document.createTextNode(statsArray[i]['base_stat']);
        statNameTD.appendChild(statNameText);
        baseStatTD.appendChild(baseStatText);
        statNameTD.style.textTransform = 'capitalize';
        trStats.appendChild(statNameTD);
        trStats.appendChild(baseStatTD);
        tbody.appendChild(trStats);
    }
    
    newTable.appendChild(tbody);
    newTable.style.borderCollapse = "separate";
    newTable.style.borderSpacing = "35px 10px";
    container.appendChild(newTable);
}

const createTableMoves = (movesDetailsArray, container) => {
    const newTable = document.createElement("table");
    const tbody = document.createElement("tbody");
    const trHeaders = createHeaders(["Move name", "Power", "Type", "Damage type", "Accuracy"]);
    tbody.appendChild(trHeaders);
    for(let i = 0; i < movesDetailsArray.length; i++){
        const trMove = document.createElement("tr");
        const moveNameTD = document.createElement("td");
        const movePowerTD = document.createElement("td");
        const moveTypeTD = document.createElement("td");
        const moveDamageTD = document.createElement("td");
        const moveAccuracyTD = document.createElement("td");
        const moveNameText = document.createTextNode(movesDetailsArray[i][0]);
        const movePowerText = document.createTextNode(movesDetailsArray[i][1]);
        const moveAccuracyText = document.createTextNode(movesDetailsArray[i][4]);
        moveNameTD.appendChild(moveNameText);
        movePowerTD.appendChild(movePowerText);
        moveTypeTD.appendChild(setIcon({"type":movesDetailsArray[i][2]}));
        moveDamageTD.appendChild(setIcon({"damage":movesDetailsArray[i][3]}));
        moveAccuracyTD.appendChild(moveAccuracyText);
        moveNameTD.style.textTransform = "capitalize";
        moveTypeTD.style.textTransform = "capitalize";
        moveDamageTD.style.textTransform = "capitalize";
        trMove.appendChild(moveNameTD);
        trMove.appendChild(movePowerTD);
        trMove.appendChild(moveTypeTD);
        trMove.appendChild(moveDamageTD);
        trMove.appendChild(moveAccuracyTD);

        tbody.appendChild(trMove);
    }
    newTable.appendChild(tbody);
    newTable.classList.add('movesTable');

    container.appendChild(newTable);
    endLoading();
}

const createHeaders = (headers) =>{
    const trHeaders = document.createElement("tr");
    for(const header of headers){
        const th = document.createElement("th");
        const thContent = document.createTextNode(header);
        th.appendChild(thContent);
        trHeaders.appendChild(th);
    }
    return trHeaders;
}

const startLoading = () =>{
    const loadingPoke = document.getElementById('whiteCircleInt');
    loadingPoke.style.animation = 'blinking 0.7s infinite';
}
const endLoading = () =>{
    const loadingPoke = document.getElementById('whiteCircleInt');
    loadingPoke.style.animation = 'blinking 0.7s 1';
}

// window.onscroll = () => {
//     if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
//         document.getElementById("footerPokedex").style.opacity = "10%";
//     }else{
//         document.getElementById("footerPokedex").style.opacity = "100%";
//     }
// };