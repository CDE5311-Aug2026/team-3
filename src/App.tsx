import { useState } from 'react'
import {
  ArrowLeft, ArrowRight, Bookmark, Camera, ChevronRight, Clock3, Compass,
  Home, Leaf, MapPin, Mic, Search, ShieldCheck, Sparkles, Sprout,
  Trash2, XCircle
} from 'lucide-react'
import walkingGroup from './assets/walking-group.jpeg'
import journeyAvatar from './assets/journey-avatar.jpeg'
import journeyPhoto from './assets/journey-photo.png'

type Screen = 'home' | 'entry' | 'results' | 'compass' | 'support' | 'journey'

const suggestions = [
  'Something I can try once first',
  'Things I can do with a friend',
  'Ways to use my past work skills',
]

const matches = [
  { icon: <Leaf />, title: 'Community Garden Workshop', badge: 'Strong fit', color: 'green', time: 'Sat · 10:00 AM · weekly', place: 'Riverside Park · 12 min', reason: 'Community · outdoors · beginner-friendly' },
  { icon: <Camera />, title: 'Phone Photography for Beginners', badge: 'Partial fit', color: 'gold', time: 'Tue · 9:30 AM · 6 weeks', place: 'Public Library · 8 min', reason: 'Learning · free most listed yet' },
  { icon: <Bookmark />, title: 'Library Reading Buddy', badge: 'Strong fit', color: 'rose', time: '2 hrs a week · you choose', place: 'Public Library · 8 min', reason: 'Uses your admin skills · try once first' },
]

function StatusBar() {
  return <div className="status"><b>9:41</b><span>▮▮▮ ◔ ▰</span></div>
}

function BottomNav({ notify, go, active = 'search' }: { notify: (message: string) => void; go: (screen: Screen) => void; active?: 'home' | 'search' | 'journey' }) {
  return <nav className="bottom-nav">
    <button className={active === 'home' ? 'active' : ''} onClick={() => go('home')}><Home /><small>Home</small></button><button onClick={() => go('compass')}><Compass /><small>Explore</small></button>
    <button className={active === 'search' ? 'active' : ''} onClick={() => go('entry')}><Search /><small>Search</small></button><button className={active === 'journey' ? 'active' : ''} onClick={() => go('journey')}><Sprout /><small>My Journey</small></button>
  </nav>
}

function SearchHeader({ screen, go }: { screen: Screen; go: (screen: Screen) => void }) {
  const [query, setQuery] = useState(screen === 'results' ? 'What can I do after retiring?' : '')
  return <div className="search-header">
    <button className="round" aria-label="Go back" onClick={() => go('entry')}><ArrowLeft size={21}/></button>
    <label className={'search-field ' + (screen === 'entry' ? 'focused' : '')}>
      <Search size={19}/><input value={query} onKeyDown={e => e.key === 'Enter' && go('results')} onChange={e => setQuery(e.target.value)} placeholder="Search activities, courses…" />
      {screen === 'entry' ? <Camera size={20}/> : <button aria-label="Clear search" onClick={() => setQuery('')}><XCircle size={18}/></button>} 
    </label>
    <button className="search-action" onClick={() => go('results')}>Search</button>
  </div>
}

function Entry({ go, notify }: { go: (screen: Screen) => void; notify: (message: string) => void }) {
  return <main className="page"><StatusBar/><section className="content entry-content"><SearchHeader screen="entry" go={go}/>
    <section><div className="section-head"><h2>Recent searches</h2><button className="icon-button" aria-label="Clear recent searches" onClick={() => notify('Recent searches cleared.')}><Trash2 size={19}/></button></div>
      <div className="chips">{['What can I do after retiring?', 'Tai chi near me', 'Weekend volunteering'].map((item, i) => <button key={item} className="chip" onClick={() => i === 0 && go('results')}><Clock3 size={15}/>{item}</button>)}</div>
    </section>
    <section><h2 className="spark-title"><Sparkles size={18}/>Try asking in your own words</h2>
      <div className="suggestions">{suggestions.map(s => <button key={s} onClick={() => go('results')}><Sparkles size={15}/><span>{s}</span><ChevronRight size={18}/></button>)}</div>
      <p className="personal">Based on your check-in: Learning, Community <button onClick={() => notify('Preferences editing is coming next.')}>Edit</button></p>
    </section>
    <section className="popular"><div className="section-head"><h2>Popular near you this week</h2><span className="verified"><ShieldCheck size={16}/>Verified</span></div>
      <div className="popular-grid">{[['1','Morning Qigong','Riverside Park · free'],['2','Kopi & Chat','Community Centre'],['3','Heritage Walk','Tiong Bahru · Sat'],['4','Phone Photography','Public Library']].map(([no,title,meta]) => <div className="popular-item" key={no}><i>{no}</i><div><b>{title}</b><small>{meta}</small></div></div>)}</div>
    </section>
  </section><button className="ask" onClick={() => go('results')}><span><Mic size={21}/></span><strong>Hold to ask in your own words<small>English · 中文 · Melayu · தமிழ்</small></strong></button><BottomNav notify={notify} go={go}/><div className="home-indicator"/></main>
}

