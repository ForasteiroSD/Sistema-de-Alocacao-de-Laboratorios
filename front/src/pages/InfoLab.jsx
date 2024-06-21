/* Packages */
import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { VscSearch } from "react-icons/vsc";
import { SiGlassdoor } from "react-icons/si";
import { MdManageAccounts } from "react-icons/md";
import { GoNumber } from "react-icons/go";
import { BsProjectorFill } from "react-icons/bs";
import { FaChalkboardTeacher } from "react-icons/fa";
import { PiTelevisionSimpleFill } from "react-icons/pi";
import { TbAirConditioning } from "react-icons/tb";
import { LuComputer } from "react-icons/lu";
import { FaRegQuestionCircle } from "react-icons/fa";

/* Components */
import UserData from '../components/Configs/UserData';
import Input from '../components/Input';
import UpdateLab from '../components/Labs/UpdateLab';
import NewReserve from '../components/Reserves/NewReserve';
import Table from '../components/Table';

/* Context */
import { UserContext } from '../context/UserContext';

/* Lib */
import api from '../lib/Axios';

/* Css */
import './InfoLab.css';

/* Consts/Variables */
const searchReservesText = (
    <div className="flex h v" style={{gap: '5px'}}>
        <VscSearch style={{transform: 'scale(1.2)'}} />    
        <p style={{margin: '0'}}>Buscar</p>
    </div>
)

export default function InfoLab() {
    const { user } = useContext(UserContext);
    const [labData, setLabData] = useState(null);
    const [showEdit, setShowEdit] = useState(false);
    const [showEditButton, setShowEditButton] = useState(false);
    const [reservasDia, setReservasDia] = useState([['Selecione um dia']]);
    const [showNewReserve, setShowNewReserve] = useState(false);
    const parametros = useParams();
    const nome = parametros.nome;

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
                setReservasDia([['Selecione um dia']]);
                return;
            }

            const response = (await api.get('lab/reservasdia', { params: { nome: nome, dia: data } })).data;
            const reservas = [];
            for (let reserva of response) reservas.push([reserva.hora_inicio + ' hrs', reserva.duracao + ' hrs']);
            setReservasDia(reservas);
        } catch (error) {
            setReservasDia([[error.response.data]]);
        }
    }

    function callbackNewReserve() {
        setShowNewReserve(true);
    }

    function callbackShowEdit() {
        setShowEdit(true);
    }

    return (
        <section className="InfoLab PageContent flex c">

            <AnimatePresence>
                {showEdit && <UpdateLab CloseModal={setShowEdit} labId={nome} />}
            </AnimatePresence>

            <AnimatePresence>
                {showNewReserve && <NewReserve CloseModal={setShowNewReserve} labName={nome} />}
            </AnimatePresence>

            <h1>Laboratório {nome}</h1>

            <div className='flex InfoLabWrapper' style={{ gap: '50px' }}>
                {labData ? (
                    <>
                        <div className="flex c info">
                            <h2 className='title'>Dados do Laboratório</h2>
                            <div className='infosLab'>
                                <UserData icon={<MdManageAccounts />} title={'Responsável:'} data={labData.responsavelNome} />
                                <UserData icon={<SiGlassdoor />} title={'Nome:'} data={labData.nome} />
                                <UserData icon={<GoNumber />} title={'Capacidade:'} data={labData.capacidade} />
                                <UserData icon={<FaChalkboardTeacher />} title={'Quadros:'} data={labData.quadros} />
                                <UserData icon={<BsProjectorFill />} title={'Projetores:'} data={labData.projetores} />
                                <UserData icon={<PiTelevisionSimpleFill />} title={'Televisões:'} data={labData.televisoes} />
                                <UserData icon={<TbAirConditioning />} title={'Ar Condicionados:'} data={labData.ar_condicionados} />
                                <UserData icon={<LuComputer />} title={'Computadores:'} data={labData.computadores} />
                                <UserData icon={<FaRegQuestionCircle />} title={'Outro:'} data={labData.outro || '-'} />
                            </div>
                            {showEditButton && <Input type={'submit'} placeholder={'Editar Dados'} callback={callbackShowEdit} />}
                        </div>
                        <hr className="vertical-divider"/>
                        <div className="reserves flex c">
                            <h2 className='title'>Ver Horários já Reservados</h2>
                            <form className='flex h' style={{gap: '20px', alignItems: 'end'}} onSubmit={getReservasDia}>
                                <Input type={'date'} placeholder={'Dia'} id={'diaSearch'} />
                                <Input type={'submit'} placeholder={searchReservesText} />
                            </form>
                            <Table header={['Horário de Início', 'Duração']} data={reservasDia}/>
                            <Input type={'submit'} placeholder={'Realizar Reserva'} callback={callbackNewReserve} />
                        </div>
                    </>
                ) : (
                    <h2 style={{width: '100%', textAlign: 'center'}}>Carregando dados...</h2>
                )}
            </div>
        </section>
    );
}
