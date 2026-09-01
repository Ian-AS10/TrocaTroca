function cancelarProposta() {

    const confirmar =
        confirm(
            "Deseja realmente cancelar esta proposta?"
        );


    if (!confirmar) {
        return;
    }


    alert(
        "Proposta cancelada com sucesso!"
    );

}


function aceitarProposta() {

    const confirmar =
        confirm(
            "Deseja aceitar esta proposta?"
        );


    if (!confirmar) {
        return;
    }


    alert(
        "Proposta aceita! A troca foi concluída."
    );

}


function recusarProposta() {

    const confirmar =
        confirm(
            "Deseja recusar esta proposta?"
        );


    if (!confirmar) {
        return;
    }


    alert(
        "Proposta recusada."
    );

}