function MatchCard({ match }: { match: typeof matches[number] }) {
  const [saved, setSaved] = useState(false)
  return <article className="match-card"><div className={'placeholder ' + match.color}>{match.icon}</div><div className="match-info"><div className="badges"><em className={match.color}>{match.badge === 'Strong fit' ? '★' : '△'} {match.badge}</em><em>⌾ Verified</em></div><h3>{match.title}</h3><p><Clock3/> {match.time}</p><p><MapPin/> {match.place}</p><a><Sparkles/> {match.reason}</a><div className="card-actions"><button>Why this?</button><button>×&nbsp; Not for me</button><button aria-label="Save" onClick={() => setSaved(!saved)}>{saved ? '★' : <Bookmark size={17}/>}</button></div></div></article>
}

function Results({ go, notify }: { go: (screen: Screen) => void; notify: (message: string) => void }) {
  return <main className="page results"><StatusBar/><section className="content results-content"><SearchHeader screen="results" go={go}/>
    <div className="tabs"><button className="selected" onClick={() => notify('Showing all results.')}>All</button><button onClick={() => notify('Showing activity results.')}>Activities</button><button onClick={() => notify('Showing course results.')}>Courses</button><button className="compass" onClick={() => notify('Compass has refined these matches for you.')}><Sparkles size={14}/>Ask Compass</button></div>
    <section className="summary"><div className="summary-top"><span><Sparkles size={13}/>Compass summary</span><button>ⓘ</button></div><p>Three directions fit what you told us — learning and community, one weekday mornings, near home. Each has real, verified options:</p>
      <ol><li><b>Learn something new</b><small>5 options · e.g. Phone Photography, Tue 9:30 AM</small></li><li><b>Meet people through a shared task</b><small>4 options · e.g. Community Garden, Sat 10 AM</small></li><li className="faded"><b>Share your experience</b></li></ol>
      <button className="full-answer">Read the full answer &amp; ask more <ArrowRight size={16}/></button><div className="sources">🌿 🏛️ 📖 <span>12 verified listings · updated today</span><ChevronRight size={16}/></div>
    </section>
    <div className="matches-head"><div><h1>Top matches</h1><small>3 of 12 results</small></div><button onClick={() => notify('Filters opened — choose time, distance, or interests next.')}>☷&nbsp; Filter</button><button onClick={() => notify('Select saved results to compare them.')}>▢&nbsp; Compare</button></div>
    <div className="match-list">{matches.map(match => <MatchCard key={match.title} match={match}/>)}</div>
    <button className="see-all" onClick={() => notify('All 12 results would open here.')}>See all 12 results</button><p className="human">⌕&nbsp; None of these feel right? <button onClick={() => notify('A support request has been started.')}>Talk to a person</button></p>
  </section><BottomNav notify={notify} go={go}/><div className="home-indicator"/></main>
}

function HomePage({ go, notify }: { go: (screen: Screen) => void; notify: (message: string) => void }) {
  return <main className="page soft-page"><StatusBar/><section className="content home-content"><header className="home-top"><b>NEXT CHAPTER</b><button aria-label="Notifications">♧</button><span>LM</span></header><h1>Good morning, Lin Mei</h1><article className="next-card"><div className="leaf-hero"><Leaf size={44}/></div><small>YOUR NEXT STEP</small><h2>Community Garden<br/>Workshop</h2><p>▣&nbsp; Sat, 19 Sep · 9:30 AM</p><p>⌾&nbsp; Queenstown Community Garden</p><p>♧&nbsp; Verified organiser</p><button onClick={() => go('support')}>View My Plan <ArrowRight size={19}/></button></article><button className="home-row" onClick={() => notify('No plans scheduled for today.')}><span>▣</span><div><b>Today</b><small>No plans yet — you are on track</small></div><ChevronRight/></button><button className="home-row blue-row" onClick={() => go('compass')}><Sparkles/><div><b>Find something new</b><small>Ask Compass what to try this week</small></div><ChevronRight/></button></section><BottomNav notify={notify} go={go} active="home"/><div className="home-indicator"/></main>
}

