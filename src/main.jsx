import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ENDINGS,
  FILES,
  HINTS,
  MAIL_LOCKED,
  MAILS,
  SAVE_KEY,
  SAVE_VERSION,
  TRASH_ITEMS,
  defaultSave,
} from "./gameData.js";
import "./styles.css";

const WINDOW_DEFAULTS = {
  computer: { x: 92, y: 62, w: 720, h: 500 },
  notepad: { x: 180, y: 84, w: 650, h: 480 },
  terminal: { x: 136, y: 118, w: 690, h: 430 },
  mail: { x: 220, y: 72, w: 690, h: 470 },
  trash: { x: 260, y: 105, w: 560, h: 390 },
  recorder: { x: 290, y: 138, w: 520, h: 350 },
  device: { x: 235, y: 88, w: 600, h: 440 },
  control: { x: 315, y: 96, w: 570, h: 460 },
  ending: { x: 165, y: 66, w: 700, h: 500 },
  about: { x: 360, y: 160, w: 450, h: 310 },
};

const APP_TITLES = {
  computer: "คอมพิวเตอร์ของฉัน",
  notepad: "แผ่นจดบันทึก",
  terminal: "พรอมต์คำสั่ง — BLACKBOX",
  mail: "กล่องจดหมาย",
  trash: "ถังรีไซเคิล",
  recorder: "เครื่องบันทึกเสียง",
  device: "ตัวจัดการอุปกรณ์",
  control: "แผงควบคุม / Beta Test",
  ending: "BLACKBOX — ผลการทดสอบ",
  about: "เกี่ยวกับ BLACKBOX",
};

function loadSave() {
  try {
    const parsed = JSON.parse(localStorage.getItem(SAVE_KEY) || "null");
    if (!parsed || parsed.version !== SAVE_VERSION) return defaultSave();
    return { ...defaultSave(), ...parsed };
  } catch {
    return defaultSave();
  }
}

