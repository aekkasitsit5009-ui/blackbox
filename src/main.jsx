import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

const STORAGE_KEY = "blackbox-v01-save";

const FILES = {
  "README.TXT": `BLACKBOX RECOVERY ENVIRONMENT\nBUILD 0.4.19\n\nSTANDARD PROCEDURE\n1. Review recovered documents.\n2. Review SYSTEM logs.\n3. Restore communication storage.\n4. Do not connect UNKNOWN DEVICE.\n\nIf MAIL is unavailable, recovery authorization may be entered through TERMINAL.`,

  "INCIDENT_01.TXT": `INCIDENT REPORT 09\n\nLOCATION: SUBLEVEL B / OBSERVATION ROOM\nSTATUS: INCOMPLETE\n\nThe subject regained consciousness at 02:31.\nNo identification was recovered.\n\nAt some point during the previous hour, all recording equipment stopped simultaneously.\n\nThe code is not in the words.\nCheck when the room went dark.\n\n[END OF RECOVERED TEXT]`,

  "PERSONAL_NOTE.TXT": `I don't remember writing this.\n\nIf this machine boots again, don't trust the date in the corner.\n\nI tried opening MAIL. It asked for an authorization code.\n\nI know I've seen it before. Somewhere in SYSTEM.\n\n— ?`,

  "SYSTEM/ACCESS.LOG": `[01:52:09] CAMERA_01 ........ ONLINE\n[01:52:11] CAMERA_02 ........ ONLINE\n[02:06:44] DOOR_A ........... SEALED\n[02:11:03] SUBJECT_MONITOR .. ACTIVE\n[02:16:58] POWER_LOAD ....... UNSTABLE\n[02:17:00] FACILITY_POWER ... OFFLINE\n[02:17:00] CAMERA_01 ........ LOST\n[02:17:00] CAMERA_02 ........ LOST\n[02:17:01] UNKNOWN_DEVICE ... CONNECTED\n[02:17:04] SIGNAL ........... DETECTED\n[02:22:41] FACILITY_POWER ... RESTORED\n[02:31:16] SUBJECT_MONITOR .. ACTIVE`,

  "SYSTEM/DEVICE.LOG": `DEVICE REPORT\n\nHOST ............. BLACKBOX\nSESSION .......... 09\nUSER ............. UNREGISTERED\nNETWORK .......... DISCONNECTED\n\nATTACHED:\n  KB-01\n  DISPLAY-02\n  STORAGE-RECOVERY\n  UNKNOWN_DEVICE\n\nWARNING:\nUNKNOWN_DEVICE does not match any registered hardware signature.`
};

const MAIL = [
  {
    from: "SYSTEM",
    subject: "Recovery channel restored",
    body: `MAIL archive successfully reconstructed.\n\nOne damaged message was recovered.\nTimestamp integrity could not be verified.`
  },
  {
    from: "YOU",
    subject: "don't answer it",
    body: `If you're reading this, then you found 02:17.\n\nGood.\n\nThat means this part still happens the same way.\n\nListen carefully. There is going to be a signal. It will look like someone trying to contact you.\n\nIt isn't.\n\nWhatever you do—\n\nDO NOT CONNECT UNKNOWN DEVICE.\n\nI did.\n\nI'm sending this message tomorrow.`
  }
];

const DEFAULT_WINDOWS = {
  files: { open: false, minimized: false, x: 120, y: 82, z: 2 },
  terminal: { open: false, minimized: false, x: 230, y: 118, z: 3 },
  mail: { open: false, minimized: false, x: 330, y: 98, z: 4 },
  system: { open: false, minimized: false, x: 390, y: 145, z: 5 }
};

function readSave() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
  } catch {
    return null;
  }
}

