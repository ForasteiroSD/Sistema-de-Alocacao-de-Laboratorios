/* Imports */
import { useRef } from "react";

/* Css */
import './Input.css'

export default function Input({type, label, placeholder, id, values, callback, formatter, autoComplete, maxDate, required }) {
    const ref = useRef();
    const checkDate = (id) => {
        const input = document.querySelector('#' + id);
        if(input.value != '') input.type = 'date';
        else input.type = 'text';
    }

    if(type == 'dropdown') {
        if(values) {
            return (
                <select className='Inputs Dropdown' style={{color: '#757575'}} onChange={() => {document.querySelector('#' + id).style.color = '#000000'}} id={id} required={required}>
                    {placeholder && <option value='' style={{display: 'none'}} defaultValue >{placeholder}</option>}
                    {values.map((value) => (
                        <option key={value.value} style={{color: '#000000'}} value={value.value} >{value.name}</option>
                    ))}
                </select>
            )
        }
    }
    
    else if(type == 'submit') {
        return (
            <button className='Inputs Submit' type='submit' onClick={callback}>{placeholder}</button>
            // <input type="submit" className='Inputs Submit' onClick={callback} value={placeholder} />
        )
    }

    else if(type == 'date') {
        return (
            <div className='Inputs Input flex c'>
                {label ? <label>{label}</label> : null}
                <input placeholder={placeholder} ref={ref} onFocus={() => (ref.current.type = "date")} onBlur={() => {checkDate(id)}} id={id} max={maxDate} required={required}/>
            </div>
        )
    }

    else {
        return (
            <div className='Inputs Input flex c'>
                {label ? <label>{label}</label> : null}
                {formatter ? (
                    <input type={type} placeholder={placeholder} ref={ref} autoComplete={autoComplete} onChange={() => formatter(id)} id={id} required={required}/>
                ) : (
                    <input type={type} placeholder={placeholder} ref={ref} autoComplete={autoComplete} id={id} required={required}/>
                )}
            </div>
        )
    }
}