function App() {
  const [save, setSave] = useState(loadSave);
  const [booting, setBooting] = useState(true);
  const [bootLine, setBootLine] = useState(0);
  const [windows, setWindows] = useState([]);
  const [positions, setPositions] = useState(WINDOW_DEFAULTS);
  const [zCounter, setZCounter] = useState(20);
  const [activeDoc, setActiveDoc] = useState("เริ่มที่นี่.txt");
  const [startOpen, setStartOpen] = useState(false);
  const [selectedMail, setSelectedMail] = useState(null);
  const [notice, setNotice] = useState(null);
  const [glitch, setGlitch] = useState(false);

  useEffect(() => {
    localStorage.setItem(SAVE_KEY, JSON.stringify(save));
  }, [save]);

  useEffect(() => {
    if (!booting) return;
    const timer = setInterval(() => {
      setBootLine((line) => {
        if (line >= 7) {
          clearInterval(timer);
          setTimeout(() => setBooting(false), 650);
          return line;
        }
        return line + 1;
      });
    }, 280);
    return () => clearInterval(timer);
  }, [booting]);

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(null), 4600);
    return () => clearTimeout(timer);
  }, [notice]);

  const updateSave = (patch) => {
    setSave((old) => ({
      ...old,
      ...(typeof patch === "function" ? patch(old) : patch),
    }));
  };

  function openWindow(id) {
    setStartOpen(false);
    setZCounter((z) => z + 1);
    setWindows((old) => {
      const found = old.find((item) => item.id === id);
      if (found) {
        return old.map((item) =>
          item.id === id ? { ...item, minimized: false, z: zCounter + 1 } : item
        );
      }
      return [...old, { id, minimized: false, z: zCounter + 1 }];
    });
    beep(520, 0.025);
  }

  function focusWindow(id) {
    setZCounter((z) => z + 1);
    setWindows((old) =>
      old.map((item) =>
        item.id === id ? { ...item, minimized: false, z: zCounter + 1 } : item
      )
    );
  }

  function closeWindow(id) {
    setWindows((old) => old.filter((item) => item.id !== id));
  }

  function minimizeWindow(id) {
    setWindows((old) =>
      old.map((item) => (item.id === id ? { ...item, minimized: true } : item))
    );
  }

  function markFileRead(name) {
    updateSave((old) => {
      const readFiles = old.readFiles.includes(name)
        ? old.readFiles
        : [...old.readFiles, name];
      const clueFound =
        readFiles.includes("รายงาน_ห้อง09.txt") && readFiles.includes("POWER.LOG");
      return {
        readFiles,
        stage: clueFound ? Math.max(old.stage, 1) : old.stage,
      };
    });
  }

  function openDocument(name) {
    setActiveDoc(name);
    markFileRead(name);
    openWindow("notepad");
  }

  function unlockMail() {
    if (save.mailUnlocked) return;
    updateSave({ mailUnlocked: true, stage: Math.max(save.stage, 2) });
    setNotice({ title: "ระบบ", text: "กู้คืนกล่องจดหมายแล้ว — พบข้อความ 2 ฉบับ" });
    setTimeout(() => openWindow("mail"), 450);
  }

  function restoreAudio() {
    if (save.restoredAudio) return;
    updateSave({ restoredAudio: true, stage: Math.max(save.stage, 3) });
    setNotice({ title: "ถังรีไซเคิล", text: "กู้คืน REC_0311.WAV ไปยังเอกสารแล้ว" });
    beep(690, 0.05);
  }

  function finishAudio() {
    updateSave({ audioPlayed: true, stage: Math.max(save.stage, 4) });
    setNotice({ title: "เครื่องบันทึกเสียง", text: "ถอดข้อมูลส่วนท้ายได้: SERVICE CODE 0311" });
  }

  function unlockDevice() {
    if (save.serviceUnlocked) return;
    updateSave({ serviceUnlocked: true, stage: Math.max(save.stage, 5) });
    setNotice({ title: "ระบบ", text: "ปลดล็อกโหมดบริการของ UNKNOWN DEVICE" });
    setTimeout(() => openWindow("device"), 350);
  }

  function chooseEnding(choice) {
    if (!ENDINGS[choice]) return;
    setGlitch(true);
    beep(choice === "connect" ? 110 : 190, 0.2);
    setTimeout(() => {
      updateSave({ ending: choice, stage: 6 });
      setGlitch(false);
      openWindow("ending");
    }, 900);
  }

  function resetGame() {
    if (!window.confirm("ลบข้อมูลการทดสอบทั้งหมดและเริ่ม Beta Test 01 ใหม่หรือไม่?")) return;
    localStorage.removeItem(SAVE_KEY);
    location.reload();
  }

  if (booting) {
    return <BootScreen line={bootLine} onSkip={() => setBooting(false)} />;
  }

  return (
    <div className={`desktop-shell ${glitch ? "glitching" : ""}`} onMouseDown={() => setStartOpen(false)}>
      <DesktopIcons
        save={save}
        openWindow={openWindow}
        openDocument={openDocument}
      />

      <div className="desktop-watermark">
        <strong>BLACKBOX</strong>
        <span>BETA TEST 01</span>
      </div>

      {windows.map((win) => {
        if (win.minimized) return null;
        const box = positions[win.id] || WINDOW_DEFAULTS[win.id] || { x: 100, y: 70, w: 600, h: 420 };
        return (
          <ClassicWindow
            key={win.id}
            id={win.id}
            title={APP_TITLES[win.id] || win.id}
            z={win.z}
            box={box}
            setBox={(next) => setPositions((old) => ({ ...old, [win.id]: next }))}
            onFocus={() => focusWindow(win.id)}
            onClose={() => closeWindow(win.id)}
            onMinimize={() => minimizeWindow(win.id)}
          >
            <WindowContent
              id={win.id}
              save={save}
              updateSave={updateSave}
              activeDoc={activeDoc}
              openDocument={openDocument}
              openWindow={openWindow}
              unlockMail={unlockMail}
              restoreAudio={restoreAudio}
              finishAudio={finishAudio}
              unlockDevice={unlockDevice}
              chooseEnding={chooseEnding}
              selectedMail={selectedMail}
              setSelectedMail={setSelectedMail}
              resetGame={resetGame}
            />
          </ClassicWindow>
        );
      })}

      {notice && <SystemNotice title={notice.title} text={notice.text} />}

      {startOpen && (
        <StartMenu
          save={save}
          openWindow={openWindow}
          onReset={resetGame}
          onClose={() => setStartOpen(false)}
        />
      )}

      <Taskbar
        windows={windows}
        startOpen={startOpen}
        onStart={(event) => {
          event.stopPropagation();
          setStartOpen((v) => !v);
        }}
        onTask={focusWindow}
      />
    </div>
  );
}

