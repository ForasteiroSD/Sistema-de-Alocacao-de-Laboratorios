/* Packages */
import { useState, useEffect } from "react";
import { VscSearch } from "react-icons/vsc";

/* Components */
import Input from "../components/Input";
import Table from "../components/Table";

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

const tableHeader = ['Responsáveis', 'Laboratórios', 'Datas Iniciais', 'Datas Finais', 'Tipos de Reservas'];
const searchButtonText = (
  <div className="flex h v" style={{ gap: '5px' }}>
    <VscSearch style={{ transform: 'scale(1.2)' }} />
    <p style={{ margin: '0' }}>Pesquisar</p>
  </div>
);


export default function Reserves() {
  const [reservas, setReservas] = useState([['Carregando Reservas...']]);
  const [labNames, setLabNames] = useState();

  useEffect(() => {
    getData();
    SearchReserves();
  }, []);

  async function getData() {

    try {
      const response = (await api.get('labNames')).data;

      const inputValues = [{ value: '', name: 'Qualquer Laboratório' }];
      for (let lab of response) {
        inputValues.push({ value: `${lab.nome}`, name: `${lab.nome}` })
      }
      setLabNames(inputValues);
    } catch (error) {
      setLabNames({ value: '', name: 'Não foi possível encontrar os laboratórios' })
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

    // data_inicial = new Date(data_inicial);
    // data_final = new Date(data_inicial);

    try {
      const response = (await api.get('reservas', {
        params: {
          userName: responsavel,
          labName: laboratorio,
          data_inicio: data_inicial,
          data_fim: data_final,
          tipo: tipo
        }
      })).data;

      let reservas = [];

      if (response.length > 0) {
        response.forEach(reserva => {
          reservas.push([reserva.responsavel, reserva.lab, reserva.data_inicio, reserva.data_fim, reserva.tipo]);
        });
      } else {
        reservas.push(['Nenhuma reserva encontrada']);
      }

      setReservas(reservas);
    } catch {
      setReservas([['Desculpe, não foi possível realizar a pesquisa. Tente novamente mais tarde.']]);
    }
  };

  return (
    <section className="Reserves PageContent">

      <h1>Reservas no Sistema</h1>

      <p>Filtros de pesquisa:</p>
      <form className="SearchForm" onSubmit={SearchReserves}>
        <Input type={'text'} placeholder={'Responsável'} formatter={nameMask} id={'respSearch'} />
        <Input type={'dropdown'} values={labNames} id={'labSearch'} placeholder={'Laboratório'} />
        <Input type={'date'} placeholder={'Data Inicial'} id={'dataISearch'} />
        <Input type={'date'} placeholder={'Data Final'} id={'dataFSearch'} />
        <Input type={'dropdown'} values={reservesTypes} id={'tipoSearch'} placeholder={'Tipo de Reserva'} />
        <Input type={'submit'} placeholder={searchButtonText} />
      </form>

      <Table header={tableHeader} data={reservas} editable={typeof reservas[0][0] !== 'string' ? true : false} />

    </section>
  );
}