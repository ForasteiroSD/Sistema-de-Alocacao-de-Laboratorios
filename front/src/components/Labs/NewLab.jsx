/* Packages */
import React, { useContext, useState, useEffect } from 'react';
import { motion } from "framer-motion";

/* Components */
import Input from '../Input';

/* Lib */
import api from '../../lib/Axios';

/* Css */
import '../Modal.css';
import './LabModal.css';

/* Context */
import { AlertContext } from '../../context/AlertContext';
import { UserContext } from '../../context/UserContext';

export default function NewLab({ CloseModal }) {
    const { setAlert } = useContext(AlertContext);
    const { user } = useContext(UserContext);
    const [responsaveis, setResponsaveis] = useState([]);
    const isResponsavel = user.tipo === 'Responsável';

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = (await api.get('users/responsavel', { params: { cpf: true } })).data;
                const users = response.map(user => ({
                    value: user.cpf,
                    name: `${user.cpf}-${user.nome}`,
                }));
                setResponsaveis(users);
            } catch (error) {
                setAlert('Error', 'Não foi possível carregar a lista de responsáveis.');
            }
        };
        fetchUsers();
    }, []);

    const createLab = async (e) => {

        e.preventDefault();

        let responsavel;
        if(!isResponsavel) responsavel = document.querySelector('#responsible').value;
        const nome = document.querySelector('#name').value;
        const capacidade = Number(document.querySelector('#capacity').value);
        const projetores = Number(document.querySelector('#projetores').value);
        const quadros = Number(document.querySelector('#quadros').value);
        const televisoes = Number(document.querySelector('#televisoes').value);
        const ar_condicionados = Number(document.querySelector('#ar_condicionados').value);
        const computadores = Number(document.querySelector('#computadores').value);
        const outro = document.querySelector('#outro').value;

        const data = {
            nome: nome,
            capacidade: capacidade,
            projetor: projetores,
            quadro: quadros,
            televisao: televisoes,
            ar_condicionado: ar_condicionados,
            computador: computadores,
            outro: outro,
            responsavel_cpf: responsavel,
            responsavel_id: user.id
        };

        try {
            await api.post('lab', data);
            setAlert('Success', 'Laboratório criado');
        } catch (e) {
            setAlert('Error', e.response.data);
        }
    };

    return (
        <>
            <motion.div key={'logo'} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.2 } }} className='ModalImg flex h'>
                <img src="/logos/Logo-White.png" alt="Logo LabHub" />
            </motion.div>
            <motion.div key={'wrapper'} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.2 } }} className='ModalBackGround' />
            <form onSubmit={createLab} className='flex h v ModalWrapper'>
                <motion.div key={'modal'} initial={{ x: '-50%', opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: '50%', opacity: 0, transition: { duration: 0.2 } }} className='Modal flex c'>
                    <h1>Novo Laboratório</h1>
                    <div className='labModal flex c'>
                        {!isResponsavel && (
                            <Input type={'dropdown'} values={responsaveis} placeholder={'Responsável'} id={'responsible'} required={true} />
                        )}
                        <Input type={'text'} placeholder={'Nome do laboratório'} id={'name'} required={true} />
                        <Input type={'number'} placeholder={'Capacidade'} id={'capacity'} required={true} min={0} />
                        <hr />
                        <p className='recursos'>Recursos:</p>
                        <Input type={'number'} placeholder={'Projetores'} id={'projetores'} min={0} />
                        <Input type={'number'} placeholder={'Quadros'} id={'quadros'} min={0} />
                        <Input type={'number'} placeholder={'Televisões'} id={'televisoes'} min={0} />
                        <Input type={'number'} placeholder={'Ar-Condicionados'} id={'ar_condicionados'} min={0} />
                        <Input type={'number'} placeholder={'Computadores'} id={'computadores'} min={0} />
                        <Input type={'text'} placeholder={'Outro'} id={'outro'} />
                    </div>
                    <Input type={'submit'} placeholder={'Cadastrar'} />
                    <p className='CancelButton' onClick={() => { CloseModal(false) }}>Cancelar</p>
                </motion.div>
            </form>
        </>
    );
}
