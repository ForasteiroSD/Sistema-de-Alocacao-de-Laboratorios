/* Packages */
import { useState, useEffect } from "react";
import { VscSearch } from "react-icons/vsc";
import { AnimatePresence } from "framer-motion";

/* Components */
import Input from "../components/Input";
import Table from "../components/Table";
import InfoReserve from "../components/Reserves/InfoReserve";
import Exclude from "../components/Exclude";

/* Lib */
import api from "../lib/Axios";

/* Css */
import './Reserves.css';

import { nameMask } from "../GlobalVariables";

const reservesTypes = [
  { value: '', name: 'Qualquer Tipo' },
  { value: 'Única', name: 'Única' },
  { value: 'Diária', name: 'Diária' },
  { value: 'Semanal', name: 'Semanal' },
  { value: 'Personalizada', name: 'Personalizada' }
]

const tableHeader = ['Responsável', 'Laboratório', 'Datas Inicial', 'Datas Final', 'Tipo de Reserva'];
const searchButtonText = (
  <div className="flex h v" style={{ gap: '5px' }}>
    <VscSearch style={{ transform: 'scale(1.2)' }} />
    <p style={{ margin: '0' }}>Pesquisar</p>
  </div>
);


export default function Reserves({ Id }) {
  const [reservas, setReservas] = useState([['Carregando Reservas...']]);
  const [labNames, setLabNames] = useState([]);
  const [expandable, setExpandable] = useState(false);
  const [infoReserva, setInfoReserva] = useState(false);
  const [deleteReserva, setDeleteReserva] = useState(false);
  const [reservaId, setReservaId] = useState(false);

  useEffect(() => {
    getData();
    SearchReserves();
  }, []);

  async function getData() {

    try {
      const response = (await api.get('lab/user', {
        params: {
          user_id: Id
        }
      })).data;

      const inputValues = [{ value: '', name: 'Qualquer Laboratório' }];
      for (let lab of response.data) {
        inputValues.push({ value: `${lab.nome}`, name: `${lab.nome}` })
      }
      setLabNames(inputValues);
    } catch (error) {
      setLabNames([{ value: '', name: 'Não foi possível encontrar os laboratórios' }])
    }

  }

  const SearchReserves = async (e) => {
    let responsavel = '';
    let laboratorio = '';
    let data_inicial = '';
    let data_final = '';
    let tipo = '';

    if (e) {
      e.preventDefault();
      responsavel = document.querySelector('#respSearch').value;
      laboratorio = document.querySelector('#labSearch').value;
      data_inicial = document.querySelector('#dataISearch').value;
      data_final = document.querySelector('#dataFSearch').value;
      tipo = document.querySelector('#tipoSearch').value;
    }

    try {

      let response;

      if (Id) {
        response = (await api.get('reservas/lab', {
          params: {
            userName: responsavel,
            labName: laboratorio,
            data_inicio: data_inicial,
            data_fim: data_final,
            tipo: tipo,
            resp_id: Id
          }
        })).data;
      } else {
        response = (await api.get('reservas', {
          params: {
            userName: responsavel,
            labName: laboratorio,
            data_inicio: data_inicial,
            data_fim: data_final,
            tipo: tipo
          }
        })).data;
      }

      let reservas = [];

      if (response.data.length > 0) {
        response.data.forEach(reserva => {
          reservas.push([reserva.id, reserva.responsavel, reserva.lab, reserva.data_inicio, reserva.data_fim, reserva.tipo]);
        });
        setExpandable(true);
      } else {
        reservas.push(['Nenhuma reserva encontrada']);
        setExpandable(false);
      }

      setReservas(reservas);
    } catch {
      setReservas([['Desculpe, não foi possível realizar a pesquisa. Tente novamente mais tarde.']]);
      setExpandable(false);
    }
  };

  return (
    <section className="Reserves PageContent flex c">

        <AnimatePresence>
            {infoReserva && <InfoReserve CloseModal={setInfoReserva} ReserveId={reservaId} />}
        </AnimatePresence>

        <AnimatePresence>
            {deleteReserva && <Exclude type={'Reserve'} CloseModal={setDeleteReserva} Id={reservaId} />}
        </AnimatePresence>

        <h1>Reservas {Id ? 'nos Meus Laboratórios' : 'no Sistema'}</h1>

        <p>Filtros de pesquisa:</p>
        <form className="SearchForm">
            <Input type={'text'} placeholder={'Responsável'} formatter={nameMask} id={'respSearch'} />
            <Input type={'dropdown'} values={labNames} id={'labSearch'} placeholder={'Laboratório'} />
            <Input type={'date'} placeholder={'Data Inicial'} id={'dataISearch'} />
            <Input type={'date'} placeholder={'Data Final'} id={'dataFSearch'} />
            <Input type={'dropdown'} values={reservesTypes} id={'tipoSearch'} placeholder={'Tipo de Reserva'} />
            <Input type={'submit'} placeholder={searchButtonText} callback={SearchReserves} />
        </form>
        <p className="info">Obs: Caso nenhuma data final seja informada serão retornadas as reservas que terminam após o dia de hoje</p>

        <Table header={tableHeader} data={reservas} expandable={expandable} deletable={true} handleExpand={setInfoReserva} showExclude={setDeleteReserva} Id={setReservaId} />
    </section>
  );
}