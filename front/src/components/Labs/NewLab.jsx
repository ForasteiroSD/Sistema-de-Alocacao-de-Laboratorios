/* Packages */
import React, { useContext, useState } from 'react';
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";

/* Components */
import Input from '../Input';

/* Lib */
import api from '../../lib/Axios';

/* Css */
import '../Modal.css';

/* Context */
import { AlertContext } from '../../context/AlertContext';

/* Variables/Consts */
const responsaveis = [
    { value: 'Responsável 1', name: 'Responsável 1' },
    { value: 'Responsável 2', name: 'Responsável 2' },
    { value: 'Responsável 3', name: 'Responsável 3' }
];

export default function NewLab({ closeModal }) {
    const { setAlert } = useContext(AlertContext);

    const createLab = async (nome, capacidade, responsavel, projetores, quadros, televisoes, ar_condicionados, computadores, outro) => {
        try {
            await api.post('labs', {
                nome,
                capacidade,
                responsavel,
                projetores,
                quadros,
                televisoes,
                ar_condicionados,
                computadores,
                outro
            });

            setAlert('Success', 'Laboratório criado');
        } catch (e) {
            setAlert('Error', 'Desculpe, não foi possível criar o laboratório. Tente novamente mais tarde');
        }
    };

    const validate = (e) => {
        e.preventDefault();

        const nome = document.querySelector('#name').value;
        const capacidade = document.querySelector('#capacity').value;
        const responsavel = document.querySelector('#responsible').value;
        const projetores = document.querySelector('#projetores').value;
        const quadros = document.querySelector('#quadros').value;
        const televisoes = document.querySelector('#televisoes').value;
        const ar_condicionados = document.querySelector('#ar_condicionados').value;
        const computadores = document.querySelector('#computadores').value;
        const outro = document.querySelector('#outro').value;

        try {
            z.string().min(1, 'Nome é obrigatório').parse(nome);
            z.number().min(1, 'Capacidade deve ser no mínimo 1').parse(Number(capacidade));
            z.string().min(1, 'Responsável é obrigatório').parse(responsavel);

            createLab(nome, capacidade, responsavel, projetores, quadros, televisoes, ar_condicionados, computadores, outro);
        } catch (error) {
            setAlert('Warning', error.errors[0].message);
        }
    };

    return (
        <>
            <motion.div key={'logo'} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.2 } }} className='ModalImg flex h'>
                <img src="/logos/Logo-White.png" alt="Logo LabHub" />
            </motion.div>
            <motion.div key={'wrapper'} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.2 } }} className='ModalBackGround' />
            <form onSubmit={validate} className='flex h v ModalWrapper' >
                <motion.div key={'modal'} initial={{ x: '-50%', opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: '50%', opacity: 0, transition: { duration: 0.2 } }} className='Modal flex c'>
                    <h1>Novo Laboratório</h1>
                    <Input type={'text'} placeholder={'Nome do laboratório'} id={'name'} required={true} />
                    <Input type={'number'} placeholder={'Capacidade'} id={'capacity'} required={true} />
                    <Input type={'dropdown'} values={responsaveis} placeholder={'Responsável'} id={'responsible'} required={true} />
                    <Input type={'text'} placeholder={'Projetores'} id={'projetores'} required={true} />
                    <Input type={'text'} placeholder={'Quadros'} id={'quadros'} required={true} />
                    <Input type={'text'} placeholder={'Televisões'} id={'televisoes'} required={true} />
                    <Input type={'text'} placeholder={'Ar-Condicionados'} id={'ar_condicionados'} required={true} />
                    <Input type={'text'} placeholder={'Computadores'} id={'computadores'} required={true} />
                    <Input type={'text'} placeholder={'Outro'} id={'outro'} required={true} />
                    <Input type={'submit'} placeholder={'Cadastrar'} />
                    <p className='CancelButton' onClick={() => { closeModal(false) }}>Cancelar</p>
                </motion.div>
            </form>
        </>
    );
}
