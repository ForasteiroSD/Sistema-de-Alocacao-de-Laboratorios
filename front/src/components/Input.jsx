/* Packages */
import { useRef, useState } from "react";
import { PiEye } from "react-icons/pi";
import { PiEyeSlash } from "react-icons/pi";

/* Css */
import './Input.css'

export default function Input({type, label, placeholder, id, values, callback, formatter, maxDate, required }) {
    const [showButtonSeePassword, setShowButtonSeePassword] = useState(false);
    const [seePassword, setSeePassword] = useState(false);
    const [inputOpened, setInputOpened] = useState(false);
    const ref = useRef();
    const checkDate = (id) => {
        const input = document.querySelector('#' + id);
        if(input.value != '') input.type = 'date';
        else input.type = 'text';
    }
    const showButton = (id) => {
        if(document.querySelector('#' + id).value != '') setShowButtonSeePassword(true);
        else setShowButtonSeePassword(false);
    }
    const changeButtonIcon = (id) => {
        setSeePassword(!seePassword);
        let input = document.querySelector('#' + id);
        if(input.type == 'password') input.type = 'text';
        else input.type = 'password';
    }
    const clickInput = (id) => {
        document.querySelector('#' + id).focus();
    }
    const DownArrow = (id) => (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" onClick={() => {clickInput(id)}} className="DropdownArrow">
            <rect width="16" height="16" rx="4" style={{fill: 'var(--gray)'}}/>
            <path d="M9.73209 10.5217C8.96229 11.8551 8.57739 12.5217 8.00004 12.5217C7.42269 12.5217 7.03779 11.8551 6.26799 10.5217L4.61125 7.65216C3.84145 6.31883 3.45655 5.65216 3.74522 5.15216C4.0339 4.65216 4.8037 4.65216 6.3433 4.65216H9.65679C11.1964 4.65216 11.9662 4.65216 12.2549 5.15216C12.5435 5.65216 12.1586 6.31883 11.3888 7.65216L9.73209 10.5217Z" style={{fill: 'var(--background)'}}/>
        </svg>
    )
    const UpArrow = (id) => (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" onClick={() => {clickInput(id)}} className="DropdownArrow">
            <rect width="16" height="16" rx="4" style={{fill: 'var(--gray)'}}/>
            <path d="M9.64518 6C8.87538 4.66667 8.49048 4 7.91313 4C7.33578 4 6.95088 4.66667 6.18108 6L4.52433 8.86957C3.75453 10.2029 3.36963 10.8696 3.65831 11.3696C3.94698 11.8696 4.71678 11.8696 6.25638 11.8696H9.56987C11.1095 11.8696 11.8793 11.8696 12.1679 11.3696C12.4566 10.8696 12.0717 10.2029 11.3019 8.86957L9.64518 6Z" style={{fill: 'var(--background)'}}/>
        </svg>
    )

    //Params: type, label(optional), placeholder(optional), id, values, required(optional)
    if(type == 'dropdown') {
        if(values) {
            return (
                <div className="InputBox Dropdown flex v" style={{cursor: 'auto'}} onClick={() => {clickInput(id)}}>
                    {label ? <p>{label}</p> : null}
                    <select style={{color: '#757575'}} onClick={() => {setInputOpened(!inputOpened)}} onBlur={() => {setInputOpened(false)}} onChange={() => {document.querySelector('#' + id).style.color = '#000000'}} id={id} required={required}>
                        {placeholder && <option value='' style={{display: 'none'}} defaultValue >{placeholder}</option>}
                        {values.map((value) => (
                            <option key={value.value} style={{color: '#000000'}} value={value.value} >{value.name}</option>
                        ))}
                    </select>
                    {inputOpened ? UpArrow(id) : DownArrow(id)}
                </div>
            )
        }
    }
    
    //Params: type, placeholder(optional), callback
    else if(type == 'submit') {
        return (
            <button className='Submit' type='submit' onClick={callback}>{placeholder}</button>
        )
    }

    //Params: type, label(optional), placeholder(optional), id, maxDate(optional), required(optional)
    else if(type == 'date') {
        return (
            <div className="InputBox" onClick={() => {clickInput(id)}}>
                {label ? <p>{label}</p> : null}
                <div className='Input flex c'>
                    <input placeholder={placeholder} ref={ref} onFocus={() => {ref.current.type = 'date'}} onBlur={() => {checkDate(id)}} id={id} max={maxDate} required={required}/>
                </div>
            </div>
        )
    }

    //Params: type, label(optional), placeholder(optional), id, required(optional)
    else if(type == 'password') {
        return (
            <div className="InputBox" onClick={() => {clickInput(id)}}>
                {label ? <p>{label}</p> : null}
                <div className='Input flex c'>
                    <div className="flex h v">
                        <input type='password' style={{flexGrow: 1}} onChange={() => {showButton(id)}} placeholder={placeholder} ref={ref} autoComplete='off' id={id} required={required}/>
                        {showButtonSeePassword && seePassword ? (
                            <PiEyeSlash className="SeePasswordButton" onClick={() => {changeButtonIcon(id)}} />
                        ) : showButtonSeePassword && !seePassword && (
                            <PiEye className="SeePasswordButton" onClick={() => {changeButtonIcon(id)}} />
                        )}
                    </div>
                </div>
            </div>
        )
    }

    //Params: type, label(optional), placeholder(optional), id, formatter(optional), required(optional)
    else {
        return (
            <div className="InputBox" onClick={() => {clickInput(id)}}>
                {label ? <p>{label}</p> : null}
                <div className='Input flex c'>
                    {formatter ? (
                        <input type={type} placeholder={placeholder} onChange={() => formatter(id)} id={id} required={required}/>
                    ) : (
                        <input type={type} placeholder={placeholder} id={id} required={required}/>
                    )}
                </div>
            </div>
        )
    }
}