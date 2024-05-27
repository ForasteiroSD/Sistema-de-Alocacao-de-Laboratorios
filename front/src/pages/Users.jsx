/* Packages */
import { useState } from "react";
import { VscSearch } from "react-icons/vsc";
import { AnimatePresence } from "framer-motion";

/* Components */
import Input from "../components/Input";
import Table from "../components/Table";
import NewUser from "../components/Users/NewUser";

/* Css */
import './Users.css'

/* Variables/Consts */
const accoutTypes = [
    {id: 'accoutType', value: null, name: 'Qualquer Tipo'},
    {id: 'accoutType', value: 'adm', name: 'Administrador'},
    {id: 'accoutType', value: 'resp', name: 'Responsável'},
    {id: 'accoutType', value: 'user', name: 'Usuário'}
]
const tableHeader = ['Nome', 'CPF', 'Email', 'Tipo de Conta']
const userData = [
    ['Bruno', '123.456.789-10', 'emaildobruno@gmail.com', 'Usuário'],
    ['Diogo', '123.456.789-11', 'emaildodiogo@gmail.com', 'Administrador'],
    ['Thiago', '123.456.789-12', 'emaildothiago@gmail.com', 'Responsável'],
    ['Tamiris', '123.456.789-13', 'emaildatamiris@gmail.com', 'Responsável']
]
const searchButtonText = (
    <div className="flex h v" style={{gap: '5px'}}>
        <VscSearch style={{transform: 'scale(1.2)'}} />    
        <p style={{margin: '0'}}>Pesquisar</p>
    </div>
)

export default function Users() {
    const [showNewUser, setShowNewUser] = useState(false);

    const SearchUsers = (e) => {
        e.preventDefault();

        alert('teste');
    }

    return (
        <section className="Users PageContent">
            <AnimatePresence>
                {showNewUser && <NewUser CloseModal={setShowNewUser} />}
            </AnimatePresence>

            <h1>Usuários do Sistema</h1>

            <p>Filtros de pesquisa:</p>
            <form className="SearchForm">
                <Input type={'text'} placeholder={'Nome'} id={'nome'} />
                <Input type={'text'} placeholder={'CPF'} id={'cpf'} />
                <Input type={'text'} placeholder={'Email'} id={'email'} />
                <Input type={'dropdown'} values={accoutTypes} id={'tipo'} placeholder={'Tipo de Conta'} />
                <Input type={'submit'} placeholder={searchButtonText} callback={SearchUsers} />
            </form>

            <Table header={tableHeader} usersData={userData}/>

            <div className="flex h" style={{marginTop: '50px'}}>
                <Input type={'submit'} placeholder={'Adicionar Novo Usuário'} callback={() => {setShowNewUser(true)}} />
            </div>
        </section>
    )
}