function BootScreen({ line, onSkip }) {
  const lines = [
    "BLACKBOX BIOS 4.19",
    "กำลังตรวจสอบหน่วยความจำ ............ ผ่าน",
    "พบไดรฟ์กู้คืนข้อมูล ................ ผ่าน",
    "กำลังตรวจสอบเครือข่าย .............. ล้มเหลว",
    "ไม่พบโปรไฟล์ผู้ใช้งาน",
    "พบอุปกรณ์ที่ไม่ทราบชนิด",
    "กำลังโหลด BLACKBOX Recovery Shell...",
    "เริ่มเซสชัน 09",
  ];

  return (
    <div className="boot-screen" onClick={onSkip}>
      <div className="boot-bios">BLACKBOX</div>
      <div className="boot-version">Recovery BIOS / BETA TEST 01</div>
      <div className="boot-lines">
        {lines.slice(0, line + 1).map((text, index) => (
          <div key={index} className={text.includes("ล้มเหลว") || text.includes("ไม่ทราบ") ? "boot-warn" : ""}>
            {text}
          </div>
        ))}
        <span className="dos-cursor">_</span>
      </div>
      <div className="boot-skip">แตะหน้าจอเพื่อข้าม</div>
    </div>
  );
}

function DesktopIcons({ save, openWindow, openDocument }) {
  const icons = [
    { id: "computer", label: "คอมพิวเตอร์ของฉัน", glyph: "▣", action: () => openWindow("computer") },
    { id: "docs", label: "เริ่มที่นี่", glyph: "▤", action: () => openDocument("เริ่มที่นี่.txt") },
    { id: "mail", label: "กล่องจดหมาย", glyph: save.mailUnlocked ? "✉" : "▥", action: () => openWindow("mail") },
    { id: "terminal", label: "พรอมต์คำสั่ง", glyph: "C:\\", action: () => openWindow("terminal") },
    { id: "recorder", label: "เครื่องบันทึกเสียง", glyph: "▶", action: () => openWindow("recorder") },
    { id: "trash", label: "ถังรีไซเคิล", glyph: "♲", action: () => openWindow("trash") },
    { id: "device", label: "UNKNOWN DEVICE", glyph: "?", action: () => openWindow("device"), danger: true },
  ];

  return (
    <div className="desktop-icons">
      {icons.map((icon) => (
        <button
          key={icon.id}
          className={`desktop-icon ${icon.danger ? "danger-icon" : ""}`}
          onDoubleClick={icon.action}
          onClick={(event) => {
            if (window.matchMedia("(pointer: coarse)").matches) icon.action();
            event.stopPropagation();
          }}
        >
          <span className="desktop-icon-image">{icon.glyph}</span>
          <span className="desktop-icon-label">{icon.label}</span>
        </button>
      ))}
    </div>
  );
}

function ClassicWindow({ id, title, z, box, setBox, onFocus, onClose, onMinimize, children }) {
  const drag = useRef(null);

  function startDrag(event) {
    if (event.target.closest("button")) return;
    onFocus();
    drag.current = {
      startX: event.clientX,
      startY: event.clientY,
      x: box.x,
      y: box.y,
    };
    event.currentTarget.setPointerCapture?.(event.pointerId);
  }

  function moveDrag(event) {
    if (!drag.current) return;
    const maxX = Math.max(0, window.innerWidth - 180);
    const maxY = Math.max(0, window.innerHeight - 90);
    setBox({
      ...box,
      x: Math.min(maxX, Math.max(0, drag.current.x + event.clientX - drag.current.startX)),
      y: Math.min(maxY, Math.max(0, drag.current.y + event.clientY - drag.current.startY)),
    });
  }

  function stopDrag() {
    drag.current = null;
  }

  return (
    <section
      className="classic-window"
      data-window={id}
      style={{ left: box.x, top: box.y, width: box.w, height: box.h, zIndex: z }}
      onMouseDown={(event) => {
        event.stopPropagation();
        onFocus();
      }}
    >
      <header
        className="classic-titlebar"
        onPointerDown={startDrag}
        onPointerMove={moveDrag}
        onPointerUp={stopDrag}
        onPointerCancel={stopDrag}
      >
        <div className="titlebar-icon">■</div>
        <div className="titlebar-text">{title}</div>
        <div className="titlebar-controls">
          <button type="button" onClick={onMinimize} aria-label="ย่อหน้าต่าง">_</button>
          <button type="button" className="fake-max" aria-label="ขยายหน้าต่าง">□</button>
          <button type="button" onClick={onClose} aria-label="ปิดหน้าต่าง">×</button>
        </div>
      </header>
      <div className="classic-menubar"><span>แฟ้ม</span><span>แก้ไข</span><span>มุมมอง</span><span>วิธีใช้</span></div>
      <div className="classic-window-body">{children}</div>
    </section>
  );
}

