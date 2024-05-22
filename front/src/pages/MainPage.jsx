/* Components */
import MainInfo from '../components/MainInfo';
import NextReserves from '../components/NextReserves';

/* Css */
import './MainPage.css'

/* Variables/Consts */
const mainInfo = [
    {name: 'Meus Laboratórios', value: '1'},
    {name: 'Laboratórios Totais', value: '2'},
    {name: 'Minhas Reservas', value: '3'},
    {name: 'Reservas Totais', value: '4'}
]
const nextReserves = [
    {name: 'LDC1', date: '22/04/2024', begin: '17:30', duration: '2rs'},
    {name: 'LDC2', date: '23/04/2024', begin: '17:30', duration: '2rs'},
    {name: 'LDC3', date: '24/04/2024', begin: '17:30', duration: '2rs'}
]
const UserName = 'User tal'

export default function MainPage() {
    return (
        <div className="PageWrapper">
            <section className='MainPage PageContent'>
            <h1>Bem vindo ao LabHub</h1>

            <p>Olá {UserName}, seja bem vindo ao LabHub. Nosso objetivo é prover um método simples e fácil para cadastro, gerenciamento e alocação de laboratórios de informática ou de salas de aula. Para isso, o menu lateral pode te ajudar.</p>
            <p>Para visualizar os laboratórios cadastrados e, se desejado, reservar algum deles, basta acessar o menu Laboratórios e filtrar pelos dados que deseja, ou simplesmente não preencher nenhum dado de filtro para visualizar todos os laboratórios.</p>
            <p>Também é possível visualizar e, se necessário, atualizar os dados ou excluir uma reserva feita previamente através do menu Reservas.</p>
            <br />
            <p>Esperamos que possa ter uma experiência agradável utilizando nosso site.</p>
            <p>Caso necessário, é possível nos contatar através do email: contato@labhub.com</p>

            <h2>Informações Gerais:</h2>
            <hr />
            <div className="Container">
                {mainInfo.map((info, i) => (
                    <MainInfo key={i} name={info.name} value={info.value} />
                ))}
            </div>

            <h2>Minhas Próximas Reservas:</h2>
            <hr />
            <div className="Container">
                {nextReserves.map((reserve, i) => (
                    <NextReserves key={i} name={reserve.name} date={reserve.date} begin={reserve.begin} duration={reserve.duration} />
                ))}
            </div>
        </section>
        </div>
    );
}