function CompassPage({ go }: { go: (screen: Screen) => void }) {
  return <main className="page soft-page"><StatusBar/><section className="content compass-page"><header className="chat-head"><button className="round" onClick={() => go('results')}><ArrowLeft/></button><span className="compass-avatar"><Compass/></span><div><h2>Compass</h2><small>AI helper · suggests, you decide</small></div><button>•••</button></header><p className="today">Today · 10:24</p><p className="user-bubble">What can I do after retiring?</p><article className="chat-card"><small>🌿 🏛️ 📖 &nbsp; Searched 12 verified listings near you</small><p>Here are three directions that fit Learning and Community, on weekday mornings near home:</p><ol><li><b>Learn something new</b><span>Phone Photography for Beginners · Tue 9:30 AM · 8 min away.</span><a>See fit ›</a></li><li><b>Meet people through a shared task</b><span>Community Garden Workshop · Sat 10:00 AM · trial session available.</span><a>See fit ›</a></li><li><b>Share your experience</b><span>Library Reading Buddy · 2 hrs a week.</span><a>See fit ›</a></li></ol><p>Not ready to choose? Save any of these and decide later.</p></article><p className="user-bubble">Which ones can I try once, with a friend?</p><article className="chat-card"><p>Two options let you try once and welcome a friend:</p><button className="chat-option" onClick={() => go('support')}><Leaf/><span><b>Community Garden Workshop</b><small>Trial · Sat 10:00 AM · friends welcome</small></span><ChevronRight/></button><button className="chat-option" onClick={() => go('support')}>☄<span><b>Morning Qigong</b><small>Drop-in · free · friends welcome</small></span><ChevronRight/></button><small>ⓘ&nbsp; I couldn't confirm whether friends can join Phone Photography.</small></article><div className="follow-ups"><button>Only weekday mornings</button><button>Free options only</button><button>Compare these two</button></div></section><div className="chat-input"><button><Mic/></button><span>Ask a follow-up or hold to talk…</span><button>＋</button></div><div className="home-indicator"/></main>
}

function SupportPage({ go }: { go: (screen: Screen) => void }) {
  return <main className="page support-page"><StatusBar/><section className="content support-content"><header className="simple-head"><button className="round" onClick={() => go('compass')}><ArrowLeft/></button><h1>Your first step</h1><span>✦</span></header><article className="trial"><img src={walkingGroup} alt="Community walking group"/><div><b>▣&nbsp; Tue 16 Apr · 10 AM</b><small>Community Walking Group</small><u>Edit</u>&nbsp;&nbsp; <u>Change date</u></div></article><h2>Get ready</h2><div className="ready-grid"><div>👟<small>Comfy shoes</small></div><div>💧<small>Water</small></div><div>⚑<small>Main gate</small></div></div><div className="route-map"><span>⌁&nbsp; 10 min · 0.8 km</span><b>Directions</b></div><article className="contact"><b>J</b><div><strong>Jamie</strong><small>Coordinator</small></div><button>⌕</button><button>□</button></article><button className="companion">◎ <b>Go with a companion</b><i/></button><div className="support-actions"><button onClick={() => go('journey')}>Confirm</button><button>Ask for help</button></div></section><div className="home-indicator"/></main>
}

function JourneyPage({ go, notify }: { go: (screen: Screen) => void; notify: (message: string) => void }) {
  return <main className="page journey-page"><StatusBar/><section className="content journey-content"><header className="journey-head"><h1>My Next Chapter</h1><img src={journeyAvatar} alt="Lin Mei"/></header><div className="journey-tabs"><b>Overview</b><span>Calendar</span><span>Goals</span></div><article className="progress-card"><img src={journeyPhoto} alt="Friends"/><div><b>Feeling more confident</b><strong>50%</strong></div><i><em/></i></article><div className="stat-grid">{[['▣','2','Upcoming'],['▯','5','Saved'],['◷','1','Waiting reply'],['♧','3','Support team']].map(item => <div key={item[2]}><span>{item[0]}</span><b>{item[1]}</b><small>{item[2]}</small></div>)}</div><div className="helpful"><b>Was this helpful?</b><span>👍　👎</span></div><button className="update-plan" onClick={() => go('compass')}>✦ &nbsp; Update my plan with Compass</button></section><BottomNav notify={notify} go={go} active="journey"/><div className="home-indicator"/></main>
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('home')
  const [message, setMessage] = useState('')
  const notify = (nextMessage: string) => { setMessage(nextMessage); window.setTimeout(() => setMessage(''), 3200) }
  const page = screen === 'home' ? <HomePage go={setScreen} notify={notify}/> : screen === 'entry' ? <Entry go={setScreen} notify={notify}/> : screen === 'results' ? <Results go={setScreen} notify={notify}/> : screen === 'compass' ? <CompassPage go={setScreen}/> : screen === 'support' ? <SupportPage go={setScreen}/> : <JourneyPage go={setScreen} notify={notify}/>
  return <div className="app-shell"><div className="device">{page}{message && <div className="toast" role="status">{message}</div>}</div></div>
}
