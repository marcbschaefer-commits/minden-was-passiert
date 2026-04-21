import { useState, useRef, useEffect } from "react";

/* ── PALETTE ─────────────────────────────────────────────────────────────── */
const C = {
  sky:      "#1877F2",
  gold:     "#D4A843",
  white:    "#FFFFFF",
  offwhite: "#F5F5F0",
  stone:    "#E8E4DC",
  slate:    "#4A4A4A",
  dark:     "#1A1A1A",
  charcoal: "#2D2D2D",
  muted:    "#888880",
  divider:  "#DDDDD8",
  tag_bg:   "#F0EDE6",
};
const FD = "'Oswald', sans-serif";
const FB = "'Source Serif 4', serif";
const FU = "'DM Sans', sans-serif";

/* ── DATA ────────────────────────────────────────────────────────────────── */
const CAT_COLORS = {
  Verkehr:"#E67E22", Kultur:"#8E44AD", Blaulicht:"#E74C3C",
  Markt:"#27AE60", Sport:"#2980B9", Soziales:"#16A085",
};

const NEWS = [
  { id:1, cat:"Verkehr",   title:"Neue Ampelanlage Königswall – Sperrung ab Montag",   body:"Die Kreuzung am Königswall wird ab dem 28. April vollgesperrt. Umleitungen sind ausgeschildert.",              time:"Heute, 09:14", hot:true  },
  { id:2, cat:"Kultur",    title:"Mindener Dom öffnet Turmbesteigung wieder",           body:"Nach der Winterpause ist der Dom-Turm ab diesem Wochenende täglich von 10–17 Uhr zugänglich.",                time:"Heute, 08:30", hot:false },
  { id:3, cat:"Blaulicht", title:"Feuerwehreinsatz in der Bäckerstraße – keine Verletzten", body:"Ein Küchenbrand konnte gestern Abend schnell unter Kontrolle gebracht werden.",                         time:"Gestern, 22:05", hot:true  },
  { id:4, cat:"Markt",     title:"Wochenmarkt: Vier neue Händler ab Mai",               body:"Frische regionale Produkte, ein Imker und ein Kräuterstand bereichern ab Mai den Marktplatz.",              time:"Gestern, 11:00", hot:false },
  { id:5, cat:"Sport",     title:"Minden Cowboys holen Regionaltitel!",                 body:"American-Football-Team siegt 34:21 gegen Paderborn – Stadtfeier ist geplant.",                                time:"19. Apr.",       hot:true  },
  { id:6, cat:"Soziales",  title:"Tafel Minden sucht dringend Ehrenamtliche",           body:"Jeden Dienstag und Freitag werden helfende Hände benötigt. Anmeldung unter minden-tafel.de.",             time:"18. Apr.",       hot:false },
];

const EVENTS = [
  { id:1, day:"24", mon:"APR", title:"Frühjahrsfest am Weserufer",   desc:"Live-Musik, Foodtrucks & Familienunterhaltung",  loc:"Weserufer Minden",     icon:"🎉" },
  { id:2, day:"26", mon:"APR", title:"Großer Flohmarkt Innenstadt",  desc:"80+ Stände – Vintage, Bücher, Haushaltswaren",   loc:"Marktplatz Minden",    icon:"🛍️" },
  { id:3, day:"01", mon:"MAI", title:"Maifest Porta Westfalica",     desc:"Traditionelles Volksfest an der Weserenge",      loc:"Porta Westfalica",     icon:"🌷" },
  { id:4, day:"02", mon:"MAI", title:"Mindener Stadtlauf 2025",      desc:"5 km · 10 km · Halbmarathon – jetzt anmelden!", loc:"Dom zu Minden",        icon:"🏃" },
  { id:5, day:"10", mon:"MAI", title:"Jazz am Kanal",                desc:"3 Bands · Foodtrucks · Sonnenuntergang am Wasser", loc:"Kanalpromenade",    icon:"🎷" },
  { id:6, day:"17", mon:"MAI", title:"Gartenmarkt Schlossgärten",    desc:"Regionaler Pflanzenmarkt mit Workshops",         loc:"Schlossgärten Minden", icon:"🌱" },
];

