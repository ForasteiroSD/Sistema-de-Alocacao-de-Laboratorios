/* Packages */
import { useRef, useState } from "react";
import { PiEye, PiEyeSlash } from "react-icons/pi";
import { IoIosArrowDropdown } from "react-icons/io";
import { TiArrowSortedUp, TiArrowSortedDown } from "react-icons/ti";
import { GiCheckMark } from "react-icons/gi";

/* Css */
import './Input.css'

export default function Input({ type, label, placeholder, id, values, callback, exclude, formatter, maxDate, required, readOnly, min = null, max = null }) {
    const [showButtonSeePassword, setShowButtonSeePassword] = useState(false);
    const [seePassword, setSeePassword] = useState(false);
    const [inputOpened, setInputOpened] = useState(false);
    const [seeSelectNumber, setSeeSelectNumber] = useState(false);
    const ref = useRef();
    const checkDate = (id) => {
        const input = document.querySelector('#' + id);
        if (input.value != '') input.type = 'date';
        else input.type = 'text';
    }
    const showButton = (id) => {
        if (document.querySelector('#' + id).value != '') setShowButtonSeePassword(true);
        else setShowButtonSeePassword(false);
    }
    const changeButtonIcon = (id) => {
        setSeePassword(!seePassword);
        let input = document.querySelector('#' + id);
        if (input.type == 'password') input.type = 'text';
        else input.type = 'password';
    }
    const clickInput = (id) => {
        document.querySelector('#' + id).focus();
    }
    const updateNumber = (value) => {
        const input = document.querySelector('#' + id);
        const inputValue = parseInt(input.value);
        if(inputValue + value > 0) input.value = inputValue + value;
        else input.value = 1;
    }
    const removeSelection = () => {
        window.getSelection().removeAllRanges();
    }

    //Params: type, label(optional), placeholder(optional), id, values, required(optional)
    if (type == 'dropdown') {
        if (values) {
            return (
                <div className="InputBox">
                    {label ? <p>{label}</p> : null}
                    <div className="Input flex c Dropdown" style={{ cursor: 'auto' }} onClick={() => { clickInput(id) }}>
                        <select style={{ color: '#757575' }} onMouseDown={() => { setInputOpened(!inputOpened) }} onBlur={() => { setInputOpened(false) }} onChange={() => {
                            document.querySelector('#' + id).style.color = '#000000';
                            if(callback) callback();
                        }} id={id} required={required}>
                            {placeholder && <option value='' style={{ display: 'none' }} defaultValue >{placeholder}</option>}
                            {values.map((value) => (
                                <option key={value.value} style={{ color: '#000000' }} value={value.value} >{value.name}</option>
                            ))}
                        </select>
                        <IoIosArrowDropdown className="DropdownArrow" style={inputOpened && { rotate: '180deg' }} />
                    </div>
                </div>
            )
        }
    }

    //Params: type, placeholder(optional), callback, exclude(optional)
    else if (type == 'submit') {
        return (
            <button className={`Submit ${exclude && 'SubmitExclude'}`} type='submit' onClick={callback}>{placeholder}</button>
        )
    }

    //Params: type, label(optional), placeholder(optional), id, maxDate(optional), required(optional)
    else if (type == 'date') {
        return (
            <div className="InputBox" >
                {label ? <p>{label}</p> : null}
                <div className='Input flex c' onClick={() => { clickInput(id) }}>
                    <input placeholder={placeholder} ref={ref} onFocus={() => { ref.current.type = 'date' }} onBlur={() => { checkDate(id) }} id={id} max={maxDate} required={required} readOnly={readOnly} />
                </div>
            </div>
        )
    }

    //Params: type, label(optional), placeholder(optional), id, required(optional)
    else if (type == 'password') {
        return (
            <div className="InputBox" >
                {label ? <p>{label}</p> : null}
                <div className='Input flex c' onClick={() => { clickInput(id) }}>
                    <div className="flex h v">
                        <input type='password' style={{ flexGrow: 1 }} onChange={() => { showButton(id) }} placeholder={placeholder} ref={ref} autoComplete='off' id={id} required={required} />
                        {showButtonSeePassword && seePassword ? (
                            <PiEyeSlash className="SeePasswordButton" onClick={() => { changeButtonIcon(id) }} />
                        ) : showButtonSeePassword && !seePassword && (
                            <PiEye className="SeePasswordButton" onClick={() => { changeButtonIcon(id) }} />
                        )}
                    </div>
                </div>
            </div>
        )
    }

    //Params: type, label(optional), placeholder(optional), id, required(optional), min(optional), max(optional)
    else if (type == 'number') {
        return (
            <div className="InputBox" >
                {label ? <p>{label}</p> : null}
                <div className='Input flex c' onClick={() => { clickInput(id) }}>
                    <input type='number' className="InputNumber" placeholder={placeholder} id={id} required={required} readOnly={readOnly} min={min} max={max} />
                </div>
            </div>
        )
    }

    //Params: type, label(optional) id
    else if (type == 'optionalQuant') {
        return (
            <div className="flex sb optionalQuant">
                <p>{label}</p>
                <div className="flex v" style={{gap: '15px'}}>
                    <div className="flex v" style={{gap: '5px', position: 'relative'}}>
                        <p>Não </p>
                        <input type="radio" name={id} onClick={() => setSeeSelectNumber(false)} defaultChecked />
                        <GiCheckMark className="CheckIcon" />
                    </div>
                    <div className="flex v" style={{gap: '5px', position: 'relative'}}>
                        <p>Sim </p>
                        <input type="radio" name={id} onClick={() => setSeeSelectNumber(true)} />
                        <GiCheckMark className="CheckIcon" />
                    </div>
                    {seeSelectNumber ? (
                        <div className="flex v">
                            <TiArrowSortedUp className="ArrowIcon" onDoubleClick={removeSelection} onClick={() => updateNumber(1)} />
                            <input type="number" min={1} id={id} defaultValue={1} className="NumberSelector"/>
                            <TiArrowSortedDown className="ArrowIcon" onDoubleClick={removeSelection} onClick={() => updateNumber(-1)} />
                        </div>
                    ) : (
                        <div style={{ width: '74px', height: '21px' }}></div>
                    )}
                </div>
            </div>
        )
    }

    else if (type == 'textArea') {
        return (
            <div className="InputBox" >
                {label ? <p>{label}</p> : null}
                {formatter ? (
                    <textarea placeholder={placeholder} className='Input TextArea' onChange={() => formatter(id)} id={id} required={required} readOnly={readOnly} ></textarea>
                ) : (
                    <textarea placeholder={placeholder} className='Input TextArea' id={id} required={required} readOnly={readOnly} ></textarea>
                )}
            </div>
        )
    }

    //Params: type, label(optional), placeholder(optional), id, formatter(optional), required(optional)
    else {
        return (
            <div className="InputBox" >
                {label ? <p>{label}</p> : null}
                <div className='Input flex c' onClick={() => { clickInput(id) }}>
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