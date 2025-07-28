"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stringData = void 0;
function stringData(data, time) {
    if (!time) {
        let string_aux1 = '';
        if (data.getUTCDate() < 10)
            string_aux1 = '0' + (data.getUTCDate());
        else
            string_aux1 += data.getUTCDate();
        let string_aux2 = '';
        if (data.getUTCMonth() < 10)
            string_aux2 = '0' + (data.getUTCMonth() + 1);
        else
            string_aux2 += (data.getUTCMonth() + 1);
        return `${string_aux1}/${string_aux2}/${data.getUTCFullYear()}`;
    }
    else {
        let string_hora = '';
        if (data.getUTCHours() < 10)
            string_hora = '0' + data.getUTCHours();
        else
            string_hora += data.getUTCHours();
        let string_min = '';
        if (data.getUTCMinutes() < 10)
            string_min = '0' + data.getUTCMinutes();
        else
            string_min += data.getUTCMinutes();
        return `${string_hora}:${string_min}`;
    }
}
exports.stringData = stringData;