function WindowContent(props) {
  switch (props.id) {
    case "computer": return <ComputerApp {...props} />;
    case "notepad": return <NotepadApp {...props} />;
    case "terminal": return <TerminalApp {...props} />;
    case "mail": return <MailApp {...props} />;
    case "trash": return <TrashApp {...props} />;
    case "recorder": return <RecorderApp {...props} />;
    case "device": return <DeviceApp {...props} />;
    case "control": return <ControlPanel {...props} />;
    case "ending": return <EndingApp {...props} />;
    case "about": return <AboutApp />;
    default: return <div className="app-pad">ไม่พบโปรแกรม</div>;
  }
}

function ComputerApp({ save, openDocument, openWindow }) {
  const [folder, setFolder] = useState("เอกสาร");
  const visibleFiles = Object.entries(FILES).filter(([, file]) => file.folder === folder && (!file.unlockAt || save.stage >= file.unlockAt));

  return (
    <div className="explorer-app">
      <div className="explorer-toolbar">
        <ClassicButton onClick={() => setFolder("เอกสาร")}>เอกสาร</ClassicButton>
        <ClassicButton onClick={() => setFolder("SYSTEM")}>SYSTEM</ClassicButton>
        <div className="address-bar">C:\\RECOVERY\\{folder}</div>
      </div>
      <div className="explorer-layout">
        <aside className="explorer-tree">
          <div className="tree-caption">โฟลเดอร์ทั้งหมด</div>
          <button onClick={() => setFolder("เอกสาร")}>▾ C:\\RECOVERY</button>
          <button className={folder === "เอกสาร" ? "tree-active" : ""} onClick={() => setFolder("เอกสาร")}>　▣ เอกสาร</button>
          <button className={folder === "SYSTEM" ? "tree-active" : ""} onClick={() => setFolder("SYSTEM")}>　▣ SYSTEM</button>
          <button onClick={() => openWindow("mail")}>　▣ MAIL {save.mailUnlocked ? "" : "(ล็อก)"}</button>
          <button onClick={() => openWindow("trash")}>　♲ ถังรีไซเคิล</button>
        </aside>
        <main className="explorer-files">
          {visibleFiles.map(([name, file]) => (
            <button key={name} className="file-tile" onDoubleClick={() => openDocument(name)} onClick={() => {
              if (window.matchMedia("(pointer: coarse)").matches) openDocument(name);
            }}>
              <span className={`file-icon ${file.type}`}>▤</span>
              <span>{name}</span>
              {save.readFiles.includes(name) && <small>เปิดแล้ว</small>}
            </button>
          ))}
          {folder === "เอกสาร" && save.restoredAudio && (
            <button className="file-tile" onClick={() => openWindow("recorder")}>
              <span className="file-icon audio">▶</span><span>REC_0311.WAV</span><small>กู้คืนแล้ว</small>
            </button>
          )}
        </main>
      </div>
      <div className="statusbar">{visibleFiles.length + (folder === "เอกสาร" && save.restoredAudio ? 1 : 0)} รายการ</div>
    </div>
  );
}

function NotepadApp({ activeDoc }) {
  const file = FILES[activeDoc];
  return (
    <div className="notepad-app">
      <div className="notepad-title">{file?.title || activeDoc}</div>
      <textarea value={file?.content || "ไม่พบข้อมูล"} readOnly spellCheck={false} />
      <div className="statusbar">Ln 1, Col 1　UTF-8　อ่านอย่างเดียว</div>
    </div>
  );
}

