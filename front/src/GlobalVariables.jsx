export const backUrl = 'http://localhost:3000/';

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