function App() {
  const saved = readSave();
  const [booted, setBooted] = useState(Boolean(saved?.booted));
  const [bootLines, setBootLines] = useState([]);
  const [windows, setWindows] = useState(DEFAULT_WINDOWS);
  const [topZ, setTopZ] = useState(10);
  const [activeFile, setActiveFile] = useState(null);
  const [readFiles, setReadFiles] = useState(saved?.readFiles || []);
  const [mailUnlocked, setMailUnlocked] = useState(Boolean(saved?.mailUnlocked));
  const [selectedMail, setSelectedMail] = useState(null);
  const [complete, setComplete] = useState(Boolean(saved?.complete));
  const [terminalLines, setTerminalLines] = useState(saved?.terminalLines || [
    "BLACKBOX RECOVERY TERMINAL",
    "TYPE 'help' FOR AVAILABLE COMMANDS.",
    ""
  ]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      booted,
      readFiles,
      mailUnlocked,
      complete,
      terminalLines: terminalLines.slice(-80)
    }));
  }, [booted, readFiles, mailUnlocked, complete, terminalLines]);

  useEffect(() => {
    if (booted) return;
    const sequence = [
      "BLACKBOX BIOS 4.19",
      "MEMORY CHECK ................. OK",
      "RECOVERY STORAGE ............. FOUND",
      "NETWORK ...................... FAILED",
      "USER PROFILE ................. MISSING",
      "UNKNOWN DEVICE ............... DETECTED",
      "",
      "STARTING RECOVERY ENVIRONMENT..."
    ];
    let i = 0;
    const timer = setInterval(() => {
      setBootLines((old) => [...old, sequence[i]]);
      i += 1;
      if (i >= sequence.length) {
        clearInterval(timer);
        setTimeout(() => setBooted(true), 700);
      }
    }, 220);
    return () => clearInterval(timer);
  }, [booted]);

  function focusWindow(id) {
    setTopZ((value) => value + 1);
    setWindows((old) => ({
      ...old,
      [id]: { ...old[id], open: true, minimized: false, z: topZ + 1 }
    }));
  }

  function closeWindow(id) {
    setWindows((old) => ({ ...old, [id]: { ...old[id], open: false } }));
  }

  function minimizeWindow(id) {
    setWindows((old) => ({ ...old, [id]: { ...old[id], minimized: true } }));
  }

  function moveWindow(id, x, y) {
    setWindows((old) => ({ ...old, [id]: { ...old[id], x, y } }));
  }

  function openFile(name) {
    setActiveFile(name);
    setReadFiles((old) => old.includes(name) ? old : [...old, name]);
    focusWindow("files");
    beep(640, 0.025);
  }

  function resetSave() {
    if (!window.confirm("ERASE BLACKBOX SAVE DATA?")) return;
    localStorage.removeItem(STORAGE_KEY);
    location.reload();
  }

  if (!booted) return <BootScreen lines={bootLines} />;

  return (
    <Desktop
      windows={windows}
      focusWindow={focusWindow}
      closeWindow={closeWindow}
      minimizeWindow={minimizeWindow}
      moveWindow={moveWindow}
      activeFile={activeFile}
      openFile={openFile}
      readFiles={readFiles}
      mailUnlocked={mailUnlocked}
      setMailUnlocked={setMailUnlocked}
      selectedMail={selectedMail}
      setSelectedMail={setSelectedMail}
      complete={complete}
      setComplete={setComplete}
      terminalLines={terminalLines}
      setTerminalLines={setTerminalLines}
      resetSave={resetSave}
    />
  );
}

function BootScreen({ lines }) {
  return (
    <main className="boot">
      <div className="boot-logo">BLACKBOX</div>
      <div className="boot-lines">
        {lines.map((line, i) => <div key={i}>{line || "\u00a0"}</div>)}
        <span className="cursor">█</span>
      </div>
    </main>
  );
}

