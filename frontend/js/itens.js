const itens = [

    {
        id: 1,
        nome: "Harry Potter e a Pedra Filosofal",
        categoria: "Livros",
        estado: "Bom",
        status: "Disponível",
        icone: "📚",
        descricao: "Livro usado em bom estado."
    },

    {
        id: 2,
        nome: "Controle para videogame",
        categoria: "Eletrônicos",
        estado: "Excelente",
        status: "Disponível",
        icone: "🎮",
        descricao: "Controle funcionando perfeitamente."
    },

    {
        id: 3,
        nome: "Camiseta preta",
        categoria: "Roupas",
        estado: "Bom",
        status: "Disponível",
        icone: "👕",
        descricao: "Camiseta preta tamanho M."
    },

    {
        id: 4,
        nome: "FIFA 24",
        categoria: "Jogos",
        estado: "Excelente",
        status: "Disponível",
        icone: "🎮",
        descricao: "Jogo original em excelente estado."
    },

    {
        id: 5,
        nome: "Livro O Hobbit",
        categoria: "Livros",
        estado: "Bom",
        status: "Disponível",
        icone: "📖",
        descricao: "Livro em bom estado de conservação."
    },

    {
        id: 6,
        nome: "Fone Bluetooth",
        categoria: "Eletrônicos",
        estado: "Bom",
        status: "Disponível",
        icone: "🎧",
        descricao: "Fone Bluetooth funcionando normalmente."
    }

];


const listaItens =
    document.getElementById("listaItens");


const busca =
    document.getElementById("busca");


const categoria =
    document.getElementById("categoria");


function mostrarItens(lista) {

    listaItens.innerHTML = "";


    if (lista.length === 0) {

        listaItens.innerHTML = `
            <div class="empty-state">
                <h3>Nenhum item encontrado</h3>
                <p>
                    Tente alterar sua busca ou categoria.
                </p>
            </div>
        `;

        return;

    }


    lista.forEach(function(item) {

        const card =
            document.createElement("div");


        card.className =
            "item-card";


        card.innerHTML = `

            <div class="item-image">
                ${item.icone}
            </div>

            <div class="item-content">

                <span class="status available">
                    ${item.status}
                </span>

                <h3>
                    ${item.nome}
                </h3>

                <p class="item-category">
                    ${item.categoria}
                </p>

                <p>
                    Estado:
                    <strong>${item.estado}</strong>
                </p>

                <a
                    href="detalhe-item.html?id=${item.id}"
                    class="button small-button"
                >
                    Ver detalhes
                </a>

            </div>
        `;


        listaItens.appendChild(card);

    });

}


function filtrarItens() {

    const texto =
        busca.value.toLowerCase();


    const categoriaSelecionada =
        categoria.value;


    const resultado =
        itens.filter(function(item) {

            const correspondeBusca =
                item.nome
                    .toLowerCase()
                    .includes(texto);


            const correspondeCategoria =
                !categoriaSelecionada ||
                item.categoria ===
                categoriaSelecionada;


            return (
                correspondeBusca &&
                correspondeCategoria
            );

        });


    mostrarItens(resultado);

}


busca.addEventListener(
    "input",
    filtrarItens
);


categoria.addEventListener(
    "change",
    filtrarItens
);


mostrarItens(itens);