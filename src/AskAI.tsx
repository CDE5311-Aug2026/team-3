import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, AudioLines, BadgeCheck, Building2, Camera, ChevronRight, Ellipsis, Info, Leaf, PersonStanding, Plus, Search, Send } from 'lucide-react'

type OpenScreen = 'match' | 'opportunities'
type AskOption = { title: string; meta: string; icon: 'leaf' | 'move'; screen: OpenScreen }
type AskDirection = { n: string; title: string; detail: string; screen: OpenScreen }
type AskTurn = {
  id: string
  from: 'user' | 'ai'
  text?: string
  search?: string
  lead?: string
  directions?: AskDirection[]
  closing?: string
  cardLead?: string
  options?: AskOption[]
  note?: string
}

const seed: AskTurn[] = [
  { id: 'u1', from: 'user', text: 'What can I do after retiring?' },
  {
    id: 'a1',
    from: 'ai',
    search: 'Searched 12 verified listings near you',
    lead: 'Here are three directions that fit Learning and Community, on weekday mornings near home:',
    directions: [
      { n: '01', title: 'Learn something new', detail: 'Phone Photography for Beginners · Tue 9:30 AM · 8 min away. Fee not listed yet.', screen: 'opportunities' },
      { n: '02', title: 'Meet people through a shared task', detail: 'Community Garden Workshop · Sat 10:00 AM · 12 min. Small group, trial session available.', screen: 'match' },
      { n: '03', title: 'Share your experience', detail: 'Library Reading Buddy · 2 hrs a week. You can try one session first.', screen: 'opportunities' },
    ],
    closing: 'Not ready to choose? Save any of these and decide later.',
  },
  { id: 'u2', from: 'user', text: 'Which ones can I try once, with a friend?' },
  {
    id: 'a2',
    from: 'ai',
    cardLead: 'Two options let you try once and welcome a friend:',
    options: [
      { title: 'Community Garden Workshop', meta: 'Trial · Sat 10:00 AM · friends welcome', icon: 'leaf', screen: 'match' },
      { title: 'Morning Qigong', meta: 'Drop-in · free · friends welcome', icon: 'move', screen: 'opportunities' },
    ],
    note: "I couldn't confirm whether friends can join Phone Photography. The organiser can tell you.",
  },
]

const suggestions = ['Only weekday mornings', 'Free options only', 'Compare these two']

let turnCount = 0
const nextId = () => `t${Date.now().toString(36)}${turnCount++}`

function replyTo(text: string): AskTurn {
  const q = text.toLowerCase()
  if (q.includes('compare')) {
    return {
      id: nextId(),
      from: 'ai',
      lead: 'Community Garden Workshop is a Saturday trial, about 12 minutes away, and a friend can come. Morning Qigong is a free weekday drop-in, and a friend is welcome there too.',
      closing: 'Choose the garden if you want one try with company. Choose Qigong if weekday mornings matter more.',
    }
  }
  if (q.includes('free')) {
    return {
      id: nextId(),
      from: 'ai',
      cardLead: 'These two do not list a fee:',
      options: [
        { title: 'Morning Qigong', meta: 'Drop-in · free · friends welcome', icon: 'move', screen: 'opportunities' },
        { title: 'Library Reading Buddy', meta: 'Free · 2 hrs a week · try one session', icon: 'leaf', screen: 'opportunities' },
      ],
      note: 'Phone Photography has not listed a fee yet. The organiser can confirm it.',
    }
  }
  if (q.includes('weekday') || q.includes('morning')) {
    return {
      id: nextId(),
      from: 'ai',
      cardLead: 'These stay on weekday mornings, close to home:',
      options: [
        { title: 'Phone Photography for Beginners', meta: 'Tue 9:30 AM · 8 min away', icon: 'leaf', screen: 'opportunities' },
        { title: 'Morning Qigong', meta: 'Weekday drop-in · free', icon: 'move', screen: 'opportunities' },
      ],
      note: 'Community Garden Workshop is on Saturday, so I left it out.',
    }
  }
  if (q.includes('friend')) {
    return { ...seed[3], id: nextId() }
  }
  if (q.includes('photo') || q.includes('picture') || q.includes('image')) {
    return {
      id: nextId(),
      from: 'ai',
      lead: 'I have not shared that photo with anyone. A Next Chapter guide can look at it with you if you ask.',
      closing: 'Compass will not sign you up from a photo.',
    }
  }
  return {
    id: nextId(),
    from: 'ai',
    lead: 'I can keep this to verified activities near Queenstown. Tell me the time of day, whether a friend is coming, or if it should be free.',
    closing: 'You can also talk with a Next Chapter guide before you decide.',
  }
}