function Desktop(props) {
  const {
    windows, focusWindow, closeWindow, minimizeWindow, moveWindow,
    activeFile, openFile, readFiles, mailUnlocked, setMailUnlocked,
    selectedMail, setSelectedMail, complete, setComplete,
    terminalLines, setTerminalLines, resetSave
  } = props;
  const [clock, setClock] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const appContent = {
    files: <FilesApp activeFile={activeFile} openFile={openFile} readFiles={readFiles} />,
    terminal: (
      <TerminalApp
        lines={terminalLines}
        setLines={setTerminalLines}
        mailUnlocked={mailUnlocked}
        unlockMail={() => setMailUnlocked(true)}
        openApp={focusWindow}
        openFile={openFile}
      />
    ),
    mail: (
      <MailApp
        unlocked={mailUnlocked}
        selected={selectedMail}
        setSelected={setSelectedMail}
        onFinal={() => setComplete(true)}
      />
    ),
    system: (
      <SystemApp
        readFiles={readFiles}
        mailUnlocked={mailUnlocked}
        complete={complete}
        resetSave={resetSave}
      />
    )
  };

  return (
    <main className="desktop">
      <div className="scanlines" />
      <div className="desktop-mark">BLACKBOX</div>

      <div className="icons">
        <DesktopIcon label="FILES" glyph="▤" onClick={() => focusWindow("files")} />
        <DesktopIcon label="TERMINAL" glyph=">_" onClick={() => focusWindow("terminal")} />
        <DesktopIcon label="MAIL" glyph={mailUnlocked ? "✉" : "▣"} locked={!mailUnlocked} onClick={() => focusWindow("mail")} />
        <DesktopIcon label="SYSTEM" glyph="◇" onClick={() => focusWindow("system")} />
      </div>

      <div className="unknown"><span />UNKNOWN DEVICE</div>

      {Object.entries(windows).map(([id, win]) => {
        if (!win.open || win.minimized) return null;
        return (
          <WindowFrame
            key={id}
            id={id}
            title={id.toUpperCase()}
            win={win}
            focus={() => focusWindow(id)}
            close={() => closeWindow(id)}
            minimize={() => minimizeWindow(id)}
            move={(x, y) => moveWindow(id, x, y)}
          >
            {appContent[id]}
          </WindowFrame>
        );
      })}

      {complete && (
        <div className="notice">
          RECOVERY CHANNEL RESTORED
          <small>Something is still connected.</small>
        </div>
      )}

      <footer className="taskbar">
        <button className="start" onClick={() => focusWindow("system")}>BLACKBOX</button>
        <div className="tasks">
          {Object.entries(windows).filter(([, win]) => win.open).map(([id, win]) => (
            <button key={id} className={!win.minimized ? "task-active" : ""} onClick={() => focusWindow(id)}>{id.toUpperCase()}</button>
          ))}
        </div>
        <time>{clock.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false })}</time>
      </footer>
    </main>
  );
}

function DesktopIcon({ label, glyph, locked, onClick }) {
  return (
    <button className="desktop-icon" onClick={onClick} onDoubleClick={onClick}>
      <span className={locked ? "icon-glyph locked" : "icon-glyph"}>{glyph}</span>
      <b>{label}</b>
      {locked && <small>LOCKED</small>}
    </button>
  );
}

function WindowFrame({ id, title, win, focus, close, minimize, move, children }) {
  const drag = useRef(null);

  function startDrag(e) {
    if (e.target.closest("button")) return;
    focus();
    drag.current = { sx: e.clientX, sy: e.clientY, x: win.x, y: win.y };
    e.currentTarget.setPointerCapture?.(e.pointerId);
  }

  function dragMove(e) {
    if (!drag.current) return;
    const nextX = Math.max(0, Math.min(window.innerWidth - 180, drag.current.x + e.clientX - drag.current.sx));
    const nextY = Math.max(0, Math.min(window.innerHeight - 90, drag.current.y + e.clientY - drag.current.sy));
    move(nextX, nextY);
  }

  function endDrag() { drag.current = null; }

  return (
    <section className={`window window-${id}`} style={{ left: win.x, top: win.y, zIndex: win.z }} onPointerDown={focus}>
      <header className="titlebar" onPointerDown={startDrag} onPointerMove={dragMove} onPointerUp={endDrag} onPointerCancel={endDrag}>
        <span>{title}</span>
        <div>
          <button onClick={minimize}>_</button>
          <button onClick={close}>×</button>
        </div>
      </header>
      <div className="window-body">{children}</div>
    </section>
  );
}

