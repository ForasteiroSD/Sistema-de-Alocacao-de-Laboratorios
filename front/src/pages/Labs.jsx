/* Packages */
import React, { useState, useEffect, useContext } from 'react';
import { VscSearch } from 'react-icons/vsc';
import { AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

/* Components */
import Input from '../components/Input';
import Table from '../components/Table';
import NewLab from '../components/Labs/NewLab';

/* Lib */
import api from '../lib/Axios';

/* Context */
import { UserContext } from '../context/UserContext';

/* Css */
import './Labs.css';

/* Variables/Consts */
const tableHeader = ['Nome', 'Responsável', 'Capacidade'];
const searchButtonText = (
    <div className="flex h v" style={{ gap: '5px' }}>
        <VscSearch style={{ transform: 'scale(1.2)' }} />
        <p style={{ margin: '0' }}>Pesquisar</p>
    </div>
);

export default function Labs() {
    const { user } = useContext(UserContext);
    const navigate = useNavigate();
    const [responsaveis, setResponsaveis] = useState([]);
    const [showNewLab, setShowNewLab] = useState(false);
    const [expandable, setExpandable] = useState(false);
    const [labs, setLabs] = useState([['Carregando Laboratórios...']]);

    useEffect(() => {
        searchLabs();
        getResponsaveis();
    }, []);

    const searchLabs = async (e) => {
        let responsavel = '';
        let nome = '';
        let capacidade = '';

        if (e) {
            e.preventDefault();
            nome = document.querySelector('#nameSearch').value;
            responsavel = document.querySelector('#responsavelSearch').value;
            capacidade = document.querySelector('#capacidadeSearch').value;
        }

        try {
            const response = (await api.get('labs', {
                params: {
                    nome: nome,
                    responsavel: responsavel,
                    capacidade_minima: capacidade
                }
            })).data;

            let labs = [];

            if (response.length > 0) {
                response.forEach(lab => {
                    labs.push([
                        lab.nome,
                        lab.nome,
                        lab.responsavel,
                        lab.capacidade
                    ]);
                });
                setExpandable(true);
            } else {
                labs.push(['Nenhum laboratório encontrado']);
                setExpandable(false);
            }

            setLabs(labs);
        } catch {
            setLabs([['Desculpe, não foi possível realizar a pesquisa. Tente novamente mais tarde.']]);
            setExpandable(false);
        }
    };

    async function getResponsaveis() {
        try {
            const users = [{ value: '', name: 'Qualquer Responsável' }];
            const response = (await api.get('users/responsavel')).data;
            for (let user of response) {
                users.push({ value: user.nome, name: user.nome });
            }
            setResponsaveis(users);
        } catch (error) {
            setResponsaveis([{ value: '', name: 'Não foi possível encontrar os responsáveis' }])
        }
    }


    const handleExpandLab = (nome) => {
        navigate(`/laboratorio/${nome}`);
    };

    return (
        <section className="Labs PageContent flex c">
            <AnimatePresence>
                {showNewLab && <NewLab CloseModal={setShowNewLab} />}
            </AnimatePresence>

            <h1>Laboratórios Cadastrados</h1>

            <p>Filtros de pesquisa:</p>
            <form className="SearchForm" onSubmit={searchLabs}>
                <Input type={'text'} placeholder={'Nome'} id={'nameSearch'} />
                <Input type={'dropdown'} values={responsaveis} placeholder={'Responsável'} id={'responsavelSearch'} />
                <Input type={'number'} placeholder={'Capacidade Mínima'} id={'capacidadeSearch'} min={0}/>
                <Input type={'submit'} placeholder={searchButtonText} />
            </form>

            <Table
                header={tableHeader}
                data={labs}
                editable={false}
                expandable={expandable}
                deletable={false}
                handleExpand={handleExpandLab}
            />

            {user && user.tipo !== 'Usuário' && (
                <div className="flex h" style={{ marginTop: '50px' }}>
                    <Input type={'submit'} placeholder={'Adicionar Novo Laboratório'} callback={() => { setShowNewLab(true) }} />
                </div>
            )}
        </section>
    );
}