type SpeechEvent = { results: { length: number; [index: number]: { 0: { transcript: string } } } }
type SpeechRecognizer = {
  lang: string
  continuous: boolean
  interimResults: boolean
  onresult: ((event: SpeechEvent) => void) | null
  onerror: ((event: { error: string }) => void) | null
  onend: (() => void) | null
  start: () => void
  stop: () => void
  abort: () => void
}

function createRecognizer() {
  const speechWindow = window as Window & {
    SpeechRecognition?: new () => SpeechRecognizer
    webkitSpeechRecognition?: new () => SpeechRecognizer
  }
  const Ctor = speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition
  if (!Ctor) return null
  const recognizer = new Ctor()
  recognizer.lang = 'en-US'
  recognizer.continuous = true
  recognizer.interimResults = true
  return recognizer
}

export default function AskAI({ back, open, notify }: { back: () => void; open: (screen: OpenScreen) => void; notify: (message: string) => void }) {
  const [turns, setTurns] = useState<AskTurn[]>(seed)
  const [draft, setDraft] = useState('')
  const [listening, setListening] = useState(false)
  const [tapMode, setTapMode] = useState(false)
  const [menu, setMenu] = useState(false)
  const [plusOpen, setPlusOpen] = useState(false)
  const threadRef = useRef<HTMLDivElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const recRef = useRef<SpeechRecognizer | null>(null)
  const listeningRef = useRef(false)
  const shouldSend = useRef(false)
  const ignoreUp = useRef(false)
  const startedAt = useRef(0)
  const transcriptRef = useRef('')
  const draftRef = useRef('')
  const draftBackup = useRef('')
  const skipScroll = useRef(true)
  draftRef.current = draft

  const sendText = (text: string) => {
    const trimmed = text.trim()
    if (!trimmed) return
    setDraft('')
    setMenu(false)
    setPlusOpen(false)
    setTurns(prev => [...prev, { id: nextId(), from: 'user', text: trimmed }, replyTo(trimmed)])
  }

  useEffect(() => {
    if (skipScroll.current) {
      skipScroll.current = false
      return
    }
    const thread = threadRef.current
    if (thread) thread.scrollTop = thread.scrollHeight
  }, [turns])

  useEffect(() => () => {
    shouldSend.current = false
    recRef.current?.abort()
  }, [])

  const finishVoice = () => {
    shouldSend.current = true
    listeningRef.current = false
    setListening(false)
    setTapMode(false)
    const recognizer = recRef.current
    recRef.current = null
    try { recognizer?.stop() } catch { /* already stopped */ }
  }

  const beginVoice = () => {
    const recognizer = createRecognizer()
    if (!recognizer) {
      notify('Voice input is not available in this browser. You can type instead.')
      return false
    }
    draftBackup.current = draftRef.current
    transcriptRef.current = ''
    shouldSend.current = false
    recognizer.onresult = event => {
      let said = ''
      for (let i = 0; i < event.results.length; i++) said += event.results[i][0].transcript
      transcriptRef.current = said.trim()
      setDraft(transcriptRef.current)
    }
    recognizer.onerror = event => {
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        shouldSend.current = false
        notify('Allow the microphone to speak your question.')
      } else if (event.error !== 'aborted' && event.error !== 'no-speech') {
        notify('Voice input stopped. You can type instead.')
      }
    }
    recognizer.onend = () => {
      listeningRef.current = false
      setListening(false)
      setTapMode(false)
      if (!shouldSend.current) return
      shouldSend.current = false
      const said = transcriptRef.current.trim()
      transcriptRef.current = ''
      if (said) sendText(said)
      else setDraft(draftBackup.current)
    }
    try {
      recognizer.start()
    } catch {
      notify('Voice input could not start. You can type instead.')
      return false
    }
    recRef.current = recognizer
    listeningRef.current = true
    setListening(true)
    return true
  }

  const onMicDown = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (event.button !== 0) return
    event.preventDefault()
    try { event.currentTarget.setPointerCapture(event.pointerId) } catch { /* pointer is no longer active */ }
    if (listeningRef.current) {
      ignoreUp.current = true
      finishVoice()
      return
    }
    ignoreUp.current = false
    startedAt.current = Date.now()
    if (beginVoice()) setTapMode(false)
  }

  const onMicUp = () => {
    if (ignoreUp.current) {
      ignoreUp.current = false
      return
    }
    if (!listeningRef.current) return
    if (Date.now() - startedAt.current >= 350) finishVoice()
    else setTapMode(true)
  }

  return <section className="ask-screen">
    <header className="ask-header">
      <button className="icon-button ask-back" onClick={back} aria-label="Back"><ArrowLeft size={18}/></button>
      <span className="ask-mark" aria-hidden><AudioLines size={15}/></span>
      <h2>Ask AI Everything</h2>
      <button className="icon-button ask-back" aria-label="Conversation options" aria-expanded={menu} onClick={() => { setMenu(openMenu => !openMenu); setPlusOpen(false) }}><Ellipsis size={18}/></button>
      {menu && <div className="ask-menu"><button onClick={() => { setTurns(seed); setMenu(false); setDraft('') }}>Start again</button></div>}
    </header>
    <div className="ask-thread" ref={threadRef}>
      <p className="ask-day">Today · 10:24</p>
      {turns.map(turn => <AskBubble key={turn.id} turn={turn} open={open}/>)}
      <div className="ask-chips">
        {suggestions.map(label => <button key={label} onClick={() => sendText(label)}>{label}</button>)}
      </div>
      <p className="ask-human">
        <Search size={14}/>
        <span>Prefer a person?</span>
        <button onClick={() => notify('A Next Chapter guide will be in touch')}>Talk to a Next Chapter guide</button>
      </p>
    </div>
    <div className="ask-dock">
      {plusOpen && <div className="ask-pop">
        {suggestions.map(label => <button key={label} onClick={() => sendText(label)}>{label}</button>)}
      </div>}
      <form className="ask-composer" onSubmit={event => { event.preventDefault(); if (listeningRef.current) finishVoice(); else sendText(draft) }}>
        <button
          type="button"
          className={`ask-mic${listening ? ' listening' : ''}`}
          aria-label={listening ? 'Stop and send voice input' : 'Hold to speak'}
          aria-pressed={listening}
          onPointerDown={onMicDown}
          onPointerUp={onMicUp}
          onPointerCancel={onMicUp}
          onContextMenu={event => event.preventDefault()}
        ><AudioLines size={18}/></button>
        <input
          value={draft}
          onChange={event => { if (!listening) setDraft(event.target.value) }}
          placeholder={listening ? (tapMode ? 'Listening… tap the mic to send' : 'Listening… release to send') : 'Ask a follow-up or hold to...'}
          aria-label="Ask a follow-up"
          enterKeyHint="send"
          readOnly={listening}
        />
        <button type="button" className="ask-tool" aria-label="Add a photo" onClick={() => fileRef.current?.click()}><Camera size={18}/></button>
        {draft.trim() && !listening
          ? <button type="submit" className="ask-tool ask-send" aria-label="Send"><Send size={18}/></button>
          : <button type="button" className="ask-tool" aria-label="More ways to ask" aria-expanded={plusOpen} onClick={() => { setPlusOpen(openPlus => !openPlus); setMenu(false) }}><Plus size={18}/></button>}
      </form>
      <p className="ask-disclaimer">Compass won't sign you up or share your details without asking.</p>
      <input ref={fileRef} className="ask-file" type="file" accept="image/*" onChange={event => {
        const file = event.target.files?.[0]
        event.target.value = ''
        if (file) sendText('Shared a photo')
      }}/>
    </div>
    <p className="ask-live" role="status">{listening ? 'Listening' : ''}</p>
  </section>
}

