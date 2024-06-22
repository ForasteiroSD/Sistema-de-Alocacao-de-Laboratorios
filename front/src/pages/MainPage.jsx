/* Packages */
import { useEffect, useContext, useState } from 'react';

/* Components */
import MainInfo from '../components/MainPage/MainInfo';
import NextReserves from '../components/MainPage/NextReserves';

/* Context */
import { UserContext } from "../context/UserContext";

/* Css */
import './MainPage.css'

/* Lib */
import api from '../lib/Axios';

export default function MainPage() {

    const { user } = useContext(UserContext);
    const [mainInfo, setMainInfo] = useState('Carregando Informações...');
    const [nextReserves, setNextReserves] = useState('Carregando Reservas...');

    useEffect(() => {
        if(!user?.id) return;
        async function buscaDados() {
            try {
                const response = (await api.post('mainpageinfo', {
                    id: user.id
                })).data;
                setMainInfo(response.mainInfo);

                for (let i = response.nextReserves.length; i < 3; i++) {
                    response.nextReserves.push({ notFound: true });
                }
                setNextReserves(response.nextReserves);

            } catch (error) {
                setMainInfo('Desculpe, não foi possível realizar a pesquisa. Tente novamente mais tarde.');
                setNextReserves('Desculpe, não foi possível realizar a pesquisa. Tente novamente mais tarde.');
            }

        }
        buscaDados();
    }, [user])

    return (
        <section className='MainPage PageContent flex c'>
            <h1>Bem vindo ao LabHub</h1>

            <p>Olá {user?.nome || 'User'}, seja bem vindo ao LabHub. Nosso objetivo é prover um método simples e fácil para cadastro, gerenciamento e alocação de laboratórios de informática ou de salas de aula. Para isso, o menu lateral pode te ajudar.</p>
            <p>Para visualizar os laboratórios cadastrados e, se desejado, reservar algum deles, basta acessar o menu Laboratórios e filtrar pelos dados que deseja, ou simplesmente não preencher nenhum dado de filtro para visualizar todos os laboratórios.</p>
            <p>Também é possível visualizar e, se necessário, atualizar os dados ou excluir uma reserva feita previamente através do menu Reservas.</p>
            <br />
            <p>Esperamos que possa ter uma experiência agradável utilizando nosso site.</p>
            <p>Caso necessário, é possível nos contatar através do email: labhubalocacaodelaboratorios@gmail.com</p>

            <h2>Informações Gerais:</h2>
            <hr />
            <div className="Container">
                {
                    typeof mainInfo === 'string' ? (
                        <p>{mainInfo}</p>
                    ) : (
                        mainInfo.map((info, i) => (
                            <MainInfo key={i} name={info.name} value={info.value} />
                        ))
                    )
                }
            </div>

            <h2>Minhas Próximas Reservas:</h2>
            <hr />
            <div className="Container">
                {
                    typeof nextReserves === 'string' ? (
                        <p>{nextReserves}</p>
                    ) : (
                        nextReserves.map((reserve, i) => (
                            <NextReserves key={i} name={reserve.name} date={reserve.date} begin={reserve.begin} duration={reserve.duration} notFound={reserve.notFound} />
                        ))
                    )
                }
            </div>
        </section>
    );
}