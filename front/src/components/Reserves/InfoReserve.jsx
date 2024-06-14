/* Packages */
import { motion } from "framer-motion";
import { useEffect, useState } from 'react';

/* Components */
import Input from '../Input';
import Days from "./Days";

/* Lib */
import api from '../../lib/Axios'

/* Css */
import '../Modal.css';
import './InfoReserve.css';

export default function InfoReserve({ CloseModal, ReserveId }) {
    const [reserveData, setReserveData] = useState({});
    const [weeklyDays, setWeeklyDays] = useState([]);


    async function getReserveData() {

        const response = (await api.get('reserva', {
            params: {
                id: ReserveId
            }
        })).data;

        setReserveData(response);

    }

    useEffect(() => {
        document.querySelector('#resp').value = reserveData.usuario;
        document.querySelector('#lab').value = reserveData.laboratorio;
        document.querySelector('#reserveType').value = reserveData.tipo;

        if (reserveData.tipo === 'Única') {
            document.querySelector('#data').value = reserveData.data_inicio;
            document.querySelector('#hora').value = reserveData.hora_inicio;
            document.querySelector('#duracao').value = reserveData.duracao;
        } else if (reserveData.tipo === 'Diária') {
            document.querySelector('#dataInicial').value = reserveData.data_inicio;
            document.querySelector('#dataFinal').value = reserveData.data_fim;
            document.querySelector('#hora').value = reserveData.hora_inicio;
            document.querySelector('#duracao').value = reserveData.duracao;
        } else if (reserveData.tipo === 'Semanal') {
            document.querySelector('#dataInicial').value = reserveData.data_inicio;
            document.querySelector('#dataFinal').value = reserveData.data_fim;
            const dias = []

            for (let i=0; i<reserveData.dias_semana.length; i++) {
                dias.push(reserveData.dias_semana[i].dia);
                document.querySelector(`#hora${i}`).value = reserveData.dias_semana[i].hora_inicio;
                document.querySelector(`#duracao${i}`).value = reserveData.dias_semana[i].duracao;
            }
            setWeeklyDays(dias);
        } else if (reserveData.tipo === 'Personalizada'){
            for (let i=0; i<reserveData.horarios.length; i++) {
                document.querySelector(`#data${i}`).value = reserveData.horarios[i].data;
                document.querySelector(`#hora${i}`).value = reserveData.horarios[i].hora_inicio;
                document.querySelector(`#duracao${i}`).value = reserveData.horarios[i].duracao;
            }
        }
    }, [reserveData]);

    useEffect(() => {
        getReserveData();
    }, []);

    return (
        <>
            <motion.div key={'logo'} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.2 } }} className='ModalImg flex h'>
                <img src="/logos/Logo-White.png" alt="Logo LabHub" />
            </motion.div>
            <motion.div key={'wrapper'} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.2 } }} className='ModalBackGround' />
            <form className='flex h v ModalWrapper'>
                <motion.div key={'modal'} initial={{ x: '-50%', opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: '50%', opacity: 0, transition: { duration: 0.2 } }} id='EditUserForm' className='Modal flex c v'>
                    <h1>Informações da Reserva</h1>
                    <div className="infoReserve flex c">
                        <Input type={'text'} placeholder={'Responsável'} id={'resp'} required={true} readOnly={'readonly'} />
                        <Input type={'text'} placeholder={'Laboratório'} id={'lab'} required={true} readOnly={'readonly'} />
                        <Input type={'text'} placeholder={'Tipo de Reserva'} id={'reserveType'} required={true} readOnly={'readonly'} />
                        <hr style={{ marginTop: '10px' }} />
                        <label className="title">Reserva {reserveData.tipo}:</label>
                        {reserveData.tipo === 'Única' ? (
                            <>
                                <Input type={'text'} placeholder={'Data da Reserva'} id={'data'} readOnly={'readonly'} required={true} label={'Data da reserva:'} />
                                <Input type={'text'} placeholder={'14:00'} id={'hora'} readOnly={'readonly'} required={true} label={'Horário de entrada:'} />
                                <Input type={'text'} placeholder={'2:00'} id={'duracao'} readOnly={'readonly'} required={true} label={'Tempo de uso (hs):'} />
                            </>
                        ) : (
                            reserveData.tipo === 'Diária' ? (
                                <>
                                    <Input type={'text'} placeholder={'Data Inicial'} id={'dataInicial'} readOnly={'readonly'} required={true} label={'Data Inicial:'} />
                                    <Input type={'text'} placeholder={'Data Final'} id={'dataFinal'} readOnly={'readonly'} required={true} label={'Data Final:'} />
                                    <Input type={'text'} placeholder={'14:00'} id={'hora'} readOnly={'readonly'} required={true} label={'Horário de entrada:'} />
                                    <Input type={'text'} placeholder={'2:00'} id={'duracao'} readOnly={'readonly'} required={true} label={'Tempo de uso (hs):'} />
                                </>
                            ) : (
                                reserveData.tipo === 'Semanal' ? (
                                    <>
                                        <Input type={'text'} placeholder={'Data Inicial'} id={'dataInicial'} readOnly={'readonly'} required={true} label={'Data Inicial:'} />
                                        <Input type={'text'} placeholder={'Data Final'} id={'dataFinal'} readOnly={'readonly'} required={true} label={'Data Final:'} />
                                        <div style={{ width: '345px', margin: '5px 0' }}>
                                            <p className="subtitle">Dias da Semana:</p>
                                            <Days editable={false} actives={weeklyDays} setActives={setWeeklyDays} />
                                        </div>
                                        {reserveData.dias_semana.map((dia, i) => (
                                            <div className="boxDay" key={i}>
                                                <p className="diaSemana">{dia.dia}:</p>
                                                <div className="flex h" style={{marginBottom: '15px'}}>
                                                    <Input type={'text'} placeholder={'14:00'} id={`hora${i}`} readOnly={'readonly'} required={true} label={'Horário de entrada:'} />
                                                    <Input type={'text'} placeholder={'2:00'} id={`duracao${i}`} readOnly={'readonly'} required={true} label={'Tempo de uso (hs):'} />
                                                </div>
                                                {i !== reserveData.dias_semana.length - 1 && <hr className="dashedLine" />}
                                            </div>
                                        ))}
                                    </>
                                ) : reserveData.tipo === 'Personalizada' && (
                                    <>
                                        {reserveData.horarios.map((data, i) => (
                                            <div className="flex c" style={{gap: '10px'}} key={i}>
                                                <Input type={'text'} placeholder={'Data da Reserva'} id={`data${i}`} readOnly={'readonly'} required={true} label={'Data da reserva:'} />
                                                <Input type={'text'} placeholder={'14:00'} id={`hora${i}`} readOnly={'readonly'} required={true} label={'Horário de entrada:'} />
                                                <Input type={'text'} placeholder={'2:00'} id={`duracao${i}`} readOnly={'readonly'} required={true} label={'Tempo de uso (hs):'} />
                                                {i !== reserveData.horarios.length - 1 && <hr className="dashedLine" />}
                                            </div>
                                        ))}
                                    </>
                                )
                            )
                        )}
                    </div>
                    <p className='CancelButton' onClick={() => { CloseModal(false) }}>Cancelar</p>
                </motion.div>
            </form>
        </>
    )
}
