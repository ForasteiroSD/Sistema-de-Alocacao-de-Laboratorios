/* Css */
import './Input.css'

export default function Input({type, label, placeholder, id, values, callback, required }) {
    if(type == 'dropdown') {
        if(values) {
            return (
                <select className='Inputs Dropdown' required={required}>
                    {placeholder && <option value={null} style={{display: 'none'}} defaultValue >{placeholder}</option>}
                    {values.map((value) => (
                        <option key={value.value} value={value.value} id={value.id}>{value.name}</option>
                    ))}
                </select>
            )
        }
    }
    
    else if(type == 'submit') {
        return (
            <button className='Inputs Submit' onClick={callback}>{placeholder}</button>
            // <input type="submit" className='Inputs Submit' value={placeholder} />
        )
    }

    else if(type == 'date') {
        return (
            <div className='Inputs Input flex c'>
                {label ? <label>{label}</label> : null}
                <input type='date' placeholder={placeholder} id={id} required={required}/>
            </div>
        )
    }

    else {
        return (
            <div className='Inputs Input flex c'>
                {label ? <label>{label}</label> : null}
                <input type={type} placeholder={placeholder} id={id} required={required}/>
            </div>
        )
    }
}