const INIT_CHAT = [
  { id:1, name:"Monika L.", color:"#7B5EA7", text:"Hat jemand mitbekommen warum die Bäckerstraße gesperrt ist? 🚧", ts:"09:02", me:false },
  { id:2, name:"Jürgen H.", color:"#2A7D4F", text:"Ja, Feuerwehreinsatz gestern Nacht – steht auch in den Neuigkeiten!",        ts:"09:08", me:false },
  { id:3, name:"Petra W.",  color:"#C0714F", text:"Danke fürs Teilen! Diese Seite ist echt praktisch 👍",                         ts:"09:15", me:false },
  { id:4, name:"Marc S.",   color:"#1877F2", text:"Willkommen bei WAS PASSIERT in Minden! 😊 Bitte die Community-Regeln beachten.", ts:"09:20", me:false },
];

const now = () => new Date().toLocaleTimeString("de-DE",{hour:"2-digit",minute:"2-digit"});

/* ── SMALL COMPONENTS ────────────────────────────────────────────────────── */
function Avatar({ name, color, size=34 }) {
  return (
    <div style={{
      width:size, height:size, borderRadius:"50%", background:color, color:"#fff",
      display:"flex", alignItems:"center", justifyContent:"center",
      fontWeight:700, fontSize:size*.36, flexShrink:0, fontFamily:FU,
      boxShadow:"0 1px 4px rgba(0,0,0,.2)",
    }}>{name[0]}</div>
  );
}

function Tag({ label, color }) {
  return (
    <span style={{
      display:"inline-block", fontSize:".63rem", fontWeight:700,
      letterSpacing:".06em", textTransform:"uppercase",
      padding:"2px 8px", borderRadius:4,
      background: color ? color+"22" : C.tag_bg,
      color: color || C.slate,
      fontFamily:FU, border:`1px solid ${color ? color+"44" : C.divider}`,
    }}>{label}</span>
  );
}

function SectionHeader({ title, action, onAction }) {
  return (
    <div style={{ display:"flex", alignItems:"baseline", justifyContent:"space-between", marginBottom:".9rem" }}>
      <h2 style={{ fontFamily:FD, fontSize:"1rem", letterSpacing:".07em", textTransform:"uppercase", color:C.dark, margin:0 }}>{title}</h2>
      {action && (
        <button onClick={onAction} style={{ fontFamily:FU, fontSize:".75rem", color:C.sky, background:"none", border:"none", cursor:"pointer", fontWeight:600 }}>
          {action}
        </button>
      )}
    </div>
  );
}

/* ── NEWS CARD ───────────────────────────────────────────────────────────── */
function NewsCard({ item, mini=false }) {
  const [hov, setHov] = useState(false);
  const cc = CAT_COLORS[item.cat] || C.slate;
  return (
    <div
      onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{
        background: hov ? C.white : C.offwhite,
        border:`1px solid ${C.divider}`, borderLeft:`3px solid ${cc}`,
        borderRadius:5, padding: mini ? ".7rem .9rem" : "1rem 1.2rem",
        marginBottom:".6rem", cursor:"pointer",
        transition:"all .15s",
        transform: hov ? "translateX(3px)" : "none",
        boxShadow: hov ? "0 2px 12px rgba(0,0,0,.07)" : "none",
      }}>
      <div style={{ fontFamily:FB, fontWeight:600, fontSize: mini ? ".87rem" : ".95rem", color:C.dark, lineHeight:1.35 }}>{item.title}</div>
      {!mini && <div style={{ fontFamily:FU, fontSize:".8rem", color:C.slate, marginTop:5, lineHeight:1.5 }}>{item.body}</div>}
      <div style={{ marginTop:6, display:"flex", gap:".5rem", alignItems:"center", flexWrap:"wrap" }}>
        <Tag label={item.cat} color={cc} />
        <span style={{ fontFamily:FU, fontSize:".68rem", color:C.muted }}>{item.time}</span>
        {item.hot && <span style={{ fontFamily:FU, fontSize:".65rem", fontWeight:700, color:"#E74C3C" }}>🔥 AKTUELL</span>}
      </div>
    </div>
  );
}

