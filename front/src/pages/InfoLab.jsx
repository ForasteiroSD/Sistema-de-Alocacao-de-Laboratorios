/* Packages */
import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

/* Components */
import Input from '../components/Input';
import UpdateLab from '../components/Labs/UpdateLab';

/* Context */
import { UserContext } from '../context/UserContext';

/* Lib */
import api from '../lib/Axios';

/* Css */
import './InfoLab.css';

export default function InfoLab() {
    const { user } = useContext(UserContext);
    const [labData, setLabData] = useState(null);
    const [showEdit, setShowEdit] = useState(false);
    const [showEditButton, setShowEditButton] = useState(false);
    const [reservasDia, setReservasDia] = useState(['Selecione um dia']);
    const parametros = useParams();
    const nome = parametros.nome;
    const navigate = useNavigate();

    useEffect(() => {
        getLabData();
    }, [nome]);

    useEffect(() => {
        if (user.tipo === "Administrador") setShowEditButton(true);
        else if (user.tipo === "Responsável") verifyUser();
    }, [user]);

    async function verifyUser() {
        try {
            const response = (await api.post('userLabs', { user_id: user.id })).data;
            if ((response.find((lab) => lab.nome === nome))) setShowEditButton(true)
            else setShowEditButton(false);

        } catch (error) {
            setShowEditButton(false);
        }
    }

    async function getLabData() {
        try {
            const response = (await api.get('lab', {
                params: { nome: nome }
            })).data;
            setLabData(response);
        } catch (error) {
            setLabData(error.response.data)
        }
    }

    async function getReservasDia(e) {
        e.preventDefault();

        try {
            const data = document.querySelector('#diaSearch').value;
            if (!data) {
                setReservasDia(['Selecione um dia']);
                return;
            }

            const response = (await api.get('lab/reservasdia', { params: { nome: nome, dia: data } })).data;
            const reservas = [];
            for(let reserva of response) reservas.push(`${reserva.hora_inicio} - ${reserva.duracao}`);
            setReservasDia(reservas);
        } catch (error) {
            setReservasDia([error.response.data]);
        }
    }

    const handleReserveClick = () => {
        navigate(`/reservas`);
    };

    return (
        <section className="InfoLab PageContent flex c">

            <AnimatePresence>
                {showEdit && <UpdateLab CloseModal={setShowEdit} labId={nome} />}
            </AnimatePresence>

            <h1>Laboratório {nome}</h1>

            <div className='flex' style={{ gap: '20px' }}>
                {labData ? (
                    <>
                        <div className="info">
                            <h2 className='title'>Dados do Laboratório</h2>
                            <p>Nome: {labData.nome}</p>
                            <p>Responsável: {labData.responsavelNome}</p>
                            <p>Capacidade: {labData.capacidade}</p>
                            <p>Projetores: {labData.projetores}</p>
                            <p>Quadros: {labData.quadros}</p>
                            <p>Televisões: {labData.televisoes}</p>
                            <p>Ar Condicionados: {labData.ar_condicionados}</p>
                            <p>Computadores: {labData.computadores}</p>
                            <p>Outro: {labData.outro || '-'}</p>
                            {showEditButton && <button onClick={() => setShowEdit(true)}>Editar Dados</button>}
                        </div>
                        <div className="vertical-divider"></div>
                        <div className="reserves">
                            <h2 className='title'>Ver Horários já Reservados</h2>
                            <form className='flex sa' onSubmit={getReservasDia}>
                                <Input type={'date'} placeholder={'Dia'} id={'diaSearch'} />
                                <Input type={'submit'} placeholder={'Buscar'} />
                            </form>
                            <h3>Início - Duração</h3>
                            <div className='horarios'>
                                {reservasDia.map((reserva, i) => (
                                    <p key={i}>{reserva}</p>
                                ))}
                            </div>
                            <button className='newReserve' onClick={handleReserveClick}>Realizar Reserva</button>
                        </div>
                    </>
                ) : (
                    <p>Carregando dados...</p>
                )}
            </div>
        </section>
    );
}
