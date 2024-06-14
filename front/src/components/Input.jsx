/* Packages */
import { useRef, useState } from "react";
import { PiEye } from "react-icons/pi";
import { PiEyeSlash } from "react-icons/pi";
import { IoIosArrowDropdown } from "react-icons/io";

/* Css */
import './Input.css'

export default function Input({type, label, placeholder, id, values, callback, exclude, formatter, maxDate, required, readOnly }) {
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

    //Params: type, label(optional), placeholder(optional), id, values, required(optional)
    if(type == 'dropdown') {
        if(values) {
            return (
                <div className="InputBox Dropdown flex v" style={{cursor: 'auto'}} onClick={() => {clickInput(id)}}>
                    {label ? <p>{label}</p> : null}
                    <select style={{color: '#757575'}} onMouseDown={() => {setInputOpened(!inputOpened)}} onBlur={() => {setInputOpened(false)}} onChange={() => {document.querySelector('#' + id).style.color = '#000000'}} id={id} required={required}>
                        {placeholder && <option value='' style={{display: 'none'}} defaultValue >{placeholder}</option>}
                        {values.map((value) => (
                            <option key={value.value} style={{color: '#000000'}} value={value.value} >{value.name}</option>
                        ))}
                    </select>
                    <IoIosArrowDropdown className="DropdownArrow" style={inputOpened && {rotate: '180deg'}} />
                </div>
            )
        }
    }
    
    //Params: type, placeholder(optional), callback, exclude(optional)
    else if(type == 'submit') {
        return (
            <button className={`Submit ${exclude && 'SubmitExclude'}`} type='submit' onClick={callback}>{placeholder}</button>
        )
    }

    //Params: type, label(optional), placeholder(optional), id, maxDate(optional), required(optional)
    else if(type == 'date') {
        return (
            <div className="InputBox" onClick={() => {clickInput(id)}}>
                {label ? <p>{label}</p> : null}
                <div className='Input flex c'>
                    <input placeholder={placeholder} ref={ref} onFocus={() => {ref.current.type = 'date'}} onBlur={() => {checkDate(id)}} id={id} max={maxDate} required={required} readOnly={readOnly} />
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
                        <input type={type} placeholder={placeholder} onChange={() => formatter(id)} id={id} required={required} readOnly={readOnly} />
                    ) : (
                        <input type={type} placeholder={placeholder} id={id} required={required} readOnly={readOnly} />
                    )}
                </div>
            </div>
        )
    }
}