/* ── EVENT CARD ──────────────────────────────────────────────────────────── */
function EventCard({ item, mini=false }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{
        display:"flex", gap:".9rem", alignItems:"flex-start",
        background: hov ? C.white : C.offwhite,
        border:`1px solid ${C.divider}`, borderRadius:5,
        padding: mini ? ".7rem .9rem" : "1rem 1.2rem",
        marginBottom:".6rem", cursor:"pointer", transition:"all .15s",
        boxShadow: hov ? "0 2px 12px rgba(0,0,0,.07)" : "none",
      }}>
      <div style={{ flexShrink:0, width:46, textAlign:"center", background:C.dark, borderRadius:4, padding:"5px 2px" }}>
        <div style={{ fontFamily:FD, fontSize:"1.3rem", fontWeight:700, color:C.gold, lineHeight:1 }}>{item.day}</div>
        <div style={{ fontFamily:FU, fontSize:".58rem", textTransform:"uppercase", letterSpacing:".08em", color:"rgba(255,255,255,.6)", fontWeight:600 }}>{item.mon}</div>
      </div>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontFamily:FB, fontWeight:600, fontSize: mini ? ".87rem" : ".95rem", color:C.dark }}>{item.icon} {item.title}</div>
        {!mini && <div style={{ fontFamily:FU, fontSize:".78rem", color:C.slate, marginTop:3 }}>{item.desc}</div>}
        <div style={{ fontFamily:FU, fontSize:".73rem", color:"#2A7D4F", marginTop:4, fontWeight:600 }}>📍 {item.loc}</div>
      </div>
    </div>
  );
}

/* ── NAV ─────────────────────────────────────────────────────────────────── */
function NavBar({ tab, setTab }) {
  const tabs = ["Home","News","Events","Chat","KI"];
  return (
    <nav style={{
      position:"sticky", top:0, zIndex:200,
      background:C.dark, borderBottom:`3px solid ${C.gold}`,
      display:"flex", alignItems:"center",
      fontFamily:FU, overflowX:"auto",
    }}>
      <div style={{
        padding:"0 1.2rem", borderRight:`1px solid rgba(255,255,255,.1)`,
        display:"flex", alignItems:"center", gap:8, height:52, flexShrink:0,
      }}>
        <div style={{
          width:28, height:28, borderRadius:3, background:C.gold, color:C.dark,
          display:"flex", alignItems:"center", justifyContent:"center",
          fontFamily:FD, fontWeight:700, fontSize:15,
        }}>W</div>
        <span style={{ fontFamily:FD, fontSize:".88rem", color:C.white, letterSpacing:".06em", textTransform:"uppercase", whiteSpace:"nowrap" }}>
          Minden &amp; Umgebung
        </span>
      </div>
      <div style={{ display:"flex", flex:1 }}>
        {tabs.map(t=>(
          <button key={t} onClick={()=>setTab(t)} style={{
            padding:"0 1rem", height:52, border:"none", cursor:"pointer",
            fontFamily:FU, fontWeight:600, fontSize:".8rem",
            letterSpacing:".05em", textTransform:"uppercase",
            background: tab===t ? C.gold : "transparent",
            color: tab===t ? C.dark : "rgba(255,255,255,.6)",
            transition:"all .2s", whiteSpace:"nowrap",
          }}>{t==="KI" ? "🤖 KI-Assistent" : t}</button>
        ))}
      </div>
      <a href="https://www.facebook.com/groups/was.passiert.in.minden.und.umgebung" target="_blank" rel="noreferrer"
        style={{
          padding:"0 1rem", height:52, display:"flex", alignItems:"center",
          color:"rgba(255,255,255,.5)", fontSize:".73rem", fontFamily:FU,
          textDecoration:"none", flexShrink:0, gap:5,
          borderLeft:"1px solid rgba(255,255,255,.1)", whiteSpace:"nowrap",
        }}>
        📘 Facebook
      </a>
    </nav>
  );
}

