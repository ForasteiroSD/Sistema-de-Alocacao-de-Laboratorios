/* Components */
import Input from '../Input'
import { motion } from "framer-motion";

/* Css */
import '../Modal.css'

/* Variables/Consts */
const accoutTypes = [
    {id: 'accoutType', value: 'user', name: 'Usuário'},
    {id: 'accoutType', value: 'resp', name: 'Responsável'},
    {id: 'accoutType', value: 'adm', name: 'Administrador'}
]

export default function NewUser({CloseModal}) {
    return (
        <>
            <motion.div key={'logo'} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: {duration: 0.2} }} className='ModalImg flex h'>
                <img src="/logos/Logo-White.png" alt="Logo LabHub" />
            </motion.div>
            <motion.div key={'wrapper'} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: {duration: 0.2} }} className='ModalBackGround' />
            <div className='flex h v ModalWrapper' >
                <motion.div key={'modal'} initial={{ x: '-50%', opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: '50%', opacity: 0, transition: {duration: 0.2} }} className='Modal flex c'>
                    <h1>Novo Usuário</h1>
                    <Input type={'text'} placeholder={'Nome completo'} id={'name'} required={true} />
                    <Input type={'text'} placeholder={'CPF'} id={'cpf'} required={true} />
                    <Input type={'date'} placeholder={'Data de Nascimento'} id={'birthday'} required={true} />
                    <Input type={'text'} placeholder={'Telefone'} id={'phone'} required={true} />
                    <Input type={'text'} placeholder={'Email'} id={'email'} required={true} />
                    <Input type={'text'} placeholder={'Senha'} id={'password'} required={true} />
                    <Input type={'text'} placeholder={'Confirmar Senha'} id={'confirmPassword'} required={true} />
                    <Input type={'dropdown'} values={accoutTypes} id={'name'} required={true} />
                    <Input type={'submit'} placeholder={'Cadastrar'} />
                    <p className='CancelButton' onClick={() => {CloseModal(false)}}>Cancelar</p>
                </motion.div>
            </div>
        </>
    )
}   