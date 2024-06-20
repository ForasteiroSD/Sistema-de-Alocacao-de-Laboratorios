/* Packages */
import { motion } from "framer-motion";
import { useEffect, useState, useContext } from 'react';

/* Components */
import Input from '../Input';
import Days from "./Days";

/* Lib */
import api from '../../lib/Axios'

/* Context */
import { AlertContext } from '../../context/AlertContext';
import { UserContext } from '../../context/UserContext';

/* Css */
import '../Modal.css';
import './InfoReserve.css';
import './NewReserve.css';

/* Variables/Consts */
const reserveTypes = [
    { value: 'Única', name: 'Única' },
    { value: 'Diária', name: 'Diária' },
    { value: 'Semanal', name: 'Semanal' },
    { value: 'Personalizada', name: 'Personalizada' }
]
import { durationMask, hourMask } from "../../GlobalVariables";

export default function NewReserve({ CloseModal, labName }) {
    const { setAlert } = useContext(AlertContext);
    const { user } = useContext(UserContext);
    const [reserveType, setReserveType] = useState('Única');
    const [weeklyDays, setWeeklyDays] = useState([]);
    const [numberPersonalizada, setNumberPersonalizada] = useState(['0']);

    useEffect(() => {
        document.querySelector('#lab').value = labName;
        document.querySelector('#reserveType').value = 'Única';
        document.querySelector('#reserveType').style.color = '#000000'
    }, []);

    async function createReserve(data_inicio, data_fim, hora_inicio, duracao, horarios) {
        const userId = user.id;
        const userName = user.nome;

        try {
            const response = (await api.post('reserva', {
                userId: userId,
                userName: userName,
                labName: labName,
                tipo: reserveType,
                data_inicio: data_inicio,
                data_fim: data_fim,
                hora_inicio: hora_inicio,
                duracao: duracao,
                horarios: horarios
            })).data;

            setAlert('Success', 'Reserva Cadastrada');
            CloseModal(false);
        } catch (error) {
            setAlert('Error', error.response.data);
        }
    }

    function changeReserveType() {
        if (reserveType === 'Única') {
            document.querySelector('#data').value = '';
            document.querySelector('#hora').value = '';
            document.querySelector('#duracao').value = '';
            document.querySelector('#data').type = 'text';

        } else if (reserveType === 'Diária') {
            document.querySelector('#dataInicial').value = '';
            document.querySelector('#dataFinal').value = '';
            document.querySelector('#hora').value = '';
            document.querySelector('#duracao').value = '';
            document.querySelector('#dataInicial').type = 'text';
            document.querySelector('#dataFinal').type = 'text';

        } else if (reserveType === 'Semanal') {

            document.querySelector('#dataInicial').value = '';
            document.querySelector('#dataFinal').value = '';

            for (let i = 0; i < weeklyDays.length; i++) {
                document.querySelector(`#hora${i}`).value = '';
                document.querySelector(`#duracao${i}`).value = '';
            }

            document.querySelector('#dataInicial').type = 'text';
            document.querySelector('#dataFinal').type = 'text';

        } else if (reserveType === 'Personalizada') {

            for (let i = 0; i < numberPersonalizada.length; i++) {
                document.querySelector(`#data${i}`).value = '';
                document.querySelector(`#hora${i}`).value = '';
                document.querySelector(`#duracao${i}`).value = '';
                document.querySelector(`#data${i}`).type = 'text';
            }
        }
        setWeeklyDays([]);
        setNumberPersonalizada(['0'])
        setReserveType(document.querySelector('#reserveType').value);
    }

    function validateHour(hora) {
        if (hora.length < 5) {
            setAlert('Warning', `Formato de hora inválido. Obs: As unidades de minuto devem ser 0 ou 5`);
            return false;
        } else return true;
    }

    function validateDuration(duracao) {
        if (duracao.length < 5) {
            setAlert('Warning', `Formato de duração inválido. Obs: No máximo 5 horas e unidades de minuto devem ser 0 ou 5`);
            return false;
        } else return true;
    }

    function verificaConflito(inicio1, fim1, inicio2, fim2) {

        if (inicio1 >= inicio2 && inicio1 < fim2) return true;

        if (inicio2 >= inicio1 && inicio2 < fim1) return true;

        return false;

    }

    function validate(e) {
        e.preventDefault();

        let data_inicio, data_fim, hora_inicio, duracao, horarios = [];

        if (reserveType === 'Única') {
            data_inicio = document.querySelector('#data').value;
            data_fim = data_inicio;
            hora_inicio = document.querySelector('#hora').value;
            duracao = '0' + document.querySelector('#duracao').value;

            if (!validateHour(hora_inicio)) return;
            if (!validateDuration(duracao)) return;

        } else if (reserveType === 'Diária') {
            data_inicio = document.querySelector('#dataInicial').value;
            data_fim = document.querySelector('#dataFinal').value;
            hora_inicio = document.querySelector('#hora').value;
            duracao = '0' + document.querySelector('#duracao').value;

            if (!validateHour(hora_inicio)) return;
            if (!validateDuration(duracao)) return;

        } else if (reserveType === 'Semanal') {
            if (weeklyDays.length === 0) {
                setAlert('Warning', 'Selecione pelo menos um dia da semana.');
                return;
            }

            data_inicio = document.querySelector('#dataInicial').value;
            data_fim = document.querySelector('#dataFinal').value;

            for (let i = 0; i < weeklyDays.length; i++) {
                const h = document.querySelector(`#hora${i}`).value;
                const d = '0' + document.querySelector(`#duracao${i}`).value;

                if (!validateHour(h)) return;
                if (!validateDuration(d)) return;

                horarios.push({
                    dia_semana: weeklyDays[i],
                    hora_inicio: h,
                    duracao: d
                });
            }

        } else if (reserveType === 'Personalizada') {

            for (let i = 0; i < numberPersonalizada.length; i++) {
                const da = document.querySelector(`#data${i}`).value;
                const h = document.querySelector(`#hora${i}`).value;
                const d = '0' + document.querySelector(`#duracao${i}`).value;

                if (!validateHour(h)) return;
                if (!validateDuration(d)) return;

                horarios.push({
                    data: da,
                    hora_inicio: h,
                    duracao: d
                });
            }

            for (let i = 0; i < horarios.length; i++) {
                const inicio1 = Number(horarios[i].hora_inicio.split(':')[0]) + Number(horarios[i].hora_inicio.split(':')[1]) / 60;
                const fim1 = inicio1 + Number(horarios[i].duracao.split(':')[0]) + Number(horarios[i].duracao.split(':')[1]) / 60;

                for (let j = i + 1; j < horarios.length; j++) {
                    if (horarios[i].data === horarios[j].data) {

                        const inicio2 = Number(horarios[j].hora_inicio.split(':')[0]) + Number(horarios[j].hora_inicio.split(':')[1]) / 60;
                        const fim2 = inicio2 + Number(horarios[j].duracao.split(':')[0]) + Number(horarios[j].duracao.split(':')[1]) / 60;
                        if (verificaConflito(inicio1, fim1, inicio2, fim2)) {
                            setAlert('Warning', 'As reservas inseridas possuem horários conflitantes entre elas');
                            return;
                        }
                    }
                }
            }
        }

        createReserve(data_inicio, data_fim, hora_inicio, duracao, horarios);

    }

    function addDayPersonalizada() {
        if (numberPersonalizada.length === 5) {
            setAlert('Warning', 'O número máximo de dias para uma reserva personalizada é 5.')
        } else {
            const copy = numberPersonalizada.slice();
            copy.push('0')
            setNumberPersonalizada(copy);
        }
    }

    return (
        <>
            <motion.div key={'logo'} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.2 } }} className='ModalImg flex h'>
                <img src="/logos/Logo-White.png" alt="Logo LabHub" />
            </motion.div>
            <motion.div key={'wrapper'} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.2 } }} className='ModalBackGround' />
            <form className='flex h v ModalWrapper' onSubmit={validate} id="formNewReserve">
                <motion.div key={'modal'} initial={{ x: '-50%', opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: '50%', opacity: 0, transition: { duration: 0.2 } }} id='EditUserForm' className='Modal flex c v'>
                    <h1>Nova Reserva</h1>
                    <div className="infoReserve newReserve flex c">
                        <Input type={'text'} placeholder={'Laboratório'} id={'lab'} required={true} readOnly={true} />
                        <Input type={'dropdown'} values={reserveTypes} placeholder={'Tipo de Reserva'} id={'reserveType'} required={true} callback={changeReserveType} />
                        <hr style={{ marginTop: '10px' }} />
                        <label className="titleRes">Reserva {reserveType}:</label>
                        {reserveType === 'Única' ? (
                            <>
                                <Input type={'date'} placeholder={'Data da Reserva'} id={'data'} required={true} label={'Data da reserva:'} />
                                <Input type={'text'} placeholder={'14:00'} id={'hora'} required={true} label={'Horário de entrada:'} formatter={hourMask} />
                                <Input type={'text'} placeholder={'2:00'} id={'duracao'} required={true} label={'Tempo de uso (hs):'} formatter={durationMask} />
                            </>
                        ) : (
                            reserveType === 'Diária' ? (
                                <>
                                    <Input type={'date'} placeholder={'Data Inicial'} id={'dataInicial'} required={true} label={'Data Inicial:'} />
                                    <Input type={'date'} placeholder={'Data Final'} id={'dataFinal'} required={true} label={'Data Final:'} />
                                    <Input type={'text'} placeholder={'14:00'} id={'hora'} required={true} label={'Horário de entrada:'} formatter={hourMask} />
                                    <Input type={'text'} placeholder={'2:00'} id={'duracao'} required={true} label={'Tempo de uso (hs):'} formatter={durationMask} />
                                </>
                            ) : (
                                reserveType === 'Semanal' ? (
                                    <>
                                        <Input type={'date'} placeholder={'Data Inicial'} id={'dataInicial'} required={true} label={'Data Inicial:'} />
                                        <Input type={'date'} placeholder={'Data Final'} id={'dataFinal'} required={true} label={'Data Final:'} />
                                        <div style={{ width: '345px', margin: '5px 0' }}>
                                            <p className="subtitle">Dias da Semana:</p>
                                            <Days actives={weeklyDays} setActives={setWeeklyDays} />
                                        </div>
                                        {weeklyDays.map((dia, i) => (
                                            <div className="boxDay" key={i}>
                                                <p className="diaSemana">{dia}:</p>
                                                <div className="flex h Times" style={i !== weeklyDays.length - 1 ? { marginBottom: '15px' } : null}>
                                                    <Input type={'text'} placeholder={'14:00'} id={`hora${i}`} required={true} label={'Horário de entrada:'} formatter={hourMask} />
                                                    <Input type={'text'} placeholder={'2:00'} id={`duracao${i}`} required={true} label={'Tempo de uso (hs):'} formatter={durationMask} />
                                                </div>
                                                {i !== weeklyDays.length - 1 && <hr className="dashedLine" />}
                                            </div>
                                        ))}
                                    </>
                                ) : reserveType === 'Personalizada' && (
                                    <>
                                        {numberPersonalizada.slice().map((data, i) => (
                                            <div className="flex c" style={{ gap: '10px' }} key={i}>
                                                <Input type={'date'} placeholder={'Data da Reserva'} id={`data${i}`} required={true} label={'Data da reserva:'} />
                                                <Input type={'text'} placeholder={'14:00'} id={`hora${i}`} required={true} label={'Horário de entrada:'} formatter={hourMask} />
                                                <Input type={'text'} placeholder={'2:00'} id={`duracao${i}`} required={true} label={'Tempo de uso (hs):'} formatter={durationMask} />
                                                {i !== numberPersonalizada.length - 1 && <hr className="dashedLine" />}
                                            </div>
                                        ))}
                                        <button type="button" onClick={addDayPersonalizada} className="addDia">Adicionar outro dia</button>
                                    </>
                                )
                            )
                        )}
                    </div>
                    <Input type={'submit'} placeholder={'Cadastrar'} />
                    <p className='CancelButton' onClick={() => { CloseModal(false) }}>Fechar</p>
                </motion.div>
            </form>
        </>
    )
}