function FilesApp({ activeFile, openFile, readFiles }) {
  return (
    <div className="split-app">
      <aside className="side-list">
        <div className="section-label">RECOVERY STORAGE</div>
        {Object.keys(FILES).map((name) => (
          <button key={name} className={activeFile === name ? "selected" : ""} onClick={() => openFile(name)}>
            <span>{name.includes("/") ? "SYS" : "TXT"}</span>
            <b>{name}</b>
            {readFiles.includes(name) && <small>READ</small>}
          </button>
        ))}
      </aside>
      <article className="viewer">
        {!activeFile ? (
          <div className="empty"><strong>▤</strong>SELECT A FILE</div>
        ) : (
          <>
            <div className="doc-title">{activeFile}</div>
            <pre>{FILES[activeFile]}</pre>
          </>
        )}
      </article>
    </div>
  );
}

function TerminalApp({ lines, setLines, mailUnlocked, unlockMail, openApp, openFile }) {
  const [value, setValue] = useState("");
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const inputRef = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => bottomRef.current?.scrollIntoView({ block: "end" }), [lines]);

  function print(...newLines) {
    setLines((old) => [...old, ...newLines]);
  }

  function findFile(input) {
    const normalized = input.trim().replaceAll("\\", "/").toUpperCase();
    return Object.keys(FILES).find((name) => name.toUpperCase() === normalized)
      || Object.keys(FILES).find((name) => name.toUpperCase().endsWith("/" + normalized));
  }

  function run(raw) {
    const input = raw.trim();
    if (!input) return print("C:\\RECOVERY>");
    setHistory((old) => [...old, input]);
    setHistoryIndex(-1);

    const [word, ...rest] = input.split(/\s+/);
    const cmd = word.toLowerCase();
    const arg = rest.join(" ");
    print(`C:\\RECOVERY> ${input}`);

    if (cmd === "help") return print("", "AVAILABLE COMMANDS", "help", "dir", "read <file>", "open <file>", "whoami", "status", "unlock <code>", "mail", "history", "clear", "");
    if (cmd === "dir" || cmd === "ls") return print("", "RECOVERY STORAGE", ...Object.keys(FILES).map((name) => `  ${name}`), `  MAIL/ ........ ${mailUnlocked ? "ONLINE" : "LOCKED"}`, "");
    if (cmd === "whoami") return print("", "USER ...... UNREGISTERED", "SESSION ... 09", "HOST ...... BLACKBOX", "");
    if (cmd === "status") return print("", `MAIL ............... ${mailUnlocked ? "ONLINE" : "LOCKED"}`, "NETWORK ............ OFFLINE", "UNKNOWN DEVICE ..... CONNECTED", "");
    if (cmd === "clear" || cmd === "cls") return setLines([]);
    if (cmd === "history") return print("", ...(history.length ? history : ["NO HISTORY"]), "");

    if (cmd === "read" || cmd === "cat" || cmd === "type") {
      const file = findFile(arg);
      if (!file) return print(`FILE NOT FOUND: ${arg || "(empty)"}`, "");
      return print("", `[${file}]`, FILES[file], "");
    }

    if (cmd === "open") {
      const file = findFile(arg);
      if (!file) return print(`FILE NOT FOUND: ${arg || "(empty)"}`, "");
      openFile(file);
      return print(`OPENING ${file}`, "");
    }

    if (cmd === "unlock") {
      const code = arg.replace(/[:\-\s]/g, "");
      if (code === "0217") {
        if (!mailUnlocked) {
          unlockMail();
          beep(860, 0.08);
          setTimeout(() => beep(1080, 0.08), 100);
        }
        print("", "AUTHORIZATION ACCEPTED.", "RECOVERING COMMUNICATION STORAGE...", "MAIL ............... ONLINE", "", "1 DAMAGED MESSAGE RECOVERED.", "");
        setTimeout(() => openApp("mail"), 500);
        return;
      }
      beep(150, 0.1);
      return print("", "AUTHORIZATION REJECTED.", "INCORRECT RECOVERY CODE.", "");
    }

    if (cmd === "mail") {
      if (!mailUnlocked) return print("MAIL IS LOCKED.", "");
      openApp("mail");
      return print("OPENING MAIL...", "");
    }

    if (cmd === "connect") return print("", "COMMAND BLOCKED.", "UNKNOWN DEVICE REQUIRES MANUAL SERVICE ACCESS.", "");
    if (cmd === "tomorrow") return print("", "UNKNOWN COMMAND.", "...", "SYSTEM CLOCK DESYNCHRONIZED.", "");

    print(`'${word}' IS NOT RECOGNIZED.`, "TYPE 'help'.", "");
  }

  function submit(e) {
    e.preventDefault();
    const raw = value;
    setValue("");
    run(raw);
  }

  function handleKey(e) {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!history.length) return;
      const next = historyIndex < 0 ? history.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(next);
      setValue(history[next]);
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex < 0) return;
      const next = historyIndex + 1;
      if (next >= history.length) {
        setHistoryIndex(-1);
        setValue("");
      } else {
        setHistoryIndex(next);
        setValue(history[next]);
      }
    }
  }

  return (
    <div className="terminal" onClick={() => inputRef.current?.focus()}>
      <div className="terminal-output">
        {lines.map((line, i) => <div key={i}>{line || "\u00a0"}</div>)}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={submit} className="terminal-prompt">
        <span>C:\\RECOVERY&gt;</span>
        <input ref={inputRef} value={value} onChange={(e) => setValue(e.target.value)} onKeyDown={handleKey} autoFocus autoComplete="off" spellCheck="false" />
      </form>
    </div>
  );
}