function TerminalApp({ save, updateSave, openDocument, openWindow, unlockMail, unlockDevice }) {
  const initial = useMemo(() => [
    "BLACKBOX Command Interpreter [BETA 01]",
    "Copyright (C) Unknown",
    "พิมพ์ help เพื่อดูคำสั่ง",
    "",
  ], []);
  const [lines, setLines] = useState(() => save.commands.length ? [...initial, ...save.commands.slice(-42)] : initial);
  const [input, setInput] = useState("");
  const bottom = useRef(null);

  useEffect(() => bottom.current?.scrollIntoView({ behavior: "smooth" }), [lines]);

  function emit(...out) {
    setLines((old) => [...old, ...out]);
  }

  function persist(command, out) {
    updateSave((old) => ({ commands: [...old.commands, `C:\\RECOVERY> ${command}`, ...out].slice(-70) }));
  }

  function run(raw) {
    const command = raw.trim();
    if (!command) return emit("C:\\RECOVERY>");
    const [headRaw, ...args] = command.split(/\s+/);
    const head = headRaw.toLowerCase();
    const arg = args.join(" ");
    const out = [];
    const say = (...text) => out.push(...text);

    if (["help", "ช่วย", "?"].includes(head)) {
      say("", "คำสั่งที่ใช้ได้", "help / ช่วย               แสดงคำสั่ง", "dir / รายการ              แสดงแฟ้ม", "read <ชื่อไฟล์> / อ่าน      อ่านแฟ้ม", "status / สถานะ            ตรวจระบบ", "unlock <รหัส> / ปลดล็อก     กู้ช่องทาง MAIL", "device <รหัส> / อุปกรณ์     เปิดโหมดบริการ", "mail / เมล                 เปิดกล่องจดหมาย", "clear / ล้าง               ล้างหน้าจอ", "whoami / ฉันคือใคร          ดูข้อมูลเซสชัน", "");
    } else if (["dir", "ls", "รายการ"].includes(head)) {
      say("", " Directory of C:\\RECOVERY", "", ...Object.keys(FILES).filter((name) => !FILES[name].unlockAt || save.stage >= FILES[name].unlockAt).map((name) => `  ${name}`), save.restoredAudio ? "  REC_0311.WAV" : "", `  MAIL\\      ${save.mailUnlocked ? "ONLINE" : "LOCKED"}`, "");
    } else if (["status", "สถานะ"].includes(head)) {
      say("", `SESSION ............. ${save.ending === "connect" ? "10" : "09"}`, `MAIL ................ ${save.mailUnlocked ? "ONLINE" : "LOCKED"}`, `REC_0311.WAV ........ ${save.restoredAudio ? (save.audioPlayed ? "ANALYZED" : "RESTORED") : "DELETED"}`, `UNKNOWN DEVICE ...... ${save.serviceUnlocked ? "SERVICE MODE" : "LOCKED"}`, "NETWORK ............. OFFLINE", "");
    } else if (["whoami", "ฉันคือใคร"].includes(head)) {
      say("", "USER ........ UNREGISTERED", "HOST ........ BLACKBOX", "SESSION ..... 09", "IDENTITY .... NOT FOUND", "");
    } else if (["clear", "cls", "ล้าง"].includes(head)) {
      setLines(initial);
      updateSave({ commands: [] });
      setInput("");
      return;
    } else if (["read", "type", "cat", "อ่าน"].includes(head)) {
      const match = matchFile(arg);
      if (!match) say("ไม่พบแฟ้ม: " + (arg || "(ไม่ได้ระบุ)"), "");
      else {
        openDocument(match);
        say("กำลังเปิด " + match, "");
      }
    } else if (["unlock", "ปลดล็อก"].includes(head)) {
      const code = arg.replace(/[^0-9]/g, "");
      if (code === "0217") {
        unlockMail();
        say("", "AUTHORIZATION ACCEPTED", "กำลังกู้คืน MAIL STORAGE...", "MAIL ........ ONLINE", "พบข้อความที่กู้คืนได้ 2 ฉบับ", "");
      } else {
        say("", "AUTHORIZATION REJECTED", "รหัสกู้คืนไม่ถูกต้อง", "");
        beep(150, 0.1);
      }
    } else if (["mail", "เมล"].includes(head)) {
      if (!save.mailUnlocked) say("MAIL STORAGE ถูกล็อก", "");
      else {
        openWindow("mail");
        say("เปิด MAIL...", "");
      }
    } else if (["device", "อุปกรณ์"].includes(head)) {
      const code = arg.replace(/[^0-9]/g, "");
      if (!save.audioPlayed) say("SERVICE ACCESS DENIED", "ต้องมีข้อมูลกู้คืนเพิ่มเติม", "");
      else if (code === "0311") {
        unlockDevice();
        say("", "SERVICE CODE ACCEPTED", "UNKNOWN_DEVICE ........ SERVICE MODE", "เปิด Device Manager แล้ว", "");
      } else {
        say("SERVICE CODE INVALID", "");
        beep(150, 0.1);
      }
    } else if (["connect", "เชื่อมต่อ"].includes(head)) {
      say("คำสั่งนี้ถูกย้ายไปยัง Device Manager", "เปิดด้วย: device <service code>", "");
    } else if (["tomorrow", "พรุ่งนี้"].includes(head)) {
      say("", "UNKNOWN COMMAND", "SYSTEM CLOCK OFFSET DETECTED", "SOURCE TIME: +23:59:58", "");
    } else {
      say(`'${headRaw}' ไม่ใช่คำสั่งที่รู้จัก`, "พิมพ์ help เพื่อดูคำสั่ง", "");
    }

    const entry = [`C:\\RECOVERY> ${command}`, ...out];
    setLines((old) => [...old, ...entry]);
    persist(command, out);
    setInput("");
  }

  return (
    <div className="terminal-app" onClick={() => document.querySelector(".terminal-field")?.focus()}>
      <div className="terminal-lines">
        {lines.map((line, index) => <div key={index}>{line || "\u00a0"}</div>)}
        <div ref={bottom} />
      </div>
      <form onSubmit={(event) => { event.preventDefault(); run(input); }} className="terminal-input-row">
        <span>C:\\RECOVERY&gt;</span>
        <input className="terminal-field" value={input} onChange={(event) => setInput(event.target.value)} autoFocus autoComplete="off" spellCheck={false} />
      </form>
    </div>
  );
}

