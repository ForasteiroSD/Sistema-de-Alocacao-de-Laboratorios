/* Packages */
import { useState, useEffect, useContext } from "react";
import { VscSearch } from "react-icons/vsc";
import { AnimatePresence } from "framer-motion";
import Axios from "axios";

/* Components */
import Input from "../components/Input";
import Table from "../components/Table";
import NewLab from "../components/Labs/NewLab";

/* Lib */
import api from "../lib/Axios";

/* Context */
import { UserContext } from "../context/UserContext";

/* Css */
import './Labs.css';

/* Variables/Consts */
const tableHeader = ['Nome', 'Capacidade', 'Projetor', 'Quadro', 'Televisão', 'Ar-condicionado', 'Computador', 'Outro', 'Responsável'];
const searchButtonText = (
    <div className="flex h v" style={{ gap: '5px' }}>
        <VscSearch style={{ transform: 'scale(1.2)' }} />
        <p style={{ margin: '0' }}>Pesquisar</p>
    </div>
);

export default function Labs() {
    const { user } = useContext(UserContext); // Get user from context
    const [showNewLab, setShowNewLab] = useState(false);
    const [labs, setLabs] = useState([['Carregando Laboratórios...']]);
    const [expandable, setExpandable] = useState(false);

    useEffect(() => {
        SearchLabs();
    }, []);

    const SearchLabs = async (e) => {
        let nome = '';
        let responsavel = '';
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
                    capacidade: capacidade
                }
            })).data;

            let labs = [];

            if (response.length > 0) {
                response.forEach(lab => {
                    labs.push([
                        lab.nome,
                        lab.capacidade,
                        lab.projetor ? 'Sim' : 'Não',
                        lab.quadro ? 'Sim' : 'Não',
                        lab.televisao ? 'Sim' : 'Não',
                        lab.ar_condicionado ? 'Sim' : 'Não',
                        lab.computador ? 'Sim' : 'Não',
                        lab.outro || '-',
                        lab.responsavel.nome
                    ]);
                });
                setExpandable(user && user.tipo !== 'cliente'); // Allow editing if user is not 'cliente'
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

    return (
        <section className="Labs PageContent flex c">
            <AnimatePresence>
                {showNewLab && <NewLab CloseModal={setShowNewLab} />}
            </AnimatePresence>

            <h1>Laboratórios do Sistema</h1>

            <p>Filtros de pesquisa:</p>
            <form className="SearchForm" onSubmit={SearchLabs}>
                <Input type={'text'} placeholder={'Nome'} id={'nameSearch'} />
                <Input type={'text'} placeholder={'Responsável'} id={'responsavelSearch'} />
                <Input type={'number'} placeholder={'Capacidade'} id={'capacidadeSearch'} />
                <Input type={'submit'} placeholder={searchButtonText} />
            </form>

            <Table header={tableHeader} data={labs} expandable={expandable} />

            {user && user.tipo !== 'Usuário' && (
                <div className="flex h" style={{ marginTop: '50px', marginBottom: '50px' }}>
                    <Input type={'submit'} placeholder={'Adicionar Novo Laboratório'} callback={() => { setShowNewLab(true) }} />
                </div>
            )}
        </section>
    );
}
