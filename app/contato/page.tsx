'use client';

import React, { useState } from 'react';
import { Phone, Mail, MapPin, Clock, Send, MessageCircle, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !whatsapp || !message) {
      toast.error('Preencha os campos obrigatórios.');
      return;
    }

    const text = `*CONTATO PELO SITE — TENÓRIO CONFECÇÕES*\n• Nome: ${name}\n• WhatsApp: ${whatsapp}\n• Assunto: ${subject || 'Dúvida Geral'}\n• Mensagem: ${message}`;
    window.open(`https://wa.me/5581999999999?text=${encodeURIComponent(text)}`, '_blank');
    toast.success('Mensagem encaminhada para o WhatsApp!');
  };

  return (
    <div className="py-12 bg-slate-950 text-white min-h-screen space-y-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-blue-400 bg-blue-400/10 border border-blue-400/20 px-3.5 py-1 rounded-full">
            CANAL DE ATENDIMENTO
          </span>
          <h1 className="text-3xl sm:text-5xl font-serif font-extrabold text-white tracking-tight">
            Fale com a Tenório Confecções
          </h1>
          <p className="text-slate-300 text-base">
            Estamos prontos para atender você, tirar dúvidas e auxiliar na escolha do seu produto personalizado.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Contact Cards */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6 shadow-xl">
              <h3 className="text-xl font-bold text-white border-b border-slate-800 pb-4">
                Informações de Contato
              </h3>

              <div className="space-y-4 text-sm text-slate-300">
                <a
                  href="https://wa.me/5581999999999"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 bg-slate-950 p-4 rounded-2xl border border-slate-800 hover:border-emerald-500/50 transition-all group"
                >
                  <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl group-hover:scale-110 transition-transform">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 block">WhatsApp Comercial</span>
                    <span className="font-bold text-white group-hover:text-emerald-400 transition-colors">
                      (81) 99999-9999
                    </span>
                  </div>
                </a>

                <a
                  href="mailto:contato@tenorioconfeccoes.com.br"
                  className="flex items-center gap-4 bg-slate-950 p-4 rounded-2xl border border-slate-800 hover:border-blue-500/50 transition-all group"
                >
                  <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl group-hover:scale-110 transition-transform">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 block">E-mail Direto</span>
                    <span className="font-bold text-white group-hover:text-blue-400 transition-colors">
                      contato@tenorioconfeccoes.com.br
                    </span>
                  </div>
                </a>

                <div className="flex items-center gap-4 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                  <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 block">Localização</span>
                    <span className="font-bold text-white">Caruaru - PE | Atendimento Nacional</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                  <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 block">Horário de Funcionamento</span>
                    <span className="font-bold text-white">Segunda a Sexta: 08h às 18h</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6 shadow-xl">
            <h3 className="text-xl font-bold text-white border-b border-slate-800 pb-4">
              Envie uma Mensagem
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold block">Nome Completo *</label>
                  <input
                    type="text"
                    required
                    placeholder="Seu nome"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:border-blue-400 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-bold block">WhatsApp *</label>
                  <input
                    type="text"
                    required
                    placeholder="(81) 99999-9999"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:border-blue-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold block">E-mail</label>
                  <input
                    type="email"
                    placeholder="seuemail@exemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:border-blue-400 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-bold block">Assunto</label>
                  <input
                    type="text"
                    placeholder="Ex: Dúvida sobre tecido, Orçamento..."
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:border-blue-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-bold block">Mensagem *</label>
                <textarea
                  required
                  placeholder="Escreva sua dúvida ou mensagem..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white placeholder-slate-500 focus:border-blue-400 focus:outline-none h-32 resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-400 text-slate-950 font-extrabold py-4 rounded-xl shadow-lg transition-all text-sm"
              >
                <MessageCircle className="w-5 h-5" />
                <span>ENVIAR MENSAGEM VIA WHATSAPP</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
