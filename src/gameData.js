export const SAVE_KEY = "blackbox-beta-test-01";
export const SAVE_VERSION = 2;

export const FILES = {
  "เริ่มที่นี่.txt": {
    folder: "เอกสาร",
    type: "text",
    title: "เริ่มที่นี่.txt",
    content: `BLACKBOX RECOVERY ENVIRONMENT
รุ่นทดสอบ BETA 01

เครื่องนี้ถูกเปิดในโหมดกู้คืนข้อมูล
ไม่พบชื่อผู้ใช้งานที่ลงทะเบียนไว้

ขั้นตอนมาตรฐาน
1. ตรวจสอบเอกสารในเครื่อง
2. ตรวจสอบบันทึกระบบ
3. กู้คืนช่องทางสื่อสาร
4. ห้ามเชื่อมต่ออุปกรณ์ที่ไม่ทราบชนิด

หากกล่องจดหมายถูกล็อก ให้ใช้โปรแกรม "พรอมต์คำสั่ง"
คำสั่งพื้นฐาน: help

— ระบบกู้คืน`,
  },
  "รายงาน_ห้อง09.txt": {
    folder: "เอกสาร",
    type: "text",
    title: "รายงาน_ห้อง09.txt",
    content: `รายงานเหตุการณ์ 09
สถานที่: ชั้นใต้ดิน B / ห้องสังเกตการณ์ 09
สถานะ: ไม่สมบูรณ์

ผู้ถูกเฝ้าสังเกตฟื้นเมื่อเวลา 02:31 น.
ไม่พบเอกสารระบุตัวตน

ก่อนหน้านั้นไม่นาน อุปกรณ์บันทึกภาพทั้งหมดดับพร้อมกัน
ข้อความส่วนนี้เสียหายอย่างหนัก

รหัสไม่ได้อยู่ในคำพูด
ให้ดูว่า "ห้องมืดลงเมื่อไร"

[จบข้อมูลที่กู้ได้]`,
  },
  "บันทึกส่วนตัว.txt": {
    folder: "เอกสาร",
    type: "text",
    title: "บันทึกส่วนตัว.txt",
    content: `ฉันจำไม่ได้ว่าเขียนสิ่งนี้เมื่อไร

ถ้าเครื่องเปิดขึ้นมาอีกครั้ง
อย่าเชื่อวันที่ตรงมุมจอ

ฉันพยายามเปิดกล่องจดหมาย
มันถามหารหัสอนุญาต
ฉันรู้ว่าเคยเห็นตัวเลขนั้นมาก่อน

อยู่ใน SYSTEM แน่ ๆ

และถ้าเห็นคำว่า UNKNOWN DEVICE
อย่าเพิ่งแตะมัน

— ?`,
  },
  "POWER.LOG": {
    folder: "SYSTEM",
    type: "log",
    title: "SYSTEM\\POWER.LOG",
    content: `[01:52:09] CAMERA_01 ........ ONLINE
[01:52:11] CAMERA_02 ........ ONLINE
[02:06:44] DOOR_A ........... SEALED
[02:11:03] SUBJECT_MONITOR .. ACTIVE
[02:16:58] POWER_LOAD ....... UNSTABLE
[02:17:00] FACILITY_POWER ... OFFLINE
[02:17:00] CAMERA_01 ........ LOST
[02:17:00] CAMERA_02 ........ LOST
[02:17:01] UNKNOWN_DEVICE ... CONNECTED
[02:17:04] SIGNAL ........... DETECTED
[02:22:41] FACILITY_POWER ... RESTORED
[02:31:16] SUBJECT_MONITOR .. ACTIVE`,
  },
  "DEVICE.LOG": {
    folder: "SYSTEM",
    type: "log",
    title: "SYSTEM\\DEVICE.LOG",
    content: `รายงานอุปกรณ์

HOST ............. BLACKBOX
SESSION .......... 09
USER ............. UNREGISTERED
NETWORK .......... DISCONNECTED

อุปกรณ์ที่พบ
  KB-01
  DISPLAY-02
  STORAGE-RECOVERY
  UNKNOWN_DEVICE

คำเตือน:
UNKNOWN_DEVICE ไม่ตรงกับลายเซ็นฮาร์ดแวร์ใดในฐานข้อมูล

การเข้าถึงระดับบริการถูกล็อก`,
  },
  "TIMELINE.LOG": {
    folder: "SYSTEM",
    type: "log",
    title: "SYSTEM\\TIMELINE.LOG",
    content: `[02:17:01] UNKNOWN_DEVICE CONNECTED
[02:17:04] SIGNAL DETECTED
[02:17:09] CLOCK OFFSET +23:59:58
[02:17:12] MESSAGE BUFFER CREATED
[02:17:13] SOURCE: LOCALHOST
[02:17:13] SOURCE TIME: TOMORROW
[02:17:14] BUFFER QUARANTINED`,
    unlockAt: 2,
  },
};

