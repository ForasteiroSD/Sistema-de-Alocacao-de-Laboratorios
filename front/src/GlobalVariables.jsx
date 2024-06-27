import { useState } from "react";

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

export const hourMask = (inputId) => {
    const input = document.querySelector('#' + inputId);
    let formattedValue = input.value
    .replace(/\D/g, '')
    formattedValue = 'i'+formattedValue
    formattedValue = formattedValue
        .replace(/(i[3-9])/, '')
        .replace(/i2([4-9])/, 'i2')
        .replace(/(\d{2})(\d)/, '$1:$2')
        .replace(/(\d{2}:)([6-9])/, '$1')
        .replace(/(\d{2}):(\d)([1-4]|[6-9])/, '$1:$2')
        .replace(/(:\d{2})\d+?$/, '$1')

    input.value = formattedValue.slice(1);
}

export const durationMask = (inputId) => {
    const input = document.querySelector('#' + inputId);
    let formattedValue = input.value
    .replace(/\D/g, '')
    formattedValue = 'i'+formattedValue
    formattedValue = formattedValue
        .replace(/(i[6-9])/, '')
        .replace(/(\d{1})(\d)/, '$1:$2')
        .replace(/(0:)([0-2]|[6-9])/, '$1')
        .replace(/(5:)([1-9])/, '$1')
        .replace(/(5:0)([1-9])/, '$1')
        .replace(/(\d{1}):(\d)([1-4]|[6-9])/, '$1:$2')
        .replace(/(:\d{2})\d+?$/, '$1')

    input.value = formattedValue.slice(1);
}

export const getCurrentDate = (subtractYears = 0) => {
    let newDate = new Date()
    let date = newDate.getDate();
    let month = newDate.getMonth() + 1;
    let year = newDate.getFullYear() - subtractYears;

    return `${year}-${month < 10 ? `0${month}` : `${month}`}-${date}`
}