/* ── HERO BANNER ─────────────────────────────────────────────────────────── */
function HeroBanner({ setTab }) {
  return (
    <div style={{ position:"relative", overflow:"hidden" }}>
      <div style={{
        background:"linear-gradient(160deg, #1a2a4a 0%, #2c4a7a 35%, #3d6b8a 60%, #8aacbf 85%, #c5d8e0 100%)",
        minHeight:260, position:"relative",
        display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
        padding:"2.5rem 2rem 2rem",
      }}>
        <div style={{ position:"absolute", bottom:0, left:0, right:0, height:80, background:"linear-gradient(to top, rgba(30,45,70,.55), transparent)" }}/>
        <div style={{ position:"absolute", inset:0, opacity:.04,
          backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
        }}/>
        <div style={{ position:"relative", textAlign:"center" }}>
          <div style={{ fontFamily:FU, fontSize:".7rem", letterSpacing:".18em", textTransform:"uppercase", color:"rgba(255,255,255,.6)", marginBottom:"1rem" }}>
            • NEWS • EVENTS & DISKUSSIONEN •
          </div>
          <h1 style={{ margin:0, lineHeight:1, color:C.white }}>
            <span style={{ display:"block", fontFamily:FD, fontSize:"clamp(2rem,5vw,3.2rem)", fontWeight:700, letterSpacing:".04em", textTransform:"uppercase", textShadow:"0 2px 16px rgba(0,0,0,.4)" }}>
              WAS PASSIERT
            </span>
            <span style={{ display:"block", fontFamily:"'Playfair Display', serif", fontSize:"clamp(1.3rem,3.5vw,2rem)", fontStyle:"italic", color:C.gold, textShadow:"0 2px 12px rgba(0,0,0,.3)", marginTop:4 }}>
              in Minden &amp; Umgebung
            </span>
          </h1>
          <div style={{ marginTop:"1.4rem", display:"flex", gap:"1.8rem", justifyContent:"center", flexWrap:"wrap" }}>
            {[["16.494","Mitglieder"],["38","Events im April"],["🌍","Öffentliche Gruppe"]].map(([v,l])=>(
              <div key={l} style={{ textAlign:"center" }}>
                <div style={{ fontFamily:FD, fontSize:"1.3rem", color:C.white, letterSpacing:".03em" }}>{v}</div>
                <div style={{ fontFamily:FU, fontSize:".65rem", color:"rgba(255,255,255,.6)", letterSpacing:".06em", textTransform:"uppercase" }}>{l}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop:"1.4rem", display:"flex", gap:".7rem", justifyContent:"center", flexWrap:"wrap" }}>
            {[["💬 Zum Chat","Chat"],["📅 Events","Events"],["🤖 KI-Assistent","KI"]].map(([label,t])=>(
              <button key={t} onClick={()=>setTab(t)} style={{
                padding:"9px 20px", borderRadius:4, border: t==="Chat" ? "none" : "1px solid rgba(255,255,255,.25)",
                fontFamily:FU, fontWeight:600, fontSize:".82rem", cursor:"pointer", letterSpacing:".04em",
                background: t==="Chat" ? C.gold : "rgba(255,255,255,.12)",
                color: t==="Chat" ? C.dark : C.white,
                backdropFilter:"blur(8px)", transition:"all .2s",
              }}>{label}</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── HOME TAB ────────────────────────────────────────────────────────────── */
function HomeTab({ setTab }) {
  return (
    <div>
      <HeroBanner setTab={setTab} />
      {/* Breaking ticker */}
      <div style={{ background:C.charcoal, color:C.white, padding:"8px 1.5rem", display:"flex", gap:"1.5rem", alignItems:"center", overflowX:"auto", fontFamily:FU, fontSize:".78rem" }}>
        <span style={{ color:C.gold, fontWeight:700, letterSpacing:".08em", flexShrink:0 }}>⚡ AKTUELL</span>
        {NEWS.filter(n=>n.hot).map(n=>(
          <span key={n.id} style={{ whiteSpace:"nowrap", color:"rgba(255,255,255,.75)", borderLeft:"1px solid rgba(255,255,255,.15)", paddingLeft:"1.5rem" }}>{n.title}</span>
        ))}
      </div>
      {/* Two-col grid */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(300px, 1fr))", gap:"1.5rem", maxWidth:1100, margin:"0 auto", padding:"1.8rem 1.2rem" }}>
        <div>
          <SectionHeader title="📰 Neuigkeiten" action="Alle News →" onAction={()=>setTab("News")} />
          {NEWS.slice(0,4).map(n=><NewsCard key={n.id} item={n} mini />)}
        </div>
        <div>
          <SectionHeader title="📅 Nächste Events" action="Alle Events →" onAction={()=>setTab("Events")} />
          {EVENTS.slice(0,4).map(ev=><EventCard key={ev.id} item={ev} mini />)}
        </div>
      </div>
      {/* Rules */}
      <div style={{ maxWidth:1100, margin:"0 auto 2.5rem", padding:"0 1.2rem" }}>
        <div style={{ background:C.offwhite, border:`1px solid ${C.divider}`, borderRadius:6, padding:"1.4rem 1.8rem" }}>
          <div style={{ fontFamily:FD, fontSize:".95rem", letterSpacing:".07em", textTransform:"uppercase", color:C.dark, marginBottom:".8rem" }}>
            📋 Community-Regeln
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(220px,1fr))", gap:".5rem .8rem", fontFamily:FU, fontSize:".82rem", color:C.slate }}>
            {["Respektvoll bleiben","Nur Themen aus Minden & Umgebung","Keine Gerüchte oder Falschmeldungen","Keine privaten Daten posten","Sachlich diskutieren","Gewerbliche Beiträge nur im Rahmen","Kein Spam","Admin-Entscheidungen gelten"].map((r,i)=>(
              <div key={i} style={{ display:"flex", gap:6 }}>
                <span style={{ color:C.gold, fontWeight:700, flexShrink:0 }}>{i+1}.</span><span>{r}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop:"1rem", fontFamily:FU, fontSize:".73rem", color:C.muted }}>
            Admins: Marc Schäfer · Sandra Pettenpaul · Silke Berger
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── NEWS TAB ────────────────────────────────────────────────────────────── */
function NewsTab() {
  const [filter, setFilter] = useState("Alle");
  const cats = ["Alle", ...Object.keys(CAT_COLORS)];
  const filtered = filter==="Alle" ? NEWS : NEWS.filter(n=>n.cat===filter);
  return (
    <div style={{ maxWidth:760, margin:"0 auto", padding:"1.8rem 1.2rem" }}>
      <h2 style={{ fontFamily:FD, fontSize:"1.2rem", letterSpacing:".07em", textTransform:"uppercase", marginBottom:"1.2rem" }}>📰 Alle Neuigkeiten</h2>
      <div style={{ display:"flex", gap:".5rem", flexWrap:"wrap", marginBottom:"1.2rem" }}>
        {cats.map(c=>(
          <button key={c} onClick={()=>setFilter(c)} style={{
            padding:"5px 14px", borderRadius:20,
            border:`1px solid ${filter===c ? (CAT_COLORS[c]||C.dark) : C.divider}`,
            background: filter===c ? (CAT_COLORS[c]||C.dark) : "transparent",
            color: filter===c ? "#fff" : C.slate,
            fontFamily:FU, fontSize:".78rem", fontWeight:600, cursor:"pointer", transition:"all .15s",
          }}>{c}</button>
        ))}
      </div>
      {filtered.map(n=><NewsCard key={n.id} item={n} />)}
    </div>
  );
}

/* ── EVENTS TAB ──────────────────────────────────────────────────────────── */
function EventsTab() {
  return (
    <div style={{ maxWidth:760, margin:"0 auto", padding:"1.8rem 1.2rem" }}>
      <h2 style={{ fontFamily:FD, fontSize:"1.2rem", letterSpacing:".07em", textTransform:"uppercase", marginBottom:"1.2rem" }}>📅 Veranstaltungskalender</h2>
      {["APR","MAI"].map(mon=>{
        const label = mon==="APR" ? "April 2025" : "Mai 2025";
        return (
          <div key={mon} style={{ marginBottom:"1.5rem" }}>
            <div style={{ fontFamily:FD, fontSize:".8rem", letterSpacing:".12em", textTransform:"uppercase", color:C.muted, borderBottom:`1px solid ${C.divider}`, paddingBottom:".4rem", marginBottom:".8rem" }}>{label}</div>
            {EVENTS.filter(e=>e.mon===mon).map(ev=><EventCard key={ev.id} item={ev} />)}
          </div>
        );
      })}
    </div>
  );
}

/* ── CHAT TAB ────────────────────────────────────────────────────────────── */
function ChatTab() {
  const [msgs, setMsgs] = useState(INIT_CHAT);
  const [text, setText] = useState("");
  const endRef = useRef(null);
  useEffect(()=>{ endRef.current?.scrollIntoView({behavior:"smooth"}); },[msgs]);

  const send = () => {
    if (!text.trim()) return;
    const t = text.trim(); setText("");
    setMsgs(m=>[...m,{id:Date.now(),name:"Du",color:C.charcoal,text:t,ts:now(),me:true}]);
    const replies=[
      {name:"Petra W.",  color:"#C0714F", text:"Danke für den Hinweis! 👍"},
      {name:"Jürgen H.", color:"#2A7D4F", text:"Interessant, das wusste ich nicht!"},
      {name:"Monika L.", color:"#7B5EA7", text:"Hat jemand noch mehr Infos dazu?"},
      {name:"Sandra P.", color:"#1877F2", text:"Schön, dass du dabei bist! 😊"},
    ];
    const r = replies[Math.floor(Math.random()*replies.length)];
    setTimeout(()=>setMsgs(m=>[...m,{id:Date.now()+1,...r,ts:now(),me:false}]),1300);
  };

  return (
    <div style={{ maxWidth:640, margin:"0 auto", padding:"1.5rem 1rem", height:"calc(100vh - 180px)", display:"flex", flexDirection:"column" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:".9rem" }}>
        <h2 style={{ fontFamily:FD, fontSize:"1.1rem", letterSpacing:".07em", textTransform:"uppercase", margin:0 }}>💬 Community-Chat</h2>
        <div style={{ display:"flex", gap:5, alignItems:"center" }}>
          <div style={{ width:8, height:8, borderRadius:"50%", background:"#22c55e" }}/>
          <span style={{ fontFamily:FU, fontSize:".75rem", color:C.slate }}>27 online</span>
        </div>
      </div>
      <div style={{ flex:1, overflowY:"auto", background:C.white, border:`1px solid ${C.divider}`, borderRadius:6, padding:".8rem", display:"flex", flexDirection:"column", gap:".7rem", boxShadow:"inset 0 1px 4px rgba(0,0,0,.04)" }}>
        {msgs.map(msg=>(
          <div key={msg.id} style={{ display:"flex", flexDirection:msg.me?"row-reverse":"row", gap:".6rem", alignItems:"flex-end" }}>
            <Avatar name={msg.name} color={msg.color} size={30} />
            <div style={{ maxWidth:"75%" }}>
              <div style={{ fontFamily:FU, fontSize:".67rem", color:C.muted, marginBottom:2, textAlign:msg.me?"right":"left" }}>{msg.name}</div>
              <div style={{ padding:"8px 12px", borderRadius:12, borderBottomRightRadius:msg.me?2:12, borderBottomLeftRadius:msg.me?12:2, background:msg.me?C.dark:C.stone, color:msg.me?"#fff":C.dark, fontFamily:FU, fontSize:".85rem", lineHeight:1.55 }}>{msg.text}</div>
              <div style={{ fontFamily:FU, fontSize:".62rem", color:C.muted, marginTop:2, textAlign:msg.me?"right":"left" }}>{msg.ts}</div>
            </div>
          </div>
        ))}
        <div ref={endRef}/>
      </div>
      <div style={{ display:"flex", gap:".6rem", marginTop:".8rem" }}>
        <input value={text} onChange={e=>setText(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()}
          placeholder="Schreib etwas für die Community…"
          style={{ flex:1, border:`1.5px solid ${C.divider}`, borderRadius:4, padding:"9px 14px", fontFamily:FU, fontSize:".88rem", outline:"none", background:C.offwhite, color:C.dark }} />
        <button onClick={send} style={{ padding:"0 18px", borderRadius:4, border:"none", background:C.dark, color:C.gold, fontWeight:700, fontFamily:FD, fontSize:".9rem", letterSpacing:".06em", cursor:"pointer" }}>
          SENDEN
        </button>
      </div>
    </div>
  );
}

/* ── KI TAB ──────────────────────────────────────────────────────────────── */
function KITab() {
  const [msgs, setMsgs] = useState([{ role:"assistant", text:"Hallo! 👋 Ich bin der WAS PASSIERT-Assistent für Minden & Umgebung.\n\nIch helfe dir bei:\n• Fragen rund um Minden & Region\n• Sehenswürdigkeiten & Geschichte\n• Ausflugstipps in der Umgebung\n• Allgemeine Informationen\n\nWas möchtest du wissen?" }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);
  useEffect(()=>{ endRef.current?.scrollIntoView({behavior:"smooth"}); },[msgs]);

  const SUGG = ["Was kann ich in Minden unternehmen?","Geschichte von Minden","Was ist das Wasserstraßenkreuz?","Ausflugsziele in der Umgebung","Wann ist der nächste Wochenmarkt?"];

  const send = async () => {
    if (!input.trim()||loading) return;
    const userText = input.trim(); setInput("");
    const updated = [...msgs,{role:"user",text:userText}];
    setMsgs(updated); setLoading(true);
    try {
      const history = updated.map(m=>({role:m.role==="assistant"?"assistant":"user", content:m.text}));
      const res = await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          model:"claude-sonnet-4-20250514",
          max_tokens:1000,
          system:`Du bist der freundliche KI-Assistent der Webseite "WAS PASSIERT in Minden & Umgebung". Die Seite gehört zur gleichnamigen Facebook-Gruppe (16.494 Mitglieder, Gründer: Marc Schäfer) und ist eine Community-Plattform für Minden in Ostwestfalen-Lippe, NRW.

Du kennst Minden gut: Dom zu Minden, Wasserstraßenkreuz, Porta Westfalica, Weser, Kaiser-Wilhelm-Denkmal, Mindener Museum, die Altstadt, regionalen Veranstaltungen usw.

Antworte immer auf Deutsch, freundlich und informativ. Max. 4–5 Sätze pro Antwort. Bei aktuellen Infos empfehle das Mindener Tageblatt (mt.de) oder die Facebook-Gruppe.`,
          messages:history,
        }),
      });
      const data = await res.json();
      const reply = data.content?.map(b=>b.text||"").join("")||"Entschuldigung, ich konnte keine Antwort generieren.";
      setMsgs(m=>[...m,{role:"assistant",text:reply}]);
    } catch {
      setMsgs(m=>[...m,{role:"assistant",text:"Entschuldigung, Verbindungsfehler. Bitte erneut versuchen."}]);
    } finally { setLoading(false); }
  };

  return (
    <div style={{ maxWidth:660, margin:"0 auto", padding:"1.5rem 1rem", height:"calc(100vh - 180px)", display:"flex", flexDirection:"column" }}>
      <div style={{ marginBottom:".9rem" }}>
        <h2 style={{ fontFamily:FD, fontSize:"1.1rem", letterSpacing:".07em", textTransform:"uppercase", margin:0 }}>🤖 KI-Assistent</h2>
        <p style={{ fontFamily:FU, fontSize:".75rem", color:C.muted, marginTop:3 }}>Powered by Claude · Dein persönlicher Minden-Guide</p>
      </div>
      <div style={{ flex:1, overflowY:"auto", background:C.white, border:`1px solid ${C.divider}`, borderRadius:6, padding:".9rem 1rem", display:"flex", flexDirection:"column", gap:".8rem" }}>
        {msgs.map((msg,i)=>(
          <div key={i} style={{ display:"flex", gap:".7rem", flexDirection:msg.role==="user"?"row-reverse":"row", alignItems:"flex-start" }}>
            {msg.role==="assistant"
              ? <div style={{ width:32,height:32,borderRadius:"50%",background:C.dark,color:C.gold,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:FD,fontSize:"1rem",flexShrink:0 }}>W</div>
              : <Avatar name="Du" color={C.sky} size={32}/>
            }
            <div style={{ maxWidth:"78%", padding:"9px 14px", borderRadius:12, borderBottomRightRadius:msg.role==="user"?2:12, borderBottomLeftRadius:msg.role==="assistant"?2:12, background:msg.role==="user"?C.dark:C.stone, color:msg.role==="user"?"#fff":C.dark, fontFamily:FU, fontSize:".85rem", lineHeight:1.65, whiteSpace:"pre-wrap" }}>
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display:"flex", gap:".7rem", alignItems:"center" }}>
            <div style={{ width:32,height:32,borderRadius:"50%",background:C.dark,color:C.gold,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:FD,fontSize:"1rem" }}>W</div>
            <div style={{ padding:"10px 14px", background:C.stone, borderRadius:12, borderBottomLeftRadius:2, display:"flex", gap:4 }}>
              {[0,1,2].map(i=><div key={i} style={{ width:6,height:6,borderRadius:"50%",background:C.muted,animation:`bounce 1s ${i*.2}s infinite ease-in-out` }}/>)}
            </div>
          </div>
        )}
        <div ref={endRef}/>
      </div>
      {msgs.length<=2 && (
        <div style={{ display:"flex", gap:".4rem", flexWrap:"wrap", marginTop:".7rem" }}>
          {SUGG.map(s=>(
            <button key={s} onClick={()=>setInput(s)} style={{ padding:"5px 11px", borderRadius:3, border:`1px solid ${C.divider}`, background:C.offwhite, color:C.slate, fontFamily:FU, fontSize:".73rem", cursor:"pointer" }}>{s}</button>
          ))}
        </div>
      )}
      <div style={{ display:"flex", gap:".6rem", marginTop:".8rem" }}>
        <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()}
          placeholder="Frag mich etwas über Minden…" disabled={loading}
          style={{ flex:1, border:`1.5px solid ${C.divider}`, borderRadius:4, padding:"9px 14px", fontFamily:FU, fontSize:".88rem", outline:"none", background:C.offwhite, color:C.dark }} />
        <button onClick={send} disabled={loading} style={{ padding:"0 18px", borderRadius:4, border:"none", background:loading?C.divider:C.dark, color:loading?C.muted:C.gold, fontWeight:700, fontFamily:FD, fontSize:".9rem", letterSpacing:".06em", cursor:loading?"default":"pointer" }}>
          SENDEN
        </button>
      </div>
    </div>
  );
}

/* ── FOOTER ──────────────────────────────────────────────────────────────── */
function Footer() {
  return (
    <footer style={{ background:C.charcoal, color:"rgba(255,255,255,.5)", padding:"2rem 1.5rem 1.2rem", textAlign:"center", fontFamily:FU, borderTop:`3px solid ${C.gold}` }}>
      <div style={{ fontFamily:FD, color:C.gold, fontSize:"1.1rem", letterSpacing:".08em", textTransform:"uppercase", marginBottom:".3rem" }}>
        WAS PASSIERT in Minden &amp; Umgebung
      </div>
      <div style={{ fontSize:".8rem", lineHeight:1.7, maxWidth:420, marginInline:"auto" }}>
        Die Community-Webseite zur Facebook-Gruppe mit 16.494 Mitgliedern. Gegründet von Marc Schäfer.
      </div>
      <div style={{ marginTop:".9rem", display:"flex", gap:"1.2rem", justifyContent:"center", flexWrap:"wrap" }}>
        {["Impressum","Datenschutz","Über uns","Kontakt"].map(l=>(
          <a key={l} href="#" style={{ color:"rgba(255,255,255,.35)", fontSize:".75rem", textDecoration:"none" }}>{l}</a>
        ))}
        <a href="https://www.facebook.com/groups/was.passiert.in.minden.und.umgebung" target="_blank" rel="noreferrer"
          style={{ color:C.sky, fontSize:".75rem", textDecoration:"none", fontWeight:600 }}>📘 Facebook-Gruppe</a>
      </div>
      <div style={{ marginTop:".9rem", fontSize:".66rem", color:"rgba(255,255,255,.2)" }}>
        © 2025 WAS PASSIERT in Minden &amp; Umgebung · Admins: Marc Schäfer · Sandra Pettenpaul · Silke Berger
      </div>
    </footer>
  );
}

/* ── ROOT APP ────────────────────────────────────────────────────────────── */
export default function App() {
  const [tab, setTab] = useState("Home");
  return (
    <div style={{ minHeight:"100vh", background:C.offwhite }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@400;600;700&family=Source+Serif+4:ital,wght@0,400;0,600;1,400&family=DM+Sans:wght@400;500;600&family=Playfair+Display:ital,wght@1,700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:5px;height:5px;}
        ::-webkit-scrollbar-thumb{background:#DDDDD8;border-radius:4px;}
        @keyframes bounce{0%,80%,100%{transform:scale(.6);opacity:.4;}40%{transform:scale(1);opacity:1;}}
      `}</style>
      <NavBar tab={tab} setTab={setTab} />
      {tab==="Home"   && <HomeTab   setTab={setTab} />}
      {tab==="News"   && <NewsTab   />}
      {tab==="Events" && <EventsTab />}
      {tab==="Chat"   && <ChatTab   />}
      {tab==="KI"     && <KITab     />}
      <Footer />
    </div>
  );
}