function MailApp({ save, selectedMail, setSelectedMail }) {
  const mails = save.mailUnlocked ? MAILS : MAIL_LOCKED;
  return (
    <div className="mail-app">
      <aside className="mail-list">
        <div className="mail-toolbar">กล่องขาเข้า ({mails.length})</div>
        {mails.map((mail, index) => (
          <button key={mail.id} className={selectedMail === index ? "mail-active" : ""} onClick={() => save.mailUnlocked && setSelectedMail(index)}>
            <strong>{mail.from}</strong><span>{mail.subject}</span><small>{mail.time}</small>
          </button>
        ))}
      </aside>
      <main className="mail-reader">
        {!save.mailUnlocked ? (
          <LockedPanel title="ที่เก็บข้อความถูกล็อก" text="ใช้พรอมต์คำสั่งเพื่อป้อนรหัสอนุญาตการกู้คืน" code="unlock ####" />
        ) : selectedMail == null ? (
          <div className="empty-pane">เลือกข้อความจากรายการด้านซ้าย</div>
        ) : (
          <article className="mail-message">
            <div className="mail-meta"><b>จาก:</b> {mails[selectedMail].from}<br/><b>เรื่อง:</b> {mails[selectedMail].subject}<br/><b>เวลา:</b> {mails[selectedMail].time}</div>
            <pre>{mails[selectedMail].body}</pre>
          </article>
        )}
      </main>
    </div>
  );
}

function TrashApp({ save, restoreAudio }) {
  return (
    <div className="trash-app app-pad">
      <div className="classic-info-box">
        <b>ถังรีไซเคิล</b>
        <span>รายการที่ลบก่อนระบบดับอาจกู้คืนได้</span>
      </div>
      {TRASH_ITEMS.map((item) => (
        <div className="trash-row" key={item.id}>
          <div className="trash-file-icon">▥</div>
          <div className="trash-info"><b>{item.name}</b><span>{item.description}</span><small>ลบเมื่อ {item.deleted} · {item.size}</small></div>
          <ClassicButton disabled={save.restoredAudio} onClick={restoreAudio}>{save.restoredAudio ? "กู้คืนแล้ว" : "กู้คืน"}</ClassicButton>
        </div>
      ))}
      <div className="statusbar">{save.restoredAudio ? "0 รายการที่กู้คืนได้" : "1 รายการ"}</div>
    </div>
  );
}

function RecorderApp({ save, finishAudio }) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(save.audioPlayed ? 100 : 0);

  function play() {
    if (!save.restoredAudio || playing) return;
    setPlaying(true);
    setProgress(0);
    playSignal();
    let value = 0;
    const timer = setInterval(() => {
      value += 5;
      setProgress(value);
      if (value >= 100) {
        clearInterval(timer);
        setPlaying(false);
        finishAudio();
      }
    }, 170);
  }

  if (!save.restoredAudio) {
    return <LockedPanel title="ไม่พบไฟล์เสียง" text="โปรแกรมไม่พบไฟล์ REC_0311.WAV ในเอกสาร" code="ตรวจสอบถังรีไซเคิล" />;
  }

  return (
    <div className="recorder-app app-pad">
      <div className="recorder-display">
        <div className="recorder-file">REC_0311.WAV</div>
        <div className="waveform">{Array.from({ length: 38 }, (_, i) => <i key={i} style={{ height: `${8 + ((i * 17) % 26)}px` }} />)}</div>
        <div className="audio-progress"><span style={{ width: `${progress}%` }} /></div>
        <div className="counter">00:{String(Math.floor(progress * 0.17)).padStart(2, "0")} / 00:17</div>
      </div>
      <div className="recorder-controls">
        <ClassicButton onClick={play} disabled={playing}>{playing ? "กำลังเล่น..." : "▶ เล่น"}</ClassicButton>
        <ClassicButton onClick={() => setProgress(0)}>■ หยุด</ClassicButton>
      </div>
      {(save.audioPlayed || progress >= 100) && (
        <div className="transcript-box">
          <b>ข้อมูลที่ถอดได้จากส่วนท้ายของไฟล์</b>
          <pre>...ห้อง 09...{"\n"}...อย่าเชื่อเวลา...{"\n"}SERVICE ACCESS: 0311{"\n"}...มันอยู่ฝั่งเดียวกับเรา...</pre>
        </div>
      )}
    </div>
  );
}

