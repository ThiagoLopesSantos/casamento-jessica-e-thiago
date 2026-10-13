import React, { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import * as S from './styles'

const CHAVE_PIX = '15470236781'
const NOME_RECEBEDOR = 'THIAGO LOPES SANTOS'
const CIDADE_RECEBEDOR = 'RIO DE JANEIRO'

const URL_RSVP_VERCEL = 'https://sunshine-events-frontend.vercel.app/convidados/convite.html?evento=3'

function crc16(data: string): string {
  let crc = 0xffff

  for (let i = 0; i < data.length; i++) {
    crc ^= data.charCodeAt(i) << 8

    for (let j = 0; j < 8; j++) {
      crc = (crc & 0x8000) !== 0 ? (crc << 1) ^ 0x1021 : crc << 1
    }
  }

  return (crc & 0xffff).toString(16).toUpperCase().padStart(4, '0')
}

function gerarPayloadPix(
  chave: string,
  valor: string,
  recebedor: string,
  cidade: string
) {
  const valorFormatado = parseFloat(
    valor.replace('R$ ', '').replace(',', '.')
  ).toFixed(2)

  const p_chave = `0014br.gov.bcb.pix01${chave.length
    .toString()
    .padStart(2, '0')}${chave}`

  const payloadBase = [
    '000201',
    '26',
    p_chave.length.toString().padStart(2, '0'),
    p_chave,
    '52040000',
    '5303986',
    '54',
    valorFormatado.length.toString().padStart(2, '0'),
    valorFormatado,
    '5802BR',
    '59',
    recebedor.length.toString().padStart(2, '0'),
    recebedor,
    '60',
    cidade.length.toString().padStart(2, '0'),
    cidade,
    '62070503***',
    '6304'
  ].join('')

  return payloadBase + crc16(payloadBase)
}

const RSVP: React.FC = () => {
  const [valorSelecionado, setValorSelecionado] = useState('R$ 20')
  const [copiado, setCopiado] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)

  const pixPayload =
    valorSelecionado === 'Outro'
      ? CHAVE_PIX
      : gerarPayloadPix(
          CHAVE_PIX,
          valorSelecionado,
          NOME_RECEBEDOR,
          CIDADE_RECEBEDOR
        )

  const copiarChave = () => {
    navigator.clipboard.writeText(pixPayload)
    setCopiado(true)

    setTimeout(() => {
      setCopiado(false)
    }, 2000)
  }

  return (
    <S.RSVPContainer className="reveal" id="rsvp">
      {/* SEÇÃO DE CONFIRMAÇÃO DE PRESENÇA (BOTÃO QUE EXPANDE O SISTEMA NA PÁGINA) */}
      <S.StepBox>
        <S.Title>Presença</S.Title>
        <S.Description>
          Confirme a sua presença no nosso grande dia de forma rápida e prática diretamente por aqui!
        </S.Description>

        <S.SubmitButton onClick={() => setIsExpanded(!isExpanded)}>
          {isExpanded ? '▲ Ocultar Confirmação' : '💌 Confirmar Presença (RSVP)'}
        </S.SubmitButton>

        {/* CONTAINER DO IFRAME COM TRANSIÇÃO SUAVE NA PROPRIA PÁGINA */}
        <div style={{
          width: '100%',
          maxWidth: '800px',
          height: isExpanded ? '650px' : '0px',
          overflow: 'hidden',
          transition: 'height 0.5s ease-in-out, opacity 0.4s ease-in-out',
          opacity: isExpanded ? 1 : 0,
          marginTop: isExpanded ? '20px' : '0px',
          borderRadius: '16px',
          border: isExpanded ? '1px solid rgba(200, 155, 90, 0.3)' : 'none',
          boxShadow: isExpanded ? '0 15px 35px rgba(62, 58, 53, 0.1)' : 'none',
          backgroundColor: '#ffffff'
        }}>
          <iframe 
            src={URL_RSVP_VERCEL} 
            title="Sistema de RSVP Vercel"
            style={{ width: '100%', height: '100%', border: 'none' }}
          />
        </div>
      </S.StepBox>

      {/* SEÇÃO DE AJUDA COM A LUA DE MEL / PIX FIXO */}
      <S.StepBox style={{ marginTop: '2rem' }}>
        <S.Title>Lua de Mel</S.Title>

        <S.Description>
          Obrigado por desejar fazer parte desse momento tão especial 💚
          <br />
          Sua contribuição nos ajudará a construir memórias incríveis na nossa
          primeira viagem como casados.
        </S.Description>

        <p>Escolha um valor:</p>

        <S.ValueGrid>
          {['R$ 20', 'R$ 50', 'R$ 100', 'Outro'].map((v) => (
            <S.ValueCard
              key={v}
              $active={valorSelecionado === v}
              onClick={() => setValorSelecionado(v)}
            >
              {v}
            </S.ValueCard>
          ))}
        </S.ValueGrid>

        <S.QRBox>
          <QRCodeSVG value={pixPayload} size={180} />
        </S.QRBox>

        <S.CopyButton onClick={copiarChave}>
          {copiado ? '✅ Copiado!' : '📋 Copiar Pix'}
        </S.CopyButton>

        {copiado && <p style={{ fontSize: '0.85rem', color: 'green' }}>Chave copiada com sucesso!</p>}
      </S.StepBox>
    </S.RSVPContainer>
  )
}

export default RSVP