export const nameMask = (inputId) => {
    const input = document.querySelector('#' + inputId);
    const formattedValue = input.value.toLowerCase().replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase())

    input.value = formattedValue;
}

export const cpfMask = (inputId) => {
    const input = document.querySelector('#' + inputId);
    const formattedValue = input.value
    .replace(/\D/g, '') // substitui qualquer caracter que nao seja numero por nada
    .replace(/(\d{3})(\d)/, '$1.$2') // captura 2 grupos de numero o primeiro de 3 e o segundo de 1, apos capturar o primeiro grupo ele adiciona um ponto antes do segundo grupo de numero
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})/, '$1-$2')
    .replace(/(-\d{2})\d+?$/, '$1') // captura 2 numeros seguidos de um traço e não deixa ser digitado mais nada

    input.value = formattedValue;
}

export const phoneMask = (inputId) => {
    const input = document.querySelector('#' + inputId);
    const formattedValue = input.value
    .replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .replace(/(-\d{4})\d+?$/, '$1')

    input.value = formattedValue;
}

export const getCurrentDate = (subtractYears=0) => {
    let newDate = new Date()
    let date = newDate.getDate();
    let month = newDate.getMonth() + 1;
    let year = newDate.getFullYear() - subtractYears;
    
    return `${year}-${month<10?`0${month}`:`${month}`}-${date}`
}

export function stringData(data, time) {
    if (!time) {
        let string_aux1 = '';
        if(data.getUTCDate() < 10) string_aux1 = '0'+(data.getUTCDate());
        else string_aux1 += data.getUTCDate();
        
        let string_aux2 = '';
        if (data.getUTCMonth() <= 10) string_aux2 = '0'+(data.getUTCMonth()+1);
        else string_aux2 += (data.getUTCMonth()+1);

        return `${string_aux1}/${string_aux2}/${data.getUTCFullYear()}`;

    } else {
        let string_hora = '';
        if(data.getUTCHours() < 10) string_hora = '0' + data.getUTCHours();
        else string_hora += data.getUTCHours();

        let string_min = '';
        if(data.getUTCMinutes() < 10) string_min = '0' + data.getUTCMinutes();
        else string_min += data.getUTCMinutes();

        return `${string_hora}:${string_min}`;
    }
}