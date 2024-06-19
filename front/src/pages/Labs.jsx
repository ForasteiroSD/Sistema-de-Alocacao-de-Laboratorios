import React, { useState, useEffect, useContext } from 'react';
import { VscSearch } from 'react-icons/vsc';
import { AnimatePresence } from 'framer-motion';
import Input from '../components/Input';
import Table from '../components/Table';
import NewLab from '../components/Labs/NewLab';
import UpdateLab from '../components/Labs/UpdateLab';
import Exclude from '../components/Exclude';
import api from '../lib/Axios';
import { UserContext } from '../context/UserContext';
import { useNavigate } from 'react-router-dom'; 
import './Labs.css';

const tableHeader = ['Nome', 'Capacidade', 'Responsável'];

const searchButtonText = (
    <div className="flex h v" style={{ gap: '5px' }}>
        <VscSearch style={{ transform: 'scale(1.2)' }} />
        <p style={{ margin: '0' }}>Pesquisar</p>
    </div>
);

export default function Labs() {
    const { user } = useContext(UserContext);
    const navigate = useNavigate();
    const [responsaveis, setResponsaveis] = useState();
    const [showNewLab, setShowNewLab] = useState(false);
    const [showUpdateLab, setShowUpdateLab] = useState(false);
    const [showExcludeLab, setShowExcludeLab] = useState(false);
    const [labId, setLabId] = useState(null);
    const [labs, setLabs] = useState([['Carregando Laboratórios...']]);
    const [editable, setEditable] = useState(false);
    const [expandable, setExpandable] = useState(false);

    useEffect(() => {
        setExpandable(user && user.tipo === 'Usuário');
        setEditable(user && user.tipo !== 'Usuário');
        searchLabs(); 
        getResponsaveis();
    }, [user]);

    const searchLabs = async (e) => {
        e && e.preventDefault();
        const nome = document.querySelector('#nameSearch').value;
        const responsavel = document.querySelector('#responsavelSearch').value;
        const capacidade = document.querySelector('#capacidadeSearch').value;

        try {
            const response = await api.get('labs', {
                params: {
                    nome: nome,
                    responsavel: responsavel,
                    capacidade: capacidade
                }
            });

            let labs = [];

            if (response.data.length > 0) {
                response.data.forEach(lab => {
                    labs.push([
                        lab.id,
                        lab.nome,
                        lab.capacidade,
                        lab.responsavel
                    ]);
                });
            } else {
                labs.push(['Nenhum laboratório encontrado']);
            }

            setLabs(labs);
        } catch {
            setLabs([['Desculpe, não foi possível realizar a pesquisa. Tente novamente mais tarde.']]);
        }
    };

    async function getResponsaveis() {
        try {
            const response = await api.get('users');
            const users = response.data.map(user => ({
                value: user.id,
                name: user.nome
            }));
            setResponsaveis(users);
        } catch (error) {
            console.error('Error fetching responsibles:', error);
        }
    }


    const handleExpandLab = (id) => {
        navigate(`/createreserve/${id}`);
    };

    return (
        <section className="Labs PageContent flex c">
            <AnimatePresence>
                {showNewLab && <NewLab CloseModal={setShowNewLab} />}
            </AnimatePresence>

            <AnimatePresence>
                {showUpdateLab && <UpdateLab CloseModal={setShowUpdateLab} labId={labId} />}
            </AnimatePresence>

            <AnimatePresence>
                {showExcludeLab && <Exclude type={'Lab'} CloseModal={setShowExcludeLab} Id={labId} />}
            </AnimatePresence>

            <h1>Laboratórios do Sistema</h1>

            <p>Filtros de pesquisa:</p>
            <form className="SearchForm" onSubmit={searchLabs}>
                <Input type={'text'} placeholder={'Nome'} id={'nameSearch'} />
                <Input type={'text'} placeholder={'Responsável'} id={'responsavelSearch'} />
                <Input type={'number'} placeholder={'Capacidade'} id={'capacidadeSearch'} />
                <Input type={'submit'} placeholder={searchButtonText} />
            </form>

            <Table
                header={tableHeader}
                data={labs}
                editable={editable}
                expandable={expandable} 
                deletable={false}
                showUpdate={setShowUpdateLab}
                showExclude={setShowExcludeLab}
                Id={setLabId}
                handleExpand={handleExpandLab} 
            />

            {user && user.tipo !== 'Usuário' && (
                <div className="flex h" style={{ marginTop: '50px', marginBottom: '50px' }}>
                    <Input type={'submit'} placeholder={'Adicionar Novo Laboratório'} callback={() => { setShowNewLab(true) }} />
                </div>
            )}
        </section>
    );
}
