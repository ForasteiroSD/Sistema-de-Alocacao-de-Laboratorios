import React, { useContext, useState, useEffect } from 'react';
import { z } from "zod";
import { motion } from "framer-motion";

/* Components */
import Input from '../Input';

/* Lib */
import api from '../../lib/Axios';

/* Css */
import '../Modal.css';

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
                const response = await api.get('users');
                const users = response.data.map(user => ({
                    value: user.id,
                    name: user.nome,
                    cpf: user.cpf 
                }));
                setResponsaveis(users);
            } catch (error) {
                setAlert('Error', 'Não foi possível carregar a lista de responsáveis.');
            }
        };
        fetchUsers();
    }, [setAlert]);

    const createLab = async (data) => {
        console.log(data);
        try {
            await api.post('lab', data);
            setAlert('Success', 'Laboratório criado'); 
        } catch (e) {
            if (e.response) {
                switch (e.response.status) {
                    case 404:
                        setAlert('Error', 'Responsável não encontrado');
                        break;
                    case 409:
                        setAlert('Error', 'Nome já cadastrado');
                        break;
                    default:
                        setAlert('Error', 'Desculpe, não foi possível criar o laboratório. Tente novamente mais tarde');
                }
            } else {
                setAlert('Error', 'Desculpe, não foi possível criar o laboratório. Tente novamente mais tarde');
            }
        }
    };

    const validate = (e) => {
        e.preventDefault();

        const nome = document.querySelector('#name').value;
        const capacidade = document.querySelector('#capacity').value;
        const responsavelId = document.querySelector('#responsible').value;
        const projetores = document.querySelector('#projetores').value;
        const quadros = document.querySelector('#quadros').value;
        const televisoes = document.querySelector('#televisoes').value;
        const ar_condicionados = document.querySelector('#ar_condicionados').value;
        const computadores = document.querySelector('#computadores').value;
        const outro = document.querySelector('#outro').value;

        try {
            z.string().min(1, 'Nome é obrigatório').parse(nome);
            z.string().regex(/^\d+$/, 'Capacidade deve ser um número positivo').refine(val => parseInt(val, 10) > 0, {
                message: 'Capacidade deve ser no mínimo 1'
            }).parse(capacidade);
            
            let responsavelCpf;
            if (isResponsavel) {
                responsavelCpf = user.cpf;
            } else {
                const selectedUser = responsaveis.find(user => user.value === responsavelId);
                if (!selectedUser) {
                    throw new Error('Responsável é obrigatório');
                }
                responsavelCpf = selectedUser.cpf;
                z.string().min(1, 'Responsável é obrigatório').parse(responsavelCpf);
            }

            const data = {
                nome,
                capacidade: parseInt(capacidade, 10), 
                projetor: projetores ? parseInt(projetores, 10) : null,
                quadro: quadros ? parseInt(quadros, 10) : null,
                televisao: televisoes ? parseInt(televisoes, 10) : null,
                ar_condicionado: ar_condicionados ? parseInt(ar_condicionados, 10) : null,
                computador: computadores ? parseInt(computadores, 10) : null,
                outro: outro || '',
                responsavel_cpf: isResponsavel == false ? responsavelCpf : user.cpf
            };

            createLab(data);
        } catch (error) {
            setAlert('Warning', error.message);
        }
    };

    return (
        <>
            <motion.div key={'logo'} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.2 } }} className='ModalImg flex h'>
                <img src="/logos/Logo-White.png" alt="Logo LabHub" />
            </motion.div>
            <motion.div key={'wrapper'} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.2 } }} className='ModalBackGround' />
            <form onSubmit={validate} className='flex h v ModalWrapper'>
                <motion.div key={'modal'} initial={{ x: '-50%', opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: '50%', opacity: 0, transition: { duration: 0.2 } }} className='Modal flex c'>
                    <h1>Novo Laboratório</h1>
                    <Input type={'text'} placeholder={'Nome do laboratório'} id={'name'} required={true} />
                    <Input type={'number'} placeholder={'Capacidade'} id={'capacity'} required={true} />
                    {!isResponsavel && (
                        <Input type={'dropdown'} values={responsaveis} placeholder={'Responsável'} id={'responsible'} required={true} />
                    )}
                    <Input type={'number'} placeholder={'Projetores'} id={'projetores'} />
                    <Input type={'number'} placeholder={'Quadros'} id={'quadros'} />
                    <Input type={'number'} placeholder={'Televisões'} id={'televisoes'} />
                    <Input type={'number'} placeholder={'Ar-Condicionados'} id={'ar_condicionados'} />
                    <Input type={'number'} placeholder={'Computadores'} id={'computadores'} />
                    <Input type={'text'} placeholder={'Outro'} id={'outro'} />
                    <Input type={'submit'} placeholder={'Cadastrar'} />
                    <p className='CancelButton' onClick={() => { CloseModal(false) }}>Cancelar</p>
                </motion.div>
            </form>
        </>
    );
}
