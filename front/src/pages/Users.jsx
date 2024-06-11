/* Packages */
import { useState, useEffect } from "react";
import { VscSearch } from "react-icons/vsc";
import { AnimatePresence } from "framer-motion";
import Axios from "axios";

/* Components */
import Input from "../components/Input";
import Table from "../components/Table";
import NewUser from "../components/Users/NewUser";
import UpdateUser from "../components/Users/UpdateUser";

/* Lib */
import api from '../lib/Axios';

/* Css */
import './Users.css'

/* Variables/Consts */
const accoutTypes = [
    {value: '', name: 'Qualquer Tipo'},
    {value: 'Administrador', name: 'Administrador'},
    {value: 'Responsável', name: 'Responsável'},
    {value: 'Usuário', name: 'Usuário'}
]
const tableHeader = ['Nome', 'CPF', 'Email', 'Tipo de Conta']
const searchButtonText = (
    <div className="flex h v" style={{gap: '5px'}}>
        <VscSearch style={{transform: 'scale(1.2)'}} />    
        <p style={{margin: '0'}}>Pesquisar</p>
    </div>
)
import { nameMask, cpfMask } from "../GlobalVariables";


export default function Users() {
    const [showNewUser, setShowNewUser] = useState(false);
    const [users, setUsers] = useState([['Carregando Usuários...']]);
    const [editable, setEditable] = useState(false);
    const [showUpdateUser, setShowUpdateUser] = useState(false);
    const [updateUserId, setUpdateUserId] = useState(false);

    useEffect(() => {
        SearchUsers();
    }, [])

    const SearchUsers = async (e) => {
        e && e.preventDefault();
        const nome = document.querySelector('#nameSearch').value;
        const cpf = document.querySelector('#cpfSearch').value;
        const email = document.querySelector('#emailSearch').value;
        const tipo = document.querySelector('#accoutTypeSearch').value;

        try {
            const response = (await api.get('users?' , {
                params: {
                    nome: nome,
                    cpf: cpf,
                    email: email,
                    tipo: tipo
                }
            })).data;
            
            let users = [];
            
            if(response.length > 0) {
                response.forEach(user => {
                    users.push([user.id, user.nome, user.cpf, user.email, user.tipo]);
                });
                setEditable(true);
            } else {
                users.push(['Nenhum usuário encontrado']);
                setEditable(false);
            }
            
            setUsers(users);
        } catch {
            setUsers('Desculpe, não foi possível realizar a pesquisa. Tente novamente mais tarde.')
            setEditable(false);
        }
    }

    return (
        <section className="Users PageContent flex c">
            <AnimatePresence>
                {showNewUser && <NewUser CloseModal={setShowNewUser} />}
            </AnimatePresence>

            <AnimatePresence>
                {showUpdateUser && <UpdateUser CloseModal={setShowUpdateUser} UserId={updateUserId} />}
            </AnimatePresence>

            <h1>Usuários do Sistema</h1>

            <p>Filtros de pesquisa:</p>
            <form className="SearchForm">
                <Input type={'text'} placeholder={'Nome'} formatter={nameMask} id={'nameSearch'} />
                <Input type={'text'} placeholder={'CPF'} formatter={cpfMask} id={'cpfSearch'} />
                <Input type={'text'} placeholder={'Email'} id={'emailSearch'} />
                <Input type={'dropdown'} values={accoutTypes} id={'accoutTypeSearch'} placeholder={'Tipo de Usuário'} />
                <Input type={'submit'} placeholder={searchButtonText} callback={SearchUsers} />
            </form>

            <Table header={tableHeader} data={users} editable={editable} showUpdate={setShowUpdateUser} updateId={setUpdateUserId}/>

            <div className="flex h" style={{marginTop: '50px', marginBottom: '50px'}}>
                <Input type={'submit'} placeholder={'Adicionar Novo Usuário'} callback={() => {setShowNewUser(true)}} />
            </div>
        </section>
    )
}