function DeviceApp({ save, chooseEnding }) {
  if (!save.serviceUnlocked) {
    return <LockedPanel title="UNKNOWN DEVICE" text="การเข้าถึงระดับบริการถูกล็อก" code="ใช้คำสั่ง device <รหัส>" danger />;
  }

  if (save.ending) {
    return <div className="app-pad"><div className="device-warning"><b>การตัดสินใจถูกบันทึกแล้ว</b><span>{ENDINGS[save.ending].title}</span></div></div>;
  }

  return (
    <div className="device-app app-pad">
      <div className="device-header">
        <div className="device-question">?</div>
        <div><b>UNKNOWN DEVICE</b><span>สถานะ: เชื่อมต่ออยู่ · ผู้ผลิต: ไม่ทราบ · ประเภท: ไม่ทราบ</span></div>
      </div>
      <div className="device-properties">
        <div><span>Hardware ID</span><code>LOCALHOST\\TMR-09</code></div>
        <div><span>Driver</span><code>ไม่พบ</code></div>
        <div><span>Signal origin</span><code>LOCAL / TIME OFFSET +23:59:58</code></div>
        <div><span>Service channel</span><code>READY</code></div>
      </div>
      <div className="device-warning-box">
        <b>คำเตือนของระบบ</b>
        <p>ไม่มีวิธีตรวจสอบว่าการตัดสัญญาณหรือการเปิดช่องทางใดปลอดภัยกว่า การกระทำนี้จะจบ Beta Test 01</p>
      </div>
      <div className="choice-buttons">
        <ClassicButton onClick={() => chooseEnding("isolate")}>ตัดสัญญาณอุปกรณ์</ClassicButton>
        <ClassicButton danger onClick={() => chooseEnding("connect")}>เปิดช่องทางและตอบกลับ</ClassicButton>
      </div>
    </div>
  );
}

function ControlPanel({ save, updateSave, resetGame }) {
  const [notes, setNotes] = useState(save.testerNotes || "");
  const progress = Math.round((Math.min(save.stage, 6) / 6) * 100);
  const elapsed = Math.max(1, Math.floor((Date.now() - save.startedAt) / 60000));

  function nextHint() {
    updateSave((old) => ({ hintIndex: Math.min(HINTS.length - 1, old.hintIndex + 1) }));
  }

  return (
    <div className="control-app app-pad">
      <div className="control-grid">
        <fieldset><legend>สถานะ Beta Test 01</legend><div className="progress-classic"><span style={{ width: `${progress}%` }} /></div><p>{progress}% · ขั้น {save.stage}/6 · {elapsed} นาที</p></fieldset>
        <fieldset><legend>คำใบ้สำหรับเทสเตอร์</legend><p>{HINTS[save.hintIndex]}</p><ClassicButton onClick={nextHint}>คำใบ้ถัดไป</ClassicButton></fieldset>
        <fieldset className="notes-field"><legend>บันทึกปัญหาที่พบ</legend><textarea value={notes} onChange={(event) => setNotes(event.target.value)} onBlur={() => updateSave({ testerNotes: notes })} placeholder="พิมพ์สิ่งที่งง บั๊ก หรือจุดที่อยากให้ปรับ..." /></fieldset>
      </div>
      <div className="control-actions"><ClassicButton onClick={() => updateSave({ testerNotes: notes })}>บันทึกโน้ต</ClassicButton><ClassicButton danger onClick={resetGame}>เริ่มการทดสอบใหม่</ClassicButton></div>
    </div>
  );
}

function EndingApp({ save, openWindow }) {
  const ending = ENDINGS[save.ending];
  if (!ending) return <div className="app-pad">ยังไม่มีผลการทดสอบ</div>;
  const minutes = Math.max(1, Math.floor((Date.now() - save.startedAt) / 60000));
  return (
    <div className="ending-app">
      <div className="ending-banner"><span>BLACKBOX / BETA TEST 01</span><strong>{ending.code}</strong></div>
      <div className="ending-content"><h1>{ending.title}</h1><p className="ending-subtitle">{ending.subtitle}</p><pre>{ending.text}</pre></div>
      <div className="ending-stats"><div><b>{minutes}</b><span>นาที</span></div><div><b>{save.readFiles.length}</b><span>แฟ้มที่อ่าน</span></div><div><b>{save.commands.length}</b><span>บรรทัดคำสั่ง</span></div></div>
      <div className="ending-footer"><span>จบเนื้อหา Beta Test 01</span><ClassicButton onClick={() => openWindow("control")}>เปิดแบบทดสอบ / โน้ต</ClassicButton></div>
    </div>
  );
}