export const MAIL_LOCKED = [
  {
    id: "locked",
    from: "SYSTEM",
    subject: "ที่เก็บข้อความถูกล็อก",
    time: "--:--",
    body: "ต้องใช้รหัสอนุญาตการกู้คืนผ่านพรอมต์คำสั่ง",
  },
];

export const MAILS = [
  {
    id: "restore",
    from: "SYSTEM",
    subject: "กู้คืนช่องทางสื่อสารสำเร็จ",
    time: "02:17",
    body: `กู้คืนกล่องจดหมายสำเร็จ

ตรวจพบข้อความเสียหาย 1 ฉบับ
ตรวจสอบเวลาไม่ได้

นอกจากนี้ยังพบรายการไฟล์ที่ถูกลบก่อนระบบดับ
ชื่อไฟล์: REC_0311.WAV

ไฟล์อาจยังอยู่ในถังรีไซเคิล`,
  },
  {
    id: "future",
    from: "คุณ",
    subject: "อย่าตอบมัน",
    time: "พรุ่งนี้",
    body: `ถ้าคุณอ่านข้อความนี้อยู่ แปลว่าคุณเจอ 02:17 แล้ว

ดี
อย่างน้อยส่วนนี้ยังเกิดเหมือนเดิม

ฟังให้ดี
มีสัญญาณกำลังพยายามติดต่อเครื่องนี้
มันจะทำเหมือนมีใครบางคนต้องการความช่วยเหลือ

อย่าเชื่อมัน

กู้ REC_0311.WAV กลับมา
ฟังให้จบ
แล้วตัดสินใจเอง

ไม่ว่าคุณจะเลือกอะไร
จำไว้ว่า ฉันเคยเลือกมาแล้วครั้งหนึ่ง

— คุณ`,
  },
];

export const TRASH_ITEMS = [
  {
    id: "rec0311",
    name: "REC_0311.WAV",
    size: "31 KB",
    deleted: "02:16",
    description: "ไฟล์บันทึกเสียงเสียหาย ถูกลบก่อนระบบไฟฟ้าดับ",
  },
];

export const HINTS = [
  "เริ่มจากอ่าน ‘รายงาน_ห้อง09.txt’ แล้วเทียบกับ SYSTEM\\POWER.LOG",
  "รหัสปลดล็อกเมลเป็นเวลา 4 หลัก ใช้คำสั่ง: unlock ####",
  "หลังเปิดเมลแล้ว ให้ดูว่ามีไฟล์อะไรถูกลบก่อนเกิดเหตุ",
  "กู้ REC_0311.WAV จากถังรีไซเคิล แล้วเปิดโปรแกรมบันทึกเสียง",
  "เมื่อฟังจบ จะได้รหัสบริการของ UNKNOWN DEVICE",
  "ตอนท้ายไม่มีคำตอบที่บอกว่าถูกหรือผิด เลือกตามที่คุณเชื่อ",
];

export const ENDINGS = {
  isolate: {
    code: "ENDING A",
    title: "ตัดสัญญาณ",
    subtitle: "คุณเลือกให้เครื่องเงียบลง",
    text: `รีเลย์บริการถูกตัดออกจาก UNKNOWN DEVICE
สัญญาณหายไปทันที

แต่ก่อนระบบจะปิดช่องทางนั้น
มีข้อความหนึ่งบรรทัดปรากฏใน buffer:

“คุณทำเหมือนเดิมอีกแล้ว”

เวลาในเครื่องกระโดดไปข้างหน้า 24 ชั่วโมง
แล้วกลับมาเป็น 02:17`,
  },
  connect: {
    code: "ENDING B",
    title: "ตอบกลับสัญญาณ",
    subtitle: "คุณเลือกเปิดช่องทางที่ถูกห้ามไว้",
    text: `UNKNOWN DEVICE ตอบสนองทันที
ไม่มีข้อมูลอุปกรณ์ ไม่มีหมายเลขผู้ผลิต
มีเพียงช่องข้อความที่เปิดขึ้นเอง

ข้อความแรกที่ได้รับคือ:

“ในที่สุดคุณก็เลือกต่างจากฉัน”

SOURCE: LOCALHOST
SOURCE TIME: TOMORROW

หน้าจอดับไป 3 วินาที
เมื่อกลับมา SESSION เปลี่ยนจาก 09 เป็น 10`,
  },
};

export function defaultSave() {
  return {
    version: SAVE_VERSION,
    startedAt: Date.now(),
    stage: 0,
    readFiles: [],
    mailUnlocked: false,
    restoredAudio: false,
    audioPlayed: false,
    serviceUnlocked: false,
    ending: null,
    commands: [],
    hintIndex: 0,
    testerNotes: "",
  };
}
