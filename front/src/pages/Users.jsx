/* Packages */
import { useState, useEffect } from "react";
import { VscSearch } from "react-icons/vsc";
import { AnimatePresence } from "framer-motion";
import Axios from "axios";

/* Components */
import Input from "../components/Input";
import Table from "../components/Table";
import NewUser from "../components/Users/NewUser";

/* Lib */
import api from "../lib/Axios";

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

    useEffect(() => {
        SearchUsers();
    }, [])

    const SearchUsers = async (e) => {
        let nome;
        let cpf;
        let email;
        let tipo;

        if(e) {
            e.preventDefault();
            nome = document.querySelector('#nameSearch').value;
            cpf = document.querySelector('#cpfSearch').value;
            email = document.querySelector('#emailSearch').value;
            tipo = document.querySelector('#accoutTypeSearch').value;
        } else {
            nome = '';
            cpf = '';
            email = '';
            tipo = '';
        }

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
                    users.push([user.nome, user.cpf, user.email, user.tipo]);
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
        <section className="Users PageContent">
            <AnimatePresence>
                {showNewUser && <NewUser CloseModal={setShowNewUser} />}
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

            <Table header={tableHeader} data={users} editable={editable}/>

            <div className="flex h" style={{marginTop: '50px', marginBottom: '50px'}}>
                <Input type={'submit'} placeholder={'Adicionar Novo Usuário'} callback={() => {setShowNewUser(true)}} />
            </div>
        </section>
    )
}