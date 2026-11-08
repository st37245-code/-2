# คู่มืออัปโหลดซอร์ส “เขางูน่ารู้” ไป GitHub

## อัปโหลดผ่านเว็บไซต์ GitHub

1. ดาวน์โหลดและแตกไฟล์ `khaongu-source.zip`
2. สร้าง repository ใหม่ใน GitHub โดยไม่ต้องเลือกเพิ่ม README, license หรือ `.gitignore` อัตโนมัติ เพราะ ZIP มี `.gitignore` อยู่แล้ว
3. เปิดโฟลเดอร์ `khaongu/` ที่แตกออกมา แล้วอัปโหลดไฟล์และโฟลเดอร์ภายในนั้นเข้า repository (ไม่ใช่อัปโหลด ZIP อย่างเดียว) จากเมนู **Add file → Upload files**
4. ใส่ข้อความ commit เช่น `Add Khao Ngu learning app source` แล้วเลือก **Commit changes**

## อัปโหลดด้วย Git (รักษาการจัดการไฟล์ได้สะดวกกว่า)

เปิด Terminal ในโฟลเดอร์ `khaongu/` ที่แตกออกมา แล้วใช้คำสั่งต่อไปนี้ โดยแทน URL ให้เป็น repository ของอาจารย์:

```bash
git init -b main
git add .
git commit -m "Add Khao Ngu learning app source"
git remote add origin https://github.com/USERNAME/REPOSITORY.git
git push -u origin main
```

เมื่อ Git ถามสิทธิ์ ให้ลงชื่อเข้าใช้ผ่าน GitHub credential manager หรือวิธีที่ GitHub รองรับ อย่าวาง token ลงในไฟล์ซอร์ส

## ทดลองรันและตรวจโค้ด

ต้องมี Node.js และ pnpm 9.12.0 (หรือเวอร์ชันที่เข้ากันได้กับ `package.json`) จากนั้น:

```bash
pnpm install --frozen-lockfile
pnpm dev
```

ตรวจโค้ดและทดสอบได้ด้วย:

```bash
pnpm check
pnpm lint
pnpm test
```

การเปิดใช้ backend หรือการ build แอปมือถือแบบ native อาจต้องตั้งค่า service/credentials เพิ่มเติมใน environment ที่ปลอดภัย ไฟล์ ZIP นี้เป็น **ซอร์สโค้ด** ไม่ใช่ APK/AAB หรือไฟล์ติดตั้ง iOS

## สิ่งที่รวมและข้อควรทราบ

ZIP รวมซอร์ส แอปและ server, รูปภาพ/ไอคอนที่ใช้ในแอป, tests, เอกสาร และ lockfile แต่ไม่รวม `.git`, `node_modules`, Expo cache หรือไฟล์ `.env`/credentials/tokens ควรตรวจสิทธิ์การเผยแพร่ภาพถ่ายจริงก่อนตั้ง repository เป็นสาธารณะ และคงเครดิตแหล่งภาพที่แสดงอยู่ในแอปและ `research-notes.md`