function AboutApp() {
  return (
    <div className="about-app app-pad">
      <div className="about-logo">BLACKBOX</div>
      <p><b>BLACKBOX Recovery Environment</b><br/>Beta Test 01 — Thai Build</p>
      <p>ระบบจำลองคอมพิวเตอร์และเกมสืบสวนบนเว็บ</p>
      <div className="classic-info-box">Build: B01.0903<br/>Session: 09<br/>Memory: 640K ought to be enough.</div>
    </div>
  );
}

function LockedPanel({ title, text, code, danger }) {
  return (
    <div className={`locked-panel ${danger ? "locked-danger" : ""}`}>
      <div className="locked-symbol">{danger ? "?" : "▥"}</div>
      <h2>{title}</h2><p>{text}</p><code>{code}</code>
    </div>
  );
}

function ClassicButton({ children, onClick, disabled, danger }) {
  return <button type="button" className={`classic-button ${danger ? "classic-danger" : ""}`} onClick={onClick} disabled={disabled}>{children}</button>;
}

function StartMenu({ save, openWindow, onReset, onClose }) {
  const items = [
    ["▣", "คอมพิวเตอร์ของฉัน", "computer"],
    ["C:\\", "พรอมต์คำสั่ง", "terminal"],
    ["✉", "กล่องจดหมาย", "mail"],
    ["▶", "เครื่องบันทึกเสียง", "recorder"],
    ["?", "ตัวจัดการอุปกรณ์", "device"],
    ["▤", "แผงควบคุม / Beta Test", "control"],
    ["i", "เกี่ยวกับ BLACKBOX", "about"],
  ];
  return (
    <div className="start-menu" onMouseDown={(event) => event.stopPropagation()}>
      <div className="start-side"><span>BLACKBOX</span><small>BETA 01</small></div>
      <div className="start-items">
        {items.map(([icon, label, id]) => <button key={id} onClick={() => { openWindow(id); onClose(); }}><b>{icon}</b><span>{label}</span>{id === "mail" && !save.mailUnlocked ? <small>ล็อก</small> : null}</button>)}
        <div className="start-separator" />
        <button onClick={onReset}><b>↻</b><span>เริ่มการทดสอบใหม่...</span></button>
      </div>
    </div>
  );
}

function Taskbar({ windows, startOpen, onStart, onTask }) {
  const [clock, setClock] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  return (
    <footer className="taskbar" onMouseDown={(event) => event.stopPropagation()}>
      <button className={`start-button ${startOpen ? "pressed" : ""}`} onClick={onStart}><span className="start-flag">▦</span> เริ่ม</button>
      <div className="task-list">
        {windows.map((win) => <button key={win.id} className={!win.minimized ? "task-active" : ""} onClick={() => onTask(win.id)}>{APP_TITLES[win.id] || win.id}</button>)}
      </div>
      <div className="tray"><span className="tray-light" /> <span>{clock.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })}</span></div>
    </footer>
  );
}

function SystemNotice({ title, text }) {
  return <div className="system-notice"><div className="notice-icon">i</div><div><b>{title}</b><span>{text}</span></div></div>;
}

function matchFile(input) {
  const value = String(input || "").trim().replaceAll("\\", "/").toLowerCase();
  if (!value) return null;
  return Object.keys(FILES).find((name) => name.toLowerCase() === value || FILES[name].title.toLowerCase() === value || FILES[name].title.toLowerCase().endsWith("/" + value) || FILES[name].title.toLowerCase().endsWith("\\" + value)) || null;
}

function beep(frequency = 440, duration = 0.04) {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    const context = new Ctx();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = "square";
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0.022, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + duration);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + duration);
    setTimeout(() => context.close(), duration * 1000 + 80);
  } catch {}
}

function playSignal() {
  const pattern = [1,0,1,0,1,0, 1,1,1,0, 1,0,1, 0,0, 1,1,0,1,0,1,1];
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    const context = new Ctx();
    pattern.forEach((on, index) => {
      if (!on) return;
      const osc = context.createOscillator();
      const gain = context.createGain();
      const start = context.currentTime + index * 0.13;
      osc.type = "square";
      osc.frequency.value = index > 13 ? 740 : 560;
      gain.gain.setValueAtTime(0.018, start);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.09);
      osc.connect(gain); gain.connect(context.destination);
      osc.start(start); osc.stop(start + 0.1);
    });
    setTimeout(() => context.close(), 4000);
  } catch {}
}

createRoot(document.getElementById("root")).render(<App />);