function MailApp({ unlocked, selected, setSelected, onFinal }) {
  if (!unlocked) {
    return (
      <div className="locked-screen">
        <div>▣</div>
        <h2>COMMUNICATION STORAGE LOCKED</h2>
        <p>Recovery authorization required.</p>
        <code>TERMINAL → unlock &lt;code&gt;</code>
      </div>
    );
  }

  return (
    <div className="split-app mail-app">
      <aside className="side-list mail-list">
        <div className="section-label">RECOVERED MAIL</div>
        {MAIL.map((mail, index) => (
          <button key={index} className={selected === index ? "selected" : ""} onClick={() => { setSelected(index); if (index === 1) onFinal(); }}>
            <span>{mail.from}</span><b>{mail.subject}</b>
          </button>
        ))}
      </aside>
      <article className="viewer">
        {selected === null ? <div className="empty"><strong>✉</strong>SELECT MESSAGE</div> : (
          <>
            <div className="mail-head"><small>FROM</small><b>{MAIL[selected].from}</b><h2>{MAIL[selected].subject}</h2></div>
            <pre>{MAIL[selected].body}</pre>
          </>
        )}
      </article>
    </div>
  );
}

function SystemApp({ readFiles, mailUnlocked, complete, resetSave }) {
  const max = Object.keys(FILES).length + 4;
  const current = readFiles.length + (mailUnlocked ? 2 : 0) + (complete ? 2 : 0);
  const progress = Math.min(100, Math.round((current / max) * 100));
  return (
    <div className="system-app">
      <div className="system-logo">BLACKBOX<small>RECOVERY ENVIRONMENT 0.1</small></div>
      <dl>
        <div><dt>HOST</dt><dd>BLACKBOX</dd></div>
        <div><dt>USER</dt><dd>UNREGISTERED</dd></div>
        <div><dt>SESSION</dt><dd>09</dd></div>
        <div><dt>MAIL</dt><dd>{mailUnlocked ? "ONLINE" : "LOCKED"}</dd></div>
        <div><dt>DEVICE</dt><dd className="danger-text">UNKNOWN / CONNECTED</dd></div>
      </dl>
      <div className="progress-title"><span>RECOVERY</span><span>{progress}%</span></div>
      <div className="progress"><span style={{ width: `${progress}%` }} /></div>
      <p>{complete ? "Communication archive restored. Timeline verification failed." : "Continue examining recovered storage."}</p>
      <button className="erase" onClick={resetSave}>ERASE SAVE DATA</button>
    </div>
  );
}

function beep(frequency = 440, duration = 0.04) {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "square";
    osc.frequency.value = frequency;
    gain.gain.setValueAtTime(0.025, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
    setTimeout(() => ctx.close(), duration * 1000 + 80);
  } catch {}
}

createRoot(document.getElementById("root")).render(<App />);
