import React, { useContext, useState, useEffect } from 'react';
import { motion } from "framer-motion";
import Input from '../Input';
import api from '../../lib/Axios';
import '../Modal.css';
import { AlertContext } from '../../context/AlertContext';

export default function UpdateLab({ labId, CloseModal }) {
    const { setAlert } = useContext(AlertContext);
    const [responsaveis, setResponsaveis] = useState([]);

    async function getLabsData() {
        const response = await api.get('lab', {
            params: { id: labId }
        });
        const data = response.data;

        document.querySelector('#name').value = data.nome;
        document.querySelector('#capacity').value = data.capacidade;
        document.querySelector('#responsible').value = data.responsavel;
        document.querySelector('#projetores').value = data.projetores;
        document.querySelector('#quadros').value = data.quadros;
        document.querySelector('#televisoes').value = data.televisoes;
        document.querySelector('#ar_condicionados').value = data.ar_condicionados;
        document.querySelector('#computadores').value = data.computadores;
        document.querySelector('#outro').value = data.outro;
        document.querySelector('#responsible').style.color = '#000000';
    }

    async function getResponsaveis() {
        const response = await api.get('users');
        const users = response.data.map(user => ({
            value: user.id,
            name: user.nome,
            cpf: user.cpf 
        }));
        setResponsaveis(users);
    }

    useEffect(() => {
        getLabsData();
        getResponsaveis();
    }, [labId]);

    const updateLab = async (nome, capacidade, responsavel, projetores, quadros, televisoes, ar_condicionados, computadores, outro) => {
        const selectedResponsavel = responsaveis.find(r => r.value === responsavel);
        const novo_responsavel = selectedResponsavel ? selectedResponsavel.cpf : null;
        console.log(novo_responsavel)
        let params = {
            id: labId,
            nome,
            capacidade: parseInt(capacidade, 10),
            projetor: projetores ? parseInt(projetores, 10) : null,
            quadro: quadros ? parseInt(quadros, 10) : null,
            televisao: televisoes ? parseInt(televisoes, 10) : null,
            ar_condicionado: ar_condicionados ? parseInt(ar_condicionados, 10) : null,
            computador: computadores ? parseInt(computadores, 10) : null,
            outro: outro || '',
            novo_responsavel
        };

        try {
            (await api.patch('lab', params)).data;

            setAlert('Success', 'Laboratório alterado');
            CloseModal(false);
        } catch (e) {
            const erro = e.response.data;
            setAlert('Error', erro);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        try {
            const nome = document.querySelector('#name').value;
            const capacidade = document.querySelector('#capacity').value;
            const responsavel = document.querySelector('#responsible').value;
            const projetores = document.querySelector('#projetores').value;
            const quadros = document.querySelector('#quadros').value;
            const televisoes = document.querySelector('#televisoes').value;
            const ar_condicionados = document.querySelector('#ar_condicionados');
            const computadores = document.querySelector('#computadores').value;
            const outro = document.querySelector('#outro').value;

            updateLab(nome, capacidade, responsavel, projetores, quadros, televisoes, ar_condicionados, computadores, outro);
        } catch (error) {
            setAlert('Warning', 'Erro ao processar o formulário.');
        }
    };

    return (
        <>
            <motion.div key={'logo'} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.2 } }} className='ModalImg flex h'>
                <img src="/logos/Logo-White.png" alt="Logo LabHub" />
            </motion.div>
            <motion.div key={'wrapper'} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.2 } }} className='ModalBackGround' />
            <form onSubmit={handleSubmit} className='flex h v ModalWrapper'>
                <motion.div key={'modal'} initial={{ x: '-50%', opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: '50%', opacity: 0, transition: { duration: 0.2 } }} className='Modal flex c'>
                    <h1>Alterar Laboratório</h1>
                    <Input type={'text'} placeholder={'Nome do laboratório'} id={'name'} required={true} />
                    <Input type={'number'} placeholder={'Capacidade'} id={'capacity'} required={true} />
                    <Input type={'dropdown'} values={responsaveis} placeholder={'Responsável'} id={'responsible'} required={true} />
                    <Input type={'number'} placeholder={'Projetores'} id={'projetores'} required={true} />
                    <Input type={'number'} placeholder={'Quadros'} id={'quadros'} required={true} />
                    <Input type={'number'} placeholder={'Televisões'} id={'televisoes'} required={true} />
                    <Input type={'number'} placeholder={'Ar-Condicionados'} id={'ar_condicionados'} required={true} />
                    <Input type={'number'} placeholder={'Computadores'} id={'computadores'} required={true} />
                    <Input type={'text'} placeholder={'Outro'} id={'outro'} required={true} />
                    <Input type={'submit'} placeholder={'Atualizar'} />
                    <p className='CancelButton' onClick={() => { CloseModal(false) }}>Cancelar</p>
                </motion.div>
            </form>
        </>
    );
}