function AskBubble({ turn, open }: { turn: AskTurn; open: (screen: OpenScreen) => void }) {
  if (turn.from === 'user') return <p className="ask-user">{turn.text}</p>
  return <div className="ask-ai">
    {turn.search && <button className="ask-search" onClick={() => open('opportunities')}>
      <span><Building2 size={13}/><Leaf size={13}/><BadgeCheck size={13}/></span>
      {turn.search}
      <ChevronRight size={15}/>
    </button>}
    {turn.lead && <p className="ask-lead">{turn.lead}</p>}
    {turn.directions && <div className="ask-directions">
      {turn.directions.map(item => <article key={item.n}>
        <b>{item.n}</b>
        <h3>{item.title}</h3>
        <p>{item.detail}</p>
        <button onClick={() => open(item.screen)}>See fit <ChevronRight size={14}/></button>
      </article>)}
    </div>}
    {turn.closing && <p className="ask-closing">{turn.closing}</p>}
    {(turn.cardLead || turn.options || turn.note) && <div className="ask-card">
      {turn.cardLead && <p>{turn.cardLead}</p>}
      {turn.options?.map(option => <button key={option.title} className="ask-option" onClick={() => open(option.screen)}>
        <span className={option.icon}>{option.icon === 'leaf' ? <Leaf size={16}/> : <PersonStanding size={16}/>}</span>
        <span><b>{option.title}</b><small>{option.meta}</small></span>
        <ChevronRight size={16}/>
      </button>)}
      {turn.note && <p className="ask-note"><Info size={14}/>{turn.note}</p>}
    </div>}
  </div>
}
