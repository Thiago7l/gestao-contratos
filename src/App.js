import React, { useState, useEffect } from 'react';
import { db } from './services/firebase'; 
import { collection, addDoc, query, onSnapshot, orderBy, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import './App.css';

function App() {
  const [abaAtiva, setAbaAtiva] = useState('cadastro'); 
  const [contratos, setContratos] = useState([]);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({
    ano: '2026', secretaria: 'Saúde', fornecedor: '',
    numeroContrato: '', pl: '', dataInicio: '', dataFinal: '',
    tipoAlteracao: 'Reajuste Solicitado', pediuAlteracao: 'Não', pdfLink: ''
  });

  const resetForm = () => {
    setForm({ ano: '2026', secretaria: 'Saúde', fornecedor: '', numeroContrato: '', pl: '', dataInicio: '', dataFinal: '', tipoAlteracao: 'Reajuste Solicitado', pediuAlteracao: 'Não', pdfLink: '' });
    setEditId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if(!form.fornecedor || !form.dataFinal) return alert("Preencha o fornecedor e a data final!");
    try {
      if (editId) {
        await updateDoc(doc(db, "contratos", editId), form);
        alert("Contrato atualizado!");
        setAbaAtiva('lista');
      } else {
        await addDoc(collection(db, "contratos"), form);
        alert("Contrato cadastrado!");
      }
      resetForm();
    } catch (error) { alert("Erro ao processar dados."); }
  };

  useEffect(() => {
    const q = query(collection(db, "contratos"), orderBy("dataFinal", "asc"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const docs = [];
      querySnapshot.forEach((doc) => docs.push({ id: doc.id, ...doc.data() }));
      setContratos(docs);
    });
    return unsubscribe;
  }, []);

  const excluirContrato = async (id) => {
    if(window.confirm("Tem certeza que deseja excluir?")) {
      await deleteDoc(doc(db, "contratos", id));
    }
  };

  const prepararEdicao = (c) => {
    setEditId(c.id);
    setForm({ ...c });
    setAbaAtiva('cadastro');
  };

  const verificarAlerta = (dataFinal) => {
    if (!dataFinal) return false;
    const dias = Math.ceil((new Date(dataFinal + "T12:00:00") - new Date()) / (1000 * 60 * 60 * 24));
    return dias <= 65;
  };

  const totalAlertas = contratos.filter(c => verificarAlerta(c.dataFinal)).length;

  return (
    <div className="App">
      <nav className="menu-navegacao">
        <button className={abaAtiva === 'cadastro' ? 'active' : ''} onClick={() => {setAbaAtiva('cadastro'); resetForm();}}>
          ➕ Novo Cadastro
        </button>
        <button className={abaAtiva === 'lista' ? 'active' : ''} onClick={() => setAbaAtiva('lista')}>
          📋 Gerenciar Contratos ({contratos.length})
        </button>
      </nav>

      <header><h1>GESTÃO DE CONTRATOS</h1></header>

      {abaAtiva === 'cadastro' ? (
        <section className="container-view">
          <form onSubmit={handleSubmit} className="form-moderno">
            <h2>{editId ? "📝 Editando Contrato" : "✨ Novo Registro"}</h2>
            <div className="grid-form">
              <div className="campo"><label>Ano</label><input type="number" value={form.ano} onChange={e => setForm({...form, ano: e.target.value})} /></div>
              <div className="campo">
                <label>Secretaria</label>
                <select value={form.secretaria} onChange={e => setForm({...form, secretaria: e.target.value})}>
                  <option value="Saúde">Saúde</option>
                  <option value="Educação">Educação</option>
                </select>
              </div>
            </div>
            <div className="campo"><label>Fornecedor</label><input type="text" value={form.fornecedor} onChange={e => setForm({...form, fornecedor: e.target.value})} required /></div>
            <div className="grid-form">
              <div className="campo"><label>Contrato</label><input type="text" value={form.numeroContrato} onChange={e => setForm({...form, numeroContrato: e.target.value})} /></div>
              <div className="campo"><label>PL</label><input type="text" value={form.pl} onChange={e => setForm({...form, pl: e.target.value})} /></div>
            </div>
            <div className="grid-form">
              <div className="campo"><label>Início</label><input type="date" value={form.dataInicio} onChange={e => setForm({...form, dataInicio: e.target.value})} /></div>
              <div className="campo"><label>Final</label><input type="date" value={form.dataFinal} onChange={e => setForm({...form, dataFinal: e.target.value})} /></div>
            </div>
            <div className="campo"><label>Link do PDF</label><input type="text" placeholder="Link do Drive" value={form.pdfLink} onChange={e => setForm({...form, pdfLink: e.target.value})} /></div>
            <div className="secao-alerta-laranja">
              <div className="grid-form">
                <div className="campo">
                  <label>Tipo</label>
                  <button type="button" className="btn-toggle-laranja" onClick={() => setForm({...form, tipoAlteracao: form.tipoAlteracao === 'Reajuste Solicitado' ? 'Reequilíbrio Solicitado' : 'Reajuste Solicitado'})}>
                    {form.tipoAlteracao}
                  </button>
                </div>
                <div className="campo">
                  <label>Peticionou?</label>
                  <select value={form.pediuAlteracao} onChange={e => setForm({...form, pediuAlteracao: e.target.value})}>
                    <option value="Não">Não</option><option value="Sim">Sim</option>
                  </select>
                </div>
              </div>
            </div>
            <button type="submit" className="btn-finalizar">{editId ? "Salvar Alterações" : "Cadastrar Contrato"}</button>
          </form>
        </section>
      ) : (
        <section className="container-view">
          <div className="lista-gerenciamento">
            {contratos.map(c => (
              <div key={c.id} className={`card-gerencia ${verificarAlerta(c.dataFinal) ? 'alerta' : ''}`}>
                <div className="card-info">
                  <span className="badge-secretaria">{c.secretaria}</span>
                  <h3>{c.fornecedor}</h3>
                  <p>Contrato: {c.numeroContrato} | PL: {c.pl}</p>
                  <p>Vencimento: {new Date(c.dataFinal + "T12:00:00").toLocaleDateString('pt-BR')}</p>
                  <div className="status-container">
                    <span className="tag-laranja">{c.tipoAlteracao}</span>
                    <span className="tag-pediu">Pedido: {c.pediuAlteracao}</span>
                  </div>
                  {verificarAlerta(c.dataFinal) && <div className="aviso-urgente">⚠️ ALERTA 65 DIAS</div>}
                </div>
                <div className="card-acoes">
                  {c.pdfLink && <a href={c.pdfLink} target="_blank" rel="noreferrer">📄</a>}
                  <button onClick={() => prepararEdicao(c)}>✏️</button>
                  <button onClick={() => excluirContrato(c.id)} className="btn-excluir">🗑️</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {totalAlertas > 0 && (
        <div className="barra-alerta-fixa">
          <div className="conteudo-alerta">
            <span>⚠️ Atenção: <strong>{totalAlertas}</strong> contrato(s) vencendo em menos de 65 dias!</span>
            <button onClick={() => setAbaAtiva('lista')}>Verificar</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;