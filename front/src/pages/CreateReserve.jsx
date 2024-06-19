import React, { useEffect, useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import api from '../lib/Axios';
import './CreateReserve.css';
import { useParams, useNavigate } from 'react-router-dom';

export default function CreateReserve() {
    const [labData, setLabData] = useState(null);
    const parametros = useParams();
    const Id = parametros.id;
    const navigate = useNavigate();

    useEffect(() => {
        getLabsData();
    }, [Id]);

    async function getLabsData() {
        console.log(Id);
        try {
            const response = await api.get('lab', {
                params: { id: Id }
            });
            const data = response.data;
            setLabData(data);
        } catch (error) {
            console.error('Error fetching lab data:', error);
        }
    }

    const handleEditClick = () => {
        navigate(`/laboratorios`);
    };

    const handleReserveClick = () => {
        navigate(`/reservas`);
    };

    return (
        <section className="Labs PageContent flex c">
            {labData ? (
                <div className="lab-details">
                    <div className="lab-info">
                        <h2>Dados do laboratório</h2>
                        <p>Nome: {labData.nome}</p>
                        <p>Capacidade: {labData.capacidade}</p>
                        <p>Projetor: {labData.projetor ? 'Sim' : 'Não'}</p>
                        <p>Quadro: {labData.quadro ? 'Sim' : 'Não'}</p>
                        <p>Televisão: {labData.televisao ? 'Sim' : 'Não'}</p>
                        <p>Ar-condicionado: {labData.ar_condicionado ? 'Sim' : 'Não'}</p>
                        <p>Computador: {labData.computador ? 'Sim' : 'Não'}</p>
                        <p>Outro: {labData.outro || '-'}</p>
                        <p>Responsável: {labData.responsavelNome}</p>
                        <button onClick={handleEditClick}>Editar Dados</button>
                    </div>
                    <div className="vertical-divider"></div>
                    <div className="lab-calendar">
                        <Calendar />
                        <button onClick={handleReserveClick}>Realizar Reserva</button>
                    </div>
                </div>
            ) : (
                <p>Loading...</p>
            )}
        </section>
    );
}
