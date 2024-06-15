/* Css */
import { useEffect, useState } from 'react';
import './Days.css';

export default function Days({ editable = true, actives, setActives }) {

    const [days, setDays] = useState([]);

    useEffect(() => {
        setDays(document.querySelectorAll('.dayCircle'));
    }, []);

    useEffect(changeColor, [actives]);

    function changeColor() {
        for (let day of days) {
            if (actives.indexOf(day.id) + 1) {
                day.style.backgroundColor = 'var(--gray)'
                day.style.color = 'var(--background)'
            } else {
                day.style.backgroundColor = ''
                day.style.color = 'var(--gray)'
            }
        }
    }

    function handleClick(day) {
        if (!editable) return;

        const index = actives.indexOf(day);
        if (index + 1) actives.splice(index, 1);
        else actives.push(day);
        changeColor();
    }

    return (
        <div className="Days flex sb">
            <div className="dayCircle flex h v" style={!editable ? {cursor: 'inherit'} : null} id='Domingo' onClick={() => handleClick('Domingo')}>D</div>
            <div className="dayCircle flex h v" style={!editable ? {cursor: 'inherit'} : null} id='Segunda' onClick={() => handleClick('Segunda')}>S</div>
            <div className="dayCircle flex h v" style={!editable ? {cursor: 'inherit'} : null} id='Terça' onClick={() => handleClick('Terça')}>T</div>
            <div className="dayCircle flex h v" style={!editable ? {cursor: 'inherit'} : null} id='Quarta' onClick={() => handleClick('Quarta')}>Q</div>
            <div className="dayCircle flex h v" style={!editable ? {cursor: 'inherit'} : null} id='Quinta' onClick={() => handleClick('Quinta')}>Q</div>
            <div className="dayCircle flex h v" style={!editable ? {cursor: 'inherit'} : null} id='Sexta' onClick={() => handleClick('Sexta')}>S</div>
            <div className="dayCircle flex h v" style={!editable ? {cursor: 'inherit'} : null} id='Sábado' onClick={() => handleClick('Sábado')}>S</div>
        </div>
    )
}