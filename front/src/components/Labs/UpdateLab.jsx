/* Packages */
import React, { useContext, useState, useEffect } from 'react';
import { motion } from "framer-motion";

/* Components */
import Input from '../Input';

/* Css */
import '../Modal.css';
import './LabModal.css';

/* Lib */
import api from '../../lib/Axios';

/* Context */
import { AlertContext } from '../../context/AlertContext';
import { UserContext } from '../../context/UserContext';

export default function UpdateLab({ labId, CloseModal, updateView }) {
    const { user } = useContext(UserContext);
    const { setAlert } = useContext(AlertContext);
    const [responsaveis, setResponsaveis] = useState([]);
    const isAdm = user.tipo === 'Administrador';

    async function getLabsData() {
        try {
            const response = (await api.get('lab', {
                params: { nome: labId }
            })).data;

            if (isAdm) {
                document.querySelector('#responsible').value = response.responsavelCpf;
                document.querySelector('#responsible').style.color = '#000000';
            }
            document.querySelector('#name').value = response.nome;
            document.querySelector('#capacity').value = response.capacidade;

            if(response.projetores != 'Não possui') {
                document.querySelector('#projetoresSim').click();
                document.querySelector('#projetores').value = response.projetores
            }
            if(response.quadros != 'Não possui') {
                document.querySelector('#quadrosSim').click();
                document.querySelector('#quadros').value = response.quadros
            }
            if(response.televisoes != 'Não possui') {
                document.querySelector('#televisoesSim').click();
                document.querySelector('#televisoes').value = response.televisoes
            }
            if(response.ar_condicionados != 'Não possui') {
                document.querySelector('#ar_condicionadosSim').click();
                document.querySelector('#ar_condicionados').value = response.ar_condicionados
            }
            if(response.computadores != 'Não possui') {
                document.querySelector('#computadoresSim').click();
                document.querySelector('#computadores').value = response.computadores
            }

            document.querySelector('#outro').value = response.outro;

        } catch (error) {
            setAlert('Error', error.response.data);
        }
    }

    async function getResponsaveis() {
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
    }

    useEffect(() => {
        getLabsData();
        getResponsaveis();
    }, [labId]);

    const updateLab = async (e) => {
        e.preventDefault();

        let responsavel;
        if(isAdm) responsavel = document.querySelector('#responsible').value;
        const nome = document.querySelector('#name').value;
        const capacidade = Number(document.querySelector('#capacity').value);

        let projetores, quadros, televisoes, ar_condicionados, computadores;
        if(document.querySelector('#projetores')) projetores = Number(document.querySelector('#projetores').value); else projetores = 0;
        if(document.querySelector('#quadros')) quadros = Number(document.querySelector('#quadros').value); else quadros = 0;
        if(document.querySelector('#televisoes')) televisoes = Number(document.querySelector('#televisoes').value); else televisoes = 0;
        if(document.querySelector('#ar_condicionados')) ar_condicionados = Number(document.querySelector('#ar_condicionados').value); else ar_condicionados = 0;
        if(document.querySelector('#computadores')) computadores = Number(document.querySelector('#computadores').value); else computadores = 0;
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
            novo_responsavel: responsavel,
        };

        try {
            (await api.patch('lab', data)).data;

            setAlert('Success', 'Laboratório alterado');
            updateView();
            CloseModal(false);
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
            <form onSubmit={updateLab} className='flex h v ModalWrapper'>
                <motion.div key={'modal'} initial={{ x: '-50%', opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: '50%', opacity: 0, transition: { duration: 0.2 } }} className='Modal flex c'>
                    <h1>Altualizar Laboratório</h1>
                    <div className='labModal flex c'>
                        {isAdm && (
                            <Input type={'dropdown'} values={responsaveis} placeholder={'Responsável'} id={'responsible'} required={true} />
                        )}
                        <Input type={'text'} placeholder={'Nome do laboratório'} id={'name'} required={true} readOnly={true}/>
                        <Input type={'number'} placeholder={'Capacidade'} id={'capacity'} required={true} min={0} />
                        <hr />
                        <p className='recursos'>Recursos:</p>
                        <div className=' flex c' style={{gap: '20px'}}>
                            <Input type={'optionalQuant'} label={'Projetor:'} id={'projetores'} />
                            <Input type={'optionalQuant'} label={'Quadro:'} id={'quadros'} />
                            <Input type={'optionalQuant'} label={'Televisão:'} id={'televisoes'} />
                            <Input type={'optionalQuant'} label={'Ar Condicionado:'} id={'ar_condicionados'} />
                            <Input type={'optionalQuant'} label={'Computador:'} id={'computadores'} />
                            <Input type={'textArea'} placeholder={'Outro'} id={'outro'} />
                        </div>
                    </div>
                    <Input type={'submit'} placeholder={'Atualizar'} />
                    <p className='CancelButton' onClick={() => { CloseModal(false) }}>Cancelar</p>
                </motion.div>
            </form>
        </>
    );
}
